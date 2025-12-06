/**
 * 分片上传 Composable
 * 处理大文件分片上传、断点续传、并发控制等核心逻辑
 */

import { ref, reactive, computed, watch, readonly } from 'vue'
import { getFileExt, getFilename } from '@/support/helper'
import Message from '@/support/message'
import http from '@/support/http'
import Cache from '@/support/cache'
import type { WorkerMessage, WorkerResponse } from '@/composables/workers/chunk-worker'

// 上传状态枚举
export enum UploadStatus {
  READY = 'ready',
  PROCESSING = 'processing', // 文件处理中（分片、计算哈希）
  UPLOADING = 'uploading',
  PAUSED = 'paused',
  SUCCESS = 'success',
  ERROR = 'error',
  CANCELLED = 'cancelled'
}

// 分片信息接口
export interface ChunkInfo {
  index: number
  hash: string
  blob: Blob
  size: number
  uploaded: boolean
  uploading: boolean
  progress: number
  error?: string
  retryCount: number
}

// 上传配置接口
export interface ChunkUploadOptions {
  action: string // 上传接口
  chunkSize?: number // 分片大小，默认 2MB
  concurrent?: number // 并发数，默认 3
  retryCount?: number // 重试次数，默认 3
  storageType?: 'localStorage' | 'memory' // 存储类型，默认 localStorage
  onProgress?: (progress: number) => void // 进度回调
  onSuccess?: (response: any) => void // 成功回调
  onError?: (error: string) => void // 错误回调
  disk?: string // 存储磁盘
  path?: string // 存储路径
}

// 上传状态
export interface UploadState {
  status: UploadStatus
  progress: number // 总进度 0-100
  fileHash: string // 文件哈希
  fileName: string // 文件名
  fileSize: number // 文件大小
  totalChunks: number // 总分片数
  uploadedChunks: number // 已上传分片数
  chunks: ChunkInfo[] // 分片信息数组
  error?: string // 错误信息
}

export function useChunkUpload(options: ChunkUploadOptions) {
  // 默认配置
  const config = reactive({
    chunkSize: options.chunkSize || 2 * 1024 * 1024, // 2MB
    concurrent: options.concurrent || 3,
    retryCount: options.retryCount || 3,
    storageType: options.storageType || 'localStorage',
    ...options
  })

  // 上传状态
  const state = reactive<UploadState>({
    status: UploadStatus.READY,
    progress: 0,
    fileHash: '',
    fileName: '',
    fileSize: 0,
    totalChunks: 0,
    uploadedChunks: 0,
    chunks: []
  })

  // WebWorker 实例
  let worker: Worker | null = null

  // 当前上传的文件
  const currentFile = ref<File | null>(null)

  // 上传队列
  const uploadQueue: ChunkInfo[] = []
  let activeUploads = 0

  // 使用项目缓存系统而非直接使用 localStorage
  const CACHE_PREFIX = 'chunk_upload_'

  // 计算属性
  const isUploading = computed(() => state.status === UploadStatus.UPLOADING)
  const isPaused = computed(() => state.status === UploadStatus.PAUSED)
  const canPause = computed(() => state.status === UploadStatus.UPLOADING)
  const canResume = computed(() => state.status === UploadStatus.PAUSED)
  const canRetry = computed(() => state.status === UploadStatus.ERROR)

  // 计算已上传的字节数（基于实际分片大小）
  const uploadedBytes = computed(() => {
    if (state.status === UploadStatus.READY || state.totalChunks === 0) {
      return 0
    }

    // 累加所有已上传分片的实际大小
    return state.chunks.reduce((total, chunk) => {
      return total + (chunk.uploaded ? chunk.size : 0)
    }, 0)
  })

  // 初始化 WebWorker
  const initWorker = () => {
    if (worker) return

    try {
      worker = new Worker(new URL('./workers/chunk-worker.ts', import.meta.url), {
        type: 'module'
      })

      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        handleWorkerMessage(event.data)
      }

      worker.onerror = error => {
        console.error('Worker error:', error)
        state.status = UploadStatus.ERROR
        state.error = 'Worker initialization failed'
      }
    } catch (error) {
      console.error('Failed to create worker:', error)
      state.error = 'WebWorker not supported'
    }
  }

  // 处理 Worker 消息
  const handleWorkerMessage = (response: WorkerResponse) => {
    const { type, id, data, error, progress } = response

    switch (type) {
      case 'PROGRESS':
        // 文件处理阶段不更新进度条，保持0%
        // 只有实际上传数据时进度才增长
        break

      case 'SUCCESS':
        if (data) {
          state.fileHash = data.fileHash
          state.fileName = data.fileName
          state.fileSize = data.fileSize
          state.totalChunks = data.totalChunks

          // 初始化分片信息
          state.chunks = data.chunks.map((chunk: Blob, index: number) => ({
            index,
            hash: data.chunkHashes[index],
            blob: chunk,
            size: chunk.size,
            uploaded: false,
            uploading: false,
            progress: 0,
            retryCount: 0
          }))

          // 检查断点续传
          checkResumeProgress()
        }
        break

      case 'ERROR':
        state.status = UploadStatus.ERROR
        state.error = error || 'File processing failed'
        options.onError?.(state.error)
        break
    }
  }

  // 开始上传文件
  const uploadFile = async (file: File) => {
    if (!file) return

    currentFile.value = file
    state.status = UploadStatus.PROCESSING
    state.progress = 0
    state.error = undefined

    // 重置状态
    Object.assign(state, {
      fileHash: '',
      fileName: file.name,
      fileSize: file.size,
      totalChunks: 0,
      uploadedChunks: 0,
      chunks: []
    })

    // 初始化 Worker
    initWorker()

    if (!worker) {
      state.status = UploadStatus.ERROR
      state.error = 'WebWorker initialization failed'
      return
    }

    // 发送文件处理消息
    const message: WorkerMessage = {
      type: 'CHUNK_FILE',
      id: Date.now().toString(),
      data: {
        file,
        chunkSize: config.chunkSize
      }
    }

    worker.postMessage(message)
  }

  // 检查断点续传进度
  const checkResumeProgress = () => {
    if (config.storageType === 'localStorage') {
      const key = getStorageKey()
      const savedProgressStr = Cache.get(key)
      if (savedProgressStr) {
        try {
          const savedProgress = JSON.parse(savedProgressStr)
          if (savedProgress.fileHash === state.fileHash) {
            // 恢复上传进度
            state.chunks.forEach(chunk => {
              const savedChunk = savedProgress.chunks.find((c: any) => c.hash === chunk.hash)
              if (savedChunk?.uploaded) {
                chunk.uploaded = true
                chunk.progress = 100
                state.uploadedChunks++
              }
            })

            updateProgress()
            Message.success(`检测到未完成的上传，已恢复 ${state.uploadedChunks}/${state.totalChunks} 分片`)
          }
        } catch (error) {
          console.warn('Failed to parse saved progress:', error)
          Message.warning('断点续传数据恢复失败，将重新开始上传')
        }
      }
    }

    // 开始上传剩余分片
    startUpload()
  }

  // 开始上传
  const startUpload = () => {
    state.status = UploadStatus.UPLOADING

    // 添加未上传的分片到队列
    state.chunks
      .filter(chunk => !chunk.uploaded)
      .forEach(chunk => {
        uploadQueue.push(chunk)
      })

    // 开始并发上传
    processUploadQueue()
  }

  // 处理上传队列
  const processUploadQueue = async () => {
    while (uploadQueue.length > 0 && activeUploads < config.concurrent && isUploading.value) {
      const chunk = uploadQueue.shift()!
      activeUploads++

      uploadChunk(chunk).finally(() => {
        activeUploads--
        if (!isPaused.value && uploadQueue.length > 0) {
          processUploadQueue()
        }

        // 检查是否所有分片都已上传（且未被取消）
        if (state.uploadedChunks >= state.totalChunks && state.status === UploadStatus.UPLOADING) {
          mergeChunks()
        }
      })
    }
  }

  // 上传单个分片
  const uploadChunk = async (chunk: ChunkInfo): Promise<void> => {
    if (chunk.uploaded || chunk.uploading) return

    chunk.uploading = true
    chunk.error = undefined

    try {
      const formData = new FormData()
      formData.append('chunk', chunk.blob, generateChunkFileName(chunk))
      formData.append('chunk_hash', chunk.hash)
      formData.append('chunk_index', chunk.index.toString())
      formData.append('file_hash', state.fileHash)
      formData.append('file_name', state.fileName)
      formData.append('total_chunks', state.totalChunks.toString())
      formData.append('chunk_size', chunk.size.toString())
      formData.append('total_size', state.fileSize.toString())

      if (config.disk) formData.append('disk', config.disk)
      if (config.path) formData.append('path', config.path)

      // 使用项目统一的 HTTP 工具
      const response = await http.post(config.action, formData)

      // 检查是否已被取消，如果取消则不处理上传结果
      if (state.status === UploadStatus.CANCELLED) {
        chunk.uploading = false
        return
      }

      // 标记为已上传
      chunk.uploaded = true
      chunk.progress = 100
      chunk.uploading = false
      state.uploadedChunks++

      // 保存进度
      saveProgress()
      updateProgress()
    } catch (error) {
      chunk.uploading = false
      chunk.error = error instanceof Error ? error.message : '分片上传失败'

      // 重试逻辑
      if (chunk.retryCount < config.retryCount) {
        chunk.retryCount++
        uploadQueue.unshift(chunk) // 重新加入队列头部
      } else {
        state.status = UploadStatus.ERROR
        state.error = `分片 ${chunk.index + 1} 上传失败: ${chunk.error}`
        options.onError?.(state.error)
        Message.error(state.error)
      }
    }
  }

  // 合并分片
  const mergeChunks = async () => {
    try {
      const mergeUrl = config.action.replace('/chunk', '/merge')

      // 使用项目统一的 HTTP 工具
      const response = await http.post(mergeUrl, {
        file_hash: state.fileHash,
        file_name: state.fileName,
        total_chunks: state.totalChunks,
        total_size: state.fileSize,
        disk: config.disk,
        path: config.path
      })

      state.status = UploadStatus.SUCCESS
      state.progress = 100

      // 清理存储的进度
      if (config.storageType === 'localStorage') {
        Cache.del(getStorageKey())
      }

      Message.success(`文件 "${state.fileName}" 上传成功！`)
      options.onSuccess?.(response.data.data)
    } catch (error) {
      state.status = UploadStatus.ERROR
      state.error = error instanceof Error ? error.message : '文件合并失败'
      options.onError?.(state.error)
      Message.error(state.error)
    }
  }

  // 暂停上传
  const pauseUpload = () => {
    if (state.status === UploadStatus.UPLOADING) {
      state.status = UploadStatus.PAUSED
    }
  }

  // 恢复上传
  const resumeUpload = () => {
    if (state.status === UploadStatus.PAUSED) {
      state.status = UploadStatus.UPLOADING
      processUploadQueue()
    }
  }

  // 取消上传
  const cancelUpload = () => {
    // 先保存当前的fileHash用于清理缓存
    const currentFileHash = state.fileHash

    // 清理存储（在重置状态之前）
    if (config.storageType === 'localStorage' && currentFileHash) {
      const cacheKey = `${CACHE_PREFIX}${currentFileHash}`
      Cache.del(cacheKey)
      console.log('已清理缓存:', cacheKey)
    }

    // 完全重置状态
    Object.assign(state, {
      status: UploadStatus.CANCELLED,
      progress: 0,
      fileHash: '',
      fileName: '',
      fileSize: 0,
      totalChunks: 0,
      uploadedChunks: 0,
      chunks: [],
      error: undefined
    })

    // 清理上传队列
    uploadQueue.length = 0
    activeUploads = 0

    // 清理文件引用
    currentFile.value = null

    // 清理 Worker
    if (worker) {
      worker.terminate()
      worker = null
    }

    Message.warning('文件上传已取消，下次将重新开始')
  }

  // 重试上传
  const retryUpload = () => {
    if (state.status === UploadStatus.ERROR && currentFile.value) {
      uploadFile(currentFile.value)
    }
  }

  // 更新总体进度
  const updateProgress = () => {
    if (state.fileSize === 0) return

    // 基于已上传字节数计算进度百分比
    const currentUploadedBytes = uploadedBytes.value
    const progressPercent = Math.floor((currentUploadedBytes / state.fileSize) * 100)

    // 确保进度不超过100%
    state.progress = Math.min(progressPercent, 100)

    options.onProgress?.(state.progress)
  }

  // 保存进度到本地存储
  const saveProgress = () => {
    if (config.storageType === 'localStorage') {
      const progress = {
        fileHash: state.fileHash,
        fileName: state.fileName,
        fileSize: state.fileSize,
        totalChunks: state.totalChunks,
        uploadedChunks: state.uploadedChunks,
        chunks: state.chunks.map(chunk => ({
          hash: chunk.hash,
          uploaded: chunk.uploaded,
          index: chunk.index
        })),
        lastSaved: Date.now()
      }
      // 使用项目统一的缓存系统
      Cache.set(getStorageKey(), JSON.stringify(progress))
    }
  }

  // 获取存储键
  const getStorageKey = () => {
    return `${CACHE_PREFIX}${state.fileHash}`
  }

  // 生成分片文件名
  const generateChunkFileName = (chunk: ChunkInfo): string => {
    const fileExt = getFileExt(state.fileName)
    const baseName = getFilename(state.fileName).replace(fileExt, '')
    return `${baseName}_chunk_${chunk.index}${fileExt}`
  }

  // 检查上传进度（可选，用于外部查询）
  const checkUploadProgress = async (): Promise<any> => {
    try {
      const checkUrl = config.action.replace('/chunk', '/check')
      const response = await http.get(checkUrl, { file_hash: state.fileHash })
      return response.data.data
    } catch (error) {
      console.warn('检查上传进度失败:', error)
      return null
    }
  }

  // 监听状态变化
  watch(
    () => state.status,
    newStatus => {
      if (newStatus === UploadStatus.SUCCESS || newStatus === UploadStatus.ERROR) {
        // 清理 Worker
        if (worker) {
          worker.terminate()
          worker = null
        }
      }
    }
  )

  return {
    // 状态
    state: readonly(state),

    // 计算属性
    isUploading,
    isPaused,
    canPause,
    canResume,
    canRetry,
    uploadedBytes,

    // 方法
    uploadFile,
    pauseUpload,
    resumeUpload,
    cancelUpload,
    retryUpload,
    checkUploadProgress
  }
}

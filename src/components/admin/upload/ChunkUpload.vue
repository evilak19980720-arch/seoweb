<template>
  <div class="chunk-upload-wrapper">
    <!-- ElementPlus Upload 组件 -->
    <el-upload
      ref="uploadRef"
      :auto-upload="false"
      :show-file-list="false"
      :accept="accept"
      :action="action"
      :limit="1"
      :on-change="handleFileChange"
      :on-exceed="handleExceed"
      :disabled="isUploading"
      drag
      class="w-full"
    >
      <template #default>
        <div class="flex flex-col justify-center items-center p-8 w-full h-full">
          <div v-if="!hasFile" class="text-center">
            <el-icon class="mb-4 text-6xl text-gray-400"><UploadFilled /></el-icon>
            <div class="text-gray-600">
              <div class="mb-2 text-lg font-medium">点击或拖拽文件到此处上传</div>
              <div class="text-sm text-gray-500">支持大文件分片上传和断点续传</div>
            </div>
          </div>

          <!-- 文件信息和进度 -->
          <div v-else class="w-full max-w-md">
            <!-- 文件信息 -->
            <div class="flex gap-3 items-center mb-6">
              <el-icon class="flex-shrink-0 text-4xl text-blue-500"><Document /></el-icon>
              <div class="flex-1 min-w-0">
                <div class="mb-1 text-base font-medium text-gray-800 truncate" :title="state.fileName">
                  {{ state.fileName }}
                </div>
                <div class="text-sm text-gray-500">{{ formatFileSize(state.fileSize) }}</div>
              </div>
            </div>

            <!-- 进度信息 -->
            <div class="w-full">
              <div class="flex justify-between items-center mb-3 text-sm">
                <span class="font-medium text-gray-800">{{ getStatusText() }}</span>
                <div class="flex gap-3 items-center">
                  <span v-if="showChunkInfo && state.totalChunks > 0" class="text-xs text-gray-500"> ({{ state.uploadedChunks }}/{{ state.totalChunks }} 分片) </span>
                  <span class="text-xs text-gray-500">{{ formatFileSize(uploadedBytes) }}/{{ formatFileSize(state.fileSize) }}</span>
                </div>
              </div>

              <!-- 进度条和控制按钮 -->
              <div class="flex gap-3 items-center mb-4">
                <!-- 进度条 -->
                <div class="flex-1">
                  <el-progress :percentage="state.progress" :status="getProgressStatus()" :stroke-width="8" />
                </div>

                <!-- 控制按钮 -->
                <div class="flex gap-1">
                  <!-- 暂停按钮 -->
                  <el-tooltip v-if="canPause" content="暂停上传" placement="top">
                    <el-button size="small" circle @click.stop="pauseUpload">
                      <el-icon class="w-full h-full"><VideoPause /></el-icon>
                    </el-button>
                  </el-tooltip>

                  <!-- 继续按钮 -->
                  <el-tooltip v-if="canResume" content="继续上传" placement="top">
                    <el-button type="primary" size="small" circle @click.stop="resumeUpload">
                      <el-icon><VideoPlay /></el-icon>
                    </el-button>
                  </el-tooltip>

                  <!-- 重试按钮 -->
                  <el-tooltip v-if="canRetry" content="重试上传" placement="top">
                    <el-button type="primary" size="small" circle @click.stop="retryUpload">
                      <el-icon><RefreshRight /></el-icon>
                    </el-button>
                  </el-tooltip>

                  <!-- 取消按钮 -->
                  <el-tooltip v-if="state.status !== 'success'" content="取消上传" placement="top">
                    <el-button type="danger" size="small" circle @click.stop="handleCancel">
                      <el-icon><Close /></el-icon>
                    </el-button>
                  </el-tooltip>
                </div>
              </div>

              <!-- 错误信息 -->
              <div v-if="state.error" class="flex gap-2 items-center p-3 mt-4 text-sm text-red-500 bg-red-50 rounded border border-red-200">
                <el-icon class="flex-shrink-0"><WarningFilled /></el-icon>
                <span>{{ state.error }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 自定义提示 -->
      <template #tip v-if="$slots.tip">
        <slot name="tip"></slot>
      </template>
    </el-upload>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, toRefs } from 'vue'
import { ElUpload, ElButton, ElProgress, ElIcon, ElTooltip } from 'element-plus'
import { UploadFilled, Document, VideoPause, VideoPlay, RefreshRight, Close, Check, WarningFilled } from '@element-plus/icons-vue'
import { genFileId } from 'element-plus'
import type { UploadFile, UploadInstance, UploadRawFile } from 'element-plus'
import { useChunkUpload, UploadStatus, type ChunkUploadOptions } from '@/composables/useChunkUpload'
import Message from '@/support/message'

// v-model支持 - 返回上传成功后的文件路径
const filePath = defineModel<string>()

// 简化的Props定义 - 专为单文件上传优化
interface ChunkUploadProps {
  // 必需参数
  action: string // 上传接口

  maxFileSize?: number // 最大文件大小（字节），默认 1GB
  // 可选配置 - 提供合理的默认值
  chunkSize?: number // 分片大小（字节），默认 2MB
  accept?: string // 接受的文件类型，默认所有
  showChunkInfo?: boolean // 是否显示分片信息，默认 false（简洁模式）

  // Laravel 后端配置
  disk?: string // 存储磁盘，默认 'uploads'
  path?: string // 存储路径，默认 'attachments'
}

const defaultMaxFileSize = 2 * 1024 * 1024 * 1024 // 2GB
const props = withDefaults(defineProps<ChunkUploadProps>(), {
  maxFileSize: defaultMaxFileSize, // 2GB
  chunkSize: 2 * 1024 * 1024, // 2MB
  accept: '*',
  showChunkInfo: false, // 默认不显示分片信息，保持界面简洁
  disk: 'uploads',
  path: 'attachments',
  action: 'upload/chunk'
})

// 简化的Emits定义
const emit = defineEmits<{
  'upload-success': [response: any]
  'upload-error': [error: string]
}>()

// 响应式解构
const { action, chunkSize, maxFileSize, accept, showChunkInfo, disk, path } = toRefs(props)

// Refs
const uploadRef = ref<UploadInstance>()
const currentUploadFile = ref<UploadFile | null>(null)

// 配置上传选项 - 使用固定的合理默认值
const uploadOptions = computed<ChunkUploadOptions>(() => ({
  action: action.value,
  chunkSize: chunkSize.value,
  concurrent: 3, // 固定3个并发
  retryCount: 3, // 固定重试3次
  storageType: 'localStorage', // 固定使用localStorage
  disk: disk.value,
  path: path.value,
  onProgress: () => {}, // 进度通过state直接获取
  onSuccess: (response: any) => {
    // 设置v-model值为文件路径
    if (response && response.path) {
      filePath.value = response.path
    }
    emit('upload-success', response)
  },
  onError: (error: string) => {
    emit('upload-error', error)
  }
}))

// 使用分片上传 Composable
const {
  state,
  isUploading,
  isPaused,
  canPause,
  canResume,
  canRetry,
  uploadedBytes,
  uploadFile: startUpload,
  pauseUpload,
  resumeUpload,
  cancelUpload,
  retryUpload
} = useChunkUpload(uploadOptions.value)

// 计算属性
const hasFile = computed(() => currentUploadFile.value !== null)

// 处理文件变化
const handleFileChange = (file: UploadFile) => {
  if (!file.raw) return

  // 验证文件大小
  if (maxFileSize.value && file.raw.size > maxFileSize.value) {
    const maxSize = formatFileSize(maxFileSize.value)
    const fileSize = formatFileSize(file.raw.size)
    Message.error(`文件大小 ${fileSize} 超过限制 ${maxSize}`)
    return
  }

  currentUploadFile.value = file

  // 自动开始上传
  startUpload(file.raw)
}

// 处理文件数量超限
const handleExceed = (files: File[]) => {
  if (!uploadRef.value) return

  uploadRef.value.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  uploadRef.value.handleStart(file)

  // 触发文件变化处理
  handleFileChange({
    uid: file.uid,
    name: file.name,
    size: file.size,
    status: 'ready',
    raw: file
  } as UploadFile)
}

// 取消上传
const handleCancel = () => {
  cancelUpload()
  currentUploadFile.value = null

  // 清理ElUpload的文件列表
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

// 清理完成的上传
const handleClear = () => {
  currentUploadFile.value = null
  uploadRef.value?.clearFiles()
}

// 获取状态文本
const getStatusText = (): string => {
  switch (state.status) {
    case UploadStatus.READY:
      return '准备中'
    case UploadStatus.PROCESSING:
      return '处理中'
    case UploadStatus.UPLOADING:
      return '上传中'
    case UploadStatus.PAUSED:
      return '已暂停'
    case UploadStatus.SUCCESS:
      return '上传成功'
    case UploadStatus.ERROR:
      return '上传失败'
    case UploadStatus.CANCELLED:
      return '已取消'
    default:
      return '未知状态'
  }
}

// 获取进度条状态
const getProgressStatus = (): 'success' | 'exception' | 'warning' | undefined => {
  switch (state.status) {
    case UploadStatus.SUCCESS:
      return 'success'
    case UploadStatus.ERROR:
      return 'exception'
    case UploadStatus.PAUSED:
      return 'warning'
    default:
      return undefined
  }
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

// 监听上传状态变化
watch(
  () => state.status,
  newStatus => {
    if (newStatus === UploadStatus.SUCCESS) {
      // 上传成功后可以执行额外逻辑
    }
  }
)

// 暴露方法给父组件（可选使用）
defineExpose({
  // 手动上传文件
  uploadFile: (file: File) => {
    if (uploadRef.value) {
      const rawFile = file as UploadRawFile
      rawFile.uid = genFileId()

      const uploadFileObj: UploadFile = {
        uid: rawFile.uid,
        name: file.name,
        size: file.size,
        status: 'ready',
        raw: rawFile
      }
      handleFileChange(uploadFileObj)
    }
  },
  // 清除文件
  clearFiles: () => {
    handleClear()
  }
})
</script>

<style scoped>
/* ElementPlus Upload 样式覆盖 */
:deep(.el-upload-dragger) {
  width: 100%;
  height: auto;
  min-height: 180px;
  padding: 0;
  border: 2px dashed #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

:deep(.el-upload-dragger:hover) {
  border-color: #3b82f6;
}

:deep(.el-upload-dragger.is-dragover) {
  background-color: rgba(59, 130, 246, 0.06);
  border-color: #3b82f6;
}
</style>

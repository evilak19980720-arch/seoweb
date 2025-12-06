/**
 * 文件分片处理 WebWorker
 * 处理文件分片、哈希计算等耗时操作，避免阻塞主线程
 */

// 消息类型定义
interface WorkerMessage {
  type: 'CHUNK_FILE' | 'CALCULATE_HASH'
  id: string
  data: any
}

// 响应消息类型
interface WorkerResponse {
  type: 'SUCCESS' | 'ERROR' | 'PROGRESS'
  id: string
  data?: any
  error?: string
  progress?: number
}

// 文件分片函数
function chunkFile(file: File, chunkSize: number): Blob[] {
  const chunks: Blob[] = []
  const totalChunks = Math.ceil(file.size / chunkSize)

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize
    const end = Math.min(start + chunkSize, file.size)
    const chunk = file.slice(start, end)
    chunks.push(chunk)
  }

  return chunks
}

// 计算文件哈希（使用原生Crypto API，SHA-256）
async function calculateFileHash(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// 计算分片哈希（使用原生Crypto API，SHA-256）
async function calculateChunkHash(chunk: Blob, index: number): Promise<string> {
  const arrayBuffer = await chunk.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return `${index}-${hashHex}`
}

// 监听主线程消息
self.addEventListener('message', async (event: MessageEvent<WorkerMessage>) => {
  const { type, id, data } = event.data

  try {
    switch (type) {
      case 'CHUNK_FILE': {
        const { file, chunkSize } = data

        // 计算文件哈希
        self.postMessage({
          type: 'PROGRESS',
          id,
          progress: 10
        } as WorkerResponse)

        const fileHash = await calculateFileHash(file)

        // 分片文件
        self.postMessage({
          type: 'PROGRESS',
          id,
          progress: 30
        } as WorkerResponse)

        const chunks = chunkFile(file, chunkSize)

        // 计算每个分片的哈希
        const chunkHashes: string[] = []
        for (let i = 0; i < chunks.length; i++) {
          const chunkHash = await calculateChunkHash(chunks[i], i)
          chunkHashes.push(chunkHash)

          // 更新进度
          const progress = 30 + Math.floor(((i + 1) / chunks.length) * 60)
          self.postMessage({
            type: 'PROGRESS',
            id,
            progress
          } as WorkerResponse)
        }

        // 返回结果
        self.postMessage({
          type: 'SUCCESS',
          id,
          data: {
            fileHash,
            chunks,
            chunkHashes,
            totalChunks: chunks.length,
            fileSize: file.size,
            fileName: file.name
          }
        } as WorkerResponse)

        break
      }

      case 'CALCULATE_HASH': {
        const { chunks } = data
        const hashes: string[] = []

        for (let i = 0; i < chunks.length; i++) {
          const hash = await calculateChunkHash(chunks[i], i)
          hashes.push(hash)

          const progress = Math.floor(((i + 1) / chunks.length) * 100)
          self.postMessage({
            type: 'PROGRESS',
            id,
            progress
          } as WorkerResponse)
        }

        self.postMessage({
          type: 'SUCCESS',
          id,
          data: { hashes }
        } as WorkerResponse)

        break
      }

      default:
        throw new Error(`Unknown message type: ${type}`)
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      id,
      error: error instanceof Error ? error.message : 'Unknown error'
    } as WorkerResponse)
  }
})

// 导出类型供主线程使用
export type { WorkerMessage, WorkerResponse }

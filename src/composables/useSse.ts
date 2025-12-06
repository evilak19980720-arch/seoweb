import { ref, type Ref } from 'vue'

/**
 * 日志项接口
 */
export interface SseLogItem {
  time: string
  message: string
  type: 'stdout' | 'stderr' | 'error' | 'success' | string
}

/**
 * 进度信息接口
 */
export interface SseProgress {
  step: string
  percent: number
  message: string
}

/**
 * SSE 事件处理器接口
 */
export interface SseEventHandlers {
  /** 日志事件回调 */
  onLog?: (message: string, type: string) => void
  /** 进度事件回调 */
  onProgress?: (progress: SseProgress) => void
  /** 完成事件回调 */
  onComplete?: (data: any) => void
  /** 错误事件回调 */
  onError?: (message: string) => void
}

/**
 * SSE 连接选项
 */
export interface SseConnectOptions {
  /** 步骤顺序，用于计算总进度 */
  steps?: string[]
  /** 事件处理器 */
  handlers?: SseEventHandlers
}

/**
 * useSse 返回值接口
 */
export interface UseSseReturn {
  /** 是否已连接 */
  isConnected: Ref<boolean>
  /** 是否正在处理 */
  isProcessing: Ref<boolean>
  /** 是否成功完成 */
  isSuccess: Ref<boolean>
  /** 日志列表 */
  logs: Ref<SseLogItem[]>
  /** 错误信息 */
  error: Ref<string>
  /** 当前进度 */
  progress: Ref<SseProgress>
  /** 总进度百分比 */
  progressPercent: Ref<number>
  /** 连接 SSE */
  connect: (url: string, options?: SseConnectOptions) => void
  /** 断开连接 */
  disconnect: () => void
  /** 清空日志 */
  clearLogs: () => void
  /** 重置状态 */
  reset: () => void
  /** 添加日志 */
  addLog: (message: string, type?: string) => void
}

/**
 * SSE 连接管理 Composable
 *
 * 提供 Server-Sent Events 连接管理、日志收集、进度跟踪等功能
 *
 * @example
 * ```typescript
 * const { connect, disconnect, logs, progress, isProcessing } = useSse()
 *
 * // 连接 SSE
 * connect('/api/task/stream', {
 *   steps: ['download', 'process', 'complete'],
 *   handlers: {
 *     onComplete: (data) => console.log('完成', data),
 *     onError: (msg) => console.error('错误', msg)
 *   }
 * })
 *
 * // 断开连接
 * disconnect()
 * ```
 */
export function useSse(): UseSseReturn {
  // 状态
  const isConnected = ref(false)
  const isProcessing = ref(false)
  const isSuccess = ref(false)
  const logs = ref<SseLogItem[]>([])
  const error = ref('')
  const progress = ref<SseProgress>({ step: '', percent: 0, message: '' })
  const progressPercent = ref(0)

  // EventSource 实例
  let eventSource: EventSource | null = null
  // 当前步骤列表
  let currentSteps: string[] = []
  // 当前事件处理器
  let currentHandlers: SseEventHandlers = {}

  /**
   * 获取当前时间字符串
   */
  const getTimeString = (): string => {
    const now = new Date()
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
  }

  /**
   * 添加日志
   */
  const addLog = (message: string, type: string = 'stdout'): void => {
    logs.value.push({
      time: getTimeString(),
      message,
      type
    })
  }

  /**
   * 计算总进度百分比
   */
  const calculateTotalProgress = (step: string, stepPercent: number): number => {
    if (currentSteps.length === 0) {
      return stepPercent
    }

    const stepIndex = currentSteps.indexOf(step)
    if (stepIndex === -1) {
      return progressPercent.value
    }

    const stepWeight = 100 / currentSteps.length
    const baseProgress = stepIndex * stepWeight
    const stepProgress = (stepPercent / 100) * stepWeight

    return Math.round(Math.min(baseProgress + stepProgress, 100))
  }

  /**
   * 连接 SSE
   */
  const connect = (url: string, options?: SseConnectOptions): void => {
    // 如果已连接，先断开
    if (eventSource) {
      disconnect()
    }

    // 保存配置
    currentSteps = options?.steps || []
    currentHandlers = options?.handlers || {}

    // 重置状态
    isConnected.value = true
    isProcessing.value = true
    isSuccess.value = false
    error.value = ''
    progress.value = { step: '', percent: 0, message: '' }
    progressPercent.value = 0

    // 创建 EventSource
    eventSource = new EventSource(url)

    // 日志事件
    eventSource.addEventListener('log', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data)
        const message = data.message || ''
        const type = data.type || 'stdout'

        addLog(message, type)
        currentHandlers.onLog?.(message, type)
      } catch (err) {
        console.error('解析日志事件失败', err)
      }
    })

    // 进度事件
    eventSource.addEventListener('progress', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data)
        const step = data.step || ''
        const percent = data.percent || 0
        const message = data.message || ''

        progress.value = { step, percent, message }
        progressPercent.value = calculateTotalProgress(step, percent)

        addLog(message)
        currentHandlers.onProgress?.({ step, percent, message })
      } catch (err) {
        console.error('解析进度事件失败', err)
      }
    })

    // 完成事件
    eventSource.addEventListener('complete', (e: MessageEvent) => {
      try {
        const data = e.data ? JSON.parse(e.data) : {}

        isSuccess.value = true
        isProcessing.value = false
        progressPercent.value = 100

        currentHandlers.onComplete?.(data)
      } catch (err) {
        // 即使解析失败也标记为完成
        isSuccess.value = true
        isProcessing.value = false
        progressPercent.value = 100
        currentHandlers.onComplete?.({})
      }

      disconnect()
    })

    // 错误事件（服务端发送的 error 事件）
    eventSource.addEventListener('error', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data)
        const message = data.message || '未知错误'

        error.value = message
        addLog(message, 'error')
        currentHandlers.onError?.(message)
      } catch {
        // 可能是连接错误，不是服务端发送的 error 事件
        if (!isSuccess.value && isProcessing.value) {
          error.value = '连接中断'
          addLog('连接中断', 'error')
          currentHandlers.onError?.('连接中断')
        }
      }

      isProcessing.value = false
      disconnect()
    })

    // EventSource 原生错误（连接问题）
    eventSource.onerror = () => {
      if (isProcessing.value && !isSuccess.value && !error.value) {
        error.value = '连接中断，请检查网络或服务器'
        addLog('SSE 连接中断', 'error')
        currentHandlers.onError?.('连接中断')
        isProcessing.value = false
      }
      disconnect()
    }
  }

  /**
   * 断开连接
   */
  const disconnect = (): void => {
    if (eventSource) {
      eventSource.close()
      eventSource = null
    }
    isConnected.value = false
  }

  /**
   * 清空日志
   */
  const clearLogs = (): void => {
    logs.value = []
  }

  /**
   * 重置所有状态
   */
  const reset = (): void => {
    disconnect()
    isProcessing.value = false
    isSuccess.value = false
    logs.value = []
    error.value = ''
    progress.value = { step: '', percent: 0, message: '' }
    progressPercent.value = 0
    currentSteps = []
    currentHandlers = {}
  }

  return {
    isConnected,
    isProcessing,
    isSuccess,
    logs,
    error,
    progress,
    progressPercent,
    connect,
    disconnect,
    clearLogs,
    reset,
    addLog
  }
}

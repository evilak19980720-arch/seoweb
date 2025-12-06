<template>
  <div
    ref="containerRef"
    class="bg-slate-900 p-4 rounded-lg overflow-y-auto font-mono text-xs leading-6"
    :style="containerStyle"
  >
    <!-- 日志内容 -->
    <div v-for="(log, index) in logs" :key="index" class="mb-1 break-all">
      <span v-if="showTime" class="text-slate-600 mr-2 select-none">[{{ log.time }}]</span>
      <span :class="getLogClass(log.type)">{{ log.message }}</span>
    </div>

    <!-- 空状态 -->
    <div v-if="logs.length === 0" class="text-slate-600">
      {{ emptyText }}
    </div>

    <!-- Loading 动画 -->
    <div v-if="loading" class="flex items-center mt-2 text-cyan-400">
      <span class="inline-flex mr-2 loading-dots">
        <span class="dot">.</span>
        <span class="dot">.</span>
        <span class="dot">.</span>
      </span>
      <span>{{ loadingText }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import type { SseLogItem } from '@/composables/useSse'

/**
 * Terminal 组件 Props
 */
interface Props {
  /** 日志列表 */
  logs?: SseLogItem[]
  /** 是否显示 loading */
  loading?: boolean
  /** loading 提示文字 */
  loadingText?: string
  /** 空状态文字 */
  emptyText?: string
  /** 高度 */
  height?: string | number
  /** 最大高度 */
  maxHeight?: string | number
  /** 是否显示时间 */
  showTime?: boolean
  /** 是否自动滚动到底部 */
  autoScroll?: boolean
  /** 自定义日志类型颜色映射 */
  typeColors?: Record<string, string>
}

const props = withDefaults(defineProps<Props>(), {
  logs: () => [],
  loading: false,
  loadingText: '处理中，请稍候...',
  emptyText: '等待开始...',
  height: '256px',
  maxHeight: undefined,
  showTime: true,
  autoScroll: true,
  typeColors: () => ({})
})

// 容器引用
const containerRef = ref<HTMLElement>()

// 容器样式
const containerStyle = computed(() => {
  const style: Record<string, string> = {}

  if (props.height) {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  }

  if (props.maxHeight) {
    style.maxHeight = typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight
  }

  return style
})

/**
 * 获取日志样式类
 */
const getLogClass = (type: string): string => {
  // 优先使用自定义颜色
  if (props.typeColors[type]) {
    return props.typeColors[type]
  }
  // 使用默认 Tailwind 颜色 - 深色背景下的亮色方案
  const tailwindColors: Record<string, string> = {
    stdout: 'text-gray-200',       // 标准输出 - 亮灰色
    out: 'text-gray-200',           // 输出 - 亮灰色
    stderr: 'text-amber-400',      // 标准错误 - 琥珀色（警告风格）
    err: 'text-amber-400',         // 错误输出 - 琥珀色
    error: 'text-rose-400',        // 错误 - 玫红色
    success: 'text-emerald-400',   // 成功 - 翠绿色
    info: 'text-cyan-400',         // 信息 - 青色
    warning: 'text-orange-400'     // 警告 - 橙色
  }
  return tailwindColors[type] || tailwindColors.stdout
}

/**
 * 滚动到底部
 */
const scrollToBottom = (): void => {
  if (!props.autoScroll) return

  nextTick(() => {
    if (containerRef.value) {
      containerRef.value.scrollTop = containerRef.value.scrollHeight
    }
  })
}

// 监听日志变化，自动滚动
watch(
  () => props.logs.length,
  () => {
    scrollToBottom()
  }
)

// 监听 loading 变化，自动滚动
watch(
  () => props.loading,
  () => {
    scrollToBottom()
  }
)

// 组件挂载时滚动到底部
onMounted(() => {
  scrollToBottom()
})

// 暴露方法
defineExpose({
  scrollToBottom,
  getContainer: () => containerRef.value
})
</script>

<style scoped>
/* Loading 动画 */
.loading-dots .dot {
  font-size: 1.5rem;
  line-height: 1;
  animation: loading-bounce 1.4s infinite ease-in-out both;
}

.loading-dots .dot:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots .dot:nth-child(2) {
  animation-delay: -0.16s;
}

.loading-dots .dot:nth-child(3) {
  animation-delay: 0s;
}

@keyframes loading-bounce {
  0%, 80%, 100% {
    opacity: 0.3;
    transform: translateY(0);
  }
  40% {
    opacity: 1;
    transform: translateY(-3px);
  }
}

/* 滚动条样式 */
.bg-slate-900::-webkit-scrollbar {
  width: 6px;
}

.bg-slate-900::-webkit-scrollbar-track {
  background: #0f172a;
}

.bg-slate-900::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 3px;
}

.bg-slate-900::-webkit-scrollbar-thumb:hover {
  background: #475569;
}
</style>

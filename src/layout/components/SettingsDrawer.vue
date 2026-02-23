<template>
  <div>
    <!-- 设置按钮 - 固定在顶部右侧 -->
    <div
      class="settings-trigger"
      @click="drawer = true"
      title="打开设置"
    >
      <el-icon :size="16">
        <Icon name="cog-6-tooth" />
      </el-icon>
    </div>

    <!-- 设置抽屉 -->
    <el-drawer
      v-model="drawer"
      title="主题设置"
      :size="320"
      direction="rtl"
    >
      <div class="px-1">
        <!-- 主题风格 -->
        <div class="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <h4 class="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">主题风格</h4>
          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="mode in themeModes"
              :class="[
                'flex flex-col items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all',
                isDarkMode === mode.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-500'
              ]"
              @click="switchThemeMode(mode.value)"
            >
              <div :class="['text-2xl', isDarkMode === mode.value ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400']">
                <Icon :name="mode.icon" class="text-2xl" />
              </div>
              <span class="text-sm">{{ mode.label }}</span>
            </div>
          </div>
        </div>

        <!-- 菜单布局 - PC端显示 -->
        <div v-if="!appStore.isMobile" class="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <h4 class="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">菜单布局</h4>
          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="layout in layoutModes"
              :key="layout.value"
              :class="[
                'flex flex-col items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all',
                currentLayout === layout.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-500'
              ]"
              @click="switchLayout(layout.value)"
            >
              <div class="w-full p-2">
                <img :src="layout.icon" :alt="layout.label" class="w-full h-auto" />
              </div>
              <span class="text-sm">{{ layout.label }}</span>
            </div>
          </div>
        </div>

        <!-- 系统主题色 -->
        <div class="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">系统主题色</h4>
            <el-icon class="cursor-pointer" @click="resetThemeColor">
              <Icon name="arrow-path" />
            </el-icon>
          </div>
          <div class="flex gap-2 items-center">
            <div
              v-for="color in themeColors"
              :key="color"
              :class="[
                'w-6 h-6 rounded-full cursor-pointer flex items-center justify-center transition-all border-2 flex-shrink-0',
                currentThemeColor === color
                  ? 'border-white shadow-[0_0_0_2px_#409EFF] scale-110'
                  : 'border-transparent hover:scale-110'
              ]"
              :style="{ backgroundColor: color }"
              @click="switchThemeColor(color)"
            >
              <el-icon v-if="currentThemeColor === color" :size="12" class="text-white">
                <Icon name="check" />
              </el-icon>
            </div>
            <!-- 自定义颜色选择器 -->
            <el-color-picker
              v-model="currentThemeColor"
              size="small"
              @change="switchThemeColor(currentThemeColor)"
            />
          </div>
        </div>

        <!-- 基础配置 -->
        <div class="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <h4 class="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">基础配置</h4>
          <div class="flex flex-col gap-4">
            <div class="flex justify-between items-center text-sm text-gray-700 dark:text-gray-300">
              <span>侧边栏手风琴模式</span>
              <el-switch :model-value="configs.accordion" @update:model-value="updateConfig('accordion', $event)" />
            </div>
            <div class="flex justify-between items-center text-sm text-gray-700 dark:text-gray-300">
              <span>显示折叠按钮</span>
              <el-switch :model-value="configs.showCollapseBtn" @update:model-value="updateConfig('showCollapseBtn', $event)" />
            </div>
            <div class="flex justify-between items-center text-sm text-gray-700 dark:text-gray-300">
              <span>显示面包屑导航</span>
              <el-switch :model-value="configs.showBreadcrumb" @update:model-value="updateConfig('showBreadcrumb', $event)" />
            </div>
            <div class="flex justify-between items-center text-sm text-gray-700 dark:text-gray-300">
              <span>显示多语言选择</span>
              <el-switch :model-value="configs.showLang" @update:model-value="updateConfig('showLang', $event)" />
            </div>
            <div class="flex justify-between items-center text-sm text-gray-700 dark:text-gray-300">
              <span>显示页面标签</span>
              <el-switch :model-value="configs.showTabs" @update:model-value="updateConfig('showTabs', $event)" />
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex gap-3 pt-4">
          <el-button type="primary" class="flex-1" @click="copyConfig">复制配置</el-button>
          <el-button class="flex-1" @click="resetConfig">重置配置</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, unref } from 'vue'
import { useDark, useToggle } from '@vueuse/core'
import { useAppStore } from '@/stores/modules/app'
import Message from '@/support/message'
import SingleSidebarIcon from '@/public/assets/single-sidebar.png'
import DoubleSidebarIcon from '@/public/assets/double-sidebar.png'

const appStore = useAppStore()
const drawer = ref(false)

// 主题模式 - 使用 VueUse
const isDark = useDark()
const toggleDark = useToggle(isDark)

const themeModes = [
  { value: false, label: '浅色', icon: 'sun' },
  { value: true, label: '深色', icon: 'moon' }
] as const

const isDarkMode = computed(() => isDark.value)

const switchThemeMode = (isDarkValue: boolean) => {
  // 如果当前状态与目标状态不同，则切换
  if (unref(isDark) !== isDarkValue) {
    appStore.setDarkMode(isDarkValue)
    toggleDark()
  }
}

// 布局模式
const layoutModes = [
  {
    value: 'single',
    label: '垂直',
    icon: SingleSidebarIcon
  },
  {
    value: 'vertical',
    label: '双列',
    icon: DoubleSidebarIcon
  }
]

const currentLayout = computed(() => appStore.getVertical ? 'vertical' : 'single')

const switchLayout = (layout: string) => {
  appStore.setVertical(layout === 'vertical')
}

// 主题色
const themeColors = [
  '#4f46e5', // 系统默认靛蓝
  '#409EFF', // Element Plus 蓝
  '#67C23A', // 绿色
  '#E6A23C', // 橙色
  '#F56C6C', // 红色
  '#722ED1', // 紫色
  '#13C2C2'  // 青色
] as const

const currentThemeColor = computed({
  get: () => appStore.getThemeColor,
  set: (val: string) => appStore.setThemeColor(val)
})

const switchThemeColor = (color: string) => {
  appStore.setThemeColor(color)
}

const resetThemeColor = () => {
  appStore.setThemeColor('#4f46e5')
}

// 基础配置 - 使用 store 中的配置
const configs = computed(() => appStore.getLayoutConfigs)

type LayoutConfigKey = 'accordion' | 'showCollapseBtn' | 'showBreadcrumb' | 'showLang' | 'showTabs'
const updateConfig = (key: LayoutConfigKey, value: boolean) => {
  appStore.setLayoutConfigs({ [key]: value })
}

// 复制配置
const copyConfig = () => {
  const config = {
    layout: currentLayout.value,
    themeColor: currentThemeColor.value,
    isDarkMode: isDarkMode.value,
    ...configs.value
  }

  navigator.clipboard.writeText(JSON.stringify(config, null, 2))
    .then(() => {
      Message.success('配置已复制到剪贴板')
    })
    .catch(() => {
      Message.error('复制失败')
    })
}

// 重置配置
const resetConfig = () => {
  // 重置为双栏布局（默认）
  appStore.setVertical(true)

  // 重置为浅色模式
  if (unref(isDark)) {
    appStore.setDarkMode(false)
    toggleDark()
  }

  // 重置主题色
  resetThemeColor()

  // 重置配置项
  appStore.setLayoutConfigs({
    accordion: true,
    showCollapseBtn: true,
    showBreadcrumb: true,
    showLang: true,
    showTabs: true
  })
}
</script>

<style scoped>
.settings-trigger {
  @apply fixed top-20 right-4 z-[2000] w-9 h-9 flex items-center justify-center cursor-pointer rounded-lg;
  @apply transition-all duration-200 ease-in-out;
  background-color: var(--header-bg-color);
  color: var(--el-text-color-regular);
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.settings-trigger:hover {
  color: var(--el-color-primary);
  border-color: var(--el-color-primary);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
  transform: scale(1.05);
}
</style>

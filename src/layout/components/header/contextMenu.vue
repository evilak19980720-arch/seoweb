<template>
  <slot></slot>
  <Teleport to="body">
    <div
      v-if="showMenu"
      class="fixed z-[99999] bg-white dark:bg-regal-dark shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
      :style="{ top: `${position.y}px`, left: `${position.x}px` }"
    >
      <ul class="w-24 py-1">
        <li
          v-for="item in menuItems"
          :key="item.label"
          :class="[
            'px-3 py-1.5 text-xs transition-colors duration-150',
            item.disabled
              ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer'
          ]"
          @click="!item.disabled && item.action()"
        >
          {{ item.label }}
        </li>
      </ul>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useNavTabStore, type Tab } from '@/stores/modules/tabs'

const navTabStore = useNavTabStore()

interface MenuItem {
  label: string
  action: () => void
  disabled: boolean
}

const position = reactive({ x: 0, y: 0 })
const showMenu = ref(false)
const targetTab = ref<Tab | null>(null)

const menuItems = computed<MenuItem[]>(() => {
  const tab = targetTab.value
  const isAffix = tab?.meta.affix ?? false

  return [
    {
      label: '刷新',
      disabled: false,
      action: () => {
        if (tab) navTabStore.refreshTab(tab)
        showMenu.value = false
      }
    },
    {
      label: '关闭',
      disabled: isAffix,
      action: () => {
        if (tab) navTabStore.removeTargetTab(tab)
        showMenu.value = false
      }
    },
    {
      label: '关闭其他',
      disabled: false,
      action: () => {
        if (tab) navTabStore.removeOtherTabs(tab)
        showMenu.value = false
      }
    },
    {
      label: '关闭所有',
      disabled: false,
      action: () => {
        navTabStore.removeAllTabs()
        showMenu.value = false
      }
    }
  ]
})

const MENU_WIDTH = 96
const MENU_ITEM_HEIGHT = 28
const MENU_PADDING = 8

const open = async (event: MouseEvent, tab: Tab) => {
  targetTab.value = tab
  showMenu.value = true

  await nextTick()
  const menuHeight = menuItems.value.length * MENU_ITEM_HEIGHT + MENU_PADDING
  const { innerWidth, innerHeight } = window

  position.x = event.clientX + MENU_WIDTH > innerWidth
    ? innerWidth - MENU_WIDTH - 4
    : event.clientX
  position.y = event.clientY + menuHeight > innerHeight
    ? innerHeight - menuHeight - 4
    : event.clientY
}

const handleClickOutside = () => {
  showMenu.value = false
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})

defineExpose({ open })
</script>

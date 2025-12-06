<template>
  <div @contextmenu.prevent="handleContextMenu" class="flex gap-x-2">
    <slot></slot>
    <!-- 右击菜单 -->
    <div v-if="showMenu" class="absolute z-[99999] bg-white dark:bg-regal-dark shadow-xl rounded border border-gray-200" :style="{ top: `${position.y}px`, left: `${position.x}px` }">
      <ul class="w-20 py-1 text-center">
        <li v-for="(item, index) in menuItems" :key="index" @click="item.action()" class="hover:bg-gray-50 hover:dark:bg-gray-800 px-2 py-1 hover:cursor-pointer text-[12px]">
          {{ item.label }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onUnmounted } from 'vue'
import { useNavTabStore } from '@/stores/modules/tabs'

const navTabStore = useNavTabStore()
interface MenuItem {
  label: string
  action: Function
}

const position = reactive({ x: 0, y: 0 })
const showMenu = ref(false)
const menuItems = ref<Array<MenuItem>>([
  {
    label: '刷新',
    action: () => {
      navTabStore.refreshCurrentTab()
    }
  },
  {
    label: '关闭',
    action: () => {
      navTabStore.removeCurrentTab()
    }
  },
  {
    label: '关闭其他',
    action: () => {
      navTabStore.removeOtherTabs()
    }
  },
  {
    label: '关闭所有',
    action: () => {
      navTabStore.removeAllTabs()
    }
  }
])

const handleContextMenu = (event: MouseEvent) => {
  event.preventDefault()
  position.x = event.clientX
  position.y = event.clientY
  showMenu.value = true
}

const handleClickOutside = () => {
  showMenu.value = false
}

window.addEventListener('click', handleClickOutside)

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})
</script>

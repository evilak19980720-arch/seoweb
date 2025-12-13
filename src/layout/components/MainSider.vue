<template>
  <div class="main-sider-container w-20 h-screen fixed left-0 top-0 z-[1001] flex-col hidden sm:flex">
    <!-- Logo -->
    <div class="flex items-center justify-center border-b h-14 logo-bg dark:border-b-gray-800">
      <img v-if="setting.dashboard.logo" :src="warpHost(setting.dashboard.logo) || LogPng" class="rounded-full h-9 w-9" />
      <img :src="LogPng" class="rounded-full h-9 w-9" v-else />
    </div>

    <!-- Main Menu Icons -->
    <div class="main-menu-list flex-1 overflow-y-auto overflow-x-hidden py-2">
      <div
        v-for="menu in topLevelMenus"
        :key="menu.name"
        :class="[
          'main-menu-item',
          'w-20 py-3 flex flex-col items-center justify-center cursor-pointer transition-colors duration-300 relative',
          isActiveMenu(menu) ? 'active' : ''
        ]"
        @click="handleMenuClick(menu)"
      >
        <el-icon class="!w-5 !h-5 mb-1">
          <Icon :name="menu.meta?.icon || 'squares-2x2'" />
        </el-icon>
        <span class="text-xs leading-tight text-center truncate w-full px-1">{{ menu.meta?.title }}</span>
      </div>
    </div>

    <!-- Collapse Button -->
    <div class="flex justify-center items-center p-4 mt-auto cursor-pointer transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800" @click="toggleLayout">
      <el-icon :size="20">
        <Icon :name="appStore.getVertical ? 'chevron-double-left' : 'chevron-double-right'" />
      </el-icon>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/modules/app'
import { usePermissionsStore } from '@/stores/modules/user/permissions'
import { useUserStore } from '@/stores/modules/user'
import { Menu } from '@/types/Menu'
import LogPng from '@/public/assets/logo.png'
import { warpHost } from '@/support/helper'

const router = useRouter()
const appStore = useAppStore()
const permissionsStore = usePermissionsStore()
const userStore = useUserStore()

const setting = computed(() => appStore.getSetting)

// 获取顶级菜单（一级菜单）
const topLevelMenus = computed(() => {
  const permissions = userStore.getPermissions === undefined ? [] : userStore.getPermissions
  const menus = permissionsStore.getMenusFrom(permissions, false)

  // 过滤出有子菜单的顶级菜单
  return menus.filter(menu => !menu.meta?.hidden && menu.children && menu.children.length > 0)
})

// 判断菜单是否激活
const isActiveMenu = (menu: Menu) => {
  return permissionsStore.getVerticalActiveMenuName === menu.name
}

// 处理菜单点击
const handleMenuClick = (menu: Menu) => {
  if (menu.name) {
    permissionsStore.setVerticalActiveMenuName(menu.name as string)

    // 自动导航到第一个子菜单
    if (menu.children && menu.children.length > 0) {
      const firstChild = menu.children[0]
      // 如果第一个子菜单还有子菜单，继续找到最深的第一个子菜单
      let targetMenu = firstChild
      while (targetMenu.children && targetMenu.children.length > 0) {
        targetMenu = targetMenu.children[0]
      }
      // 导航到目标菜单
      if (targetMenu.path) {
        router.push(targetMenu.path)
      }
    }
  }
}

// 切换布局模式
const toggleLayout = () => {
  appStore.setVertical(!appStore.getVertical)
}
</script>

<style scoped>
/* 保留 CSS 变量支持主题切换 */
.main-sider-container {
  background-color: var(--sider-menu-bg-color);
  border-right: 1px solid var(--el-border-color-lighter);
}

.logo-bg {
  background-color: var(--header-logo-bg-color);
}

.main-menu-item {
  color: var(--el-text-color-regular);
}

.main-menu-item:hover {
  background-color: var(--sider-sub-menu-hover-bg-color);
}

.main-menu-item.active {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}


/* 自定义滚动条样式 */
.main-menu-list::-webkit-scrollbar {
  width: 4px;
}

.main-menu-list::-webkit-scrollbar-track {
  background: transparent;
}

.main-menu-list::-webkit-scrollbar-thumb {
  background: rgba(144, 147, 153, 0.3);
  border-radius: 4px;
}

.main-menu-list::-webkit-scrollbar-thumb:hover {
  background: rgba(144, 147, 153, 0.5);
}
</style>

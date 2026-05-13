<template>
  <div class="main-sider-container w-20 h-screen fixed left-0 top-0 z-[1001] flex-col hidden sm:flex">
    <!-- Logo -->
    <div class="main-sider-logo">
      <img v-if="setting.dashboard.logo" :src="warpHost(setting.dashboard.logo) || LogPng" class="rounded-xl h-9 w-9 shadow-xs" />
      <img :src="LogPng" class="rounded-xl h-9 w-9 shadow-xs" v-else />
    </div>

    <!-- Main Menu Icons -->
    <div class="main-menu-list flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-1">
      <div
        v-for="menu in topLevelMenus"
        :key="menu.name"
        :class="['main-menu-item', isActiveMenu(menu) ? 'active' : '']"
        @click="handleMenuClick(menu)"
        :title="menu.meta?.title"
      >
        <div class="main-menu-icon-wrap">
          <el-icon class="!w-[22px] !h-[22px]">
            <Icon :name="menu.meta?.icon || 'squares-2x2'" />
          </el-icon>
        </div>
        <span class="main-menu-label">{{ menu.meta?.title }}</span>
      </div>
    </div>

    <!-- Collapse Button -->
    <div class="main-sider-collapse" @click="toggleLayout">
      <el-icon :size="16">
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
@reference "tailwindcss";
.main-sider-container {
  background-color: var(--sider-menu-bg-color);
  border-right: 1px solid var(--el-border-color-lighter);
}

.main-sider-logo {
  @apply flex items-center justify-center h-14 shrink-0;
  background-color: var(--header-logo-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.main-menu-item {
  @apply flex flex-col items-center justify-center py-2 rounded-xl cursor-pointer;
  @apply transition-all duration-200 ease-in-out;
  color: var(--el-text-color-regular);
}

.main-menu-icon-wrap {
  @apply w-10 h-10 rounded-lg flex items-center justify-center mb-1;
  @apply transition-all duration-200 ease-in-out;
}

.main-menu-label {
  @apply text-[11px] leading-tight text-center w-full px-1;
  @apply transition-colors duration-200;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-all;
}

.main-menu-item:hover {
  color: var(--el-color-primary);
}

.main-menu-item:hover .main-menu-icon-wrap {
  background: color-mix(in srgb, var(--el-color-primary) 10%, transparent);
}

.main-menu-item.active {
  color: var(--el-color-primary);
}

.main-menu-item.active .main-menu-icon-wrap {
  background: color-mix(in srgb, var(--el-color-primary) 12%, transparent);
  color: var(--el-color-primary);
}

.main-menu-item.active .main-menu-label {
  font-weight: 600;
}

.main-sider-collapse {
  @apply flex justify-center items-center py-3 cursor-pointer;
  @apply transition-colors duration-200;
  color: var(--el-text-color-secondary);
  border-top: 1px solid var(--el-border-color-lighter);
}

.main-sider-collapse:hover {
  color: var(--el-color-primary);
  background: color-mix(in srgb, var(--el-color-primary) 6%, transparent);
}

/* 自定义滚动条 */
.main-menu-list::-webkit-scrollbar {
  width: 0;
}
</style>

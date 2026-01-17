<template>
  <div class="z-20 w-full h-14 bg-[var(--header-bg-color)] border-b border-l border-[var(--el-border-color-lighter)]">
    <div class="flex items-center justify-between h-full px-3 gap-3">
      <div class="flex items-center gap-2 min-w-0 sm:min-w-64 flex-1">
        <div v-if="store.getLayoutConfigs.showCollapseBtn" class="cursor-pointer" @click="store.changeExpaned">
          <Icon name="list-bullet" class="w-6 h-8" />
        </div>
        <div v-if="store.getLayoutConfigs.showBreadcrumb" class="flex items-center min-w-0">
          <Breadcrumbs />
        </div>
      </div>

      <div class="flex items-center gap-1 sm:gap-[0.35rem] shrink-0">
        <!-- 搜索 -->
        <MenuSearch />
        <!-- 多语言 -->
        <div v-if="store.getLayoutConfigs.showLang" class="hidden md:grid">
          <Lang />
        </div>
        <!-- 暗黑主题 -->
        <Theme />
        <Notification />
        <Profile />
      </div>
    </div>
  </div>
  <Tabs v-if="store.getLayoutConfigs.showTabs" />
</template>
<script setup lang="ts">
import { useAppStore } from '@/stores/modules/app'
import Notification from './notification.vue'
import MenuSearch from './menuSearch.vue'
import Tabs from './tabs.vue'

const store = useAppStore()
</script>

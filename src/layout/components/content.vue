<template>
  <div :class="mlClass" class="flex flex-1 min-w-0 overflow-x-hidden flex-col h-screen main-bg" style="width: 100%">
    <!-- Header -->
    <Header />
    <!-- Container -->
    <div class="overflow-auto p-1 max-w-full sm:p-3 sm:overflow-x-hidden dark:bg-regal-deep-dark">
      <div class="min-h-[calc(100vh-8rem)]">
        <router-view v-slot="{ Component }">
          <component :is="Component" :key="routeKey" />
        </router-view>
      </div>
      <div class="w-full h-4 leading-10 text-center text-gray-400"><el-link href="https://catchadmin.com" target="_blank">CatchAdmin</el-link> 管理系统 @copyright 2018 ~ {{ year }}</div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/modules/app'
import router from '@/router'
const appStore = useAppStore()

// 计算 margin-left 类名，使用瞬时切换
const mlClass = computed(() => {
  // 双栏模式 (MainSider 80px + Sider 192px = 272px)
  if (appStore.getVertical) {
    return appStore.isExpand ? 'ml-0 sm:ml-[272px]' : 'ml-0 sm:ml-20'
  }
  // 单栏模式 (Sider 192px)
  return appStore.isExpand ? 'ml-0 sm:ml-48' : 'ml-0 sm:ml-16'
})

// const isKeepalive = computed(() => router.currentRoute.value.meta.keepalive)
const routeKey = computed(() => router.currentRoute.value.name)

const year = computed(() => {
  const date = new Date()

  return date.getFullYear()
})
</script>

<template>
  <div class="content-wrapper flex flex-1 min-w-0 overflow-x-hidden flex-col h-screen main-bg" :style="{ marginLeft: mlValue }">
    <!-- Header -->
    <Header />
    <!-- Container -->
    <div class="content-scroll overflow-auto max-w-full sm:overflow-x-hidden dark:bg-regal-deep-dark">
      <div class="content-body">
        <router-view v-slot="{ Component }">
          <component :is="Component" :key="routeKey" />
        </router-view>
      </div>
      <!-- 底部版权 -->
      <div class="content-footer">
        <span>CatchAdmin</span>
        <span class="mx-1.5">·</span>
        <span>© 2018 ~ {{ year }}</span>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/modules/app'
import { useNavTabStore } from '@/stores/modules/tabs'
import router from '@/router'
const appStore = useAppStore()
const navTabStore = useNavTabStore()

const mlValue = computed(() => {
  if (window.innerWidth < 640) return '0px'
  if (appStore.getVertical) {
    return appStore.isExpand ? '320px' : '80px'
  }
  return appStore.isExpand ? '240px' : '64px'
})

const routeKey = computed(() => `${String(router.currentRoute.value.name)}-${navTabStore.getRefreshKey}`)

const year = computed(() => {
  const date = new Date()
  return date.getFullYear()
})
</script>

<style scoped>
.content-wrapper {
  transition: margin-left 280ms cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
}

.content-scroll {
  @apply p-2 sm:p-4;
}

.content-body {
  min-height: calc(100vh - 8rem);
}

.content-footer {
  @apply flex items-center justify-center py-4 text-xs;
  color: var(--el-text-color-placeholder);
  letter-spacing: 0.02em;
}
</style>

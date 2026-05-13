<template>
  <div class="header-bar z-20 w-full h-14 shrink-0">
    <div class="flex items-center justify-between h-full px-4 gap-4">
      <div class="flex items-center gap-3 min-w-0 flex-1">
        <div v-if="store.getLayoutConfigs.showCollapseBtn" class="header-action-sm" @click="store.changeExpaned">
          <Icon :name="store.isExpand ? 'bars-3-bottom-left' : 'bars-3'" class="w-[18px] h-[18px]" />
        </div>
        <div v-if="store.getLayoutConfigs.showBreadcrumb" class="flex items-center min-w-0">
          <Breadcrumbs />
        </div>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <!-- 首页链接 -->
        <a
          v-if="store.getSetting?.dashboard?.homepage"
          :href="store.getSetting.dashboard.homepage"
          target="_blank"
          rel="noopener noreferrer"
          class="header-action"
          title="访问首页"
        >
          <Icon name="home" class="w-[18px] h-[18px]" />
        </a>
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

<style scoped>
@reference "tailwindcss";
.header-bar {
  background-color: var(--header-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.header-action-sm {
  @apply w-9 h-9 rounded-lg grid place-items-center cursor-pointer;
  @apply transition-all duration-150 ease-in-out;
  color: var(--el-text-color-regular);
}

.header-action-sm:hover {
  background: color-mix(in srgb, var(--el-color-primary) 8%, transparent);
  color: var(--el-text-color-primary);
}
</style>

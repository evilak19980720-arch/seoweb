<template>
  <div class="z-20 flex flex-row w-full border-b border-l border-gray-200 dark:border-gray-800 h-14" style="background-color: var(--header-bg-color)">
    <div class="flex flex-row justify-between w-full h-14">
      <div class="flex flex-row min-w-[17rem]">
        <div v-if="store.getLayoutConfigs.showCollapseBtn" class="flex items-center w-8 h-full ml-2 hover:cursor-pointer" @click="store.changeExpaned">
          <Icon name="list-bullet" class="w-6 h-8" />
        </div>
        <div v-if="store.getLayoutConfigs.showBreadcrumb" class="flex items-center pl-3 w-96 sm:pl-0">
          <Breadcrumbs />
        </div>
      </div>

      <div class="grid grid-cols-3 sm:grid-cols-6 w-80 sm:min-w-[18rem] pl-1 sm:pl-0 justify-center">
        <!-- 搜索 -->
        <MenuSearch />
        <!-- 多语言 -->
        <Lang v-if="store.getLayoutConfigs.showLang" />
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

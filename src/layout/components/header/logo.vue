<template>
  <div class="logo-container">
    <!-- 双栏模式下不显示图片 -->
    <template v-if="!store.getVertical">
      <img v-if="setting.dashboard.logo" :src="warpHost(setting.dashboard.logo)" class="rounded-xl h-8 w-8" />
      <img :src="LogPng" class="rounded-xl h-8 w-8" v-else />
    </template>
    <!--这里写应用名称-->
    <div :class="['logo-text text-sm font-semibold tracking-tight', store.getVertical ? '' : 'pl-3']" v-if="store.isExpand">{{ setting.dashboard.name }}</div>
  </div>
</template>

<script lang="ts" setup>
//@ts-nocheck
import { useAppStore } from '@/stores/modules/app'
import LogPng from '@/public/assets/logo.png'
import { warpHost } from '@/support/helper'
import { computed } from 'vue'

const store = useAppStore()
const setting = computed(() => store.getSetting)
</script>
<style scoped>
.logo-container {
  @apply flex items-center justify-center h-14 shrink-0;
  background-color: var(--header-logo-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.logo-text {
  color: var(--header-logo-text-color);
}
</style>

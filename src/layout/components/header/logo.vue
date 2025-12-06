<template>
  <div class="flex items-center justify-center border-b h-14 logo-bg dark:border-b-gray-800">
    <!-- 双栏模式下不显示图片 -->
    <template v-if="!store.getVertical">
      <img v-if="setting.dashboard.logo" :src="warpHost(setting.dashboard.logo)" class="rounded-full h-9 w-9" />
      <img :src="LogPng" class="rounded-full h-9 w-9" v-else />
    </template>
    <!--这里写应用名称-->
    <div :class="['text-md logo-text', store.getVertical ? '' : 'pl-3']" v-if="store.isExpand">{{ setting.dashboard.name }}</div>
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
.logo-bg {
  background-color: var(--header-logo-bg-color);
}

.logo-text {
  color: var(--header-logo-text-color);
}
</style>

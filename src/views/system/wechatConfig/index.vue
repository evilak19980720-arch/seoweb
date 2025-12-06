<template>
  <div class="w-full bg-white dark:bg-regal-dark p-5">
    <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
      <el-tab-pane label="微信公众号配置" name="office">
        <wechatOffice />
      </el-tab-pane>
      <el-tab-pane label="微信小程序配置" name="mini">
        <wechatMini />
      </el-tab-pane>
      <el-tab-pane label="微信开放平台配置" name="pc">
        <wechatPc />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import type { TabsPaneContext } from 'element-plus'
import wechatMini from './components/wechatMini.vue'
import wechatPc from './components/wechatPc.vue'
import wechatOffice from './components/wechatOffice.vue'

const activeName = ref('office')

const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event)
}
</script>
<style scoped>
:deep(.el-tabs__nav > .is-active) {
  @apply text-base;
}
</style>

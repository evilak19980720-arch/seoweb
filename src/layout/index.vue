<template>
  <div class="flex w-full main-bg dark:bg-regal-deep-dark" ref="el">
    <!--- Main Sider (双栏模式的主菜单栏) -->
    <Transition name="main-sider">
      <MainSider v-if="appStore.getVertical" />
    </Transition>
    <!--- Sider (单栏模式或双栏模式的子菜单栏) -->
    <Sider />
    <!--content-->
    <Content />
    <Exception />
    <!-- 设置抽屉 -->
    <SettingsDrawer />
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/modules/app'
import MainSider from './components/MainSider.vue'
import SettingsDrawer from './components/SettingsDrawer.vue'

const appStore = useAppStore()
</script>

<style scoped>
/* 禁用 MainSider 的过渡动画，避免出现间隙 */
.main-sider-enter-active,
.main-sider-leave-active {
  transition: none;
}
</style>

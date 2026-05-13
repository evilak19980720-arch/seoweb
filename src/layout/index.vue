<template>
  <div class="layout-root" ref="el">
    <!--- Main Sider (双栏模式的主菜单栏) -->
    <MainSider v-if="appStore.getVertical" />
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
import { onMounted } from 'vue'
import { useAppStore } from '@/stores/modules/app'
import MainSider from './components/MainSider.vue'
import SettingsDrawer from './components/SettingsDrawer.vue'

const appStore = useAppStore()

// 页面加载时应用持久化的主题色
onMounted(() => {
  const savedColor = appStore.getThemeColor
  if (savedColor) {
    document.documentElement.style.setProperty('--el-color-primary', savedColor)
  }
})
</script>

<style scoped>
@reference "tailwindcss";
.layout-root {
  @apply flex w-full min-h-screen;
  background-color: var(--el-bg-color-page, #f1f5f9);
}
</style>

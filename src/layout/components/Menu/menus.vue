<template>
  <el-menu
    :default-active="appStore.getActiveMenu"
    background-color="var(--sider-menu-bg-color)"
    active-text-color="var(--sider-ment-active-text-color)"
    text-color="var(--sider-menu-text-color)"
    :collapse="!appStore.isExpand"
    :collapse-transition="false"
    :router="true"
    :unique-opened="appStore.getLayoutConfigs.accordion"
  >
    <slot />
  </el-menu>
</template>
<script lang="ts" setup name="menus">
import { useAppStore } from '@/stores/modules/app'
import { watch } from 'vue'
import router from '@/router'
import { useNavTabStore } from '@/stores/modules/tabs'

const navTabStore = useNavTabStore()
watch(
  () => router.currentRoute,
  (to, from) => {
    const tab: any = {
      name: to.value.name,
      fullPath: to.value.fullPath,
      path: to.value.path,
      is_active: true,
      meta: {
        title: to.value.meta.title,
        affix: false,
        keepalive: !!to.value.meta.keepalive
      }
    }
    navTabStore.addTabs(tab)
  },
  { deep: true, immediate: true }
)
const appStore = useAppStore()
</script>

<style scoped>
.el-menu {
  border-right: none;
}

:deep(.el-menu-item) {
  height: 48px !important;
  margin: 4px 10px;
  border-radius: 8px;
  font-size: 14px;
  transition: all 200ms ease;
  position: relative;
}

:deep(.el-menu-item .el-icon) {
  font-size: 18px;
  margin-right: 10px;
}

:deep(.el-menu-item:hover) {
  background-color: var(--sider-sub-menu-hover-bg-color) !important;
}

:deep(.el-menu-item.is-active) {
  background-color: var(--side-active-menu-bg-color) !important;
  font-weight: 500;
}

:deep(.el-sub-menu__title) {
  padding-left: calc(var(--el-menu-base-level-padding) + var(--el-menu-level) * var(--el-menu-level-padding));
  color: var(--sider-menu-text-color);
  height: 48px !important;
  margin: 4px 10px;
  border-radius: 8px;
  font-size: 14px;
  transition: all 200ms ease;
}

:deep(.el-sub-menu__title .el-icon) {
  font-size: 14px;
  margin-right: 5px;
}

:deep(.el-sub-menu) {
  color: var(--sider-sub-menu-bg-color);
}

:deep(.el-sub-menu__icon-arrow) {
  font-size: 10px;
}

:deep(.el-sub-menu__title:hover) {
  background-color: var(--sider-sub-menu-hover-bg-color) !important;
}

:deep(.el-menu--popup .el-menu-item:hover) {
  background-color: var(--sider-sub-menu-hover-bg-color) !important;
}
</style>

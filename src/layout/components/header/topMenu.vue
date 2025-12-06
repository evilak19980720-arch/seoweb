<template>
  <el-menu :default-active="activeIndex" mode="horizontal" @select="handleSelect" :ellipsis="false">
    <el-menu-item :index="menu.name" v-for="menu in menus" :key="menu.name">{{ menu.meta?.title }}</el-menu-item>
  </el-menu>
</template>
<script setup lang="ts">
// 一级菜单展示
import { usePermissionsStore } from '@/stores/modules/user/permissions'
import { computed } from 'vue'
const permissionsStore = usePermissionsStore()
const menus = computed(() => permissionsStore.getMenus)

const activeIndex = computed(() => permissionsStore.getVerticalActiveMenuName)

const handleSelect = (key: string, keyPath: string[]) => {
  permissionsStore.setVerticalActiveMenuName(key)
}
</script>

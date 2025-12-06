<template>
  <el-breadcrumb separator="/" class="flex sm:text-sm lg:text-base">
    <transition-group name="breadcrumb">
      <!--<el-breadcrumb-item :to="{ path: '/' }" class="text-blue=">Dashboard</el-breadcrumb-item>-->
      <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index" class="text">{{ item }}</el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script lang="ts" setup>
import router from '@/router'
import { watch, onMounted, ref } from 'vue'
import { useAppStore } from '@/stores/modules/app'
import { RouteLocationNormalizedLoaded } from 'vue-router'
import { usePermissionsStore } from '@/stores/modules/user/permissions'
import { isUndefined } from '@/support/helper'
const appStore = useAppStore()
const breadcrumbs = ref<string[]>([])

// 监听当前路由的变化
watch(
  () => router.currentRoute.value,
  (newValue, oldValue) => {
    // 激活菜单
    if (newValue.meta.active_menu) {
      appStore.setActiveMenu(newValue.meta.active_menu as string)
    }
    setActiveMenu(newValue)
    getBreadcrumbs(newValue)
  },
  { deep: true }
)

// get init breadcrumb
onMounted(() => {
  setActiveMenu(router.currentRoute.value)
  getBreadcrumbs(router.currentRoute.value)
})

const setActiveMenu = (route: RouteLocationNormalizedLoaded) => {
  // 如果是水平模式
  if (route.matched[0]?.name) {
    const permissionStore = usePermissionsStore()
    permissionStore.setVerticalActiveMenuName(route.matched[0]?.name as string)
  }

  if (route.path !== '/') {
    // 如果是内页，并且设置激活菜单
    if (route.meta.active_menu) {
      appStore.setActiveMenu(route.meta.active_menu as string)
    } else {
      appStore.setActiveMenu(route.path)
    }
  }
}

// get breadcrums
function getBreadcrumbs(newRoute: RouteLocationNormalizedLoaded) {
  breadcrumbs.value = []
  // breadcrumbs.value.push('首页')
  newRoute.matched.forEach(m => {
    if (!isUndefined(m.meta.title)) {
      breadcrumbs.value.push(m.meta?.title as string)
    }
  })
}
</script>

<style>
.breadcrumb-leave-active {
  transition: all 1s linear;
}

.breadcrumb-leave-to {
  opacity: 0;
  transition: all 0.3s linear;
}
.el-breadcrumb {
  font-size: 13px;
}
</style>

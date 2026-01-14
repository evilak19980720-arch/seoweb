<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'

// 应用挂载后立即隐藏 loading
onMounted(() => {
  // 调用 index.html 中定义的隐藏函数
  if (typeof window.hideAppLoading === 'function') {
    window.hideAppLoading()
  }
})
</script>

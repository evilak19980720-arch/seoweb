<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'

// 在应用程序挂载后隐藏加载屏幕
onMounted(() => {
  // 确保DOM已完全加载
  window.addEventListener('DOMContentLoaded', () => {
    document.body.style.backgroundColor = '#f5f7fa'
  })

  // 延迟一小段时间确保应用已完全渲染
  setTimeout(() => {
    const appLoading = document.getElementById('app-loading')
    if (appLoading) {
      // 先设置透明度为0，然后在过渡结束后移除元素
      appLoading.style.opacity = '0'
      appLoading.style.visibility = 'hidden'

      // 监听过渡结束后移除元素
      appLoading.addEventListener('transitionend', () => {
        appLoading.remove()
      })
    }
  }, 100) // 延迟100毫秒，可根据需要调整
})
</script>

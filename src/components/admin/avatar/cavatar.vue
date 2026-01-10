<template>
  <div>
    <el-avatar :icon="UserFilled" :size="size" v-if="!avatarSrc" :shapre="shape" />

    <el-avatar :src="avatarSrc" :size="size" v-else :shapre="shape" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { UserFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/modules/user'
import { warpHost } from '@/support/helper'
const userStore = useUserStore()

const props = defineProps({
  avatar: {
    type: String,
    default: null
  },
  size: {
    type: Number,
    default: 33
  },
  shape: {
    type: String,
    default: 'circle'
  },
  // 当 avatar 为空时，是否使用当前登录用户的头像作为默认值
  fallbackToUser: {
    type: Boolean,
    default: true
  }
})

const avatarSrc = computed(() => warpHost(props.avatar || (props.fallbackToUser ? userStore.getAvatar : null)))
</script>

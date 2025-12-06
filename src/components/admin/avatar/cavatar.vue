<template>
  <div>
    <el-avatar :icon="UserFilled" :size="size" v-if="!avatarSrc" :shapre="shape" />

    <el-avatar :src="avatarSrc" :size="size" v-else :shapre="shape" />
  </div>
</template>

<script setup lang="ts">
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
  }
})

const avatarSrc = warpHost(props.avatar ? props.avatar : userStore.getAvatar)
</script>

<template>
  <el-button type="primary" :size="size">
    <Icon :name="icon" className="w-4 h-4 mr-1" />
    {{ text }}
  </el-button>
</template>

<script lang="ts" setup>
import { t } from '@/support/helper'

defineProps({
  size: {
    type: String,
    default: 'default'
  },
  icon: {
    type: String,
    default: 'plus'
  },
  text: {
    type: String,
    default: t('system.add')
  }
})
</script>

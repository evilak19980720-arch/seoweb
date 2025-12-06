<template>
  <el-button type="primary" :size="size" text>
    <Icon :name="icon" className="w-4 h-4 mr-1" />
    {{ text }}
  </el-button>
</template>

<script lang="ts" setup>
import { t } from '@/support/helper'

defineProps({
  size: {
    type: String,
    default: 'small'
  },
  icon: {
    type: String,
    default: 'eye'
  },
  text: {
    type: String,
    default: t('system.show')
  }
})
</script>

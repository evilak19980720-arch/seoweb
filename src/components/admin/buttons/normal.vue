<template>
  <el-button :type="type" :size="size" :class="className">
    <Icon :name="icon" v-if="icon" :class="iconClass" />
    {{ label }}
  </el-button>
</template>

<script lang="ts" setup>
import { t } from '@/support/helper'

defineProps({
  className: {
    type: String,
    default: ''
  },
  iconClass: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'primary'
  },
  size: {
    type: String,
    default: 'default'
  },
  icon: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: t('system.add')
  }
})
</script>

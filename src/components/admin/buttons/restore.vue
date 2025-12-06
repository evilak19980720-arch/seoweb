<template>
  <el-button type="success" :size="size" v-bind="$attrs">
    <Icon :name="icon" className="w-4 h-4 mr-1" />
    {{ text }}
  </el-button>
</template>

<script lang="ts" setup>
defineProps({
  size: {
    type: String,
    default: 'small'
  },
  icon: {
    type: String,
    default: 'arrow-uturn-left'
  },
  text: {
    type: String,
    default: '恢复'
  }
})
</script>

<style scoped></style>

<template>
  <div>
    <editor :height="height" v-model="content" />
    <el-input v-model="content" class="invisible" />
  </div>
</template>

<script setup lang="ts">
defineProps({
  height: {
    type: Number,
    default: 600
  }
})
const content = defineModel({
  type: String
})
</script>

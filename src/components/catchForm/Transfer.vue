<template>
  <el-transfer
    v-model="model"
    :props="{
      key: 'value',
      label: 'desc'
    }"
    :data="data"
    $attrs
  />
</template>
<script lang="ts" setup>
const model = defineModel({
  type: Array<string | number>,
  default: () => []
})
const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
})
</script>

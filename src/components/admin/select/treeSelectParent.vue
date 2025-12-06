<template>
  <el-tree-select
    v-bind="$attrs"
    :model-value="modelValue"
    :data="data"
    check-strictly
    :value-key="valueKey"
    :render-after-expand="false"
    class="w-full"
    :props="{
      label: label
    }"
    :placeholder="placeholder"
    @node-click="handleNodeClick"
  />
</template>
<script setup lang="ts">
import http from '@/support/http'
import { ref } from 'vue'

const props = defineProps({
  api: {
    type: String,
    require: false,
    default: ''
  },
  /**
  modelValue: {
    type: [String, Number],
    require: true
  }, */

  valueKey: {
    type: String,
    default: 'id'
  },
  label: {
    type: String,
    default: 'name'
  },
  placeholder: {
    type: String,
    default: '请选择父级'
  }
})

const data = ref()
http.get(props.api).then(r => {
  data.value = r.data.data
})

const modelValue = defineModel()
const handleNodeClick = (node: any) => {
  modelValue.value = node.id
}
</script>

<template>
  <el-cascader
    v-bind="$attrs"
    :model-value="modelValue"
    :options="options"
    :props="{ multiple: multiple, value: value, label: label }"
    check-strictly
    class="w-full"
    :placeholder="placeholder"
    @change="handleChange"
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
    type: [String, Number, Array],
    require: true
  }, */

  value: {
    type: String,
    default: 'id'
  },
  multiple: {
    type: Boolean,
    default: true
  },
  label: {
    type: String,
    default: 'name'
  },
  placeholder: {
    type: String,
    default: '请选择'
  }
})

const options = ref()
http.get(props.api).then(r => {
  options.value = r.data.data
})

const modelValue = defineModel()

const handleChange = (value: any) => {
  modelValue.value = value
}
</script>

<template>
  <el-cascader :options="options" :model-value="modelValue" v-bind="$attrs" />
</template>

<script lang="ts" setup>
import http from '@/support/http'
import { ref } from 'vue'
const props = defineProps({
  table: {
    type: String,
    required: true
  },
  value: {
    type: String,
    default: 'id'
  },
  label: {
    type: String,
    default: 'name'
  },
  pid: {
    type: String,
    default: 'parent_id'
  }
})

const options = ref([])
const modelValue = defineModel()

const getOptions = () => {
  http
    .get(`/options/tableData`, { table: props.table, value: props.value, label: props.label, pid: props.pid })
    .then(response => {
      options.value = response.data.data
      console.log(options.value)
    })
    .catch(error => {
      console.error('Error fetching options:', error)
    })
}
getOptions()
</script>

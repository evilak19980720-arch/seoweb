<template>
  <el-cascader :options="options" v-model="modelValue" v-bind="$attrs" clearable :props="defaultProps" />
</template>

<script lang="ts" setup>
import { useGetRemoteTableData } from '@/composables/useGetRemoteTableData'
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
  },
  props: {
    type: Object,
    default: () => ({})
  }
})

const defaultProps = {
  value: props.value,
  label: props.label,
  ...props.props
}
const modelValue = defineModel()
const { options } = useGetRemoteTableData(props.table, props.value, props.label, props.pid)
</script>

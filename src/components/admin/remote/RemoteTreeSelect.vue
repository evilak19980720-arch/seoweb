<template>
  <el-tree-select v-model="modelValue" :data="options" :props="defaultProps" v-bind="$attrs" clearable />
</template>
<script lang="ts" setup>
import { useGetRemoteTableData } from '@/composables/useGetRemoteTableData'

const props = defineProps({
  label: {
    type: String,
    default: 'name'
  },
  value: {
    type: String,
    default: 'id'
  },
  table: {
    type: String,
    require: true,
    default: ''
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

const { options, loading, filter } = useGetRemoteTableData(props.table, props.value, props.label, props.pid)
</script>

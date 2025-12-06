<template>
  <el-tree v-loading="loading" ref="tree" :data="options" v-bind="$attrs" :props="defaultProps" clearable :node-key="value" :show-checkbox="showCheckbox" @check="defaultSelectCheckboxMethod"
    ><slot
  /></el-tree>
</template>

<script lang="ts" setup>
import { useGetRemoteTableData } from '@/composables/useGetRemoteTableData'
import { nextTick, ref, watch } from 'vue'
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
  children: {
    type: String,
    default: 'children'
  },
  pid: {
    type: String,
    default: 'parent_id'
  },
  showCheckbox: {
    type: Boolean,
    default: true
  },
  selectCheckbox: {
    type: Function,
    default: null
  },
  props: {
    type: Object,
    default: () => ({})
  },
  needHalfChecked: {
    type: Boolean,
    default: true
  },

  setChecked: {
    type: Function,
    default: null
  }
})

const defaultProps = {
  value: props.value,
  label: props.label,
  children: props.children,
  ...props.props
}
const modelValue = defineModel({
  type: Array,
  default: () => []
})
const { options, loading } = useGetRemoteTableData(props.table, props.value, props.label, props.pid)
const tree = ref()
// 如果没有传入selectCheckbox函数，则使用默认的选择逻辑
// 如果传入了selectCheckbox函数，则使用传入的函数来处理选中节点
const defaultSelectCheckboxMethod = props.selectCheckbox
  ? props.selectCheckbox
  : (checkedNodes: any, checkedKeys: any) => {
      if (props.needHalfChecked) {
        modelValue.value = checkedKeys.checkedKeys.concat(checkedKeys.halfCheckedKeys).sort()
      } else {
        modelValue.value = checkedKeys.checkedKeys.sort()
      }
    }
// 选中
watch(
  () => options.value,
  async () => {
    // 如果有传入的值，则选中对应的节点
    await nextTick()
    // 如果有传入 set checked 的方法，则优先执行它，没有则执行默认
    props.setChecked ? props.setChecked(modelValue, tree.value) : defaultSetChecked(modelValue.value)
  },
  { deep: true }
)

const defaultSetChecked = (value: any) => {
  // 如果有传入的值，则选中对应的节点
  if (value && value.length > 0) {
    value.forEach((item: any) => {
      tree.value?.setChecked(item, true, false)
    })
  }
}
</script>

<template>
  <div class="bg-white dark:bg-regal-dark w-full sm:w-[22rem] min-h-[30rem]">
    <el-tree :data="departments" :props="{ label: 'department_name', value: 'id' }" @node-click="clickDepartment" class="p-5" :expand-on-click-node="false" :highlight-current="true" />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import http from '@/support/http'
defineProps({
  modelValue: {
    type: Number,
    default: 0
  }
})

const departments = ref()

onMounted(() => {
  http.get('permissions/departments').then(r => {
    departments.value = r.data.data
  })
})

const emits = defineEmits(['update:modelValue', 'searchDepartmentUsers'])

const clickDepartment = (node: any) => {
  emits('update:modelValue', node.id)

  emits('searchDepartmentUsers')
}
</script>

<style scoped>
@reference "tailwindcss";
:deep(.el-tree .el-tree-node) {
  @apply p-0.5;
}

:deep(.el-tree .el-tree-node .el-tree-node__content) {
  @apply h-8 rounded;
}
</style>

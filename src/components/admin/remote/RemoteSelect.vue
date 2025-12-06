<template>
  <el-select v-bind="$attrs" v-model="modelValue" filterable clearable :filter-method="filterMethod" :loading="loading">
    <el-option v-for="item in options" :key="item[value]" :label="item[label]" :value="item[value]">
      <div class="flex justify-between px-2">
        <div>{{ item[label] }}</div>
        <div>
          <slot :row="item" name="other" />
        </div>
      </div>
    </el-option>
    <!-- 底部 -->
    <template #footer>
      <el-pagination :page-size="limit" layout="prev, pager, next" :total="+total" class="flex justify-end" @current-change="changePage" />
    </template>
  </el-select>
</template>
<script lang="ts" setup>
import { useGetRemoteTablePaginateData } from '@/composables/useGetRemoteTableData'

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
  }
})

const modelValue = defineModel()

const { options, loading, page, limit, total, filter } = useGetRemoteTablePaginateData(props.table, props.value, props.label)
console.log(options)
const changePage = (p: number) => {
  page.value = p
}
const filterMethod = (title: string) => {
  filter.value = title
}
</script>

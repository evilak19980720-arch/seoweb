<template>
  <el-select v-bind="$attrs" v-model="modelValue" filterable clearable :filter-method="filterMethod" :loading="loading">
    <el-option v-for="item in options" :key="getRowData(item, value)" :label="getRowData(item, label)" :value="getRowData(item, value)">
      <div class="flex justify-between px-2">
        <div>{{ getRowData(item, label) }}</div>
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
import { useGetDataByApi } from '@/composables/useGetRemoteTableData'
import { get } from 'lodash-es'
const props = defineProps({
  api: {
    type: String,
    default: ''
  },
  searchField: {
    type: String,
    default: 'keywords'
  },
  label: {
    type: String,
    default: 'name'
  },
  value: {
    type: String,
    default: 'id'
  }
})

const getRowData = (row: any, path: string) => {
  return get(row, path)
}
const modelValue = defineModel()

const { options, loading, page, limit, total, filter } = useGetDataByApi(props.api, props.searchField)

const changePage = (p: number) => {
  page.value = p
}
const filterMethod = (title: string) => {
  filter.value = title
}
</script>

<template>
  <div :class="className">
    <el-select v-model="modelValue" clearable :multiple="multiple" :filterable="filterable" :filter-method="filterMethod" :placeholder="placeholder" :loading="loading" @current-change="changePage">
      <template #header>
        <div class="grid grid-cols-2 gap-2" v-if="!filterable">
          <slot name="header" />
          <div v-if="!filterable">
            <el-button type="primary" @click="search">搜索</el-button>
          </div>
        </div>
      </template>
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
        <el-pagination :page-size="page" layout="prev, pager, next" :total="+total" class="flex justify-end" v-if="api" />
      </template>
    </el-select>
  </div>
</template>
<script lang="ts" setup>
import http from '@/support/http'
import { ref } from 'vue'

const props = defineProps({
  api: {
    type: String,
    require: true
  },
  className: {
    type: String,
    require: false,
    default: 'w-full'
  },
  multiple: {
    type: Boolean,
    default: true
  },
  filterable: {
    type: Boolean,
    default: true
  },
  placeholder: {
    type: String,
    default: '请输入搜索关键字'
  },
  label: {
    type: String,
    require: true,
    default: 'title'
  },
  value: {
    type: String,
    require: true,
    default: 'id'
  },
  title: {
    type: String,
    default: 'title'
  },
  searchParams: {
    type: Object,
    default: null
  }
})

const options = ref()
const modelValue = defineModel()
const loading = ref(false)
const total = ref<number>(0)
const page = ref<number>(1)
const limit = ref<number>(10)
const defaultParams: any = { page: page.value, limit: limit.value }
const getData = (params = {}) => {
  if (!props.api) {
    return
  }
  // 搜索参数
  loading.value = true
  http
    .get(props.api as string, Object.assign(defaultParams, params))
    .then(r => {
      options.value = r.data.data
      loading.value = false
      total.value = r.data.total
      page.value = r.data.page
      limit.value = r.data.limit
    })
    .catch(e => {
      loading.value = false
    })
}

const changePage = (p: number) => {
  console.log(p)
  page.value = p
  getData()
}
const filterMethod = (title: string = '') => {
  const parmas: Object = {}
  // @ts-ignore
  parmas[props.title] = title
  getData(parmas)
}

const search = () => {
  getData(props.searchParams)
}
// 初始化
getData()
</script>

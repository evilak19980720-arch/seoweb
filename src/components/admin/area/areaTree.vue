<template>
  <div class="w-64 px-5 pt-2 pb-5 overflow-auto border border-gray-200 rounded shadow-inner h-96">
    <div class="mb-3 text-base text-gray-600">选择地区</div>
    <el-tree :data="areas" @check="selectArea" show-checkbox node-key="id" :default-checked-keys="checkedAreas" :props="defaultProps" />
  </div>
</template>
<script setup lang="ts">
import http from '@/support/http'
import { ref } from 'vue'
const defaultProps = {
  children: 'children',
  label: 'name'
}
const checkedAreas = defineModel({
  type: Array<any>,
  default: []
})

interface areaInterface {
  id: number
  pid: number
  name: string
  selected: boolean
}

interface areasInterface {
  id: number
  pid: number
  name: string
  total: number
  selected: boolean
  cities: Array<number>
  children: Array<areaInterface>
}
const areas = ref<Array<areasInterface>>([])
// 直接使用
const loading = ref(false)

const getAreas = () => {
  loading.value = true
  http.get('areas').then(r => {
    areas.value = r.data.data
    loading.value = false
  })
}

const selectArea = (data: any, node: any) => {
  checkedAreas.value = node.checkedKeys
}
getAreas()
</script>

<template>
  <div v-loading="loading">
    <div class="grid grid-cols-4 gap-2 scroll-m-96">
      <div v-for="area in areas" :key="area.id">
        <div class="min-h-0">
          <el-checkbox :checked="isChecked(area.id)" @click="selectArea(area, null)" :indeterminate="area.cities.length > 0 && !equalArr(getOneKeyFromArr(area.children, 'id'), area.cities)"
            >{{ area.name }} <span class="text-red-500">({{ area.cities.length }}/{{ area.children.length }})</span></el-checkbox
          >
          <div v-if="area.id === areaId || area.selected" class="ml-4">
            <el-checkbox-group v-model="area.cities">
              <el-checkbox v-for="city in area.children" :key="city.id" :label="city.id" @click="selectArea(city, area)">{{ city.name }}</el-checkbox>
            </el-checkbox-group>
          </div>
          <!--
        <el-checkbox :label="area.name" size="large" :checked="area.selected" @click="selectArea(area, index)" /> <span class="text-sm text-red-500">(0/{{ area.children.length }})</span>
        <div class="min-h-0">
          <el-checkbox :checked="a.selected" v-for="a in area.children" :key="a.id" @click="selectArea(a)">{{ a.name }} {{ a.selected ? 'yes' : 'no' }}</el-checkbox>
        </div>-->
        </div>
      </div>
    </div>
    <div class="flex justify-end">
      <el-button size="large" type="primary" @click="closeDialog">确认</el-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import http from '@/support/http'
import { reactive, watch, ref } from 'vue'

const areasModel = defineModel({
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
const areas = reactive<Array<areasInterface>>([])
const areaId = ref(0)
const selectArea = (area: any, parentArea: any) => {
  area.selected = !area.selected
  if (area.pid === 0) {
    areaId.value = area.selected ? area.id : 0
    area.cities = area.selected ? getOneKeyFromArr(area.children, 'id') : []
  }
}

// 直接使用
const areasTmp: Array<any> = []
const loading = ref(false)

const getAreas = () => {
  http.get('areas').then(r => {
    loading.value = true
    r.data.data.forEach((a: areasInterface) => {
      a.total = a.children.length
      areasTmp.push(a)
      let cities: Array<number> = []
      let selected: boolean = false
      if (areasModel.value.length > 0) {
        areasModel.value.forEach(i => {
          if (i.id === a.id) {
            cities = getOneKeyFromArr(i.children, 'id')
            selected = true
          }
        })
      }
      areas.push({
        id: a.id,
        pid: a.pid,
        name: a.name,
        total: a.total,
        selected,
        cities,
        children: a.children
      })
    })
    loading.value = false
  })
}

const isChecked = (id: any) => {
  return getOneKeyFromArr(areasModel.value, 'id').includes(id)
}
const getOneKeyFromArr = (arr: Array<any>, key: string) => {
  return arr.map(item => item[key])
}

const equalArr = (arr1: Array<any>, arr2: Array<any>) => {
  if (arr1.length !== arr2.length) {
    return false
  }
  arr1.forEach(item => {
    if (arr2.indexOf(item) === -1) {
      return false
    }
  })

  return true
}

const emits = defineEmits(['closeDialog'])

const selectedCities = ref([])
const closeDialog = () => {
  // 更新选中城市
  areasModel.value = selectedCities.value
  emits('closeDialog')
}
watch(
  () => areas,
  (newValue, oldValue) => {
    const selectedCityIds: Array<number> = []
    newValue.forEach(c => {
      if (c.cities.length > 0) {
        selectedCityIds.push(c.id)
        selectedCityIds.push(...c.cities)
      }
    })
    selectedCities.value = []
    areasTmp.forEach(area => {
      if (selectedCityIds.includes(area.id)) {
        area.children = area.children.filter((child: any) => {
          return selectedCityIds.includes(child.id)
        })
        selectedCities.value.push(area as never)
      }
    })
  },
  { deep: true }
)

getAreas()
</script>

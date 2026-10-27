<template>
  <div>
    <catch-table
      :columns="[
        { label: 'ID', prop: 'id', width: 80 },
        { label: '广告名称', prop: 'name' },
        { label: '广告位', prop: 'position', slot: 'position', width: 160 },
        { label: '类型', prop: 'type', slot: 'type', width: 100 },
        { label: '投放站点', prop: 'site_ids', slot: 'sites', width: 110 },
        { label: '投放时间', prop: 'start_at', slot: 'period', width: 220 },
        { label: '权重', prop: 'weight', width: 80 },
        { label: '点击', prop: 'clicks', width: 90 },
        { label: '状态', prop: 'status', slot: 'status', width: 90 },
        { type: 'operate', label: '操作', width: 160 }
      ]"
      :api="api"
      dialog-width="760px"
      :search-form="[
        { type: 'input', label: '广告名称', name: 'name' },
        { type: 'select', label: '广告位', name: 'position', options: positions },
        { type: 'select', label: '状态', name: 'status', api: 'status' }
      ]"
    >
      <template #position="scope">{{ positionName(scope.row.position) }}</template>
      <template #type="scope">
        <el-tag :type="scope.row.type === 1 ? 'primary' : 'warning'">{{ scope.row.type === 1 ? '图片' : '代码' }}</el-tag>
      </template>
      <template #sites="scope">{{ scope.row.site_ids?.length ? scope.row.site_ids.length + ' 个站点' : '全部站点' }}</template>
      <template #period="scope">{{ formatTime(scope.row.start_at) || '立即' }} ~ {{ formatTime(scope.row.end_at) || '不限' }}</template>
      <template #status="scope">
        <Status v-model="scope.row.status" :id="scope.row.id" :api="api" />
      </template>
      <template #dialog="row">
        <Create :primary="row?.id" :api="api" :positions="positions" />
      </template>
    </catch-table>
  </div>
</template>

<script lang="ts" setup>
// @ts-nocheck
import { ref } from 'vue'
import http from '@/support/http'
import Create from './form/create.vue'

const api = 'ad/ads'
const positions = ref([])

http.get('ad/ads/positions').then(r => {
  positions.value = r.data.data
})

const positionName = (value: string) => positions.value.find(item => item.value === value)?.label ?? value
const formatTime = (ts: number) => (ts ? new Date(ts * 1000).toLocaleString('zh-CN', { hour12: false }) : '')
</script>

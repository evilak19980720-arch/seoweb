<template>
  <div v-loading="loading">
    <div class="grid grid-cols-1 gap-3 mb-3 sm:grid-cols-3">
      <el-card v-for="card in totals" :key="card.label" shadow="never">
        <div class="text-sm text-gray-500">{{ card.label }}</div>
        <div class="mt-1 text-3xl font-semibold">{{ card.value.toLocaleString() }}</div>
        <div class="mt-1 text-xs text-gray-400">{{ card.hint }}</div>
      </el-card>
    </div>

    <div class="grid grid-cols-1 gap-3 mb-3 md:grid-cols-2 xl:grid-cols-4">
      <el-card v-for="card in periods" :key="card.label" shadow="never">
        <div class="text-sm text-gray-500">{{ card.label }}</div>
        <div class="grid grid-cols-3 mt-2 text-center">
          <div v-for="p in periodNames" :key="p.key">
            <div class="text-xl font-semibold">{{ (card.data[p.key] || 0).toLocaleString() }}</div>
            <div class="text-xs text-gray-400">{{ p.label }}</div>
          </div>
        </div>
      </el-card>
    </div>

    <el-card shadow="never">
      <template #header>近 30 天趋势</template>
      <v-chart style="height: 340px" autoresize :option="chart" />
    </el-card>
  </div>
</template>

<script lang="ts" setup>
// @ts-nocheck
import { computed, ref } from 'vue'
import http from '@/support/http'

const loading = ref(false)
const data = ref(null)

const periodNames = [
  { key: 'today', label: '今天' },
  { key: 'week', label: '7 天' },
  { key: 'month', label: '30 天' }
]

http
  .get('stats/dashboard')
  .then(r => {
    data.value = r.data.data
  })
  .finally(() => {
    loading.value = false
  })
loading.value = true

const totals = computed(() => {
  const d = data.value
  if (!d) return []
  return [
    { label: '网站数量', value: d.sites, hint: `已上线 ${d.sites_online}` },
    { label: '文章数量', value: d.articles, hint: `已发布 ${d.articles_published}` },
    { label: '蜘蛛爬取数量', value: d.crawls.total, hint: `今天 ${d.crawls.today}，7 天 ${d.crawls.week}，30 天 ${d.crawls.month}（Google + Bing）` }
  ]
})

const periods = computed(() => {
  const d = data.value
  if (!d) return []
  return [
    { label: '谷歌爬取', data: d.google },
    { label: 'Bing 爬取', data: d.bing },
    { label: '访问流量', data: d.pageviews },
    { label: '点击数量', data: d.clicks }
  ]
})

const chart = computed(() => {
  const t = data.value?.trend || { dates: [], series: {}, labels: {} }
  return {
    tooltip: { trigger: 'axis' },
    legend: { top: 0 },
    grid: { left: 48, right: 24, top: 40, bottom: 32 },
    xAxis: { type: 'category', data: t.dates },
    yAxis: { type: 'value', minInterval: 1 },
    series: Object.keys(t.series).map(key => ({ name: t.labels[key] || key, type: 'line', smooth: true, showSymbol: false, data: t.series[key] }))
  }
})
</script>

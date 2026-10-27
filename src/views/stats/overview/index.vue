<template>
  <div v-loading="loading">
    <div class="flex flex-wrap gap-3 items-center p-4 mb-3 bg-white dark:bg-regal-dark">
      <RemoteApiSelect v-model="siteId" api="site/sites" search-field="keywords" label="name" value="id" placeholder="全部站点" class="w-64" @change="load" />
      <el-radio-group v-model="days" @change="load">
        <el-radio-button :value="7">7 天</el-radio-button>
        <el-radio-button :value="30">30 天</el-radio-button>
        <el-radio-button :value="90">90 天</el-radio-button>
      </el-radio-group>
    </div>

    <div class="grid grid-cols-2 gap-3 mb-3 md:grid-cols-4 xl:grid-cols-6">
      <el-card v-for="card in cardList" :key="card.label" shadow="never">
        <div class="text-sm text-gray-500">{{ card.label }}</div>
        <div class="mt-1 text-2xl font-semibold">{{ card.value.toLocaleString() }}</div>
        <div v-if="card.hint" class="mt-1 text-xs text-gray-400">{{ card.hint }}</div>
      </el-card>
    </div>

    <el-card shadow="never" class="mb-3">
      <template #header>
        <div class="flex justify-between items-center">
          <span>趋势</span>
          <el-checkbox-group v-model="shown" size="small">
            <el-checkbox-button v-for="(label, key) in data.metrics" :key="key" :value="key">{{ label }}</el-checkbox-button>
          </el-checkbox-group>
        </div>
      </template>
      <v-chart style="height: 340px" autoresize :option="chart" />
    </el-card>

    <el-card v-if="!siteId" shadow="never">
      <template #header>
        <div class="flex justify-between items-center">
          <span>站点排行（前 20）</span>
          <el-select v-model="metric" size="small" class="w-48" @change="load">
            <el-option v-for="(label, key) in rankMetrics" :key="key" :label="label" :value="key" />
          </el-select>
        </div>
      </template>
      <el-table :data="data.top" size="small">
        <el-table-column type="index" width="60" />
        <el-table-column prop="name" label="站点" />
        <el-table-column prop="domain" label="域名">
          <template #default="{ row }">
            <el-link :href="'https://' + row.domain" target="_blank" type="primary">{{ row.domain }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="total" label="合计" width="120" />
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
// @ts-nocheck
import { computed, ref } from 'vue'
import http from '@/support/http'
import RemoteApiSelect from '@/components/admin/remote/RemoteApiSelect.vue'

const loading = ref(false)
const siteId = ref(null)
const days = ref(30)
const metric = ref('crawl_google')
const shown = ref(['crawl_google', 'cf_pageviews', 'articles'])
const data = ref({ cards: {}, dates: [], series: {}, metrics: {}, top: [] })

const load = () => {
  loading.value = true
  http
    .get('stats/overview', { days: days.value, site_id: siteId.value || 0, metric: metric.value })
    .then(r => {
      data.value = r.data.data
    })
    .finally(() => {
      loading.value = false
    })
}
load()

const cardList = computed(() => {
  const c = data.value.cards
  if (!c.sites && c.sites !== 0) return []
  return [
    { label: '站点', value: c.sites, hint: `已上线 ${c.sites_online}` },
    { label: '待确认游戏资料', value: c.profiles_pending },
    { label: '已发布文章', value: c.articles_published, hint: `近 7 天 ${c.articles_week}` },
    { label: '待发布 / 未通过', value: c.articles_queued, hint: `未通过或失败 ${c.articles_rejected}` },
    { label: 'Googlebot（7 天）', value: c.crawl_google_week, hint: `Bingbot ${c.crawl_bing_week}` },
    { label: '页面浏览（7 天）', value: c.pageviews_week, hint: '来自 Cloudflare，每日凌晨更新' },
    { label: '广告点击（7 天）', value: c.ad_clicks_week },
    { label: 'AI 调用（7 天）', value: c.ai_calls_week, hint: `失败 ${c.ai_failed_week}，tokens ${c.ai_tokens_week.toLocaleString()}` }
  ]
})

const rankMetrics = computed(() => {
  const { articles, ...rest } = data.value.metrics
  return rest
})

const chart = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { top: 0 },
  grid: { left: 48, right: 24, top: 40, bottom: 32 },
  xAxis: { type: 'category', data: data.value.dates },
  yAxis: { type: 'value', minInterval: 1 },
  series: shown.value
    .filter(key => data.value.series[key])
    .map(key => ({ name: data.value.metrics[key], type: 'line', smooth: true, showSymbol: false, data: data.value.series[key] }))
}))
</script>

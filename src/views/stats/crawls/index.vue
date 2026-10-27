<template>
  <div>
    <catch-table
      :columns="[
        { label: '时间', prop: 'created_at', slot: 'time', width: 180 },
        { label: '蜘蛛', prop: 'bot', slot: 'bot', width: 110 },
        { label: '站点', prop: 'site_name', width: 160 },
        { label: '路径', prop: 'path', slot: 'path' },
        { label: '状态码', prop: 'status', slot: 'status', width: 90 },
        { label: 'IP', prop: 'ip', width: 160 }
      ]"
      api="stats/crawls"
      :operation="false"
      :search-form="[
        { type: 'remote-api-select', label: '站点', name: 'site_id', props: { api: 'site/sites', label: 'name', value: 'id' } },
        { type: 'select', label: '蜘蛛', name: 'bot', options: [{ label: 'Googlebot', value: 'google' }, { label: 'Bingbot', value: 'bing' }] },
        { type: 'input', label: '状态码', name: 'status' }
      ]"
    >
      <template #time="scope">{{ new Date(scope.row.created_at * 1000).toLocaleString('zh-CN', { hour12: false }) }}</template>
      <template #bot="scope">
        <el-tag :type="scope.row.bot === 'google' ? 'success' : 'primary'">{{ scope.row.bot === 'google' ? 'Googlebot' : 'Bingbot' }}</el-tag>
      </template>
      <template #path="scope">
        <el-link :href="'https://' + scope.row.domain + scope.row.path" target="_blank">{{ scope.row.path }}</el-link>
      </template>
      <template #status="scope">
        <el-text :type="scope.row.status >= 400 ? 'danger' : scope.row.status >= 300 ? 'warning' : 'success'">{{ scope.row.status }}</el-text>
      </template>
    </catch-table>
  </div>
</template>

<script lang="ts" setup>
// @ts-nocheck
</script>

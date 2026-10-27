<template>
  <div>
    <catch-table
      ref="catchtable"
      :columns="[
        { label: 'ID', prop: 'id', width: 80 },
        { label: '域名', prop: 'domain' },
        { label: '解析 IP', prop: 'ip', width: 150 },
        { label: 'www', prop: 'with_www', slot: 'www', width: 70 },
        { label: '代理', prop: 'proxied', slot: 'proxied', width: 70 },
        { label: '状态', prop: 'status', slot: 'status', width: 100 },
        { label: '批次', prop: 'batch', width: 130 },
        { label: '时间', prop: 'updated_at', width: 170 },
        { type: 'operate', label: '操作', width: 160, update: false }
      ]"
      api="site/dns/tasks"
      :operation="false"
      :search-form="[
        { type: 'input', label: '域名', name: 'domain' },
        { type: 'input', label: '批次', name: 'batch' },
        { type: 'select', label: '状态', name: 'status', options: statusOptions }
      ]"
    >
      <template #www="scope">{{ scope.row.with_www ? '是' : '否' }}</template>
      <template #proxied="scope">{{ scope.row.proxied ? '开' : '关' }}</template>
      <template #status="scope">
        <el-tooltip :disabled="!scope.row.error" :content="scope.row.error" placement="top">
          <el-tag :type="statusTag[scope.row.status]">{{ statusText[scope.row.status] }}</el-tag>
        </el-tooltip>
      </template>
      <template #operate="scope">
        <Show v-if="scope.row.status === 3" text="重试" icon="arrow-path" @click="retry(scope.row.id)" />
      </template>
    </catch-table>
  </div>
</template>

<script lang="ts" setup>
// @ts-nocheck
import { ref } from 'vue'
import http from '@/support/http'
import Message from '@/support/message'

const catchtable = ref()
const statusText = { 1: '等待', 2: '成功', 3: '失败' }
const statusTag = { 1: 'info', 2: 'success', 3: 'danger' }
const statusOptions = Object.entries(statusText).map(([value, label]) => ({ label, value: Number(value) }))

const retry = (id: number) => {
  http.post(`site/dns/tasks/${id}/retry`).then(() => {
    Message.success('已重新加入队列')
    catchtable.value.doSearch()
  })
}
</script>

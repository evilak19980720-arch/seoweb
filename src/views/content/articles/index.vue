<template>
  <div>
    <catch-table
      ref="catchtable"
      :columns="[
        { label: 'ID', prop: 'id', width: 80 },
        { label: '站点', prop: 'site.name', width: 160 },
        { label: '标题', prop: 'title', slot: 'title' },
        { label: '状态', prop: 'status', slot: 'status', width: 110 },
        { label: 'AI 审核分', prop: 'review_score', width: 100 },
        { label: '字数', prop: 'word_count', width: 80 },
        { label: '来源', prop: 'source', slot: 'source', width: 80 },
        { label: '发布时间', prop: 'published_at', slot: 'published', width: 170 },
        { type: 'operate', label: '操作', width: 260 }
      ]"
      :api="api"
      dialog-width="1100px"
      :search-form="[
        { type: 'remote-api-select', label: '站点', name: 'site_id', props: { api: 'site/sites', label: 'name', value: 'id' } },
        { type: 'input', label: '标题', name: 'title' },
        { type: 'select', label: '状态', name: 'status', options: statusOptions }
      ]"
    >
      <template #title="scope">
        <el-link v-if="scope.row.status === 4 && scope.row.site" :href="`https://${scope.row.site.domain}/${scope.row.slug}`" target="_blank" type="primary">{{ scope.row.title }}</el-link>
        <span v-else>{{ scope.row.title }}</span>
      </template>
      <template #status="scope">
        <el-tooltip :disabled="!scope.row.error" :content="scope.row.error" placement="top">
          <el-tag :type="statusTag[scope.row.status]">{{ statusText[scope.row.status] }}</el-tag>
        </el-tooltip>
      </template>
      <template #source="scope">{{ scope.row.source === 1 ? 'AI' : '人工' }}</template>
      <template #published="scope">{{ scope.row.published_at ? new Date(scope.row.published_at * 1000).toLocaleString('zh-CN', { hour12: false }) : '-' }}</template>
      <template #operate="scope">
        <Show v-if="[2, 3, 5].includes(scope.row.status)" text="发布" icon="paper-airplane" @click="act(scope.row.id, 'publish', '确定发布这篇文章吗？')" />
        <Show v-if="scope.row.status === 4" text="下线" icon="arrow-down-tray" @click="act(scope.row.id, 'unpublish', '下线后文章页面将返回 404，确定吗？')" />
        <Show v-if="[2, 3, 5, 6].includes(scope.row.status) && scope.row.source === 1" text="重写" icon="arrow-path" @click="act(scope.row.id, 'rewrite', '重写会覆盖当前正文，确定吗？')" />
      </template>
      <template #dialog="row">
        <Create :primary="row?.id" :api="api" />
      </template>
    </catch-table>
  </div>
</template>

<script lang="ts" setup>
// @ts-nocheck
import { ref } from 'vue'
import http from '@/support/http'
import Message from '@/support/message'
import { ElMessageBox } from 'element-plus'
import Create from './form/create.vue'

const api = 'content/articles'
const catchtable = ref()

const statusText = { 1: '生成中', 2: '审核未通过', 3: '待发布', 4: '已发布', 5: '已下线', 6: '生成失败' }
const statusTag = { 1: 'info', 2: 'warning', 3: 'primary', 4: 'success', 5: 'info', 6: 'danger' }
const statusOptions = Object.entries(statusText).map(([value, label]) => ({ label, value: Number(value) }))

const act = (id: number, action: string, confirm: string) => {
  ElMessageBox.confirm(confirm, '提示', { type: 'warning' }).then(() => {
    http.post(`${api}/${id}/${action}`).then(() => {
      Message.success('操作成功')
      catchtable.value.doSearch()
    })
  })
}
</script>

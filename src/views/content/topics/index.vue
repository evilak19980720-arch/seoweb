<template>
  <div>
    <catch-table
      ref="catchtable"
      :columns="[
        { label: 'ID', prop: 'id', width: 80 },
        { label: '站点', prop: 'site.name', width: 160 },
        { label: '选题', prop: 'title' },
        { label: '关键词', prop: 'keyword' },
        { label: '搜索意图', prop: 'intent', width: 100 },
        { label: '状态', prop: 'status', slot: 'status', width: 90 },
        { label: '来源', prop: 'source', slot: 'source', width: 80 },
        { label: '创建时间', prop: 'created_at', width: 170 },
        { type: 'operate', label: '操作', width: 220 }
      ]"
      :api="api"
      :search-form="[
        { type: 'remote-api-select', label: '站点', name: 'site_id', props: { api: 'site/sites', label: 'name', value: 'id' } },
        { type: 'input', label: '选题', name: 'title' },
        { type: 'select', label: '状态', name: 'status', options: statusOptions }
      ]"
    >
      <template #operation>
        <el-button type="success" @click="generateVisible = true">AI 生成选题</el-button>
      </template>
      <template #status="scope">
        <el-tag :type="statusTag[scope.row.status]">{{ statusText[scope.row.status] }}</el-tag>
      </template>
      <template #source="scope">{{ scope.row.source === 1 ? 'AI' : '人工' }}</template>
      <template #operate="scope">
        <Show v-if="scope.row.status === 1" text="生成文章" icon="pencil-square" @click="write(scope.row.id)" />
      </template>
      <template #dialog="row">
        <Create :primary="row?.id" :api="api" />
      </template>
    </catch-table>

    <Dialog v-model="generateVisible" title="AI 生成选题" width="520px" destroy-on-close>
      <el-form :model="generate" label-width="90px" class="pr-4">
        <el-form-item label="站点" required>
          <RemoteApiSelect v-model="generate.site_id" api="site/sites" search-field="keywords" label="name" value="id" class="w-full" />
          <Prompt text="站点的游戏资料确认后才能生成" />
        </el-form-item>
        <el-form-item label="数量">
          <el-input-number v-model="generate.count" :min="1" :max="20" />
        </el-form-item>
        <div class="flex justify-end">
          <el-button type="primary" :loading="generating" @click="submitGenerate">开始生成</el-button>
        </div>
      </el-form>
    </Dialog>
  </div>
</template>

<script lang="ts" setup>
// @ts-nocheck
import { reactive, ref } from 'vue'
import http from '@/support/http'
import Message from '@/support/message'
import RemoteApiSelect from '@/components/admin/remote/RemoteApiSelect.vue'
import Create from './form/create.vue'

const api = 'content/topics'
const catchtable = ref()

const statusText = { 1: '待写', 2: '生成中', 3: '已使用', 4: '已废弃' }
const statusTag = { 1: 'primary', 2: 'info', 3: 'success', 4: 'info' }
const statusOptions = Object.entries(statusText).map(([value, label]) => ({ label, value: Number(value) }))

const write = (id: number) => {
  http.post(`${api}/${id}/write`).then(() => {
    Message.success('已加入生成队列，可在「文章」里查看进度')
    catchtable.value.doSearch()
  })
}

const generateVisible = ref(false)
const generating = ref(false)
const generate = reactive({ site_id: null, count: 5 })
const submitGenerate = () => {
  if (!generate.site_id) {
    Message.error('请选择站点')
    return
  }
  generating.value = true
  http
    .post(`${api}/generate`, generate)
    .then(() => {
      Message.success('已加入生成队列，稍后刷新查看')
      generateVisible.value = false
    })
    .finally(() => {
      generating.value = false
    })
}
</script>

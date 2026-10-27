<template>
  <div>
    <catch-table
      :columns="[
        { label: 'ID', prop: 'id', width: 80 },
        { label: '名称', prop: 'name' },
        { label: '类型', prop: 'type', slot: 'type', width: 140 },
        { label: 'AI 渠道', prop: 'channel.name', slot: 'channel' },
        { label: '版本', prop: 'version', width: 80 },
        { label: '状态', prop: 'status', slot: 'status', width: 90 },
        { label: '更新时间', prop: 'updated_at' },
        { type: 'operate', label: '操作', width: 160 }
      ]"
      :api="api"
      dialog-width="900px"
      :search-form="[
        { type: 'input', label: '名称', name: 'name' },
        { type: 'select', label: '类型', name: 'type', options: typeOptions },
        { type: 'select', label: '状态', name: 'status', api: 'status' }
      ]"
    >
      <template #type="scope">
        <el-tag>{{ typeName(scope.row.type) }}</el-tag>
      </template>
      <template #channel="scope">
        <span v-if="scope.row.channel">{{ scope.row.channel.name }}（{{ scope.row.channel.model }}）</span>
        <el-text v-else type="danger">未设置，无法使用</el-text>
      </template>
      <template #status="scope">
        <Status v-model="scope.row.status" :id="scope.row.id" :api="api" />
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
import Create from './form/create.vue'

const api = 'ai/prompts'
const typeOptions = ref([])

http.get('ai/prompts/types').then(r => {
  typeOptions.value = r.data.data.map(item => ({ label: item.label, value: item.value }))
})

const typeName = (type: number) => typeOptions.value.find(item => item.value === type)?.label ?? type
</script>

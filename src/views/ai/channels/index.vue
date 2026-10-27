<template>
  <div>
    <catch-table
      :columns="[
        { label: 'ID', prop: 'id', width: 80 },
        { label: '名称', prop: 'name' },
        { label: '协议', prop: 'provider', slot: 'provider', width: 120 },
        { label: '模型', prop: 'model' },
        { label: '接口地址', prop: 'base_url', ellipsis: 40 },
        { label: '状态', prop: 'status', slot: 'status', width: 90 },
        { label: '创建时间', prop: 'created_at' },
        { type: 'operate', label: '操作', width: 220 }
      ]"
      :api="api"
      :search-form="[
        { type: 'input', label: '名称', name: 'name' },
        { type: 'select', label: '状态', name: 'status', api: 'status' }
      ]"
    >
      <template #provider="scope">
        <el-tag>{{ scope.row.provider === 2 ? 'Anthropic' : 'OpenAI 兼容' }}</el-tag>
      </template>
      <template #status="scope">
        <Status v-model="scope.row.status" :id="scope.row.id" :api="api" />
      </template>
      <template #operate="scope">
        <Show text="测试" icon="bolt" @click="test(scope.row.id)" />
      </template>
      <template #dialog="row">
        <Create :primary="row?.id" :api="api" />
      </template>
    </catch-table>
  </div>
</template>

<script lang="ts" setup>
// @ts-nocheck
import http from '@/support/http'
import Message from '@/support/message'
import Create from './form/create.vue'

const api = 'ai/channels'

const test = (id: number) => {
  Message.success('正在请求模型，请稍候')
  http.post(`${api}/${id}/test`).then(r => {
    const data = r.data.data
    Message.success(`连接成功，模型回复：${data.reply}（输入 ${data.input_tokens} / 输出 ${data.output_tokens} tokens）`)
  })
}
</script>

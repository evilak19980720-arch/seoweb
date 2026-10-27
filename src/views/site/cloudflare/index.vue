<template>
  <div>
    <catch-table
      :columns="[
        { label: 'ID', prop: 'id', width: 80 },
        { label: '名称', prop: 'name' },
        { label: 'Account ID', prop: 'account_id' },
        { label: '状态', prop: 'status', slot: 'status' },
        { label: '备注', prop: 'remark', ellipsis: true },
        { label: '创建时间', prop: 'created_at' },
        { type: 'operate', label: '操作', width: 220 }
      ]"
      :api="api"
      :search-form="[
        { type: 'input', label: '名称', name: 'name' },
        { type: 'select', label: '状态', name: 'status', api: 'status' }
      ]"
    >
      <template #status="scope">
        <Status v-model="scope.row.status" :id="scope.row.id" :api="api" />
      </template>
      <template #operate="scope">
        <Show text="校验 Token" icon="shield-check" @click="verify(scope.row.id)" />
        <Show text="批量解析" icon="globe-alt" @click="openResolve(scope.row)" />
      </template>
      <template #dialog="row">
        <Create :primary="row?.id" :api="api" />
      </template>
    </catch-table>

    <Dialog v-model="resolveVisible" :title="resolveTitle" width="900px" destroy-on-close>
      <Resolve v-if="resolveVisible" :account-id="resolveAccountId" @done="resolveVisible = false" />
    </Dialog>
  </div>
</template>

<script lang="ts" setup>
// @ts-nocheck
import http from '@/support/http'
import Message from '@/support/message'
import { ref } from 'vue'
import Create from './form/create.vue'
import Resolve from './resolve.vue'

const api = 'site/cloudflare/accounts'

const verify = (id: number) => {
  http.post(`${api}/${id}/verify`).then(() => {
    Message.success('API Token 可用')
  })
}

const resolveVisible = ref(false)
const resolveAccountId = ref(0)
const resolveTitle = ref('')
const openResolve = (row: any) => {
  resolveAccountId.value = row.id
  resolveTitle.value = `批量解析：${row.name}`
  resolveVisible.value = true
}
</script>

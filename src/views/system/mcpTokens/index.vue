<script setup lang="ts">
import { shallowRef, useTemplateRef } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import CatchTable from '@/components/catchTable/index.vue'
import type { Column, SItem } from '@/components/catchTable/ctable'
import Create from './form/create.vue'
import TokenCredentials, { type IssuedToken } from './TokenCredentials.vue'
import { date } from '@/support/helper'
import http from '@/support/http'
import Message from '@/support/message'

interface McpToken {
  id: number
  name: string
  user_id: number
  user: { id: number; username: string } | null
  status: number
  expires_at: number
  revoked_at: number
  last_used_at: number
  last_used_ip: string
  created_at: number
}

const api = 'system/mcp/tokens'
const table = useTemplateRef<InstanceType<typeof CatchTable>>('table')
const dialogVisible = shallowRef(false)
const dialogBusy = shallowRef(false)
const credential = shallowRef<IssuedToken>()
const pendingId = shallowRef<number | null>(null)
const columns: Column[] = ([
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'name', label: '令牌名称', 'min-width': 180 },
  { prop: 'user_id', label: '所属用户', slot: 'user', 'min-width': 150 },
  { prop: 'status', label: '状态', slot: 'status', width: 100 },
  { prop: 'expires_at', label: '到期时间', slot: 'expires_at', width: 165 },
  { prop: 'last_used_at', label: '最近使用', slot: 'last_used_at', width: 165 },
  { prop: 'last_used_ip', label: '最近使用 IP', slot: 'last_used_ip', width: 150 },
  { prop: 'created_at', label: '创建时间', slot: 'created_at', width: 165 },
  { type: 'operate', label: '操作', width: 160, update: false, destroy: false }
] satisfies Partial<Column>[]).map(column => ({ header: '', show: true, preview: false, ...column }))
const searchForm: (SItem & { label: string })[] = [
  { type: 'input', label: '令牌名称', name: 'name', default: '', options: [] }
]

onBeforeRouteLeave(() => {
  if (dialogBusy.value || pendingId.value !== null) {
    Message.warning('令牌操作处理中，请稍候')
    return false
  }
  dialogVisible.value = false
  credential.value = undefined
})

const isAvailable = (row: McpToken): boolean => row.status === 1 && row.revoked_at === 0 && row.expires_at > Math.floor(Date.now() / 1000)
const formatTime = (timestamp: number): string => timestamp ? date('YYYY-MM-DD HH:mm', timestamp) : '—'

function tokenState(row: McpToken): { label: string; type: 'danger' | 'info' | 'warning' | 'success' } {
  if (row.revoked_at) return { label: '已撤销', type: 'danger' }
  if (row.status !== 1) return { label: '已禁用', type: 'info' }
  if (!isAvailable(row)) return { label: '已过期', type: 'warning' }
  return { label: '有效', type: 'success' }
}

function showCredential(value: IssuedToken): void {
  credential.value = value
  dialogVisible.value = true
  table.value?.doSearch()
}

function beforeClose(done: () => void): void {
  if (!dialogBusy.value) done()
}

async function rotate(row: McpToken): Promise<void> {
  if (pendingId.value !== null || !isAvailable(row)) return
  await Message.confirm(`轮换“${row.name}”后，旧令牌立即失效。请更新外部客户端的凭证。`, async () => {
    pendingId.value = row.id
    try {
      const response = await http.post(`${api}/${row.id}/rotate`)
      showCredential(response.data.data as IssuedToken)
    } finally {
      pendingId.value = null
    }
  }).catch(() => {})
}

async function revoke(row: McpToken): Promise<void> {
  if (pendingId.value !== null || row.revoked_at) return
  await Message.confirm(`确定撤销“${row.name}”吗？外部客户端将立即失去该令牌的访问权限。`, async () => {
    pendingId.value = row.id
    try {
      await http.delete(`${api}/${row.id}`)
      Message.success('令牌已撤销')
      table.value?.doSearch()
    } finally {
      pendingId.value = null
    }
  }).catch(() => {})
}
</script>

<template>
  <div>
    <CatchTable ref="table" :api="api" :columns="columns" :search-form="searchForm" :operation="false" :multi-del-show="false">
      <template #operation>
        <el-button v-action="'system.mcpTokens@store'" type="primary" :disabled="pendingId !== null" @click="dialogVisible = true">创建令牌</el-button>
      </template>
      <template #user="scope">{{ scope.row.user?.username || scope.row.user_id }}</template>
      <template #status="scope">
        <el-tag :type="tokenState(scope.row).type">{{ tokenState(scope.row).label }}</el-tag>
      </template>
      <template #expires_at="scope">{{ formatTime(scope.row.expires_at) }}</template>
      <template #last_used_at="scope">{{ formatTime(scope.row.last_used_at) }}</template>
      <template #last_used_ip="scope">{{ scope.row.last_used_ip || '—' }}</template>
      <template #created_at="scope">{{ formatTime(scope.row.created_at) }}</template>
      <template #operate="scope">
        <el-button v-action="'system.mcpTokens@rotate'" type="primary" size="small" text :disabled="!isAvailable(scope.row) || pendingId !== null" @click="rotate(scope.row)">轮换</el-button>
        <el-button v-action="'system.mcpTokens@destroy'" type="danger" size="small" text :disabled="!!scope.row.revoked_at || pendingId !== null" @click="revoke(scope.row)">撤销</el-button>
      </template>
    </CatchTable>
    <el-dialog
      v-model="dialogVisible"
      :title="credential ? '保存 MCP 凭证' : '创建 MCP 令牌'"
      width="min(650px, 94vw)"
      destroy-on-close
      :show-close="!dialogBusy"
      :close-on-click-modal="false"
      :close-on-press-escape="!dialogBusy"
      :before-close="beforeClose"
      @close="credential = undefined"
    >
      <template v-if="dialogVisible">
        <TokenCredentials v-if="credential" :credential="credential" @close="dialogVisible = false" />
        <Create v-else :api="api" @issued="showCredential" @busy="dialogBusy = $event" @close="dialogVisible = false" />
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useGetList } from '@/composables/curd/useGetList'
import { date } from '@/support/helper'

interface UsageLog {
  id: number
  token_id: number
  tool_name: string
  ip: string
  result: 1 | 2
  created_at: number
  token: {
    id: number
    name: string
    user_id: number
    user: { id: number; username: string } | null
  } | null
}

const props = defineProps<{ api: string; tokenId: number }>()
const { data, search, loading } = useGetList(`${props.api}/${props.tokenId}/usage-logs`)
const rows = computed(() => (data.value as { data: UsageLog[] } | undefined)?.data || [])

onMounted(search)
</script>

<template>
  <div>
    <el-table v-loading="loading" :data="rows" row-key="id" empty-text="暂无使用记录">
      <el-table-column label="绑定账号" min-width="150">
        <template #default="scope">{{ scope.row.token?.user?.username || '账号已删除' }}</template>
      </el-table-column>
      <el-table-column prop="tool_name" label="调用工具" min-width="180" />
      <el-table-column label="使用时间" width="180">
        <template #default="scope">{{ date('YYYY-MM-DD HH:mm:ss', scope.row.created_at) }}</template>
      </el-table-column>
      <el-table-column prop="ip" label="IP" min-width="150" />
      <el-table-column label="结果" width="90">
        <template #default="scope">
          <el-tag :type="scope.row.result === 1 ? 'success' : 'danger'">{{ scope.row.result === 1 ? '成功' : '失败' }}</el-tag>
        </template>
      </el-table-column>
    </el-table>
    <Paginate />
  </div>
</template>

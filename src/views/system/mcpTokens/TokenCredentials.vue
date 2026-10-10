<script lang="ts">
export interface IssuedToken {
  id: number
  name: string
  token: string
  expires_at: number
  endpoint: string
}
</script>

<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { date } from '@/support/helper'
import Message from '@/support/message'

const props = defineProps<{ credential: IssuedToken }>()
const emit = defineEmits<{ close: [] }>()
const { copy } = useClipboard({ legacy: true })

async function copyText(value: string): Promise<void> {
  try {
    await copy(value)
    Message.success('已复制')
  } catch {
    Message.error('复制失败，请选中文字手动复制')
  }
}
</script>

<template>
  <div class="space-y-5">
    <el-alert title="令牌仅在本次窗口显示，请立即复制并妥善保存。" type="warning" :closable="false" show-icon />
    <p class="text-sm text-slate-500">
      {{ credential.name }} · 有效至 {{ date('YYYY-MM-DD HH:mm', credential.expires_at) }}
    </p>
    <div>
      <div class="mb-2 flex items-center justify-between">
        <label for="mcp-token" class="text-sm font-medium">Token</label>
        <el-button size="small" @click="copyText(credential.token)">复制 Token</el-button>
      </div>
      <el-input id="mcp-token" :model-value="credential.token" readonly type="textarea" :rows="3" class="font-mono" />
      <p class="mt-2 text-sm text-slate-500">
        请求头格式：<code class="font-mono">Authorization: Bearer &lt;token&gt;</code>，将 &lt;token&gt; 替换为上方完整 Token。
      </p>
    </div>
    <div>
      <div class="mb-2 flex items-center justify-between">
        <label for="mcp-endpoint" class="text-sm font-medium">MCP 地址</label>
        <el-button size="small" @click="copyText(credential.endpoint)">复制地址</el-button>
      </div>
      <el-input id="mcp-endpoint" :model-value="credential.endpoint" readonly />
    </div>
    <div class="flex justify-end">
      <el-button type="primary" @click="emit('close')">完成</el-button>
    </div>
  </div>
</template>

<template>
  <div v-loading="loading">
    <div class="flex gap-2 mb-3">
      <el-input v-model="keyword" placeholder="按域名搜索" clearable class="w-64" @keyup.enter="load(1)" @clear="load(1)" />
      <el-button @click="load(1)">搜索</el-button>
      <el-text type="info" class="ml-auto">已选 {{ selected.length }} 个域名（翻页后仍保留）</el-text>
    </div>
    <el-table ref="table" :data="zones" row-key="id" height="360" @select="onSelect" @select-all="onSelectAll">
      <el-table-column type="selection" width="50" />
      <el-table-column prop="name" label="域名" />
      <el-table-column prop="status" label="Cloudflare 状态" width="140">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'warning'">{{ row.status === 'active' ? '已生效' : row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="当前站点 IP" width="160">
        <template #default="{ row }">{{ row.site_ip ?? '未添加为站点' }}</template>
      </el-table-column>
    </el-table>
    <el-pagination class="flex justify-end mt-2" layout="total, prev, pager, next" :page-size="50" :total="total" :current-page="page" @current-change="load" />

    <el-form label-width="110px" class="mt-4">
      <el-form-item label="解析 IP" required>
        <el-input v-model="ip" placeholder="例如 203.0.113.10" class="w-64" />
      </el-form-item>
      <el-form-item label="选项">
        <el-checkbox v-model="withWww">同时解析 www（CNAME 到根域名）</el-checkbox>
        <el-checkbox v-model="proxied">开启 Cloudflare 代理（橙色云朵，SSL 需要开启）</el-checkbox>
      </el-form-item>
      <div class="flex justify-end">
        <el-button type="primary" :loading="submitting" @click="submit">解析选中的 {{ selected.length }} 个域名</el-button>
      </div>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
// @ts-nocheck
import { nextTick, ref } from 'vue'
import http from '@/support/http'
import Message from '@/support/message'

const props = defineProps({ accountId: Number })
const emit = defineEmits(['done'])

const loading = ref(false)
const submitting = ref(false)
const zones = ref([])
const total = ref(0)
const page = ref(1)
const keyword = ref('')
const selected = ref([])
const table = ref()
const ip = ref('')
const withWww = ref(true)
const proxied = ref(true)

const api = `site/cloudflare/accounts/${props.accountId}`

// 默认填入全局配置里的默认 IP（没有权限读取时忽略）
http.get('front/settings').then(r => {
  ip.value = ip.value || r.data.data.values.default_ip || ''
}).catch(() => {})

const load = (p = 1) => {
  loading.value = true
  http
    .get(`${api}/zones`, { page: p, name: keyword.value })
    .then(r => {
      zones.value = r.data.data.items
      total.value = r.data.data.total
      page.value = p
      nextTick(() => {
        zones.value.forEach(zone => {
          if (selected.value.some(item => item.id === zone.id)) {
            table.value.toggleRowSelection(zone, true)
          }
        })
      })
    })
    .finally(() => {
      loading.value = false
    })
}
load()

const onSelect = (rows, row) => {
  const checked = rows.some(item => item.id === row.id)
  selected.value = checked ? [...selected.value.filter(item => item.id !== row.id), { id: row.id, name: row.name }] : selected.value.filter(item => item.id !== row.id)
}
const onSelectAll = rows => {
  const ids = zones.value.map(item => item.id)
  selected.value = selected.value.filter(item => !ids.includes(item.id)).concat(rows.map(row => ({ id: row.id, name: row.name })))
}

const submit = () => {
  if (!selected.value.length) {
    Message.error('请先勾选域名')
    return
  }
  if (!ip.value) {
    Message.error('请填写解析 IP')
    return
  }
  submitting.value = true
  http
    .post(`${api}/resolve`, { zones: selected.value, ip: ip.value, with_www: withWww.value, proxied: proxied.value })
    .then(() => {
      Message.success('已加入解析队列，可在「批量解析记录」里查看结果')
      emit('done')
    })
    .finally(() => {
      submitting.value = false
    })
}
</script>

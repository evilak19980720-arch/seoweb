<template>
  <div>
    <catch-table
      ref="catchtable"
      :columns="[
        { label: 'ID', prop: 'id', width: 80 },
        { label: 'Logo', prop: 'logo', image: true, width: 80 },
        { label: '网站名称', prop: 'name' },
        { label: '域名', prop: 'domain', slot: 'domain' },
        { label: '语言', prop: 'locale', width: 90 },
        { label: '服务器', prop: 'server.name' },
        { label: '接入状态', prop: 'onboard_status', slot: 'onboard' },
        { label: '状态', prop: 'status', slot: 'status', width: 90 },
        { label: '创建时间', prop: 'created_at' },
        { type: 'operate', label: '操作', width: 220 }
      ]"
      :api="api"
      :search-form="[
        { type: 'input', label: '网站名称', name: 'name' },
        { type: 'input', label: '域名', name: 'domain' },
        { type: 'select', label: '接入状态', name: 'onboard_status', options: onboardOptions },
        { type: 'select', label: '状态', name: 'status', api: 'status' }
      ]"
    >
      <template #domain="scope">
        <el-link :href="'https://' + scope.row.domain" target="_blank" type="primary">{{ scope.row.domain }}</el-link>
      </template>
      <template #onboard="scope">
        <el-tooltip :disabled="!tooltip(scope.row)" :content="tooltip(scope.row)" placement="top">
          <el-tag :type="onboardTag[scope.row.onboard_status]">{{ onboardText[scope.row.onboard_status] }}</el-tag>
        </el-tooltip>
      </template>
      <template #status="scope">
        <Status v-model="scope.row.status" :id="scope.row.id" :api="api" />
      </template>
      <template #operate="scope">
        <Show v-if="scope.row.onboard_status !== 4" text="重新接入" icon="arrow-path" @click="onboard(scope.row.id)" />
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
import Create from './form/create.vue'

const api = 'site/sites'
const catchtable = ref()

const onboardText = { 1: '待接入', 2: '等待 NS 生效', 3: '等待证书', 4: '已上线', 5: '失败' }
const onboardTag = { 1: 'info', 2: 'warning', 3: 'warning', 4: 'success', 5: 'danger' }
const onboardOptions = Object.entries(onboardText).map(([value, label]) => ({ label, value: Number(value) }))

// 等待 NS 时提示需要修改的 NS，失败时显示原因
const tooltip = (row: any) => {
  if (row.onboard_status === 5) {
    return row.onboard_error
  }
  if (row.onboard_status === 2 && row.name_servers?.length) {
    return '请在域名注册商把 NS 改为：' + row.name_servers.join('、')
  }
  return ''
}

const onboard = (id: number) => {
  http.post(`${api}/${id}/onboard`).then(() => {
    Message.success('已重新加入接入队列')
    catchtable.value.doSearch()
  })
}
</script>

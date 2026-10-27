<template>
  <div>
    <catch-table
      :columns="[
        { label: 'ID', prop: 'id', width: 80 },
        { label: '名称', prop: 'name' },
        { label: 'IP', prop: 'ip' },
        { label: '区域', prop: 'region' },
        { label: '站点数 / 容量', prop: 'site_count', slot: 'usage' },
        { label: '状态', prop: 'status', slot: 'status' },
        { label: '备注', prop: 'remark', ellipsis: true },
        { label: '创建时间', prop: 'created_at' },
        { type: 'operate', label: '操作', width: 160 }
      ]"
      :api="api"
      :search-form="[
        { type: 'input', label: '名称', name: 'name' },
        { type: 'input', label: 'IP', name: 'ip' },
        { type: 'select', label: '状态', name: 'status', api: 'status' }
      ]"
    >
      <template #usage="scope">
        <el-progress :percentage="Math.min(100, Math.round((scope.row.site_count / scope.row.capacity) * 100))" :format="() => `${scope.row.site_count} / ${scope.row.capacity}`" />
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
import Create from './form/create.vue'

const api = 'site/servers'
</script>

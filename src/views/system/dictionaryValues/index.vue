<template>
  <div>
    <catch-table
      :default-params="{
        dic_id: dicId
      }"
      :columns="[
        {
          label: 'ID',
          prop: 'id'
        },
        {
          label: '字典值名称',
          prop: 'label'
        },
        {
          label: '字典值键名',
          prop: 'key'
        },
        {
          label: '字典键值',
          prop: 'value'
        },
        {
          label: '排序',
          prop: 'sort'
        },
        {
          label: '状态',
          prop: 'status',
          slot: 'status'
        },
        {
          label: '描述',
          prop: 'description'
        },
        {
          label: '创建时间',
          prop: 'created_at'
        },
        {
          type: 'operate',
          label: '操作',
          width: 200
        }
      ]"
      :api="api"
      :search-form="[
        {
          type: 'input',
          label: '字典值名',
          name: 'label'
        },
        {
          type: 'select',
          label: '状态',
          name: 'status',
          api: 'status'
        }
      ]"
    >
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
import router from '@/router'
const api = 'system/dic/values'
const dicId = router.currentRoute.value.params.id
</script>

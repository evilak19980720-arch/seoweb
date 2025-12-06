<template>
  <div>
    <catch-table
      :columns="[
        {
          label: '部门名称',
          prop: 'department_name'
        },
        {
          label: '排序',
          prop: 'sort'
        },
        {
          label: '状态',
          slot: 'status'
        },
        {
          label: '创建时间',
          prop: 'created_at'
        },
        {
          type: 'operate',
          label: '操作'
        }
      ]"
      :search-form="[
        {
          type: 'input',
          label: '部门名称',
          name: 'department_name'
        }
      ]"
      :api="api"
      ref="catchtable"
      row-key="id"
      :pagination="false"
    >
      <template #status="scope">
        <Status v-model="scope.row.status" :id="scope.row.id" :api="api" @refresh="catchtable.doSearch" />
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
import Create from './form/create.vue'
const api = 'permissions/departments'
const catchtable = ref()
</script>

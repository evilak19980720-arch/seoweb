<template>
  <div>
    <catch-table
      :columns="[
        {
          type: 'selection'
        },
        {
          label: 'ID',
          prop: 'id',
          align: 'center',
          width: 100
        },
        {
          prop: 'job_name',
          label: '岗位名称'
        },
        {
          prop: 'coding',
          label: '岗位编码'
        },
        {
          label: '状态',
          prop: 'status',
          switch: true,
          align: 'center'
        },
        {
          prop: 'sort',
          label: '排序',
          sortable: true
        },
        {
          prop: 'description',
          label: '岗位描述',
          ellipsis: true
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
          name: 'job_name',
          label: '岗位名称'
        }
      ]"
    >
      <template #dialog="row">
        <Create :primary="row?.id" :api="api" />
      </template>
    </catch-table>
  </div>
</template>

<script lang="ts" setup>
// @ts-nocheck
import Create from './form/create.vue'
const api = 'permissions/jobs'
</script>

<template>
  <div>
    <catch-table
      :columns="[
        {
          label: '角色名称',
          prop: 'role_name'
        },
        {
          label: '角色标识',
          prop: 'identify'
        },
        {
          label: '角色描述',
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
          label: '角色名称',
          name: 'role_name'
        }
      ]"
      row-key="id"
      :pagination="false"
    >
      <template #dialog="row">
        <Create :primary="row?.id" :api="api" :has-permissions="row?.permissions" />
      </template>
    </catch-table>
  </div>
</template>

<script lang="ts" setup>
// @ts-nocheck
import Create from './form/create.vue'
const api = 'permissions/roles'
</script>

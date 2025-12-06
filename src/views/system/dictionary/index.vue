<template>
  <div>
    <catch-table
      :columns="[
        {
          type: 'selection',
          width: 80,
          aligh: 'center'
        },
        {
          label: 'ID',
          prop: 'id',
          width: 100
        },
        {
          label: '字典名称',
          prop: 'name'
        },
        {
          label: '字典键名',
          prop: 'key',
          slot: 'key'
        },
        {
          label: '字典状态',
          prop: 'status',
          slot: 'status'
        },
        {
          label: '字典描述',
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
          label: '字典名称',
          name: 'name'
        },
        {
          type: 'input',
          label: '字典键名',
          name: 'key'
        },
        {
          type: 'select',
          label: '状态',
          name: 'status',
          api: 'status'
        }
      ]"
    >
      <template #key="scope">
        <router-link :to="{ path: '/system/dictionary/values/' + scope.row.id }">
          <el-text type="primary">{{ scope.row.key }}</el-text>
        </router-link>
      </template>
      <template #status="scope">
        <Status v-model="scope.row.status" :id="scope.row.id" :api="api" />
      </template>
      <template #operation>
        <el-button @click="generateEnum()">生成枚举</el-button>
      </template>
      <template #operate="scope">
        <Show text="生成枚举" @click="generateEnum(scope.row.id)" icon="cursor-arrow-rays" />
      </template>
      <template #dialog="row">
        <Create :primary="row?.id" :api="api" />
      </template>
    </catch-table>
  </div>
</template>

<script lang="ts" setup>
// @ts-nocheck
import http from '@/support/http'
import Create from './form/create.vue'
import Message from '@/support/message'

const api = 'system/dictionary'

const generateEnum = (id: number = 0) => {
  http.post(`system/dictionary/enums/${id}`).then(r => {
    Message.success('枚举已在 Common 模块下 Eums 目录下生成')
  })
}
</script>

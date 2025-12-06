<template>
  <div>
    <catch-table
      :columns="[
        {
          prop: 'title',
          label: '模块名称'
        },
        {
          prop: 'path',
          label: '模块目录'
        },
        {
          slot: 'version',
          label: '模块版本'
        },
        {
          slot: 'status',
          label: '模块状态'
        },
        {
          type: 'operate',
          label: '操作',
          width: 300,
          destroy: false
        }
      ]"
      :search-form="[
        {
          type: 'input',
          name: 'title',
          label: '模块名称'
        }
      ]"
      :api="api"
      primary-name="name"
      :pagination="false"
      ref="catchtable"
    >
      <template #version="scope">
        <el-tag type="warning">{{ scope.row.version }}</el-tag>
      </template>
      <template #status="scope">
        <Status v-model="scope.row.enable" :id="scope.row.name" :api="api" @refresh="refresh" />
      </template>
      <template #dialog="row">
        <Create :primary="row?.name" :api="api" />
      </template>
    </catch-table>
  </div>
</template>

<script lang="ts" setup>
// @ts-nocheck
import { ref } from 'vue'
import Create from './create.vue'
import Install from './install.vue'
const api = 'module'
const catchtable = ref()

// '确认删除吗? ⚠️将会删除模块下所有文件'

const installVisible = ref<boolean>(false)
const refresh = () => {
  catchtable.value.reset()
}
</script>

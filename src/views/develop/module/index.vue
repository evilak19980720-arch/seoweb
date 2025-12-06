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
      <template #operation>
        <!-- header 插槽的内容放这里 -->
        <el-button type="success" class="float-right" @click="installVisible = true">
          <Icon name="cog-6-tooth" class="w-4 h-4 mr-1" />
          安装
        </el-button>
      </template>

      <template #dialog="row">
        <Create :primary="row?.name" :api="api" />
      </template>
    </catch-table>
    <!-- 安装 -->
    <Dialog v-model="installVisible" title="安装模块" destroy-on-close>
      <Install />
    </Dialog>
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

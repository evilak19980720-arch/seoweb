<template>
  <div>
    <catch-table
      :columns="[
        {
          label: '菜单名称',
          prop: 'permission_name'
        },
        {
          label: '菜单路由',
          prop: 'route'
        },
        {
          label: '权限标识',
          slot: 'permission_mark',
          width: 400
        },
        {
          label: '状态',
          prop: 'hidden',
          switch: true,
          switchRefresh: () => {
            catchtable.doSearch()
          },
          align: 'center',
          width: 100
        },
        {
          label: '操作',
          type: 'operate',
          width: 200
        }
      ]"
      :search-form="[
        {
          type: 'input',
          name: 'permission_name',
          label: '菜单名称'
        }
      ]"
      :api="api"
      row-key="id"
      ref="catchtable"
      default-expand-all
      dialog-width="800px"
    >
      <template #permission_mark="scope">
        <div v-if="scope.row.actions.length" class="grid grid-cols-4 gap-1">
          <el-tag v-for="(action, k) in scope.row.actions" :key="k" class="cursor-pointer min-w-fit" @click="catchtable.openDialog(action)" closable @close="catchtable.del(api, action.id)">{{
            action.permission_name
          }}</el-tag>
        </div>
        <div v-else>
          <el-popconfirm
            v-if="scope.row.type === MenuType.PAGE_TYPE && scope.row.hidden === 1"
            confirm-button-text="确认"
            title="添加基础actions"
            @confirm="actionGenerate(scope.row.id)"
            placement="top"
          >
            <template #reference>
              <el-tag class="w-8 cursor-pointer">
                <Icon name="cog-6-tooth" className="animate-spin w-4 h-4" v-if="generateId === scope.row.id" />
                <Icon name="plus" className="w-4 h-4" v-else />
              </el-tag>
            </template>
          </el-popconfirm>
        </div>
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
import { MenuType } from '@/enum/app'
import http from '@/support/http'
import Create from './form/create.vue'

const api = 'permissions/permissions'

// table ref
const catchtable = ref()
const generateId = ref<number>(0)
const actionGenerate = async (id: number) => {
  generateId.value = id
  http
    .post(api, { parent_id: id, actions: true })
    .then(r => {
      actionReset()
    })
    .catch(e => {
      actionReset()
    })
    .finally(() => {
      actionReset()
    })
}
const actionReset = () => {
  generateId.value = 0
  catchtable.value.reset()
}
</script>

<template>
  <div class="flex flex-col justify-between w-full gap-3 sm:flex-row">
    <Department v-model="departmentId" @searchDepartmentUsers="searchDepartment" v-if="hasRoles" />
    <catch-table
      :columns="columns"
      api="users"
      class="w-full"
      ref="catchtable"
      :exports="true"
      permission="user.user"
      exportUrl="/user/export"
      importUrl="/user/import"
      :trash="true"
      :search-form="[
        {
          type: 'input',
          label: '用户名',
          name: 'username'
        },
        {
          type: 'input',
          label: '邮箱',
          name: 'email'
        },
        {
          type: 'select',
          label: '状态',
          name: 'status',
          api: 'status'
        }
      ]"
    >
      <template #avatar="scope">
        <cavatar :avatar="scope.row.avatar" :size="35" />
      </template>
      <!-- dialog -->
      <template #dialog="row">
        <!--<catch-form :api="api" />-->
        <Create :primary="row?.id" :api="api" :has-roles="hasRoles" />
      </template>
    </catch-table>
  </div>
</template>

<script lang="ts" setup>
// @ts-nocheck
import { onMounted, ref } from 'vue'
import Create from './create.vue'
import Department from './components/department.vue'
import { useUserStore } from '@/stores/modules/user'
import { isUndefined } from '@/support/helper'
const userStore = useUserStore()
const api = 'users'
const hasRoles = ref<boolean>(false)

onMounted(() => {
  hasRoles.value = !isUndefined(userStore.getRoles)
})

const catchtable = ref<any>()
// 部门搜索
const departmentId = ref<number>()
const searchDepartment = () => {
  catchtable.value.doSearch({ department_id: departmentId.value }, true)
}

const columns = [
  {
    type: 'selection'
  },
  {
    label: '用户昵称',
    prop: 'username'
  },
  {
    prop: 'avatar',
    label: '头像',
    slot: 'avatar'
  },
  {
    label: '邮箱',
    prop: 'email',
    ellipsis: true
  },
  {
    label: '状态',
    prop: 'status',
    switch: true
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
]
</script>

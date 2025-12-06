<template>
  <div>
    <catch-table
      :columns="columns"
      :api="api"
      :search-form="search"
      exportUrl="permissions/admin/export/users"
      importUrl="permissions/admin/import/users"
    >
      <template #dialog="row">
        <Create :primary="row?.id" :api="api" />
    </template>
    </catch-table>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import Create from './form/create.vue'
const api = "permissions/admin/users"
// table columns
const columns = [
	{
		prop: 'id',
		label: 'ID',
	},
	{
		prop: 'username',
		label: '昵称',
	},
	{
		prop: 'password',
		label: '密码',
	},
	{
		prop: 'email',
		label: '邮箱',
	},
	{
		prop: 'mobile',
		label: 'mobile',
	},
	{
		prop: 'wx_pc_openid',
		label: '微信网页授权的 openid',
	},
	{
		prop: 'unionid',
		label: '微信唯一用户标识 unionid',
	},
	{
		prop: 'avatar',
		label: '头像',
	},
	{
		prop: 'remember_token',
		label: 'token',
	},
	{
		prop: 'department_id',
		label: '部门ID',
	},
	{
		prop: 'status_text',
		label: '状态',
	},
	{
		prop: 'login_ip',
		label: '登录IP',
	},
	{
		prop: 'login_at',
		label: '登录时间',
	},
	{
		prop: 'created_at',
		label: '创建时间',
	},
	{
		prop: 'updated_at',
		label: '更新时间',
	},
	{
		type: 'operate',
		label: '操作',
	},
]
// table search
const search = [
	{
		type: 'input',
		name: 'username',
		label: '昵称',
	},
]
</script>
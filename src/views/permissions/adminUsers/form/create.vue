<template>
  <el-form :model="formData" label-width="120px" ref="form" v-loading="loading" class="pr-4">
    <el-form-item label="昵称" prop="username" :rules="[{ required: true, message: 'required' }]">
  <el-input v-model="formData.username" name="username" clearable />
</el-form-item>

<el-form-item label="密码" prop="password" >
  <el-input v-model="formData.password" name="password" clearable />
</el-form-item>

<el-form-item label="邮箱" prop="email" >
  <el-input v-model="formData.email" name="email" clearable />
</el-form-item>

<el-form-item label="mobile" prop="mobile" >
  <el-input v-model="formData.mobile" name="mobile" clearable />
</el-form-item>

<el-form-item label="微信网页授权的 openid" prop="wx_pc_openid" >
  <el-input v-model="formData.wx_pc_openid" name="wx_pc_openid" clearable />
</el-form-item>

<el-form-item label="微信唯一用户标识 unionid" prop="unionid" >
  <el-input v-model="formData.unionid" name="unionid" clearable />
</el-form-item>

<el-form-item label="头像" prop="avatar" >
  <el-input v-model="formData.avatar" name="avatar" clearable />
</el-form-item>

<el-form-item label="token" prop="remember_token" >
  <el-input v-model="formData.remember_token" name="remember_token" clearable />
</el-form-item>

<el-form-item label="部门ID" prop="department_id" >
   <RemoteSelect table="departments" value="id" label="department_name" v-model="formData.department_id" placeholder="请选择部门ID"/>
</el-form-item>

<el-form-item label="状态" prop="status" >
  <el-radio-group v-model="formData.status">
    <el-radio v-for="item in [{label:'正常',value: 1},{label:'禁用',value: 2}]" :key="item.value" :value="item.value" name="status">{{ item.label }}</el-radio>
  </el-radio-group>
</el-form-item>

<el-form-item label="登录IP" prop="login_ip" >
  <el-input v-model="formData.login_ip" name="login_ip" clearable />
</el-form-item>

<el-form-item label="登录时间" prop="login_at" >
  <el-input-number v-model="formData.login_at" name="login_at" :min="1" />
</el-form-item>
    <div class="flex justify-end">
      <el-button type="primary" @click="submitForm(form)">{{ $t('system.confirm') }}</el-button>
    </div>
  </el-form>
</template>

<script lang="ts" setup>
// @ts-nocheck
import { useCreate } from '@/composables/curd/useCreate'
import { useShow } from '@/composables/curd/useShow'

import { inject, onMounted } from 'vue'

const props = defineProps({
  primary: [String, Number],
  api: String
})

const { formData, form, loading, submitForm, close } = useCreate(props.api as string, props.primary)

if (props.primary) {
  useShow(props.api as string, props.primary, formData)
}

const closeDialog = inject('closeDialog') as Function
onMounted(() => {
  close(() => closeDialog())
})
</script>

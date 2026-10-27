<template>
  <el-form :model="formData" label-width="120px" ref="form" v-loading="loading" class="pr-4">
    <el-form-item label="名称" prop="name" :rules="[{ required: true, message: '名称必须填写' }]">
      <el-input v-model="formData.name" clearable maxlength="100" />
    </el-form-item>
    <el-form-item label="Account ID" prop="account_id" :rules="[{ required: true, message: 'Account ID 必须填写' }]">
      <el-input v-model="formData.account_id" clearable maxlength="64" />
    </el-form-item>
    <el-form-item label="API Token" prop="api_token" :rules="primary ? [] : [{ required: true, message: 'API Token 必须填写' }]">
      <el-input v-model="formData.api_token" type="password" show-password clearable maxlength="255" :placeholder="primary ? '留空表示不修改' : ''" />
      <Prompt text="用「API 令牌」创建自定义令牌（不是 Global API Key）。权限：Zone 编辑、DNS 编辑、Zone Settings 编辑、SSL and Certificates 读取、Cache Purge、Zone Analytics 读取、Account Analytics 读取" />
    </el-form-item>
    <el-form-item label="状态" prop="status">
      <el-radio-group v-model="formData.status">
        <el-radio :value="1">启用</el-radio>
        <el-radio :value="2">禁用</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="备注" prop="remark">
      <el-input v-model="formData.remark" type="textarea" maxlength="500" show-word-limit />
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

const { formData, form, loading, submitForm, close } = useCreate(props.api, props.primary)

formData.value.status = 1

if (props.primary) {
  useShow(props.api, props.primary, formData)
}

const closeDialog = inject('closeDialog')
onMounted(() => {
  close(() => closeDialog())
})
</script>

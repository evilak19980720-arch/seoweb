<script setup lang="ts">
import { reactive, shallowRef, useTemplateRef } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { IssuedToken } from '../TokenCredentials.vue'
import http from '@/support/http'

const props = defineProps<{ api: string }>()
const emit = defineEmits<{ issued: [credential: IssuedToken]; busy: [value: boolean]; close: [] }>()
const form = useTemplateRef<FormInstance>('form')
const loading = shallowRef(false)
const formData = reactive<{ name: string; user_id: number | undefined; days: number }>({ name: '', user_id: undefined, days: 30 })
const rules: FormRules<typeof formData> = {
  user_id: [{ required: true, type: 'number', message: '请选择所属用户', trigger: 'change' }],
  name: [
    { required: true, whitespace: true, message: '请填写令牌名称', trigger: 'blur' },
    { max: 100, message: '名称最多 100 个字符', trigger: 'blur' }
  ]
}

async function submit(): Promise<void> {
  if (loading.value || !form.value) return
  if (!await form.value.validate().catch(() => false)) return

  loading.value = true
  emit('busy', true)
  try {
    const response = await http.post(props.api, {
      name: formData.name.trim(),
      user_id: formData.user_id,
      expires_at: Math.floor(Date.now() / 1000) + formData.days * 86400
    })
    emit('issued', response.data.data as IssuedToken)
  } catch {
    // 请求错误由共享 HTTP 层显示，保留表单供重试。
  } finally {
    loading.value = false
    emit('busy', false)
  }
}
</script>

<template>
  <el-form ref="form" :model="formData" :rules="rules" label-width="90px" @submit.prevent="submit">
    <el-form-item label="令牌名称" prop="name">
      <el-input v-model="formData.name" placeholder="例如：Claude Desktop / 自动化脚本" maxlength="100" show-word-limit :disabled="loading" />
    </el-form-item>
    <el-form-item label="所属用户" prop="user_id">
      <RemoteApiSelect v-model="formData.user_id" api="users?status=1" search-field="username" value="id" label="username" placeholder="请选择后台用户" :disabled="loading" class="w-full" />
    </el-form-item>
    <el-form-item label="有效期" prop="days">
      <el-radio-group v-model="formData.days" :disabled="loading">
        <el-radio-button :value="7">7 天</el-radio-button>
        <el-radio-button :value="30">30 天</el-radio-button>
        <el-radio-button :value="90">90 天</el-radio-button>
      </el-radio-group>
    </el-form-item>
    <div class="flex justify-end gap-2">
      <el-button :disabled="loading" @click="emit('close')">取消</el-button>
      <el-button type="primary" native-type="submit" :loading="loading">创建令牌</el-button>
    </div>
  </el-form>
</template>

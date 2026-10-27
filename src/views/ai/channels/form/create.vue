<template>
  <el-form :model="formData" label-width="120px" ref="form" v-loading="loading" class="pr-4">
    <el-form-item label="快速选择" v-if="!primary">
      <el-select class="w-full" placeholder="选择常用渠道，自动填写协议和接口地址" @change="applyPreset" clearable>
        <el-option v-for="item in presets" :key="item.label" :label="item.label" :value="item.label" />
      </el-select>
    </el-form-item>
    <el-form-item label="名称" prop="name" :rules="[{ required: true, message: '名称必须填写' }]">
      <el-input v-model="formData.name" clearable maxlength="100" />
    </el-form-item>
    <el-form-item label="协议" prop="provider" :rules="[{ required: true, message: '请选择协议' }]">
      <el-radio-group v-model="formData.provider">
        <el-radio :value="1">OpenAI 兼容</el-radio>
        <el-radio :value="2">Anthropic</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="接口地址" prop="base_url" :rules="[{ required: true, message: '接口地址必须填写' }]">
      <el-input v-model="formData.base_url" clearable maxlength="255" />
    </el-form-item>
    <el-form-item label="API Key" prop="api_key" :rules="primary ? [] : [{ required: true, message: 'API Key 必须填写' }]">
      <el-input v-model="formData.api_key" type="password" show-password clearable :placeholder="primary ? '留空表示不修改' : ''" />
    </el-form-item>
    <el-form-item label="模型" prop="model" :rules="[{ required: true, message: '模型必须填写' }]">
      <el-input v-model="formData.model" clearable maxlength="100" />
    </el-form-item>
    <el-form-item label="温度" prop="temperature">
      <el-input-number v-model="formData.temperature" :min="0" :max="2" :step="0.1" :precision="2" />
    </el-form-item>
    <el-form-item label="最大输出" prop="max_tokens">
      <el-input-number v-model="formData.max_tokens" :min="256" :max="200000" :step="512" />
      <span class="ml-2 text-gray-400">tokens</span>
    </el-form-item>
    <el-form-item label="超时" prop="timeout">
      <el-input-number v-model="formData.timeout" :min="10" :max="600" />
      <span class="ml-2 text-gray-400">秒</span>
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

formData.value.provider = 1
formData.value.temperature = 0.7
formData.value.max_tokens = 4096
formData.value.timeout = 120
formData.value.status = 1

if (props.primary) {
  useShow(props.api, props.primary, formData)
}

const presets = [
  { label: 'OpenAI', provider: 1, base_url: 'https://api.openai.com/v1' },
  { label: 'Anthropic Claude', provider: 2, base_url: 'https://api.anthropic.com' },
  { label: 'DeepSeek', provider: 1, base_url: 'https://api.deepseek.com/v1' },
  { label: '通义千问（阿里云百炼）', provider: 1, base_url: 'https://dashscope.aliyuncs.com/compatible-mode/v1' },
  { label: 'Kimi（月之暗面）', provider: 1, base_url: 'https://api.moonshot.cn/v1' },
  { label: 'Google Gemini', provider: 1, base_url: 'https://generativelanguage.googleapis.com/v1beta/openai' },
  { label: 'OpenRouter', provider: 1, base_url: 'https://openrouter.ai/api/v1' }
]

const applyPreset = (label: string) => {
  const preset = presets.find(item => item.label === label)
  if (!preset) {
    return
  }
  formData.value.provider = preset.provider
  formData.value.base_url = preset.base_url
  if (!formData.value.name) {
    formData.value.name = preset.label
  }
}

const closeDialog = inject('closeDialog')
onMounted(() => {
  close(() => closeDialog())
})
</script>

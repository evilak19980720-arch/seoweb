<template>
  <el-form :model="formData" label-width="120px" ref="form" v-loading="loading" class="pr-4">
    <el-form-item label="名称" prop="name" :rules="[{ required: true, message: '名称必须填写' }]">
      <el-input v-model="formData.name" clearable maxlength="100" />
    </el-form-item>
    <el-form-item label="类型" prop="type" :rules="[{ required: true, message: '请选择类型' }]">
      <el-select v-model="formData.type" class="w-full">
        <el-option v-for="item in types" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <Prompt text="同一类型有多条启用的提示词时，使用 ID 最大的那条" />
    </el-form-item>
    <el-form-item label="AI 渠道" prop="channel_id" :rules="[{ required: true, message: '请选择 AI 渠道' }]">
      <el-select v-model="formData.channel_id" class="w-full">
        <el-option v-for="item in channels" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <Prompt text="建议生成、润色、审核分别使用不同厂商的模型" />
    </el-form-item>
    <el-form-item label="可用变量" v-if="variables.length">
      <div class="flex flex-wrap gap-2">
        <el-tooltip v-for="item in variables" :key="item.key" :content="item.label" placement="top">
          <el-tag class="cursor-pointer" @click="insert(item.key)">{{ '{' + item.key + '}' }}</el-tag>
        </el-tooltip>
      </div>
      <Prompt text="点击变量插入到提示词内容末尾" />
    </el-form-item>
    <el-form-item label="系统提示词" prop="system_prompt">
      <el-input v-model="formData.system_prompt" type="textarea" :rows="4" />
    </el-form-item>
    <el-form-item label="提示词内容" prop="content" :rules="[{ required: true, message: '提示词内容必须填写' }]">
      <el-input v-model="formData.content" type="textarea" :rows="16" />
    </el-form-item>
    <el-form-item label="状态" prop="status">
      <el-radio-group v-model="formData.status">
        <el-radio :value="1">启用</el-radio>
        <el-radio :value="2">禁用</el-radio>
      </el-radio-group>
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
import http from '@/support/http'
import { computed, inject, onMounted, ref } from 'vue'

const props = defineProps({
  primary: [String, Number],
  api: String
})

const { formData, form, loading, submitForm, close } = useCreate(props.api, props.primary)

formData.value.status = 1

if (props.primary) {
  useShow(props.api, props.primary, formData)
}

const types = ref([])
const channels = ref([])

const variables = computed(() => {
  const type = types.value.find(item => item.value === formData.value.type)
  return type ? Object.entries(type.variables).map(([key, label]) => ({ key, label })) : []
})

const insert = (key: string) => {
  formData.value.content = (formData.value.content ?? '') + '{' + key + '}'
}

const closeDialog = inject('closeDialog')
onMounted(() => {
  close(() => closeDialog())
  http.get('ai/prompts/types').then(r => {
    types.value = r.data.data
  })
  http.get('ai/channels/options').then(r => {
    channels.value = r.data.data
  })
})
</script>

<template>
  <el-form :model="formData" label-width="120px" ref="form" v-loading="loading" class="pr-4">
    <el-form-item
      label="模版标识"
      prop="identify"
      :rules="[
        {
          required: true,
          message: '标识必须填写'
        }
      ]"
    >
      <el-input v-model="formData.identify" name="identify" clearable />
    </el-form-item>
    <el-form-item label="模版ID" prop="template_id">
      <el-input v-model="formData.template_id" name="template_id" clearable />
    </el-form-item>
    <el-form-item label="模版内容" prop="content">
      <el-input v-model="formData.content" name="content" type="textarea" clearable />
      <div class="text-sm text-gray-400">
        消息内容支持文本和markdown格式,同时也支持变量，变量请使用【<span class="text-red-600">{}</span>】包裹，例如 <span class="text-red-600">{content}</span> ，<span class="text-red-600"
          >{name}</span
        >
        格式
      </div>
    </el-form-item>
    <el-form-item label="模版变量" prop="variables">
      <el-input v-model="formData.variables" name="variables" clearable />
      <Prompt text="预留字段,提供特定需求，如果你得变量需要做转换，可以使用它二次开发" />
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
  api: String,
  channel: {
    type: String,
    default: ''
  }
})

const { formData, form, loading, submitForm, close } = useCreate(props.api as string, props.primary)

if (props.primary) {
  useShow(props.api as string, props.primary, formData)
}

const closeDialog = inject('closeDialog') as Function
onMounted(() => {
  close(() => closeDialog())
  formData.value.channel = props.channel
})
</script>

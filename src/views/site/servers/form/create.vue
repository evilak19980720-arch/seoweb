<template>
  <el-form :model="formData" label-width="120px" ref="form" v-loading="loading" class="pr-4">
    <el-form-item label="名称" prop="name" :rules="[{ required: true, message: '名称必须填写' }]">
      <el-input v-model="formData.name" clearable maxlength="100" placeholder="例如 sp-node-01" />
    </el-form-item>
    <el-form-item label="公网 IP" prop="ip" :rules="[{ required: true, message: 'IP 必须填写' }]">
      <el-input v-model="formData.ip" clearable maxlength="45" />
    </el-form-item>
    <el-form-item label="区域" prop="region">
      <el-input v-model="formData.region" clearable maxlength="50" placeholder="例如 São Paulo" />
    </el-form-item>
    <el-form-item label="容量" prop="capacity" :rules="[{ required: true, message: '容量必须填写' }]">
      <el-input-number v-model="formData.capacity" :min="1" :max="10000" />
      <Prompt text="这台服务器最多承载的站点数" />
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

formData.value.capacity = 100
formData.value.status = 1

if (props.primary) {
  useShow(props.api, props.primary, formData)
}

const closeDialog = inject('closeDialog')
onMounted(() => {
  close(() => closeDialog())
})
</script>

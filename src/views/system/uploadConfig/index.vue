<template>
  <div class="flex flex-col items-center justify-center w-full bg-white dark:bg-regal-dark">
    <el-form :model="formData" label-width="200px" ref="form" v-loading="loading" class="w-1/2 mt-10 mb-10">
      <el-form-item
        label="图片类型限制"
        :rules="[
          {
            required: true,
            message: '请选择图片类型'
          }
        ]"
      >
        <Select api="imageExts" multiple v-model="formData.image_exts" />
        <Prompt text="config('upload.image_exts')" />
      </el-form-item>
      <el-form-item
        label="文件类型限制"
        :rules="[
          {
            required: true,
            message: '请选择文件类型'
          }
        ]"
      >
        <Select api="fileExts" multiple v-model="formData.file_exts" />
        <Prompt text="config('upload.file_exts')" />
      </el-form-item>
      <el-form-item
        label="上传大小限制"
        :rules="[
          {
            required: true,
            message: '请输入上传大小限制'
          }
        ]"
      >
        <div class="flex flex-col">
          <div><el-input-number v-model="formData.limit_size" :max="100" :min="0" /> <span class="ml-2 text-gray-500">MB</span></div>
          <Prompt text="config('upload.limit_size')" />
        </div>
      </el-form-item>
      <el-form-item
        label="请选择驱动"
        :rules="[
          {
            required: true,
            message: '请选择上传驱动'
          }
        ]"
      >
        <el-select v-model="driver" placeholder="请选择驱动" class="w-full" @change="selectDriver">
          <el-option v-for="item in drivers" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <div v-if="formData.driver === 'oss'">
        <oss :oss="ossData" />
      </div>
      <div v-if="formData.driver === 'cos'">
        <cos :cos="ossData" />
      </div>
      <div v-if="formData.driver === 'qiniu'">
        <qiniu :qiniu="ossData" />
      </div>
      <div class="flex justify-center">
        <el-button type="primary" @click="submitForm(form)">{{ $t('system.confirm') }}</el-button>
      </div>
    </el-form>
  </div>
</template>
<script lang="ts" setup>
// @ts-nocheck
import { ref, onMounted } from 'vue'
import oss from './components/oss.vue'
import cos from './components/cos.vue'
import qiniu from './components/qiniu.vue'
import http from '@/support/http'
import Message from '@/support/message'
import type { FormInstance } from 'element-plus'
const api: string = 'system/upload/config'

const formData = ref({
  driver: '',
  image_exts: '',
  file_exts: '',
  limit_size: 1
})
const driver = ref('')
const loading = ref(false)
const form = ref<FormInstance>()
const submitForm = (form: FormInstance | undefined) => {
  if (!form) return
  form.validate((valid, fields) => {
    if (valid) {
      const post = Object.assign(formData.value, ossData.value)
      http.post(api, post).then(r => {
        if (r.data.code === 10000) {
          Message.success('配置成功')
        }
      })
    }
  })
}
const ossData = ref({})
//  上传驱动
const drivers = [
  {
    label: '阿里OSS',
    value: 'oss'
  },
  {
    label: '腾讯COS',
    value: 'cos'
  },
  {
    label: '七牛云',
    value: 'qiniu'
  }
]

const selectDriver = async (v: string) => {
  ossData.value = {}
  await http.get(api + '/' + v).then(r => {
    const { image_exts, file_exts, limit_size, config } = r.data.data

    if (config) {
      ossData.value = config
    }
    formData.value.driver = r.data.data.driver
    formData.value.image_exts = image_exts
    formData.value.file_exts = file_exts
    formData.value.limit_size = limit_size
    driver.value = r.data.data.driver
  })
}

onMounted(() => {
  http.get(api).then(r => {
    const { image_exts, file_exts, limit_size, config } = r.data.data
    formData.value.driver = r.data.data.driver
    formData.value.image_exts = image_exts
    formData.value.file_exts = file_exts
    formData.value.limit_size = limit_size
    driver.value = r.data.data.driver
    if (config) {
      ossData.value = config
    }
  })
})
</script>

<template>
  <el-form :model="form" label-width="200px">
    <el-form-item label="七牛 AccessKey">
      <el-input v-model="form.access_key" />
      <Prompt text="config('upload.qiniu.access_key')" />
    </el-form-item>
    <el-form-item label="七牛 SecretKey">
      <el-input v-model="form.secret_key" />
      <Prompt text="config('upload.qiniu.secret_key')" />
    </el-form-item>
    <el-form-item label="七牛 Bucket">
      <el-input v-model="form.bucket" />
      <Prompt text="config('upload.qiniu.bucket')" />
    </el-form-item>
    <el-form-item label="七牛 Domain">
      <el-input v-model="form.domain" />
      <Prompt text="config('upload.qiniu.domain')" />
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface Qiniu {
  access_key: string
  secret_key: string
  bucket: string
  domain: string
}

const props = defineProps<{
  qiniu: Qiniu
}>()
const form = ref<Qiniu>(props.qiniu)
</script>

<template>
  <el-form :model="form" label-width="200px">
    <el-form-item label="region">
      <el-input v-model="form.region" />
      <Prompt text="config('upload.cos.region')" />
    </el-form-item>
    <el-form-item label="app_id">
      <el-input v-model="form.app_id" />
      <Prompt text="config('upload.cos.app_id')" />
    </el-form-item>
    <el-form-item label="secret_id">
      <el-input v-model="form.secret_id" />
      <Prompt text="config('upload.cos.secret_id')" />
    </el-form-item>
    <el-form-item label="secret_key">
      <el-input v-model="form.secret_key" />
      <Prompt text="config('upload.cos.secret_key')" />
    </el-form-item>
    <el-form-item label="bucket">
      <el-input v-model="form.bucket" />
      <Prompt text="config('upload.cos.bucket')" />
    </el-form-item>
    <el-form-item label="timeout">
      <el-input v-model="form.timeout" />
      <Prompt text="config('upload.cos.timeout')" />
    </el-form-item>
    <el-form-item label="connect_timeout">
      <el-input v-model="form.connect_timeout" />
      <Prompt text="config('upload.cos.connect_timeout')" />
    </el-form-item>
    <el-form-item label="cdn">
      <el-input v-model="form.cdn" />
      <Prompt text="config('upload.cos.cdn')" />
    </el-form-item>
    <el-form-item label="scheme">
      <el-input v-model="form.scheme" />
      <Prompt text="config('upload.cos.scheme')" />
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
interface Cos {
  region: string
  app_id: string
  secret_id: string
  secret_key: string
  bucket: string
  timeout: number
  connect_timeout: number
  cdn: string
  scheme: string
}

const props = defineProps<{
  cos: Cos
}>()
const form = ref<Cos>(props.cos)
</script>

<template>
  <el-form :model="form" label-width="200px">
    <el-form-item label="AccessKey ID">
      <el-input v-model="form.access_key" />
    </el-form-item>
    <el-form-item label="AccessKey Secret">
      <el-input v-model="form.secret_key" type="password" show-password />
    </el-form-item>
    <el-form-item label="Bucket">
      <el-input v-model="form.bucket" />
    </el-form-item>
    <el-form-item label="Endpoint">
      <el-input v-model="form.end_point" placeholder="oss-cn-hongkong.aliyuncs.com" />
      <Prompt text="Bucket 所在地域的外网 Endpoint，不带 Bucket 名称" />
    </el-form-item>
    <el-form-item label="访问域名">
      <el-input v-model="form.domain" placeholder="https://img.example.com" />
      <Prompt text="选填。绑定了自定义域名或 CDN 时填写，图片地址会使用这个域名" />
    </el-form-item>
    <el-form-item label="目录前缀">
      <el-input v-model="form.prefix" placeholder="uploads" />
    </el-form-item>
    <div class="mb-3 text-sm text-center text-gray-400">Bucket 需要开启公共读，RAM 账号需要 oss:PutObject 权限</div>
  </el-form>
</template>

<script lang="ts" setup>
// @ts-nocheck
import { ref } from 'vue'
const props = defineProps({ oss: Object })
const form = ref(props.oss)
</script>

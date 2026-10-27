<template>
  <el-form :model="form" label-width="200px">
    <el-form-item label="Access Key ID">
      <el-input v-model="form.access_key" />
    </el-form-item>
    <el-form-item label="Secret Access Key">
      <el-input v-model="form.secret_key" type="password" show-password />
    </el-form-item>
    <el-form-item label="Bucket">
      <el-input v-model="form.bucket" />
    </el-form-item>
    <el-form-item label="Region">
      <el-input v-model="form.region" placeholder="sa-east-1" />
      <Prompt text="Bucket 所在区域，例如圣保罗是 sa-east-1" />
    </el-form-item>
    <el-form-item label="Endpoint">
      <el-input v-model="form.endpoint" placeholder="留空使用 AWS 官方地址" />
      <Prompt text="选填。使用 Cloudflare R2、MinIO 等兼容 S3 的存储时填写完整地址" />
    </el-form-item>
    <el-form-item label="访问域名">
      <el-input v-model="form.domain" placeholder="https://img.example.com" />
      <Prompt text="选填。绑定了 CloudFront 或自定义域名时填写，图片地址会使用这个域名" />
    </el-form-item>
    <el-form-item label="目录前缀">
      <el-input v-model="form.prefix" placeholder="uploads" />
    </el-form-item>
    <div class="mb-3 text-sm text-center text-gray-400">Bucket 需要允许公开读取，IAM 账号需要 s3:PutObject 权限</div>
  </el-form>
</template>

<script lang="ts" setup>
// @ts-nocheck
import { ref } from 'vue'
const props = defineProps({ s3: Object })
const form = ref(props.s3)
</script>

<template>
  <el-form :model="form" label-width="200px">
    <el-form-item label="阿里云OSS prefix">
      <el-input v-model="form.prefix" />
      <Prompt text="config('upload.oss.prefix')" />
    </el-form-item>
    <el-form-item label="阿里云OSS access_key">
      <el-input v-model="form.access_key" />
      <Prompt text="config('upload.oss.access_key')" />
    </el-form-item>
    <el-form-item label="阿里云OSS secret_key">
      <el-input v-model="form.secret_key" />
      <Prompt text="config('upload.oss.secret_key')" />
    </el-form-item>
    <el-form-item label="阿里云OSS bucket">
      <el-input v-model="form.bucket" />
      <Prompt text="config('upload.oss.bucket')" />
    </el-form-item>
    <el-form-item label="阿里云OSS 区域">
      <el-input v-model="form.region" />
      <Prompt text="config('upload.oss.region')" />
    </el-form-item>
    <el-form-item label="阿里云OSS RAM 角色得 ARN">
      <el-input v-model="form.role_arn" />
      <Prompt text="config('upload.oss.role_arn')" />
    </el-form-item>
    <el-form-item label="阿里云OSS end_point">
      <el-input v-model="form.end_point" />
      <Prompt text="config('upload.oss.end_point')" />
      <Prompt text="可以使用自定义域名，录入 xxxx.com，如果需要 https 的话，需设置 https://xxxx.com" />
    </el-form-item>
    <el-form-item label="阿里云OSS is_cname">
      <el-radio-group v-model="form.is_cname" class="w-full">
        <el-radio :value="1" size="large">是</el-radio>
        <el-radio :value="2" size="large">否</el-radio>
      </el-radio-group>
      <Prompt text="config('upload.oss.is_cname')" />
      <Prompt text="使用自定义域名，需要开启 cname" />
    </el-form-item>
    <div class="mb-3 text-sm text-center text-gray-400">
      阿里云 OSS 上传需要通过 STS TOKEN 获取临时授权，所以按照这个<a
        href="https://help.aliyun.com/zh/oss/developer-reference/use-temporary-access-credentials-provided-by-sts-to-access-oss"
        class="text-lg text-indigo-600"
        >页面</a
      >创建 oss 密钥相关信息
    </div>
  </el-form>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
interface Oss {
  prefix: string
  access_key: string
  secret_key: string
  bucket: string
  end_point: string
  is_cname: number
  region: string
  role_arn: string
}
const props = defineProps<{
  oss: Oss
}>()

watch(
  props.oss,
  (oldValue, newValue) => {
    console.log(oldValue, newValue)
  },
  { deep: true }
)
const form = ref<Oss>(props.oss)
</script>

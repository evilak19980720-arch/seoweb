<template>
  <div class="w-2/3 mx-auto">
    <el-alert :title="'微信公众号配置需要到「微信公众平台」的 设置与开发 > 基本配置 获取'" type="warning" show-icon :closable="false" />

    <div class="w-5/6 mx-auto mt-5">
      <el-divider content-position="left" class="text-xl">开发配置</el-divider>
      <el-form :model="formData" label-width="120px" ref="form" v-loading="loading">
        <el-form-item
          label="AppId"
          prop="app_id"
          :rules="[
            {
              required: true,
              message: '微信公众开发配置 app_id'
            }
          ]"
        >
          <el-input v-model="formData.app_id" name="app_id" clearable />
          <Prompt text="config('wechat.office.app_id')" className="w-full" />
        </el-form-item>
        <el-form-item
          label="AppSecret"
          prop="app_secret"
          :rules="[
            {
              required: true,
              message: '微信公众开发配置 app secret'
            }
          ]"
        >
          <el-input v-model="formData.app_secret" name="app_secret" clearable />
          <Prompt text="config('wechat.office.app_secret')" className="w-full" />
        </el-form-item>

        <el-divider content-position="left" class="mt-12">服务器配置</el-divider>
        <el-form-item label="URL" prop="url">
          <el-input v-model="formData.url" name="url" clearable />
          <Prompt text="config('wechat.mini_program.url')" className="w-full" />
        </el-form-item>
        <el-form-item label="Token" prop="token">
          <el-input v-model="formData.token" name="token" clearable />
          <Prompt text="config('wechat.mini_program.token')" className="w-full" />
        </el-form-item>
        <el-form-item label="EncodingAESKey" prop="encoding_aeskey">
          <el-input v-model="formData.callback" name="callback" clearable />
          <Prompt text="config('wechat.mini_program.callback')" className="w-full" />
        </el-form-item>
        <div class="flex justify-center">
          <el-button type="primary" @click="submitForm(form)">{{ $t('system.confirm') }}</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>
<script lang="ts" setup>
// @ts-nocheck
import { useCreate } from '@/composables/curd/useCreate'
import { onMounted } from 'vue'
import http from '@/support/http'

const api: string = 'system/wechat/config'
const driver: string = 'office'
const { formData, form, loading, submitForm } = useCreate(api)
formData.value.driver = driver
formData.value.driver = driver
onMounted(() => {
  http.get(api + '/' + driver).then(r => {
    if (typeof r.data.data === 'object') {
      formData.value = Object.assign(formData.value, r.data.data)
      console.log(formData.value)
    }
  })
})
</script>

<style scoped>
:deep(.el-divider .el-divider__text) {
  @apply text-base;
}
</style>

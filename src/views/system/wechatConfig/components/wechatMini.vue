<template>
  <div class="w-2/3 mx-auto">
    <el-alert :title="'微信小程序配置需要 AppId 和 App Secret，请自行到「微信公众平台」申请小程序并认证之后获取'" type="warning" show-icon :closable="false" />

    <div class="w-full mx-auto mt-5">
      <el-form :model="formData" label-width="160px" ref="form" v-loading="loading">
        <el-divider content-position="left" class="text-xl">应用配置</el-divider>
        <el-form-item label="小程序名称" prop="app_name">
          <el-input v-model="formData.app_name" name="app_name" clearable />
          <Prompt text="config('wechat.mini_program.app_name')" />
        </el-form-item>
        <el-form-item label="原始ID" prop="origin_id" imageClass="w-12 h-12">
          <el-input v-model="formData.origin_id" name="app_secret" clearable />
          <Prompt text="config('wechat.mini_program.app_name')" />
        </el-form-item>
        <el-form-item label="小程序图标" prop="app_logo" class="flex flex-row">
          <Upload v-model="formData.app_logo" imageClass="w-28 h-28 rounded" />
          <Prompt text="config('wechat.mini_program.app_name')" className="w-full" />
        </el-form-item>

        <el-divider content-position="left" class="text-xl">开发配置</el-divider>
        <el-form-item
          label="AppId"
          prop="app_id"
          :rules="[
            {
              required: true,
              message: '小程序开发app id'
            }
          ]"
        >
          <el-input v-model="formData.app_id" name="app_id" clearable />
          <Prompt text="config('wechat.mini_program.app_id')" />
        </el-form-item>
        <el-form-item
          label="AppSecret"
          prop="app_secret"
          :rules="[
            {
              required: true,
              message: '小程序开发app secret'
            }
          ]"
        >
          <el-input v-model="formData.app_secret" name="app_secret" clearable />
          <Prompt text="config('wechat.mini_program.app_secret')" />
        </el-form-item>
        <el-form-item label="Token" prop="token">
          <el-input v-model="formData.token" name="token" clearable />
          <Prompt text="config('wechat.mini_program.token')" />
        </el-form-item>
        <el-form-item label="EncodingAESKey" prop="encoding_aeskey">
          <el-input v-model="formData.encoding_aeskey" name="encoding_aeskey" clearable />
          <Prompt text="config('wechat.mini_program.encoding_aeskey')" />
        </el-form-item>

        <el-divider content-position="left" class="mt-12">服务器域名</el-divider>
        <el-form-item label="Request合法域名" prop="request_domain">
          <el-input v-model="formData.request_domain" name="request_domain" clearable />
          <Prompt text="config('wechat.mini_program.request_domain')" />
        </el-form-item>
        <el-form-item label="Socket合法域名" prop="socket_domain">
          <el-input v-model="formData.socket_domain" name="socket_domain" clearable />
          <Prompt text="config('wechat.mini_program.socket_domain')" />
        </el-form-item>
        <el-form-item label="UploadFile合法域名" prop="upload_file_domain">
          <el-input v-model="formData.upload_file_domain" name="upload_file_domain" clearable />
          <Prompt text="config('wechat.mini_program.upload_file_domain')" />
        </el-form-item>
        <el-form-item label="DownloadFile合法域名" prop="download_file_domain">
          <el-input v-model="formData.download_file_domain" name="download_file_domain" clearable />
          <Prompt text="config('wechat.mini_program.download_file_domain')" />
        </el-form-item>
        <el-form-item label="Udp合法域名" prop="udp_domain">
          <el-input v-model="formData.udp_domain" name="udp_domain" clearable />
          <Prompt text="config('wechat.mini_program.udp_domain')" />
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
const driver: string = 'mini_program'

const { formData, form, loading, submitForm } = useCreate(api)
formData.value.driver = driver
onMounted(() => {
  http.get(api + '/' + driver).then(r => {
    if (typeof r.data.data === 'object') {
      formData.value = Object.assign(formData.value, r.data.data)
    }
  })
})
</script>

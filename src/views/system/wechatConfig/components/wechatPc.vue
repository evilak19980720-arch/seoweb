<template>
  <div class="w-2/3 mx-auto">
    <el-alert :title="'微信开发平台配置需要 AppId 和 App Secret，请自行到「微信开放平台」的管理中心 > 网站应用 获取'" type="warning" show-icon :closable="false" />

    <div class="w-5/6 mx-auto mt-5">
      <el-form :model="formData" label-width="120px" ref="form" v-loading="loading">
        <el-form-item
          label="AppId"
          prop="app_id"
          :rules="[
            {
              required: true,
              message: '网站开发应用 app_id'
            }
          ]"
        >
          <el-input v-model="formData.app_id" name="app_id" clearable />
          <Prompt text="config('wechat.pc.app_id')" />
        </el-form-item>
        <el-form-item
          label="AppSecret"
          prop="app_secret"
          :rules="[
            {
              required: true,
              message: '网站开发应用 app secret'
            }
          ]"
        >
          <el-input v-model="formData.app_secret" name="app_secret" clearable />
          <Prompt text="config('wechat.pc.app_secret')" />
        </el-form-item>
        <el-form-item
          label="回调地址"
          prop="callback"
          :rules="[
            {
              required: true,
              message: '网站回调地址'
            }
          ]"
        >
          <el-input v-model="formData.callback" name="callback" clearable />
          <Prompt text="config('wechat.pc.callback')" />
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
const driver: string = 'pc'

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

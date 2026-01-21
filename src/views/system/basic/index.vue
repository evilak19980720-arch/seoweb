<template>
  <!-- 美化的表单容器 -->
  <div class="bg-white rounded-xl border border-gray-200 shadow-lg dark:bg-gray-800 dark:border-gray-700">
    <div class="p-8">
      <el-form :model="formData" label-width="200px" ref="form" class="space-y-8 max-w-none">
        <!-- 基础设置分组 -->
        <div class="space-y-6">
          <el-divider content-position="left" class="!my-8">
            <div class="flex items-center space-x-2">
              <Icon name="cog-6-tooth" class="w-5 h-5 text-indigo-600" />
              <span class="text-lg font-semibold text-gray-800 dark:text-gray-200">基础设置</span>
            </div>
          </el-divider>

          <el-form-item label="后台标题" :rules="[{ required: true, message: '请输入后台标题' }]" class="mb-8">
            <div class="w-full">
              <el-input v-model="formData.dashboard.name" placeholder="请输入后台标题" size="large" class="w-full max-w-lg" />
              <div class="mt-3">
                <Prompt text="config('setting.dashboard.name')" />
              </div>
            </div>
          </el-form-item>

          <el-form-item label="后台 Logo" :rules="[{ required: true, message: '请上传后台 Logo' }]" class="mb-8">
            <div class="flex flex-col space-y-4">
              <div class="flex justify-start">
                <UploadImage v-model="formData.dashboard.logo" image-class="h-24"/>
              </div>
              <Prompt text="config('setting.dashboard.logo')" />
            </div>
          </el-form-item>
        </div>

        <!-- 登录设置分组 -->
        <div class="space-y-6">
          <el-divider content-position="left" class="!my-8">
            <div class="flex items-center space-x-2">
              <Icon name="key" class="w-5 h-5 text-green-600" />
              <span class="text-lg font-semibold text-gray-800 dark:text-gray-200">登录设置</span>
            </div>
          </el-divider>

          <el-form-item label="开启微信登录" class="mb-8">
            <div class="space-y-4">
              <el-radio-group v-model="formData.login.wechat" class="flex flex-col gap-4 sm:flex-row">
                <el-radio :value="1" size="large" class="!mr-0">
                  <span class="ml-2 text-base">是</span>
                </el-radio>
                <el-radio :value="0" size="large" class="!mr-0">
                  <span class="ml-2 text-base">否</span>
                </el-radio>
              </el-radio-group>
              <div class="space-y-2 max-w-4xl text-sm">
                <Prompt text="config('setting.login.wechat')" />
                <div class="p-3 bg-amber-50 rounded-lg border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
                  <Prompt text="先到[系统管理->微信配置->微信开放平台]配置对应的网站应用配置后，再启用，否则无效" />
                </div>
              </div>
            </div>
          </el-form-item>

          <el-form-item label="开启验证码" class="mb-8">
            <div class="space-y-4">
              <el-radio-group v-model="formData.login.use_captcha" class="flex flex-col gap-4 sm:flex-row">
                <el-radio :value="1" size="large" class="!mr-0">
                  <span class="ml-2 text-base">是</span>
                </el-radio>
                <el-radio :value="0" size="large" class="!mr-0">
                  <span class="ml-2 text-base">否</span>
                </el-radio>
              </el-radio-group>
              <div class="space-y-2 max-w-4xl text-sm">
                <Prompt text="config('setting.login.use_captcha')" />
                <div class="p-3 bg-green-50 rounded-lg border border-green-200 dark:bg-green-900/20 dark:border-green-800">
                  <Prompt text="后台是否使用验证码校验" />
                </div>
              </div>
            </div>
          </el-form-item>
        </div>

        <!-- 提交按钮 -->
        <div class="flex justify-center pt-8 border-t border-gray-200 dark:border-gray-700">
          <el-button type="primary" size="large" @click="submitForm(form)" class="px-12 py-3 text-base font-medium shadow-lg transition-all duration-200 hover:shadow-xl">
            {{ $t('system.confirm') }}
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
// @ts-nocheck
import { ref, onMounted } from 'vue'
import http from '@/support/http'
import Message from '@/support/message'
import type { FormInstance } from 'element-plus'
import { useAppStore } from '@/stores/modules/app'
import router from '@/router'

const api: string = 'system/setting'
const appStore = useAppStore()

const formData = ref({
  dashboard: {
    name: '',
    logo: ''
  },
  login: {
    wechat: 0,
    use_captcha: 1
  }
})

const form = ref<FormInstance>()

const submitForm = async (form: FormInstance | undefined) => {
  if (!form) return
  form.validate(async (valid) => {
    if (valid) {
      await http.post(api, formData.value)
      await appStore.setSetting()
      Message.success('配置成功')
    }
  })
}

onMounted(() => {
  const { dashboard, login } = appStore.getSetting
  formData.value.dashboard.logo = dashboard.logo
  formData.value.dashboard.name = dashboard.name
  formData.value.login.wechat = login.wechat
  formData.value.login.use_captcha = login.use_captcha
})
</script>

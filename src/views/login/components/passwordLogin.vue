<template>
  <div>
    <el-form
      ref="form"
      :model="params"
      status-icon
      v-loading.fullscreen.lock="loading"
      :rules="rules"
      element-loading-background="rgba(0, 0, 0, 0.7)"
      label-width="70px"
      class="w-11/12 pt-2 mx-auto space-y-8 sm:w-4/5"
    >
      <el-form-item prop="account">
        <el-input v-model="params.account" autocomplete="off" placeholder="邮箱/手机/用户" size="large" :prefix-icon="Message" class="h-12 text-base" />
      </el-form-item>
      <el-form-item prop="password">
        <el-input v-model="params.password" type="password" autocomplete="off" size="large" :placeholder="$t('login.password')" show-password :prefix-icon="Lock" class="h-12 text-base" />
      </el-form-item>
      <el-form-item prop="captcha" v-if="appStore.setting.login?.use_captcha > 0">
        <div class="flex w-full">
          <el-input v-model="params.captcha" autocomplete="off" size="large" placeholder="请输入验证码" class="h-12 text-base" />
          <img :src="captcha" class="w-full h-12 ml-2 cursor-pointer" @click="getCaptcha" v-if="captcha" />
        </div>
      </el-form-item>
    </el-form>
    <div class="flex justify-between w-11/12 mx-auto mt-3 sm:w-4/5">
      <el-checkbox v-model="params.remember" class="top-2">
        {{ $t('login.remember') }}
      </el-checkbox>
      <div class="pt-3 text-sm text-indigo-600 cursor-pointer">
        {{ $t('login.lost_password') }}
      </div>
    </div>
    <div class="w-11/12 mx-auto mt-5 sm:w-4/5">
      <el-button type="primary" @click="submit(form)" size="large" class="w-full text-xl" @keydown.enter="enterToLogin" ref="loginBtn">
        {{ $t('login.sign_in') }}
      </el-button>
    </div>
  </div>
</template>
<script setup lang="ts">
// @ts-nocheck
import { Lock, Message } from '@element-plus/icons-vue'
import { useLogin } from './login'
import { t } from '@/support/helper'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import http from '@/support/http'
import { useAppStore } from '@/stores/modules/app'
const appStore = useAppStore()

const { params, loading, submit, form, rules } = useLogin(
  {
    account: 'catch@admin.com',
    password: 'catchadmin',
    captcha_key: '',
    remember: false
  },
  {
    account: [{ required: true, message: '请输入邮箱/手机号/用户名', trigger: 'blur' }],
    password: [{ required: true, message: t('login.verify.password.required'), trigger: 'blur' }],
    captcha: [{ required: true, message: '请输入验证码', trigger: 'click' }]
  }
)
const captcha = ref('')
const getCaptcha = () => {
  http.get('auth/captcha').then(r => {
    captcha.value = r.data.data.img
    params.captcha_key = r.data.data.key
  })
}

watch(
  () => appStore.setting.login?.use_captcha,
  newValue => {
    console.log(newValue)
    if (newValue) {
      getCaptcha()
    }
  },
  { deep: true, immediate: true }
)
const loginBtn = ref()
const enterToLogin = e => {
  if (e.keyCode == 13) {
    loginBtn.value.$el.click()
  }
}

onMounted(() => {
  //绑定监听事件
  window.addEventListener('keydown', enterToLogin)
})

onUnmounted(() => {
  //销毁事件
  window.removeEventListener('keydown', enterToLogin, false)
})
</script>

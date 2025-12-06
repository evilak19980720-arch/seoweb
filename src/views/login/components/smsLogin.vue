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
      <el-form-item prop="mobile">
        <el-input v-model="params.mobile" placeholder="请输入手机号码" size="large" :prefix-icon="Iphone" class="h-12 text-base" clearable />
      </el-form-item>
      <el-form-item prop="sms_code" class="sms_code">
        <el-input v-model="params.sms_code" placeholder="请输入短信验证码" :prefix-icon="Position" class="h-12 text-base code" clearable />
        <div class="h-10 pt-1 text-center text-gray-500 border border-indigo-100 border-solid rounded-lg cursor-pointer text send hover:border-indigo-500">
          <span v-if="!timeStart" @click="getSmsCode" class="block w-full h-full">获取验证码</span>
          <span v-else>{{ time }} 秒后重新获取</span>
        </div>
      </el-form-item>
    </el-form>
    <div class="w-11/12 mx-auto mt-5 sm:w-4/5">
      <el-button type="primary" @click="submit(form)" size="large" class="w-full text-xl">
        {{ $t('login.sign_in') }}
      </el-button>
    </div>
  </div>
</template>
<script setup lang="ts">
// @ts-nocheck
import { useLogin } from './login'
import { ref } from 'vue'
import http from '@/support/http'
import Message from '@/support/message'
const { params, loading, submit, form, rules } = useLogin(
  {
    mobile: '',
    sms_code: '',
    remember: false
  },
  {
    mobile: [{ required: true, message: '请输入手机号码', trigger: 'blur' }],
    sms_code: [{ required: true, message: '请输入短信验证码', trigger: 'blur' }]
  }
)

const getTimeFromStorage = () => {
  const time = sessionStorage.getItem('sms_code_time') as string
  return parseInt(time)
}

const setTimeToStorage = (time: string) => {
  sessionStorage.setItem('sms_code_time', time)
}

const delTimeFromStorage = () => {
  sessionStorage.removeItem('sms_code_time')
  time.value = 60
  timeStart.value = false
}
const timeStart = ref<boolean>(false)
const time = ref<number>(getTimeFromStorage() || 60)
// 计时获取验证码
const smsCodeStart = () => {
  timeStart.value = true
  const setTimeoutS = setInterval(() => {
    time.value--
    setTimeToStorage(time.value.toString())
    if (time.value <= 0) {
      clearInterval(setTimeoutS)
      delTimeFromStorage()
    }
  }, 1000)
}
// 获取验证码
const getSmsCode = () => {
  http.get('sms/code', { mobile: params.mobile }).then(r => {
    if (r.data.code === 1e4) {
      Message.success('短信发送成功,请注意查收')
      smsCodeStart()
    } else {
      Message.error(r.data.message)
    }
  })
}

if (getTimeFromStorage() > 0) {
  smsCodeStart()
}
</script>
<style scoped>
:deep(.code) {
  @apply w-3/5;
}
:deep(.send) {
  @apply w-1/3;
}
:deep(.sms_code .el-form-item__content) {
  @apply flex justify-between;
}
</style>

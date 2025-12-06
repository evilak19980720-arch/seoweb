<template>
  <div class="flex items-center justify-center h-screen bg-gray-50">
    <div class="flex w-full sm:w-[32rem] shadow bg-white lg:rounded-lg">
      <!--<div class="hidden w-1/2 sm:block">
              <img src="@/public/assets/login-left.png" />
            </div>-->
      <div class="w-full pt-6 pb-6 pl-4 pr-4 mx-auto">
        <div class="flex mt-2">
          <img :src="logo" class="w-8 mx-auto" />
        </div>
        <div class="w-full mt-6 mb-8 text-2xl text-center text-indigo-700">Hi, {{ $t('login.welcome') }}</div>
        <el-divider>{{ $t('login.sign_in') }}</el-divider>
        <div v-if="loginDriver === 'password'">
          <passwordLogin />
        </div>
        <div v-if="loginDriver === 'wechat'">
          <wechatLogin />
        </div>
        <div v-if="loginDriver === 'mobile'">
          <smsLogin />
        </div>
        <!-- 登陆方式切换 -->
        <div class="flex flex-col justify-between w-11/12 mx-auto mt-3 sm:w-4/5" v-if="loginDrivers.length > 1">
          <el-divider> <span class="text-sm">其 他 登 陆 方 式</span> </el-divider>
          <div class="flex justify-between w-11/12 mx-auto mt-2 sm:w-3/5">
            <component v-bind:is="driver.value" v-for="(driver, k) in loginDrivers" :key="k" @click="changeLoginDriver(driver.driver)" />
          </div>
        </div>
        <div class="w-full mt-8 mb-10 text-sm text-center text-gray-400">{{ $t('system.name') }} @copyright 2018-{{ new Date().getFullYear() }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, shallowReactive, ref, watch } from 'vue'
import logo from '@/public/assets/logo.png'
import passwordLogin from './components/passwordLogin.vue'
import wechatLogin from './components/wechatLogin.vue'
import smsLogin from './components/smsLogin.vue'
import emailIcon from './icons/email.vue'
import mobileIcon from './icons/mobile.vue'
import wechatIcon from './icons/wechat.vue'
import { useAppStore } from '@/stores/modules/app'
// set default color-theme light
onMounted(() => {
  document.querySelector('html')?.setAttribute('class', 'light')
})

const getLoginDriverFromStorage = () => {
  const driver = sessionStorage.getItem('login_driver')
  return driver || 'password'
}

const changeLoginDriver = (driver: string) => {
  sessionStorage.setItem('login_driver', driver)
  loginDriver.value = driver
}
const loginDriver = ref<string>(getLoginDriverFromStorage())

const loginDrivers = shallowReactive([
  {
    label: '密码登录',
    value: emailIcon,
    driver: 'password'
  }
])

const appStore = useAppStore()
watch(
  () => appStore.setting,
  () => {
    if (appStore.setting.login?.mobile) {
      loginDrivers.push({
        label: '手机登陆',
        value: mobileIcon,
        driver: 'mobile'
      })
    }
    if (appStore.setting.login?.wechat) {
      loginDrivers.push({
        label: '微信登陆',
        value: wechatIcon,
        driver: 'wechat'
      })
    }
  },
  { deep: true }
)
</script>

<style scoped>
:deep(.el-form-item__content) {
  margin-left: 0 !important;
}

:deep(.el-divider__text) {
  @apply text-xl text-slate-400;
}
</style>
./components/login

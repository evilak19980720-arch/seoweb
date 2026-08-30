<template>
  <div class="flex w-full gap-5 p-10 bg-white dark:bg-regal-dark">
    <aliSms :default-driver="defualtDriver" @setDefault="setDefault('aliyun')" />
    <qcloudSms :default-driver="defualtDriver" @setDefault="setDefault('qcloud')" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import http from '@/support/http'
import aliSms from './components/aliSms.vue'
import qcloudSms from './components/qcloudSms.vue'
import Message from '@/support/message'

const defualtDriver = ref<string>('')
const getDefault = () => {
  http.get('system/sms/config/default').then(r => {
    if (r.data.code === 1e4) {
      defualtDriver.value = r.data.data
    }
  })
}

const setDefault = (driver: string) => {
  http.post('system/sms/config', { default: driver }).then(r => {
    Message.success('已设置' + (driver === 'qcloud' ? '腾讯云' : '阿里云') + '短信为默认短信通道')
    defualtDriver.value = driver
  })
}
getDefault()
</script>

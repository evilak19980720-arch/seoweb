<template>
  <el-card class="relative w-1/3">
    <div class="absolute top-0 right-0 w-10 h-10" v-if="defaultDriver === 'qcloud'">
      <div class="h-16 origin-top-left transform -rotate-45 bg-indigo-700"></div>
    </div>
    <template #header>
      <div class="flex justify-between">
        <span>腾讯云短信</span>
        <div>
          <el-button text bg type="success" @click="visible = true" size="small">短信模版</el-button>
          <el-button text bg type="primary" size="small" @click="setDefault" v-if="defaultDriver !== 'qcloud'">选择</el-button>
        </div>
      </div>
    </template>
    <div>
      <el-form :model="qcloud" label-width="100px">
        <el-form-item label="短信签名">
          <el-input v-model="qcloud.sign_name" placeholder="短信签名" />
          <Prompt text="config('sms.qcloud.sign_name')" />
        </el-form-item>
        <el-form-item label="sdk_app_id">
          <el-input v-model="qcloud.sdk_app_id" placeholder="短信SDK app id" />
          <Prompt text="config('sms.qcloud.sdk_app_id')" />
        </el-form-item>
        <el-form-item label="access_key">
          <el-input v-model="qcloud.secret_id" placeholder="短信 secret id" />
          <Prompt text="config('sms.qcloud.secret_id')" />
        </el-form-item>
        <el-form-item label="access_secret">
          <el-input v-model="qcloud.secret_key" placeholder="短信 secret key" />
          <Prompt text="config('sms.qcloud.secret_key')" />
        </el-form-item>
      </el-form>
      <div class="flex justify-end w-full">
        <el-button type="primary" @click="qcoludSubmit">保存</el-button>
      </div>
    </div>
    <Dialog title="腾讯短信模版" destroy-on-close v-model="visible" width="1000" _class="template">
      <systemSmsTemplate channel="qcloud" />
    </Dialog>
  </el-card>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import http from '@/support/http'
import Message from '@/support/message'
import systemSmsTemplate from './systemSmsTemplate/index.vue'
const visible = ref<boolean>(false)

// 腾讯短信配置
const qcloud = ref({
  channel: 'qcloud',
  sign_name: '',
  sdk_app_id: '',
  secret_key: '',
  secret_id: ''
})

defineProps({
  defaultDriver: {
    type: String,
    default: ''
  }
})
const emit = defineEmits(['setDefault'])
const setDefault = () => {
  emit('setDefault')
}
// 腾讯云
const getQcolud = () => {
  http.get('system/sms/config/qcloud').then(r => {
    if (r.data.code === 1e4) {
      qcloud.value.sign_name = r.data.data.sign_name
      qcloud.value.sdk_app_id = r.data.data.sdk_app_id
      qcloud.value.secret_key = r.data.data.secret_key
      qcloud.value.secret_id = r.data.data.secret_id
    }
  })
}
const qcoludSubmit = () => {
  http.post('system/sms/config', qcloud).then(r => {
    Message.success('腾讯短信配置成功')
  })
}
onMounted(() => {
  getQcolud()
})
</script>

<style scoped>
:deep(.template > .el-dialog__body) {
  padding: 0 !important;
}
</style>

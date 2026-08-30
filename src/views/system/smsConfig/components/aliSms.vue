<template>
  <el-card class="relative w-1/3">
    <div class="absolute top-0 right-0 w-10 h-10" v-if="defaultDriver === 'aliyun'">
      <div class="h-16 origin-top-left transform -rotate-45 bg-indigo-700"></div>
    </div>

    <template #header>
      <div class="flex justify-between">
        <span>阿里云短信</span>
        <div>
          <el-button text bg type="success" @click="visible = true" size="small">短信模版</el-button>
          <el-button text bg type="primary" size="small" @click="setDefault" v-if="defaultDriver !== 'aliyun'">选择</el-button>
        </div>
      </div>
    </template>
    <div>
      <el-form :model="aliyun" label-width="100px">
        <el-form-item label="短信签名">
          <el-input v-model="aliyun.sign_name" placeholder="短信签名" />
          <el-text type="info" size="small">config('sms.aliyun.sign_name')</el-text>
        </el-form-item>
        <el-form-item label="access_key">
          <el-input v-model="aliyun.access_key_id" placeholder="短信 access key" />
          <Prompt text="config('sms.aliyun.access_key_id')" />
        </el-form-item>
        <el-form-item label="access_secret">
          <el-input v-model="aliyun.access_key_secret" placeholder="短信 access secret" />
          <Prompt text="config('sms.aliyun.access_key_secret')" />
        </el-form-item>
      </el-form>
      <div class="flex justify-end w-full">
        <el-button type="primary" @click="aliyunSubmit">保存</el-button>
      </div>
      <Dialog title="阿里短信模版" destroy-on-close v-model="visible" width="1000" _class="template">
        <systemSmsTemplate channel="aliyun" />
      </Dialog>
    </div>
  </el-card>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import http from '@/support/http'
import Message from '@/support/message'
import systemSmsTemplate from './systemSmsTemplate/index.vue'
const visible = ref<boolean>(false)

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
// 阿里云配置
const aliyun = ref({
  channel: 'aliyun',
  sign_name: '',
  access_key_id: '',
  access_key_secret: ''
})

const getAliyun = () => {
  // 获取阿里云配置
  http.get('system/sms/config/aliyun').then(r => {
    if (r.data.code === 1e4) {
      aliyun.value.sign_name = r.data.data.sign_name
      aliyun.value.access_key_id = r.data.data.access_key_id
      aliyun.value.access_key_secret = r.data.data.access_key_secret
    }
  })
}
const aliyunSubmit = () => {
  http.post('system/sms/config', aliyun).then(r => {
    Message.success('阿里短信配置成功')
  })
}

onMounted(() => {
  getAliyun()
})
</script>
<style scoped>
:deep(.template > .el-dialog__body) {
  padding: 0 !important;
}
</style>

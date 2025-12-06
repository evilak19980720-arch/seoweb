<template>
  <div class="flex flex-col justify-center py-10 pl-5 pr-5 bg-white rounded gap-y-10 dark:bg-regal-dark">
    <el-alert title="该方案是为了解决跨域无法调试，由于演示环境使用统一域名，没有跨域问题，请下载的本地开放环境演示" type="warning" />
    <div>
      <h1>异常展示</h1>
      <el-input v-model="exceptionMessage" style="max-width: 600px" placeholder="Please input" class="input-with-select">
        <template #append>
          <el-button @click="exception">提交</el-button>
        </template>
      </el-input>
    </div>

    <div>
      <h1>dd 打印</h1>
      <el-input v-model="ddMessage" style="max-width: 600px" placeholder="Please input" class="input-with-select">
        <template #append>
          <el-button @click="dd">提交</el-button>
        </template>
      </el-input>
    </div>
  </div>
</template>
<script lang="ts" setup>
import http from '@/support/http'
import { ref } from 'vue'
const exceptionMessage = ref()
const exception = () => {
  http.get('demo/exception', { message: exceptionMessage.value }).then(r => {})
}
const ddMessage = ref()

const dd = () => {
  http.get('demo/dd', { message: ddMessage.value }).then(r => {})
}
</script>

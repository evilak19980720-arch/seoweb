<template>
  <el-upload
    ref="upload"
    :action="actionApi"
    :show-file-list="false"
    name="image"
    :auto-upload="auto"
    :headers="{ authorization: getBearerToken(), 'Request-from': 'Dashboard' }"
    v-bind="$attrs"
    :on-success="handleSuccess"
    :data="{ disk: props.disk, path: props.path }"
  >
    <template v-for="(index, name) in $slots" v-slot:[name]>
      <slot :name="name" />
    </template>
    <img :src="warpHost(model)" v-if="model" :class="imageClass" />
    <div v-else class="flex justify-center w-24 h-24 pt-8 border border-blue-100 border-dashed rounded">
      <Icon name="plus" />
    </div>
  </el-upload>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref } from 'vue'
import { getBaseUrl, warpHost } from '@/support/helper'
import { Code } from '@/enum/app'
import Message from '@/support/message'
import { getBearerToken } from '@/support/helper'

const props = defineProps({
  action: {
    type: String,
    default: 'upload/image'
  },
  auto: {
    type: Boolean,
    default: true
  },
  imageClass: {
    type: String,
    default: ''
  },
  // 配合后端的 filesysytem 配置
  disk: {
    type: String,
    default: 'uploads'
  },
  // 配合后端存储目录
  path: {
    type: String,
    default: 'attachments'
  }
})

const model = defineModel()
const baseURL: string = getBaseUrl()

const actionApi = ref<string>('')

actionApi.value = (baseURL.endsWith('/') ? baseURL : baseURL + '/') + props.action

const handleSuccess = (response: any, uploadFile: any) => {
  if (response.code === Code.SUCCESS) {
    model.value = response.data.path
  } else {
    Message.error(response.message)
  }
}
</script>

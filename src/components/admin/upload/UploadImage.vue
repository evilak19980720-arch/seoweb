<template>
  <el-upload
    :action="actionApi"
    :show-file-list="false"
    :name="name"
    :auto-upload="true"
    :headers="{ authorization: getBearerToken(), 'Request-from': RequestFrom }"
    ref="upload"
    :data="{ disk: props.disk, path: props.path }"
    :on-exceed="handleExceed"
    :on-success="handleSuccess"
    :before-upload="beforeUpload"
    :limit="1"
    v-loading="loading"
    :accept="fileExtensions.join(',')"
  >
    <img v-if="fileModel" :src="warpHost(fileModel)" :class="imageClass" />
    <div v-else>
      <div class="flex items-center justify-center w-20 h-20 border border-collapse">
        <el-icon><Plus /></el-icon>
      </div>
      <Prompt :text="'图片类型仅支持' + fileExtensions.join(' | ')" />
    </div>
  </el-upload>
</template>
<script setup lang="ts">
// @ts-nocheck
import { watch } from 'vue'
import { uploadImage } from '@/composables/useUpload'
import { Plus } from '@element-plus/icons-vue'
import { warpHost, getBearerToken } from '@/support/helper'
const props = defineProps({
  action: {
    type: String,
    default: '/upload/image'
  },
  name: {
    type: String,
    default: 'image'
  },
  auto: {
    type: Boolean,
    default: true
  },
  fileExtensions: {
    type: Array<String>,
    default: []
  },
  imageClass: {
    type: String,
    default: ''
  },
  // 配合后端的 filesystem 配置
  disk: {
    type: String,
    default: 'uploads'
  },
  path: {
    type: String,
    default: 'attachments'
  }
})

// 定义文件 v-model
const fileModel = defineModel({
  type: String,
  default: '',
  required: true
})
const { upload, actionApi, beforeUpload, handleExceed, handleSuccess, file, RequestFrom, fileExtensions, loading } = uploadImage(props.action, props.fileExtensions)
// 更新 model 的 value
watch(
  () => file.value,
  (newValue, oldValue) => {
    loading.value = false
    fileModel.value = newValue
  }
)
</script>

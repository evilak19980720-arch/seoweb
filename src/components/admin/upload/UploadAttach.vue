<template>
  <el-upload
    :action="actionApi"
    :show-file-list="false"
    name="file"
    :auto-upload="true"
    :headers="{ authorization: getBearerToken(), 'Request-from': RequestFrom }"
    :before-upload="beforeUpload"
    :on-success="handleSuccess"
    ref="upload"
    :data="{ category_id: categoryId, disk: disk, path: path }"
    v-loading="loading"
  >
    <template #trigger>
      <el-button type="primary">上传</el-button>
    </template>
  </el-upload>
</template>
<script setup lang="ts">
import { uploadFile } from '@/composables/useUpload'
import { Code } from '@/enum/app'
import Message from '@/support/message'
import { getBearerToken } from '@/support/helper'

defineProps({
  categoryId: {
    type: Number,
    default: 0
  },
  disk: {
    type: String,
    default: 'uploads'
  },
  path: {
    type: String,
    default: 'attachments'
  }
})

const emits = defineEmits(['refresh'])
const { upload, actionApi, beforeUpload, RequestFrom, loading } = uploadFile('upload/file', false)
const handleSuccess = (response: any, uploadFile: any) => {
  loading.value = false
  if (response.code === Code.SUCCESS) {
    emits('refresh')
  } else {
    Message.error(response.message)
  }
}
</script>

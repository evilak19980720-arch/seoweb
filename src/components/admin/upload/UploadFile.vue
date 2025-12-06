<template>
  <el-upload
    ref="upload"
    :action="actionApi"
    :show-file-list="false"
    name="file"
    :on-exceed="handleExceed"
    :auto-upload="auto"
    :headers="{ authorization: getBearerToken(), 'Request-from': RequestFrom }"
    v-bind="$attrs"
    :before-upload="beforeUpload"
    :on-success="handleSuccess"
    :limit="1"
    :data="{ disk: props.disk, path: props.path }"
    v-loading="loading"
    :accept="fileExtensions.join(',')"
  >
    <template v-for="(index, name) in $slots" v-slot:[name]>
      <slot :name="name"></slot>
    </template>
    <div v-if="fileModel">
      {{ getFilename(fileModel) }}
    </div>
    <div v-else>
      <div class="flex items-center justify-center w-24 h-12 text-[14px] border border-blue-100 border-dashed rounded">
        <div>点击上传文件</div>
      </div>
      <Prompt :text="'文件类型仅支持 ' + fileExtensions.join(' | ')" />
    </div>
  </el-upload>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { uploadFile } from '@/composables/useUpload'
import { getBearerToken, getFilename } from '@/support/helper'

const props = defineProps({
  action: {
    type: String,
    default: '/upload/file'
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

// 定义文件 v-model
const fileModel = defineModel({
  type: String,
  default: '',
  required: true
})

const { upload, actionApi, beforeUpload, handleExceed, handleSuccess, file, RequestFrom, filename, fileExtensions, loading } = uploadFile(props.action, true, props.fileExtensions)
// 更新 model 的 value
watch(
  () => file.value,
  (newValue, oldValue) => {
    loading.value = false
    fileModel.value = newValue
  }
)
</script>

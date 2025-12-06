<template>
  <el-upload
    ref="upload"
    :action="actionApi"
    multiple
    :show-file-list="false"
    name="file"
    :auto-upload="auto"
    :headers="{ authorization: getBearerToken(), 'Request-from': RequestFrom }"
    v-bind="$attrs"
    :data="{ disk: props.disk, path: props.path }"
    :on-exceed="handleExceed"
    :before-upload="beforeUpload"
    :on-success="handleSuccess"
    :accept="fileExtensions.join(',')"
  >
    <template v-for="(index, name) in $slots" v-slot:[name]>
      <slot :name="name"></slot>
    </template>
    <div class="flex flex-col w-full">
      <div>
        <div class="flex items-center justify-center w-24 h-12 text-[14px] border border-blue-100 border-dashed rounded">
          <div>点击上传文件</div>
        </div>
        <Prompt :text="'文件类型仅支持 ' + fileExtensions.join(' | ')" />
      </div>
      <div class="w-full mt-2">
        <div v-for="(item, key) in filesModel" :key="key" class="flex justify-between px-2">
          <div>{{ getFilename(item) }}</div>
          <div @click.stop="deleteFile(item)" class="ml-4 cursor-pointer">
            <el-icon><Delete /></el-icon>
          </div>
        </div>
      </div>
    </div>
  </el-upload>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { getFilename } from '@/support/helper'
import { uploadFile } from '@/composables/useUpload'
import { getBearerToken } from '@/support/helper'
import { Delete } from '@element-plus/icons-vue'
const props = defineProps({
  action: {
    type: String,
    default: '/upload/file'
  },
  auto: {
    type: Boolean,
    default: true
  },
  imageClass: {
    type: String,
    default: ''
  },
  fileExtensions: {
    type: Array<String>,
    default: []
  },
  // 配合后端的 filesysytem 配置
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
const filesModel = defineModel({
  type: Array<string>,
  default: [],
  required: true
})

const deleteFile = (file: string) => {
  filesModel.value = filesModel.value.filter(item => {
    return item !== file
  })
}
const { upload, actionApi, beforeUpload, handleExceed, handleSuccess, file, RequestFrom, fileExtensions } = uploadFile(props.action, true, props.fileExtensions)
// 更新 model 的 value
watch(
  () => file.value,
  (newValue, oldValue) => {
    filesModel.value.push(newValue)
  }
)
</script>

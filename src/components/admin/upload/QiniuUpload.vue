<template>
  <div>
    <div class="multiple" v-if="!multiple">
      <el-upload ref="upload" :http-request="uploadFiles" :name="name" :auto-upload="auto" v-bind="$attrs" :before-upload="beforeUpload" :on-exceed="exceed">
        <img :src="model" v-if="model" :class="imageClass" />
        <div v-else class="flex justify-center w-24 h-24 pt-8 border border-blue-100 border-dashed rounded">
          <Icon name="plus" />
        </div>
      </el-upload>
    </div>
    <el-upload
      v-if="multiple"
      ref="upload"
      :limit="limit"
      :show-file-list="true"
      :multiple="multiple"
      :name="name"
      :auto-upload="auto"
      v-bind="$attrs"
      :before-upload="beforeUpload"
      :on-exceed="exceed"
      :http-request="uploadFiles"
      list-type="picture-card"
      v-model:file-list="filesList"
    >
      <template #file="{ file }">
        <div class="w-full" v-if="file.src">
          <img class="w-full h-full" :src="file.src" />
          <span class="el-upload-list__item-actions">
            <span class="el-upload-list__item-preview" @click="handlePictureCardPreview(file)">
              <el-icon><zoom-in /></el-icon>
            </span>
            <span class="el-upload-list__item-delete" @click="handleRemove(file)">
              <el-icon><Delete /></el-icon>
            </span>
          </span>
        </div>
        <div v-else class="w-full">
          <el-progress style="z-index: 100; top: 10%; width: 95%; margin: auto" :percentage="file.percent" :stroke-width="15" striped :striped-flow="true" :text-inside="true" />
          <el-image class="w-full h-full bg-slate-100">
            <template #error>
              <div class="flex justify-center items-center w-full h-full text-[30px]">
                <el-icon class="text-[30px]"><icon-picture /></el-icon>
              </div>
            </template>
          </el-image>
        </div>
      </template>
      <div v-if="!filesList.length || multiple" class="flex justify-center w-24 h-24 pt-8 border border-blue-100 border-dashed rounded">
        <Icon name="plus" />
      </div>
    </el-upload>

    <el-dialog v-model="dialogVisible">
      <img class="w-full" :src="dialogImageUrl" alt="Preview Image" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Message from '@/support/message'
import { UploadFile, UploadRawFile, UploadRequestOptions, UploadUserFile } from 'element-plus'
import http from '@/support/http'
import { generateFilename } from '@/support/helper'
import { Delete, ZoomIn, Picture as IconPicture } from '@element-plus/icons-vue'
import * as qiniu from 'qiniu-js'
const props = defineProps({
  auto: {
    type: Boolean,
    default: true
  },
  limit: {
    type: Number,
    default: 1
  },
  multiple: {
    type: Boolean,
    default: false
  },
  imageClass: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    default: 'image'
  }
})

const model = defineModel({
  type: String,
  default: '',
  required: true
})
interface file {
  name: string
  src: string
  percent: number
  status: string
}

const filesList = ref<Array<file>>([])

// 上传前
const beforeUpload = (file: UploadRawFile) => {
  const filename = generateFilename(file.name)
  http.get('upload/token', { driver: 'qiniu', filename }).then(r => {
    const fileURL: string = r.data.data.url
    const fileRef = addFile(r.data.data.filename)
    const observable = qiniu.upload(file, filename, r.data.data.token)
    observable.subscribe({
      next(res: any) {
        // ...
        fileRef.value.percent = parseInt(res.total.percent)
      },
      error(err: any) {
        console.log(err)
      },
      complete(res: any) {
        fileRef.value.percent = 100
        fileRef.value.src = fileURL
        model.value = files()
      }
    }) // 上传开始
  })
}

// 新增 file
const addFile = (filename: string) => {
  filesList.value = filesList.value.filter(file => {
    return file.status === 'success'
  })
  const fileRef = ref<file>({
    name: filename,
    src: '',
    percent: 0,
    status: ''
  })
  // 多文件
  if (props.multiple) {
    filesList.value.push(fileRef.value)
  } else {
    // 单文件
    filesList.value.pop()
    filesList.value.push(fileRef.value)
  }
  return fileRef
}
// 校验
const exceed = (files: File[], uploadFiles: UploadUserFile[]) => {
  if (files.length > props.limit) {
    Message.error('最多上传' + props.limit + '个文件')
  }
}
// 抹除
const handleRemove = (file: UploadFile) => {
  filesList.value = filesList.value.filter(item => {
    return item.name !== file.name
  })

  model.value = files()
}

// 预览
const dialogImageUrl = ref('')
const dialogVisible = ref(false)
const handlePictureCardPreview = (file: file) => {
  dialogImageUrl.value = file.src
  dialogVisible.value = true
}

const files = () => {
  const files: Array<string> = []
  filesList.value.forEach(file => {
    files.push(file.src)
  })
  return files.join(',')
}

const uploadFiles = (options: UploadRequestOptions) => {
  return false
}
</script>
<style scoped>
:deep(.el-upload-list__item) {
  @apply w-24 h-24;
}
:deep(.el-upload-list .el-upload--picture-card) {
  @apply border-none;
}
:deep(.el-upload-list .el-upload) {
  @apply h-24 w-24;
}
:deep(.multiple .el-upload-list) {
  display: none !important;
}
</style>

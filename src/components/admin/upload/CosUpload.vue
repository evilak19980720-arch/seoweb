<template>
  <div>
    <div class="multiple" v-if="!multiple">
      <el-upload ref="upload" :http-request="uploadFiles" :name="name" :auto-upload="auto" v-bind="$attrs" :before-upload="beforeUpload" :on-exceed="exceed">
        <img :src="modelValue" v-if="modelValue" :class="imageClass" />
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
// @ts-nocheck
import { onMounted, ref } from 'vue'
import Message from '@/support/message'
import { UploadFile, UploadRawFile, UploadUserFile } from 'element-plus'
import http from '@/support/http'
import { generateFilename } from '@/support/helper'
import { Delete, ZoomIn, Picture as IconPicture } from '@element-plus/icons-vue'
import COS from 'cos-js-sdk-v5'
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
  modelValue: {
    type: String,
    default: '',
    require: true
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

const emits = defineEmits(['update:modelValue'])

interface file {
  name: string
  src: string
  percent: number
}

const filesList = ref<Array<file>>([])

const bucket = ref<string>('')
const region = ref<string>('')
onMounted(async () => {
  await http.get('upload/token', { driver: 'cos' }).then(r => {
    bucket.value = r.data.data.bucket
    region.value = r.data.data.region
  })
})
const cos = new COS({
  getAuthorization: async (options, callback) => {
    await http.get('upload/token', { driver: 'cos' }).then(r => {
      const data = r.data.data
      callback({
        TmpSecretId: data.credentials.TmpSecretId,
        TmpSecretKey: data.credentials.TmpSecretKey,
        SecurityToken: data.credentials.Token,
        StartTime: data.start_time,
        ExpiredTime: data.expiredtime
      })
    })
  }
})
// 上传前
const beforeUpload = (file: UploadRawFile) => {
  const filename: string = generateFilename(file.name)
  const fileRef = addFile(filename)
  cos.uploadFile({
    Bucket: bucket.value /* 填入您自己的存储桶，必须字段 */,
    Region: region.value /* 存储桶所在地域，例如ap-beijing，必须字段 */,
    Key: filename /* 存储在桶里的对象键（例如1.jpg，a/b/test.txt），必须字段 */,
    Body: file /* 必须，上传文件对象，可以是input[type="file"]标签选择本地文件后得到的file对象 */,
    onTaskReady: function (taskId) {},
    onProgress: function (progressData) {
      /* 非必须 */
      fileRef.value.percent = parseInt(progressData.percent * 100)
    },
    // @ts-ignore
    onFileFinish: (_err: any, data: any, options: any) => {
      fileRef.value.percent = 100
      fileRef.value.src = 'https://' + data.Location
      emits('update:modelValue', files())
    }
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
    percent: 0
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

  emits('update:modelValue', files())
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

const uploadFiles = () => {}
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

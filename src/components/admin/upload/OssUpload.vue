<template>
  <div>
    <el-upload v-if="!multiple" :show-file-list="false" ref="upload" :name="name" :auto-upload="auto" v-bind="$attrs" :before-upload="beforeUpload" :on-exceed="exceed" :http-request="uploadFiles">
      <template v-for="(index, name) in $slots" v-slot:[name]>
        <slot :name="name"></slot>
      </template>
      <img :src="model" v-if="model" :class="imageClass" />
      <div v-else class="flex justify-center w-24 h-24 pt-8 border border-blue-100 border-dashed rounded">
        <Icon name="plus" />
      </div>
    </el-upload>
    <el-upload
      :key="forceUpdate"
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
      list-type="picture-card"
      :http-request="uploadFiles"
      :file-list="filesList"
    >
      <template v-for="(index, name) in $slots" v-slot:[name]>
        <slot :name="name"></slot>
      </template>

      <div v-if="!filesList.length || multiple" class="flex justify-center w-24 h-24 pt-8 border border-blue-100 border-dashed rounded">
        <Icon name="plus" />
      </div>
      <template #file="{ file }">
        <div class="w-full">
          <!--<el-progress style="z-index: 100; width: 90%; top: 8%" :percentage="file.percent" :stroke-width="15" striped v-if="!file.src" :striped-flow="file.percent !== 100" :text-inside="true" />-->
          <img class="w-full h-full" :src="file.src" v-if="file.src" />
          <el-image v-if="!file.src" class="w-full h-full bg-slate-100">
            <template #error>
              <div class="flex justify-center items-center w-full h-full text-[30px]">
                <el-icon class="text-[30px]"><icon-picture /></el-icon>
              </div>
            </template>
          </el-image>
          <span class="el-upload-list__item-actions" v-if="file.src">
            <span class="el-upload-list__item-preview" @click="handlePictureCardPreview(file)">
              <el-icon><zoom-in /></el-icon>
            </span>
            <span class="el-upload-list__item-delete" @click="handleRemove(file)">
              <el-icon><Delete /></el-icon>
            </span>
          </span>
        </div>
      </template>
    </el-upload>

    <el-dialog v-model="dialogVisible">
      <img class="w-full" :src="dialogImageUrl" alt="Preview Image" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Message from '@/support/message'
import { UploadFile, UploadRawFile, UploadUserFile } from 'element-plus'
import http from '@/support/http'
import { generateFilename } from '@/support/helper'
import { Delete, ZoomIn, Picture as IconPicture } from '@element-plus/icons-vue'
// @ts-ignore
import Oss from 'ali-oss'

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
}

const filesList = ref<Array<file>>([])

// 上传前
const beforeUpload = (file: UploadRawFile) => {
  const filename: string = generateFilename(file.name)
  const fileRef = addFile(filename)
  http.get('upload/token', { driver: 'oss', filename: file.name }).then(async r => {
    const client = new Oss({
      security: true,
      accessKeyId: r.data.data.AccessKeyId,
      accessKeySecret: r.data.data.AccessKeySecret,
      bucket: r.data.data.bucket,
      region: r.data.data.region,
      stsToken: r.data.data.SecurityToken,
      endpoint: r.data.data.endpoint,
      cname: r.data.data.cname
    })

    const response = await client.put(filename, file, {
      meta: { temp: filename },
      mime: 'json',
      headers: { 'Content-Type': 'text/plain' }
    })
    if (response.res.statusCode === 200) {
      fileRef.value.src = response.url
      model.value = files()
    }
  })
}

// 新增 file
const addFile = (filename: string) => {
  const fileRef = ref<file>({
    name: filename,
    src: ''
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
const uploadFiles = () => {}

const forceUpdate = ref(0)
watch(
  () => filesList,
  (newValue, oldValue) => {
    forceUpdate.value++
  },
  { deep: true, immediate: true }
)
</script>
<style scoped>
@reference "tailwindcss";
:deep(.el-upload-list__item) {
  @apply w-24 h-24;
}
:deep(.el-upload-list .el-upload--picture-card) {
  @apply border-none;
}
:deep(.el-upload-list .el-upload) {
  @apply h-24 w-24;
}
</style>

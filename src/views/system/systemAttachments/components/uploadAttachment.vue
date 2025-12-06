<template>
  <div>
    <!-- 腾讯 cos 上传附件 -->
    <el-upload v-if="driver === 'cos'" ref="upload" :show-file-list="false" :before-upload="cosUpload" :limit="1" :auto-upload="true">
      <template #trigger>
        <el-button type="primary">上传</el-button>
      </template>
    </el-upload>
    <!-- 本地上传附件 -->
    <UploadAttach v-if="driver === 'local'" :categoryId="categoryId" @refresh="refresh" />
    <!-- 七牛上传附件 -->
    <el-upload v-if="driver === 'qiniu'" ref="upload" :show-file-list="false" :before-upload="qiniuUpload" :limit="1" :auto-upload="true">
      <template #trigger>
        <el-button type="primary">上传</el-button>
      </template>
    </el-upload>
    <!-- OSS上传附件 -->
    <el-upload v-if="driver === 'oss'" ref="upload" :show-file-list="false" :before-upload="ossUpload" :limit="1">
      <template #trigger>
        <el-button type="primary">上传</el-button>
      </template>
    </el-upload>
  </div>
</template>
<script lang="ts" setup>
import * as qiniu from 'qiniu-js'
import COS from 'cos-js-sdk-v5'
import http from '@/support/http'
import { UploadRawFile } from 'element-plus'
import { ref } from 'vue'
import { generateFilename, getFileExt } from '@/support/helper'
// @ts-ignore
import Oss from 'ali-oss'

const props = defineProps({
  driver: {
    type: String,
    default: 'local'
  },
  api: {
    type: String,
    default: ''
  },
  categoryId: {
    type: [Number, String],
    default: 0
  }
})

const emits = defineEmits(['refresh'])
const upload = ref()
const loading = ref(false)
/**
const { upload, actionApi, beforeUpload, token, RequestFrom } = uploadImage('upload/file')

const localUpload = (response: any, _uploadFile: UploadFile) => {
  if (response.code === Code.SUCCESS) {
    // emits('update:modelValue', response.data.path)
    addAttachment({
      filename: response.data.originalName,
      path: response.data.path,
      filesize: response.data.size,
      mimetype: response.data.type,
      extension: response.data.ext,
      driver: 'local',
      category_id: props.categoryId === '' ? 0 : props.categoryId
    })
  } else {
    Message.error(response.message)
  }
  upload.value?.clearFiles()
} */
// 七牛上传
const qiniuUpload = async (file: UploadRawFile) => {
  const filename = generateFilename(file.name)
  http.get('upload/token', { driver: 'qiniu', filename }).then(r => {
    const fileURL: string = r.data.data.url
    const observable = qiniu.upload(file, filename, r.data.data.token)
    observable.subscribe({
      next() {
        // ...
        loading.value = true
      },
      error(err: any) {
        console.log(err)
      },
      complete() {
        loading.value = false
        upload.value?.clearFiles()
        addAttachment({
          filename: filename,
          path: fileURL,
          filesize: file.size,
          mimetype: file.type,
          extension: getFileExt(file.name).slice(1),
          driver: 'oss',
          category_id: props.categoryId === '' ? 0 : props.categoryId
        })
      }
    }) // 上传开始
  })
}

// cos 上传
const cosUpload = async (file: UploadRawFile) => {
  const filename: string = generateFilename(file.name)
  const bucket = ref<string>('')
  const region = ref<string>('')
  await http.get('upload/token', { driver: 'cos' }).then(r => {
    bucket.value = r.data.data.bucket
    region.value = r.data.data.region
  })

  const cos = new COS({
    getAuthorization: async (_options, callback) => {
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
  cos.uploadFile({
    Bucket: bucket.value /* 填入您自己的存储桶，必须字段 */,
    Region: region.value /* 存储桶所在地域，例如ap-beijing，必须字段 */,
    Key: filename /* 存储在桶里的对象键 例如1.jpg，a/b/test.txt，必须字段 */,
    Body: file /* 必须，上传文件对象，可以是input[type="file"]标签选择本地文件后得到的file对象 */,
    onTaskReady: function (_taskId) {},
    onProgress: function (_progressData) {
      /* 非必须 */
      loading.value = true
    },
    onFileFinish: (_err: any, data: any, options: any) => {
      loading.value = false
      upload.value?.clearFiles()
      addAttachment({
        filename: filename,
        path: 'https://' + data.Location,
        filesize: file.size,
        mimetype: file.type,
        extension: getFileExt(file.name).slice(1),
        driver: 'oss',
        category_id: props.categoryId === '' ? 0 : props.categoryId
      })
    }
  })
}

const ossUpload = async (file: UploadRawFile) => {
  const filename: string = generateFilename(file.name)
  http.get('upload/token', { driver: 'oss', filename: file.name }).then(async r => {
    loading.value = true
    const client = new Oss({
      security: true,
      accessKeyId: r.data.data.AccessKeyId,
      accessKeySecret: r.data.data.AccessKeySecret,
      bucket: r.data.data.bucket,
      region: r.data.data.region,
      stsToken: r.data.data.SecurityToken
    })

    const response = await client.put(filename, file, {
      meta: { temp: filename },
      mime: 'json',
      headers: { 'Content-Type': 'text/plain' }
    })

    if (response.res.statusCode === 200) {
      addAttachment({
        filename: filename,
        path: response.url,
        filesize: file.size,
        mimetype: file.type,
        extension: getFileExt(file.name).slice(1),
        driver: 'oss',
        category_id: props.categoryId === '' ? 0 : props.categoryId
      })
    }
  })
}

interface attachment {
  filename: string
  path: string
  extension: string
  filesize: number
  mimetype: string
  driver: string
  category_id: number | string
}

const addAttachment = (a: attachment) => {
  http.post(props.api, a).then(r => {
    emits('refresh')
  })
}

const refresh = () => {
  emits('refresh')
}
</script>

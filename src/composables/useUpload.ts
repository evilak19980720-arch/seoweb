import { ref } from 'vue'
import { getBaseUrl, getFileExt, getFilename } from '@/support/helper'
import { Code } from '@/enum/app'
import Message from '@/support/message'
import { genFileId } from 'element-plus'
import type { UploadInstance, UploadProps, UploadRawFile } from 'element-plus'
// 常见的文件类型
export const FILE_EXTENSIONS: Array<String> = ['.docx', '.pdf', '.txt', '.html', '.zip', '.tar', '.doc', '.css', '.csv', '.ppt', '.xlsx', '.xls', '.xml']
// 常见的图片后缀
export const IMAGE_EXTENSIONS: Array<String> = ['.jpeg', '.jpg', '.gif', '.png', '.svg', '.ico', '.doc', '.psd', '.bmp', '.tiff', '.webp', '.tif', '.pjpeg']

const baseURL = getBaseUrl()

const RequestFrom: string = 'Dashboard'
// get upload api
const getUploadApi = (baseURL: string, action: string) => {
  if (!baseURL.endsWith('/')) {
    baseURL = baseURL + '/'
  }

  if (action.startsWith('/')) {
    action = action.substring(1)
  }

  return baseURL + action
}
// 上传文件
export function uploadFile(action: string = 'upload/file', isValidate: boolean = true, fileExtensions: Array<String> = FILE_EXTENSIONS) {
  const upload = ref<UploadInstance>()
  const loading = ref(false)
  const file = ref<string>('')
  const filename = ref<string>('')
  const actionApi = getUploadApi(baseURL, action)

  if (fileExtensions.length === 0) {
    fileExtensions = FILE_EXTENSIONS
  }

  // 上传前的钩子 判断文件类型
  const beforeUpload = (file: UploadRawFile) => {
    loading.value = true
    if (isValidate) {
      const isCanUpload = fileExtensions.indexOf(getFileExt(file.name)) > -1
      if (!isCanUpload) {
        loading.value = false
        Message.error('不符合上传文件类型，仅支持' + fileExtensions.join(' | '))
      }
      return isCanUpload
    } else {
      return true
    }
  }

  const handleExceed: UploadProps['onExceed'] = files => {
    upload.value!.clearFiles()
    const file = files[0] as UploadRawFile
    file.uid = genFileId()
    upload.value!.handleStart(file)
    upload.value!.submit()
  }

  const handleSuccess = (response: any, uploadFile: any) => {
    if (response.code === Code.SUCCESS) {
      file.value = response.data.path
      filename.value = getFilename(file.value)
    } else {
      loading.value = false
      Message.error(response.message)
    }
  }

  return { upload, actionApi, beforeUpload, handleExceed, handleSuccess, file, RequestFrom, filename, fileExtensions, loading }
}

// 上传图片
// 上传文件
export function uploadImage(action: string, fileExtensions: Array<String> = IMAGE_EXTENSIONS) {
  const upload = ref<UploadInstance>()
  const loading = ref(false)
  const file = ref<string>('')
  const filename = ref<string>('')
  const actionApi = getUploadApi(baseURL, action)

  if (fileExtensions.length === 0) {
    fileExtensions = IMAGE_EXTENSIONS
  }

  // 上传前的钩子 判断文件类型
  const beforeUpload = (file: UploadRawFile) => {
    loading.value = true

    const isCanUpload = fileExtensions.indexOf(getFileExt(file.name)) > -1
    if (!isCanUpload) {
      loading.value = false
      Message.error('不符合上传文件类型，仅支持' + fileExtensions.join(' | '))
    }
    return isCanUpload
  }

  const handleExceed: UploadProps['onExceed'] = files => {
    upload.value!.clearFiles()
    const file = files[0] as UploadRawFile
    file.uid = genFileId()
    upload.value!.handleStart(file)
    upload.value!.submit()
  }

  const handleSuccess = (response: any, uploadFile: any) => {
    if (response.code === Code.SUCCESS) {
      file.value = response.data.path
      filename.value = getFilename(file.value)
    } else {
      loading.value = false
      Message.error(response.message)
    }
  }

  return { upload, actionApi, beforeUpload, handleExceed, handleSuccess, file, RequestFrom, filename, fileExtensions, loading }
}

export function importExcel(action: string, fileExtensions: Array<String> = FILE_EXTENSIONS) {
  const upload = ref<UploadInstance>()
  const loading = ref(false)
  const file = ref<string>('')
  const filename = ref<string>('')
  const actionApi = getUploadApi(baseURL, action)
  const isSuccess = ref(false)
  if (fileExtensions.length === 0) {
    fileExtensions = FILE_EXTENSIONS
  }
  console.log(action)
  // 上传前的钩子 判断文件类型
  const beforeUpload = (file: UploadRawFile) => {
    loading.value = true
    const isCanUpload = fileExtensions.indexOf(getFileExt(file.name)) > -1
    if (!isCanUpload) {
      loading.value = false
      Message.error('不符合上传文件类型，仅支持' + fileExtensions.join(' | '))
    }
    return isCanUpload
  }

  const handleExceed: UploadProps['onExceed'] = files => {
    upload.value!.clearFiles()
    const file = files[0] as UploadRawFile
    file.uid = genFileId()
    upload.value!.handleStart(file)
    upload.value!.submit()
  }

  const handleSuccess = (response: any, uploadFile: any) => {
    loading.value = false
    if (response.code === Code.SUCCESS) {
      isSuccess.value = true
      Message.success(response.message)
    } else {
      Message.error(response.message)
    }
  }

  return { upload, actionApi, beforeUpload, handleExceed, handleSuccess, file, RequestFrom, filename, fileExtensions, loading, isSuccess }
}

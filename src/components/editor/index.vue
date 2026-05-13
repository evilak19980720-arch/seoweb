<template>
  <div class="relative">
    <Editor :api-key="aipKey" :tinymce-script-src="tingmceSrc" :init="config" v-model="content" v-bind="$attrs" />
    <el-button :class="uploadButtonClass" @click="openDialog()"><Icon name="cloud-arrow-up" class="mr-1" />选择附件</el-button>
    <!-- Dialog -->
    <Dialog v-model="attachVisible" width="1200px" title="选择附件" append-to-body :z-index="999999">
      <Attachment :multi="multiAttach" @close-dialog="closeDialog" v-model="attachments" />
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import Attachment from '@/views/system/systemAttachments/index.vue'

import Editor from '@tinymce/tinymce-vue'
import { getBaseUrl, getFileExt, getFilename, warpHost } from '@/support/helper'
import Http from '@/support/http'
import Message from '@/support/message'
import { ref, watch } from 'vue'
import { IMAGE_EXTENSIONS } from '@/composables/useUpload'

const attachVisible = ref<boolean>(false)
const tinymceBaseUrl = new URL('tinymce', document.baseURI).pathname
const tingmceSrc = `${tinymceBaseUrl}/tinymce.min.js`
const props = defineProps({
  width: {
    type: [Number, String],
    required: false,
    default: 'auto'
  },
  height: {
    type: [Number, String],
    required: false,
    default: 'auto'
  },
  language: {
    type: String,
    default: 'zh-Hans'
  },

  placeholder: {
    type: String,
    default: '在这里输入内容'
  },

  plugins: {
    type: String,
    default: 'preview searchreplace autolink directionality visualblocks visualchars fullscreen image link media template code ' + 'codesample table charmap'
  },
  toolbar: {
    type: Array<string>,
    default: [
      'undo redo restoredraft cut copy paste pastetext forecolor backcolor bold italic underline strikethrough link anchor alignleft aligncenter alignright alignjustify outdent indent bullist numlist blockquote subscript superscript removeformat styleselect formatselect fontselect fontsizeselect ' +
        'table upload image axupimgs media emoticons charmap hr pagebreak insertdatetime ' +
        'codesample selectall visualblocks searchreplace code print preview indent2em fullscreen'
    ]
  }
})

const aipKey: string = 's1ntkmnev0ggx0hhaqnubrdxhv0ly99uyrdbckeaycx7iz6v'
const uploaded = (blobInfo: any, progress: any) =>
  new Promise((resolve, reject) => {
    if (blobInfo.blob().size / 1024 / 1024 > 10) {
      Message.error('上传失败，图片大小请控制在 10M 以内')
    } else {
      const params = new FormData()
      params.append('image', blobInfo.blob())
      const baseUrl = getBaseUrl()
      // 如果有是以 / 结尾，则直接拼接 'upload/image'
      // 如果没有以 / 结尾，则拼接 /upload/image
      const url = baseUrl.endsWith('/') ? baseUrl + 'upload/image' : baseUrl + '/upload/image'
      Http.post(url, params)
        .then(res => {
          if (res.data.code === 10000) {
            resolve(warpHost(res.data.data.path))
          } else {
            Message.error(res.data.message)
          }
        })
        .catch(() => {
          Message.error('Server Error!')
        })
    }
  })

const multiAttach = ref(true)
const uploadButtonClassWhenFullscreen: string = 'fixed right-2 top-2 z-[999999]'
const uploadButtonClassWhenNotFullscreen: string = 'absolute right-2 top-2 z-[999999]'
const uploadButtonClass = ref<string>(uploadButtonClassWhenNotFullscreen)
const editorRef = ref()
const attachments = ref<Array<string>>([])
const config = {
  base_url: tinymceBaseUrl,
  language: props.language,
  placeholder: props.placeholder,
  width: props.width,
  height: props.height,
  plugins: props.plugins,
  toolbar: props.toolbar,
  branding: false,
  // menubar: false,
  images_upload_handler: uploaded,
  setup(editor: any) {
    editorRef.value = editor
    editor.on('FullscreenStateChanged', (e: any) => {
      // _this.fullscreen = e.state
      uploadButtonClass.value = e.state ? uploadButtonClassWhenFullscreen : uploadButtonClassWhenNotFullscreen
    })
  },
  // pick file callback 选择文件
  file_picker_callback: function (callback: any, value: any, meta: any) {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', meta.filetype === 'media' ? 'video/*' : 'image/*')
    input.addEventListener('change', event => {
      const reader = new FileReader()
      const fileInput = event.target as HTMLInputElement
      if (fileInput.files && fileInput.files.length > 0) {
        const file = fileInput.files[0]
        reader.onload = function () {
          // 构造表单数据
          const formData = new FormData()
          formData.append('image', file)

          Http.post('/upload/image', formData)
            .then(r => {
              callback(warpHost(r.data.data.path))
            })
            .catch(e => {
              console.error('上传视频报错', e)
            })
        }
        reader.readAsDataURL(file)
      }
    })
    input.click()
  }
}
const content = defineModel()
// 创建的时候
watch(
  () => content.value,
  value => {
    content.value = value
  }
)

// 关闭
const closeDialog = () => {
  let html = ''
  attachments.value.forEach(attachment => {
    if (IMAGE_EXTENSIONS.indexOf(getFileExt(attachment)) > -1) {
      html += `<img src="${attachment}"/>`
    } else {
      const filename = getFilename(attachment)
      html += `<p><a href="${attachment}">${filename}</a></p> `
    }
  })
  editorRef.value.insertContent(html)
  attachments.value = []
  attachVisible.value = false
}

// 开启
const openDialog = () => {
  attachVisible.value = true
}
</script>

<style scoped>
.tinymce-boxz > textarea {
  display: none;
}
</style>
<style>
/* 隐藏apikey没有绑定这个域名的提示 */
.tox-notifications-container .tox-notification--warning {
  display: none !important;
}

.tox {
  z-index: 999999999999 !important;
}

.tox-promotion {
  display: none !important;
}
</style>

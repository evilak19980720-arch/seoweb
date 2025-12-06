<template>
  <div class="flex flex-col justify-center py-10 pl-5 pr-5 bg-white rounded gap-y-10 dark:bg-regal-dark">
    <div>
      <div>单文件上传</div>
      <UploadFile v-model="file" />
    </div>
    <div>
      <div>多文件上传</div>
      <UploadFiles v-model="fiels" />
    </div>
    <div>
      <div>单图上传</div>
      <UploadImage v-model="image" />
    </div>
    <div>
      <div>选择单附件上传</div>
      <AttachUpload v-model="attachment" />
    </div>
    <div>
      <div>选择多附件上传</div>
      <AttachUpload v-model="attachments" :multi="true" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'

const file = ref()
const fiels = ref([])
const image = ref()
const attachment = ref()
const attachments = ref([])
</script>

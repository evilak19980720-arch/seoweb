<template>
  <el-button v-if="loading">
    <svg class="w-5 h-5 mr-3 -ml-1 text-indigo-600 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    导入...
  </el-button>

  <el-upload
    ref="upload"
    :action="actionApi"
    :auto-upload="true"
    :limit="1"
    :show-file-list="false"
    name="file"
    :on-exceed="handleExceed"
    :headers="{ authorization: getBearerToken(), 'Request-from': RequestFrom }"
    v-bind="$attrs"
    :before-upload="beforeUpload"
    :on-success="handleSuccess"
    v-else
  >
    <el-button>导入</el-button>
  </el-upload>
</template>
<script lang="ts" setup>
import { importExcel } from '@/composables/useUpload'
import { watch } from 'vue'
import { getBearerToken } from '@/support/helper'

const props = defineProps({
  action: {
    type: String,
    require: true
  }
})
const { upload, actionApi, beforeUpload, handleExceed, handleSuccess, RequestFrom, loading, isSuccess } = importExcel(props.action as string)

const emit = defineEmits(['afterImport'])

watch(
  () => isSuccess,
  () => {
    emit('afterImport')
  },
  { deep: true }
)
</script>

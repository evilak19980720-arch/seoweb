<template>
  <div>
    <div v-if="multi">
      <VueDraggable v-model="attachmentsData" class="grid grid-cols-4 gap-2">
        <transition-group>
          <div :class="'w-' + imageWidth + ' h-' + imageWidth + ' relative group cursor-pointer '" v-for="(src, k) in attachmentsData" :key="k">
            <el-image
              v-if="!isFile(src)"
              :src="src"
              :class="'w-' + imageWidth + ' h-' + imageWidth + ' border border-gray-100 rounded-md p-0.5'"
              :zoom-rate="1.2"
              :max-scale="7"
              :min-scale="0.2"
              :preview-src-list="attachmentsData"
              :initial-index="k"
              fit="cover"
              preview-teleported
            />
            <div v-else class="flex justify-center pt-6">
              <el-tooltip class="box-item" effect="dark" :content="getFilename(src)" placement="top">
                <Icon name="clipboard-document" className="w-10 h-10" />
              </el-tooltip>
            </div>
            <!-- 删除 -->
            <div
              @click="delAttachment(src)"
              class="w-5 h-5 z-50 bg-[#f5f7fa] rounded-full border border-solid border-gray-300 justify-center -top-2 -right-2 absolute leading-4 cursor-pointer hidden group-hover:flex"
            >
              x
            </div>
          </div>
          <div
            @click="attachVisible = true"
            :class="'w-' + imageWidth + ' h-' + imageWidth + ' cursor-pointer border-blue-100 border-dashed border rounded flex justify-center items-center' + (center ? ' mx-auto' : '')"
            key="9999999"
          >
            <Icon name="plus" />
          </div>
        </transition-group>
      </VueDraggable>
    </div>
    <div v-else class="cursor-pointer">
      <div v-if="attachmentsData[0].length > 0" @click="attachVisible = true">
        <img v-if="!isFile(attachmentsData[0])" :src="attachmentsData[0]" :class="'w-' + imageWidth + ' h-' + imageWidth + imageClass" preview-teleported />
        <div v-else class="flex justify-center pt-6">
          <el-tooltip class="box-item" effect="dark" :content="getFilename(attachmentsData[0])" placement="top">
            <Icon name="clipboard-document" className="w-10 h-10" />
          </el-tooltip>
        </div>
      </div>
      <div
        v-else
        @click="attachVisible = true"
        :class="'w-' + imageWidth + ' h-' + imageWidth + ' cursor-pointer border-blue-100 border-dashed items-center border rounded flex justify-center' + (center ? ' mx-auto' : '')"
      >
        <Icon name="plus" />
      </div>
    </div>
    <!-- Dialog -->
    <Dialog v-model="attachVisible" width="1200px" title="选择附件" append-to-body destroy-on-close>
      <Attachment v-model="attachmentsData" :multi="multi" @close-dialog="closeDialog" />
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Attachment from '@/views/system/systemAttachments/index.vue'
import { unique, getFileExt, getFilename } from '@/support/helper'
import { VueDraggable } from 'vue-draggable-plus'
import { FILE_EXTENSIONS } from '@/composables/useUpload'
const props = defineProps({
  imageClass: {
    type: String,
    default: ''
  },
  multi: {
    type: Boolean,
    default: false
  },
  center: {
    type: Boolean,
    default: false
  },
  imageWidth: {
    type: Number,
    default: 24
  }
})

// 定义 v-model 数据
const attachmentsModel = defineModel()
// 附件组初始化
const initAttachment = () => {
  let attachmentTmp: Array<string> = []

  if (attachmentsModel.value === undefined) {
    // 判断是否多图，多图返回空数组，单图返回一个空字符，为了兼容，使用数组第一个元素是空字符
    return props.multi ? [] : ['']
  }
  if (attachmentsModel.value !== null) {
    if (typeof attachmentsModel.value === 'string') {
      attachmentTmp = [attachmentsModel.value]
    } else {
      attachmentTmp = attachmentsModel.value as Array<string>
    }
  }
  return attachmentTmp
}

// 真实渲染的附件数据
const attachmentsData = ref<Array<string>>(initAttachment())

// 监听附件数组变化，更新 model-value
watch(
  () => attachmentsData.value,
  (newValue, oldValue) => {
    if (props.multi) {
      attachmentsModel.value = unique(newValue) as Array<string>
    } else {
      attachmentsModel.value = newValue[0]
    }
  },
  { deep: true }
)

// 监听 v-model 值，防止异步数据
const stop = watch(
  () => attachmentsModel.value,
  (newValue, oldValue) => {
    // 添加判断，避免不必要的更新
    attachmentsData.value = initAttachment() as Array<string>
    // 这里只需要监听一次即可，停止监听
    stop()
  }
)

const attachVisible = ref<boolean>(false)
const closeDialog = () => {
  attachVisible.value = false
}

const delAttachment = (path: string) => {
  attachmentsData.value = attachmentsData.value.filter(a => {
    return path !== a
  })
}

const isFile = (filename: string) => {
  return FILE_EXTENSIONS.indexOf(getFileExt(filename)) > -1
}
</script>
<style scoped>
:deep(.el-dialog__body) {
  @apply pt-3;
}
</style>

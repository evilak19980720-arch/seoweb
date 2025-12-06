<template>
  <div>
    <el-dialog :model-value="visiable" :class="_class" :show-close="false" :fullscreen="isFullscreen" v-bind="$attrs" :width="_width" :close="close" :before-close="beforeClose" draggable>
      <template #header="{ titleId, titleClass }">
        <div class="flex justify-between w-full">
          <div>
            <h4 :id="titleId" :class="titleClass">{{ title }}</h4>
          </div>
          <div class="flex justify-end w-12">
            <!--<Icon :name="fullscreenIcon" @click="fullscreen" className="hover:cursor-pointer w-4 h-4" />-->
            <Icon name="x-mark" className="hover:cursor-pointer w-5 h-5" @click="close" />
          </div>
        </div>
      </template>
      <div :class="contentTop">
        <slot />
      </div>
      <template #footer v-if="showFooter">
        <span class="dialog-footer">
          <el-button @click="close">{{ $t('system.cancel') }}</el-button>
          <el-button type="primary" @click="close">{{ $t('system.confirm') }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
    require: true
  },
  showFooter: {
    type: Boolean,
    default: false
  },
  contentTop: {
    type: String,
    default: 'pt-4'
  },
  width: {
    type: String,
    required: false,
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  _class: {
    type: String,
    default: ''
  }
})

const visiable = defineModel({
  type: Boolean,
  default: false
})

const isFullscreen = ref(false)

/**
const fullscreenIcon = computed(() => {
  return isFullscreen.value ? 'arrows-pointing-in' : 'arrows-pointing-out'
})

const fullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}
*/

const close = () => {
  visiable.value = false
  // emits('update:modelValue', false)
}

// 遮罩关闭调用
const beforeClose = () => {
  visiable.value = false
  // emits('update:modelValue', false)
}
const _width = ref<string>()
onMounted(() => {
  _width.value = props.width ? props.width : getWidth()
})

// 窗口尺寸
const getWidth = () => {
  const clientWidth = window.document.body.clientWidth

  if (clientWidth <= 726) {
    return '100%'
  }

  if (clientWidth > 726 && clientWidth < 1440) {
    return '60%'
  }

  return '650px'
}
</script>

<style scoped>
:deep(.el-dialog) {
  border-radius: 0.5rem;
  .el-dialog__header {
    margin-right: 0 !important;
    border-bottom: 1px solid #e2e8f0;
  }
}
</style>

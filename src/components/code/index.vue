<template>
  <div class="h-[62rem] overflow-y-scroll">
    <div class="absolute z-[10] right-0 cursor-pointer pt-1 pr-5" v-if="modelValue">
      <div v-if="isSupported" class="flex gap-x-2">
        <el-tag>{{ filepath }}</el-tag>
        <el-tag class="justify-end w-full" :type="copied ? 'warning' : 'info'" @click="copy(source)">
          <div class="flex gap-x-1">
            <Icon name="check" className="w-4" v-if="copied" /> <span class="mt-0.5">{{ copied ? '已复制' : '复制' }}</span>
          </div></el-tag
        >
        <el-tag @click="changeEditor" type="success">{{ isEditor ? '显示' : '编辑' }}</el-tag>
      </div>
      <div v-else>暂不支持复制</div>
    </div>
    <div v-if="modelValue">
      <el-input type="textarea" v-model="modelValue" v-if="isEditor" :autosize="{ minRows: 2 }" />
      <highlightjs :code="modelValue" :lang="lang" ref="editable" class="p-2 bg-[#24273a]" v-else :model-value="modelValue" />
    </div>
    <div v-else>暂无内容</div>
  </div>
</template>
<script lang="ts" setup>
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import php from 'highlight.js/lib/languages/php'
import '@catppuccin/highlightjs/css/catppuccin-macchiato.css'
import { useClipboard } from '@vueuse/core'
import { ref, watch } from 'vue'
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('php', php)
defineProps({
  filepath: {
    type: String,
    default: ''
  },
  lang: {
    type: String,
    default: ''
  }
})

const modelValue = defineModel({
  type: String,
  default: ''
})

const source = ref()

const { copy, copied, isSupported } = useClipboard({ source })

const isEditor = ref(false)
const changeEditor = () => {
  isEditor.value = !isEditor.value
}

watch(
  () => modelValue.value,
  (newValue, oldValue) => {
    source.value = newValue
  }
)
</script>

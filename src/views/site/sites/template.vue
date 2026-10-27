<template>
  <div v-loading="loading">
    <el-alert v-if="tpl.status === 1" type="info" :closable="false" show-icon class="mb-3" title="AI 正在生成模板，完成后会自动刷新预览" />
    <el-alert v-if="tpl.status === 4" type="error" :closable="false" show-icon class="mb-3" :title="'生成失败：' + (tpl.error || '未知错误')" />
    <el-alert
      v-if="tpl.status === 3"
      type="success"
      :closable="false"
      show-icon
      class="mb-3"
      :title="'前台正在使用这个模板' + (tpl.published_at ? '（启用于 ' + tpl.published_at + '）' : '') + '。修改草稿后需要再次启用才会生效'"
    />

    <div class="flex gap-4">
      <div class="w-80 shrink-0">
        <el-form label-position="top">
          <el-form-item label="参考图">
            <UploadImage v-model="tpl.reference_image" />
          </el-form-item>
          <el-form-item label="风格说明">
            <el-input v-model="tpl.style_notes" type="textarea" :rows="3" maxlength="1000" />
          </el-form-item>
          <el-button type="primary" plain :disabled="tpl.status === 1" @click="generate">AI 按参考图生成</el-button>
        </el-form>
        <Prompt text="AI 只生成配色样式、页头和页脚，正文和 SEO 结构由系统输出。需要在「AI 管理」里给“生成站点模板”提示词选一个支持识图的渠道" />
      </div>

      <div class="flex-1 min-w-0">
        <el-tabs v-model="tab">
          <el-tab-pane label="预览（草稿）" name="preview">
            <iframe :srcdoc="previewHtml" class="w-full bg-white rounded border" style="height: 560px" sandbox="allow-same-origin" />
          </el-tab-pane>
          <el-tab-pane label="CSS" name="css">
            <el-input v-model="tpl.css" type="textarea" :rows="24" class="font-mono" />
          </el-tab-pane>
          <el-tab-pane label="页头 HTML" name="header">
            <el-input v-model="tpl.header_html" type="textarea" :rows="24" class="font-mono" />
          </el-tab-pane>
          <el-tab-pane label="页脚 HTML" name="footer">
            <el-input v-model="tpl.footer_html" type="textarea" :rows="24" class="font-mono" />
          </el-tab-pane>
        </el-tabs>
        <div class="text-xs text-gray-400">
          可用占位符：[[logo]] [[site_name]] [[nav]] [[cta]] [[year]] [[footer_text]]。保存时会自动去掉脚本、事件属性和外部链接
        </div>
      </div>
    </div>

    <div class="flex justify-end gap-2 mt-4">
      <el-button @click="save(true)">保存草稿</el-button>
      <el-button v-if="tpl.status === 3" type="warning" plain @click="unpublish">停用，恢复默认模板</el-button>
      <el-button type="primary" :disabled="!hasDraft || tpl.status === 1" @click="publish">保存并启用到前台</el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
// @ts-nocheck
import { computed, onBeforeUnmount, ref } from 'vue'
import http from '@/support/http'
import Message from '@/support/message'

const props = defineProps({ siteId: Number })
const emit = defineEmits(['changed'])

const base = `site/sites/${props.siteId}/template`
const loading = ref(false)
const tab = ref('preview')
const tpl = ref({ status: 0 })
const previewHtml = ref('')
let timer = null

const hasDraft = computed(() => !!(tpl.value.css || tpl.value.header_html || tpl.value.footer_html))

const preview = () =>
  http.get(base + '/preview').then(r => {
    previewHtml.value = r.data.data.html
  })

const load = () => {
  loading.value = true
  return http
    .get(base)
    .then(r => {
      tpl.value = r.data.data
      watchGenerating()
      return preview()
    })
    .finally(() => {
      loading.value = false
    })
}

// 生成中每 5 秒查一次状态
const watchGenerating = () => {
  clearTimeout(timer)
  if (tpl.value.status !== 1) return
  timer = setTimeout(() => {
    http.get(base).then(r => {
      if (r.data.data.status !== 1) {
        tpl.value = r.data.data
        preview()
        emit('changed')
      } else {
        watchGenerating()
      }
    })
  }, 5000)
}

const payload = () => {
  const { reference_image, style_notes, css, header_html, footer_html } = tpl.value
  return { reference_image, style_notes, css, header_html, footer_html }
}

const save = (notify = false) =>
  http.put(base, payload()).then(() => {
    if (notify) {
      Message.success('草稿已保存')
      load()
    }
  })

const generate = () => {
  save().then(() =>
    http.post(base + '/generate').then(() => {
      Message.success('已开始生成')
      emit('changed')
      load()
    })
  )
}

const publish = () => {
  save().then(() =>
    http.post(base + '/publish').then(() => {
      Message.success('已启用到前台')
      emit('changed')
      load()
    })
  )
}

const unpublish = () => {
  http.post(base + '/unpublish').then(() => {
    Message.success('已恢复默认模板')
    emit('changed')
    load()
  })
}

load()
onBeforeUnmount(() => clearTimeout(timer))
</script>

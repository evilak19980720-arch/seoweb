<template>
  <el-form :model="formData" label-width="110px" ref="form" v-loading="loading" class="pr-4">
    <el-alert v-if="formData.review_detail" :type="formData.status === 2 ? 'warning' : 'success'" :closable="false" class="mb-4">
      <template #title>
        AI 审核：
        <span v-for="(score, key) in formData.review_detail.scores" :key="key" class="mr-3">{{ checkText[key] ?? key }} {{ score }}</span>
      </template>
      <ul v-if="formData.review_detail.issues?.length" class="pl-4 list-disc">
        <li v-for="(issue, index) in formData.review_detail.issues" :key="index">{{ issue }}</li>
      </ul>
    </el-alert>
    <el-form-item label="站点" prop="site_id" :rules="[{ required: true, message: '请选择站点' }]">
      <RemoteApiSelect v-model="formData.site_id" api="site/sites" search-field="keywords" label="name" value="id" class="w-full" :disabled="!!primary" />
    </el-form-item>
    <el-form-item label="标题" prop="title" :rules="[{ required: true, message: '标题必须填写' }]">
      <el-input v-model="formData.title" maxlength="255" />
    </el-form-item>
    <div class="grid grid-cols-2 gap-x-4">
      <el-form-item label="URL 路径" prop="slug">
        <el-input v-model="formData.slug" maxlength="191" placeholder="留空按标题自动生成" />
      </el-form-item>
      <el-form-item label="目标关键词" prop="keyword">
        <el-input v-model="formData.keyword" maxlength="191" />
      </el-form-item>
    </div>
    <el-form-item label="SEO 标题" prop="meta_title">
      <el-input v-model="formData.meta_title" maxlength="255" show-word-limit />
      <Prompt text="建议 60 个字符以内" />
    </el-form-item>
    <el-form-item label="SEO 描述" prop="meta_description">
      <el-input v-model="formData.meta_description" type="textarea" :rows="2" maxlength="500" show-word-limit />
      <Prompt text="建议 155 个字符以内" />
    </el-form-item>
    <el-form-item label="封面" prop="cover">
      <UploadImage v-model="formData.cover" />
    </el-form-item>
    <el-form-item label="正文" prop="content" :rules="[{ required: true, message: '正文必须填写' }]">
      <el-tabs v-model="tab" class="w-full">
        <el-tab-pane label="编辑（Markdown）" name="edit">
          <el-input v-model="formData.content" type="textarea" :rows="22" />
        </el-tab-pane>
        <el-tab-pane label="预览" name="preview">
          <div class="article-preview" v-html="preview" />
        </el-tab-pane>
      </el-tabs>
    </el-form-item>
    <div class="flex justify-between items-center">
      <el-text type="info">约 {{ words }} 词</el-text>
      <el-button type="primary" @click="submitForm(form)">{{ $t('system.confirm') }}</el-button>
    </div>
  </el-form>
</template>

<script lang="ts" setup>
// @ts-nocheck
import { useCreate } from '@/composables/curd/useCreate'
import { useShow } from '@/composables/curd/useShow'
import RemoteApiSelect from '@/components/admin/remote/RemoteApiSelect.vue'
import { marked } from 'marked'
import { computed, inject, onMounted, ref } from 'vue'

const props = defineProps({
  primary: [String, Number],
  api: String
})

const { formData, form, loading, submitForm, close } = useCreate(props.api, props.primary)

if (props.primary) {
  useShow(props.api, props.primary, formData)
}

const tab = ref('edit')
const checkText = { factual: '事实', useful: '有用', original: '原创', language: '语言', honest: '真实' }

// 预览只用于后台查看，去掉 HTML 标签避免执行脚本
const preview = computed(() => marked.parse((formData.value.content ?? '').replace(/<[^>]*>/g, '')))
const words = computed(() => (formData.value.content ?? '').match(/[\p{L}\p{N}]+/gu)?.length ?? 0)

const closeDialog = inject('closeDialog')
onMounted(() => {
  close(() => closeDialog())
})
</script>

<style scoped>
.article-preview {
  line-height: 1.8;
  max-height: 520px;
  overflow: auto;
}
.article-preview :deep(h2) {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 1rem 0 0.5rem;
}
.article-preview :deep(h3) {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0.75rem 0 0.5rem;
}
.article-preview :deep(p) {
  margin: 0.5rem 0;
}
.article-preview :deep(ul) {
  list-style: disc;
  padding-left: 1.5rem;
}
.article-preview :deep(ol) {
  list-style: decimal;
  padding-left: 1.5rem;
}
</style>

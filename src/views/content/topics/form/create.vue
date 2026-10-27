<template>
  <el-form :model="formData" label-width="100px" ref="form" v-loading="loading" class="pr-4">
    <el-form-item label="站点" prop="site_id" :rules="[{ required: true, message: '请选择站点' }]">
      <RemoteApiSelect v-model="formData.site_id" api="site/sites" search-field="keywords" label="name" value="id" class="w-full" :disabled="!!primary" />
    </el-form-item>
    <el-form-item label="选题" prop="title" :rules="[{ required: true, message: '选题必须填写' }]">
      <el-input v-model="formData.title" maxlength="255" />
      <Prompt text="写玩家会搜索的问题，例如「Como desbloquear novos carros」" />
    </el-form-item>
    <el-form-item label="关键词" prop="keyword">
      <el-input v-model="formData.keyword" maxlength="191" />
    </el-form-item>
    <el-form-item label="搜索意图" prop="intent">
      <el-select v-model="formData.intent" class="w-full" clearable>
        <el-option v-for="item in intents" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="状态" prop="status" v-if="primary">
      <el-radio-group v-model="formData.status">
        <el-radio :value="1">待写</el-radio>
        <el-radio :value="4">废弃</el-radio>
      </el-radio-group>
    </el-form-item>
    <div class="flex justify-end">
      <el-button type="primary" @click="submitForm(form)">{{ $t('system.confirm') }}</el-button>
    </div>
  </el-form>
</template>

<script lang="ts" setup>
// @ts-nocheck
import { useCreate } from '@/composables/curd/useCreate'
import { useShow } from '@/composables/curd/useShow'
import RemoteApiSelect from '@/components/admin/remote/RemoteApiSelect.vue'
import { inject, onMounted } from 'vue'

const props = defineProps({
  primary: [String, Number],
  api: String
})

const { formData, form, loading, submitForm, close } = useCreate(props.api, props.primary)

if (props.primary) {
  useShow(props.api, props.primary, formData)
}

const intents = [
  { label: '新手指南 guide', value: 'guide' },
  { label: '机制讲解 explanation', value: 'explanation' },
  { label: '技巧 tips', value: 'tips' },
  { label: '常见问题 faq', value: 'faq' },
  { label: '更新动态 news', value: 'news' }
]

const closeDialog = inject('closeDialog')
onMounted(() => {
  close(() => closeDialog())
})
</script>

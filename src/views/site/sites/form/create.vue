<template>
  <el-form :model="formData" label-width="120px" ref="form" v-loading="loading" class="pr-4">
    <el-form-item label="网站名称" prop="name" :rules="[{ required: true, message: '网站名称必须填写' }]">
      <el-input v-model="formData.name" clearable maxlength="100" placeholder="游戏品牌名" />
    </el-form-item>
    <el-form-item label="域名" prop="domain" :rules="primary ? [] : [{ required: true, message: '域名必须填写' }]">
      <el-input v-model="formData.domain" clearable maxlength="191" placeholder="example.com.br，不要带 www" :disabled="!!primary" />
    </el-form-item>
    <el-form-item label="Cloudflare 账号" prop="cloudflare_account_id" :rules="primary ? [] : [{ required: true, message: '请选择 Cloudflare 账号' }]">
      <el-select v-model="formData.cloudflare_account_id" class="w-full" :disabled="!!primary">
        <el-option v-for="item in accounts" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="解析 IP" prop="ip">
      <el-input v-model="formData.ip" clearable maxlength="45" placeholder="留空使用「全局配置」里的默认解析 IP" />
      <Prompt text="修改后会自动更新 Cloudflare 上的解析" />
    </el-form-item>
    <el-form-item label="语言" prop="locale" :rules="[{ required: true, message: '请选择语言' }]">
      <el-select v-model="formData.locale" class="w-full">
        <el-option v-for="item in locales" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <Prompt text="页面模板和 AI 生成的内容都会使用这个语言" />
    </el-form-item>
    <el-form-item label="Logo" prop="logo">
      <UploadImage v-model="formData.logo" />
    </el-form-item>
    <el-form-item label="标题" prop="title">
      <el-input v-model="formData.title" clearable maxlength="191" show-word-limit />
    </el-form-item>
    <el-form-item label="描述" prop="description">
      <el-input v-model="formData.description" type="textarea" maxlength="500" show-word-limit />
    </el-form-item>
    <el-form-item label="关键词" prop="keywords">
      <el-input v-model="formData.keywords" clearable maxlength="500" placeholder="多个用英文逗号分隔" />
    </el-form-item>
    <el-form-item label="游戏说明" prop="game_brief">
      <el-input v-model="formData.game_brief" type="textarea" :rows="3" maxlength="1000" show-word-limit placeholder="选填。一两句话说明玩法和特色，AI 生成游戏资料时会以此为准" />
    </el-form-item>
    <el-form-item label="状态" prop="status">
      <el-radio-group v-model="formData.status">
        <el-radio :value="1">启用</el-radio>
        <el-radio :value="2">禁用</el-radio>
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
import http from '@/support/http'
import { inject, onMounted, ref } from 'vue'

const props = defineProps({
  primary: [String, Number],
  api: String
})

const { formData, form, loading, submitForm, close } = useCreate(props.api, props.primary)

formData.value.locale = 'pt-BR'
formData.value.status = 1

if (props.primary) {
  useShow(props.api, props.primary, formData)
}

const accounts = ref([])
const locales = [
  { label: 'Português (Brasil) pt-BR', value: 'pt-BR' },
  { label: 'English en', value: 'en' },
  { label: 'Español es', value: 'es' }
]

const closeDialog = inject('closeDialog')
onMounted(() => {
  close(() => closeDialog())
  http.get('site/cloudflare/accounts/options').then(r => {
    accounts.value = r.data.data
    if (!props.primary && accounts.value.length === 1) {
      formData.value.cloudflare_account_id = accounts.value[0].value
    }
  })
})
</script>

<template>
  <div class="p-5 bg-white dark:bg-regal-dark" v-loading="loading">
    <el-alert type="info" :closable="false" class="mb-5" title="这里的配置作用于所有站点，保存后所有站点的页面缓存会刷新。图片存储（OSS 等）在「系统管理 → 上传配置」里设置。" />
    <el-form label-width="160px" class="max-w-4xl">
      <el-form-item v-for="(item, key) in schema" :key="key" :label="item.label">
        <el-switch v-if="item.type === 'bool'" v-model="values[key]" />
        <el-input v-else-if="item.type === 'code'" v-model="values[key]" type="textarea" :rows="6" class="font-mono" />
        <el-input v-else v-model="values[key]" maxlength="500" />
        <Prompt v-if="item.help" :text="item.help" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
// @ts-nocheck
import { ref } from 'vue'
import http from '@/support/http'
import Message from '@/support/message'

const api = 'front/settings'
const loading = ref(true)
const saving = ref(false)
const schema = ref({})
const values = ref({})

http
  .get(api)
  .then(r => {
    schema.value = r.data.data.schema
    values.value = r.data.data.values
  })
  .finally(() => {
    loading.value = false
  })

const save = () => {
  saving.value = true
  http
    .post(api, values.value)
    .then(() => Message.success('已保存'))
    .finally(() => {
      saving.value = false
    })
}
</script>

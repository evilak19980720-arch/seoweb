<template>
  <div class="p-5 bg-white dark:bg-regal-dark" v-loading="loading">
    <el-alert type="info" :closable="false" class="mb-5" title="开启自动生产后，系统每小时为已上线且游戏资料已确认的站点补充选题、生成文章；每 15 分钟按配额发布审核通过的文章。审核未通过的文章不会自动发布。" />
    <el-form label-width="300px" class="max-w-3xl">
      <el-form-item v-for="(item, key) in schema" :key="key" :label="item.label">
        <el-switch v-if="typeof item.default === 'boolean'" v-model="values[key]" />
        <el-input-number v-else v-model="values[key]" :min="item.min" :max="item.max" :step="isFloat(item) ? 0.05 : 1" :precision="isFloat(item) ? 2 : 0" />
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

const api = 'content/settings'
const loading = ref(true)
const saving = ref(false)
const schema = ref({})
const values = ref({})

const isFloat = (item: any) => !Number.isInteger(item.default) && typeof item.default === 'number'

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

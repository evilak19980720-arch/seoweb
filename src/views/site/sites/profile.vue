<template>
  <div v-loading="loading" class="pr-2">
    <el-alert v-if="profile.status === 1" type="info" :closable="false" class="mb-4" title="AI 正在生成资料草稿，稍后点“刷新”查看" />
    <el-alert v-if="profile.status === 4" type="error" :closable="false" class="mb-4" :title="'生成失败：' + profile.error" />
    <el-alert v-if="profile.status === 2" type="warning" :closable="false" class="mb-4" title="这是 AI 草稿，请逐项核对并上传真实截图后再确认。资料确认之前，这个站不会生成文章。" />
    <el-alert v-if="profile.status === 3" type="success" :closable="false" class="mb-4" title="资料已确认，后续文章以这份资料为事实依据" />

    <el-form :model="profile" label-width="110px">
      <el-form-item label="游戏类型">
        <el-input v-model="profile.genre" maxlength="100" />
      </el-form-item>
      <el-form-item label="简介">
        <el-input v-model="profile.summary" type="textarea" :rows="3" maxlength="2000" show-word-limit />
      </el-form-item>
      <el-form-item label="玩法">
        <el-input v-model="profile.gameplay" type="textarea" :rows="5" maxlength="5000" show-word-limit />
      </el-form-item>
      <el-form-item label="特色">
        <div class="w-full">
          <div v-for="(item, index) in profile.features" :key="'f' + index" class="flex mb-2">
            <el-input v-model="profile.features[index]" maxlength="300" />
            <el-button class="ml-2" link type="danger" @click="profile.features.splice(index, 1)">删除</el-button>
          </div>
          <el-button size="small" @click="profile.features.push('')">添加特色</el-button>
        </div>
      </el-form-item>
      <el-form-item label="常见问题">
        <div class="w-full">
          <div v-for="(item, index) in profile.faq" :key="'q' + index" class="p-2 mb-2 border rounded">
            <el-input v-model="item.q" placeholder="问题" maxlength="300" class="mb-1" />
            <el-input v-model="item.a" placeholder="回答" type="textarea" :rows="2" maxlength="2000" />
            <el-button link type="danger" size="small" @click="profile.faq.splice(index, 1)">删除</el-button>
          </div>
          <el-button size="small" @click="profile.faq.push({ q: '', a: '' })">添加问题</el-button>
        </div>
      </el-form-item>
      <el-form-item label="Google Play">
        <el-input v-model="profile.store_links.google_play" placeholder="https://play.google.com/store/apps/details?id=..." />
      </el-form-item>
      <el-form-item label="App Store">
        <el-input v-model="profile.store_links.app_store" placeholder="https://apps.apple.com/..." />
      </el-form-item>
      <el-form-item label="网页版">
        <el-input v-model="profile.store_links.web" placeholder="可直接玩的网页地址（可选）" />
      </el-form-item>
      <el-form-item label="宣传视频">
        <el-input v-model="profile.video_url" placeholder="YouTube 等视频地址（可选）" />
      </el-form-item>
      <el-form-item label="截图">
        <div class="w-full">
          <div class="flex flex-wrap gap-2 mb-2">
            <div v-for="(item, index) in profile.screenshots" :key="'s' + index" class="relative">
              <el-image :src="warpHost(item)" fit="cover" class="w-28 h-20 rounded" :preview-src-list="profile.screenshots.map(warpHost)" :initial-index="index" preview-teleported />
              <el-button class="absolute top-0 right-0" size="small" circle type="danger" @click="profile.screenshots.splice(index, 1)">×</el-button>
            </div>
          </div>
          <UploadImage v-model="uploading" :key="uploadKey" />
          <Prompt text="确认前至少需要 1 张真实的游戏截图" />
        </div>
      </el-form-item>
    </el-form>

    <div class="flex justify-between">
      <div>
        <el-button @click="load">刷新</el-button>
        <el-button v-if="profile.status !== 3" @click="regenerate">重新生成</el-button>
      </div>
      <div>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button v-if="profile.status !== 3" type="success" @click="confirm">保存并确认</el-button>
        <el-button v-else type="warning" @click="unconfirm">撤销确认</el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// @ts-nocheck
import { ref, watch } from 'vue'
import http from '@/support/http'
import Message from '@/support/message'
import { warpHost } from '@/support/helper'

const props = defineProps({
  siteId: { type: [String, Number], required: true }
})
const emits = defineEmits(['changed'])

const api = `site/sites/${props.siteId}/profile`
const loading = ref(false)
const uploading = ref('')
const uploadKey = ref(0)
const profile = ref({ features: [], faq: [], store_links: {}, screenshots: [] })

const normalize = (data: any) => ({
  ...data,
  features: data.features ?? [],
  faq: data.faq ?? [],
  store_links: data.store_links && !Array.isArray(data.store_links) ? data.store_links : {},
  screenshots: data.screenshots ?? []
})

const load = () => {
  loading.value = true
  http
    .get(api)
    .then(r => {
      profile.value = normalize(r.data.data)
    })
    .finally(() => (loading.value = false))
}

// 每上传一张图就加入截图列表，并重置上传组件
watch(uploading, value => {
  if (value) {
    profile.value.screenshots.push(value)
    uploading.value = ''
    uploadKey.value++
  }
})

const payload = () => ({
  genre: profile.value.genre,
  summary: profile.value.summary,
  gameplay: profile.value.gameplay,
  features: profile.value.features.filter(item => item && item.trim()),
  faq: profile.value.faq.filter(item => item.q && item.a),
  store_links: profile.value.store_links,
  screenshots: profile.value.screenshots,
  video_url: profile.value.video_url
})

const save = () => {
  loading.value = true
  return http
    .put(api, payload())
    .then(() => {
      Message.success('已保存')
      emits('changed')
    })
    .finally(() => (loading.value = false))
}

const confirm = () => {
  save().then(() =>
    http.post(`${api}/confirm`).then(() => {
      Message.success('资料已确认')
      load()
      emits('changed')
    })
  )
}

const unconfirm = () => {
  http.post(`${api}/unconfirm`).then(() => {
    load()
    emits('changed')
  })
}

const regenerate = () => {
  http.post(`${api}/regenerate`).then(() => {
    Message.success('已重新加入生成队列')
    load()
  })
}

load()
</script>

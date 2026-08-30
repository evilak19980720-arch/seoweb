<template>
  <div>
    <catch-table :columns="columns" :api="api" :default-params="{ channel }">
      <template #dialog="row">
        <Create :primary="row?.id" :api="api" :channel="channel" />
      </template>
    </catch-table>
  </div>
</template>

<script lang="ts" setup>
import Create from './form/create.vue'
const api = 'system/sms/template'
defineProps({
  channel: {
    type: String,
    default: ''
  }
})
// table columns
const columns = [
  {
    prop: 'id',
    label: 'ID'
  },
  {
    prop: 'channel',
    label: '通道'
  },
  {
    prop: 'identify',
    label: '模版标识'
  },
  {
    prop: 'template_id',
    label: '模版ID'
  },
  {
    prop: 'content',
    label: '模版内容'
  },
  {
    prop: 'variables',
    label: '模版变量'
  },
  {
    prop: 'created_at',
    label: '创建时间'
  },
  {
    type: 'operate',
    label: '操作'
  }
]
</script>

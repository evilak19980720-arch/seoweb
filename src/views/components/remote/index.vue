<template>
  <div class="flex flex-col justify-center py-10 pl-5 pr-5 bg-white rounded gap-y-10 dark:bg-regal-dark">
    <div>
      <h1>远程级联选择器</h1>
      <RemoteCascader :table="table" :value="value" :label="label" :pid="pid" v-model="m" :props="{ checkStrictly: true }" />
    </div>

    <div>
      <h1>远程Select组件</h1>
      <RemoteSelect :table="table" :value="value" :label="label" v-model="m" />
    </div>

    <div>
      <h1>远程Tree组件</h1>
      <RemoteTree :table="table" :value="value" :label="label" v-model="m" :pid="pid" />
    </div>

    <div>
      <h1>远程Tree Select组件</h1>
      <RemoteTreeSelect :table="table" :value="value" :label="label" v-model="m" :pid="pid" multiple />
    </div>

    <div>
      <h1>远程API Select组件</h1>
      <RemoteApiSelect api="permissions/permissions" :value="value" :label="label" v-model="m"/>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, watch } from 'vue'
import RemoteApiSelect from '@/components/admin/remote/RemoteApiSelect.vue'

const table = 'permissions'
const value = 'id'
const label = 'permission_name'
const pid = 'parent_id'
const m = ref()

watch(m, newValue => {
  console.log('m changed:', newValue)
})
</script>

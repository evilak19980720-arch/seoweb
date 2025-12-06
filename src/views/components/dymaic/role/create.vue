<template>
  <catch-form ref="formRef" :config="config" :beforeSubmit="beforeSubmit" />
</template>

<script lang="ts" setup>
// @ts-nocheck
import http from '@/support/http'
import { onMounted, ref, beforeMount, watch } from 'vue'
defineProps({
  config: Object
})
const formRef = ref()
const form = formRef.value?.getForm()

// 监听模块组件的 change 事件
const changeEvent = () => {
  const form = formRef.value.getForm()
  form.on('change', (field, value) => {
    if (field === 'parent_id') {
      getPermissions(value)
    }
  })
  getPermissions()
}

// 提交前的钩子
const beforeSubmit = formData => {
  formData.parent_id = formData.parent_id ? formData.parent_id[0] : 0
  return formData
}

const getPermissions = async (value: number = 0) => {
  const form = formRef.value.getForm()
  if (value) {
    http.get('permissions/roles/' + value, { from: 'parent_role' }).then(r => {
      form.setData('permissionsOption', r.data.data.permissions)
    })
  } else {
    http.get('permissions/permissions', { from: 'role' }).then(r => {
      form.setData('permissionsOption', r.data.data)
    })
  }
}
onMounted(() => {
  changeEvent()
})
</script>

<template>
  <!--<form-create v-model="formData" :rule="rule" v-model:api="formApi" :option="options" ref="form"> </form-create>-->
  <catch-form ref="formRef" :config="config" :beforeSubmit="beforeSubmit" :afterSubmit="afterSubmit" v-model="formData" />
</template>

<script lang="ts" setup>
// @ts-nocheck
import http from '@/support/http'
import { before } from 'node:test'
import { onMounted, ref, beforeMount, watch, onUnmounted } from 'vue'
const props = defineProps({
  config: Object
})

const formData = ref({})
const formRef = ref()

// 类型字段 change
const typeChange = (value: number) => {
  const form = formRef.value.getForm()

  // 监听类型值
  watch(
    () => formData.value.type,
    newValue => {
      if (newValue === 3) {
        form.hidden(true, ['icon', 'module', 'component', 'route', 'hidden', 'redirect', 'sort', 'keepalive', 'select_permission_mark', 'active_menu'])
        form.hidden(false, ['text_permission_mark', 'parent_id'])
      } else if (newValue === 2) {
        form.hidden(true, 'text_permission_mark')
        form.hidden(false, ['icon', 'module', 'component', 'route', 'hidden', 'redirect', 'parent_id', 'sort', 'keepalive', 'select_permission_mark', 'active_menu'])
      } else {
        form.hidden(true, ['select_permission_mark', 'text_permission_mark', 'active_menu', 'parent_id', 'redirect'])
        form.hidden(false, ['icon', 'module', 'component', 'route', 'hidden', 'sort', 'keepalive'])
      }
    },
    {
      deep: true
    }
  )

  // 监听模块组件的 change 事件
  watch(
    () => formData.value.module,
    newValue => {
      console.log(newValue)
      if (!newValue) return
      form.mergeRule('select_permission_mark', { props: { query: { module: newValue } } })
      form.mergeRule('component', { props: { query: { module: newValue } } })
    }
  )

  if (form.getValue('type') === 1) {
    form.hidden(false, ['icon', 'module', 'component', 'route', 'hidden', 'sort', 'keepalive'])
    form.hidden(true, ['redirect', 'parent_id', 'select_permission_mark', 'text_permission_mark', 'active_menu'])
  }
}

// 提交前的钩子
const beforeSubmit = formData => {
  if (typeof formData.parent_id !== 'number') {
    formData.parent_id = formData.parent_id[0]
  }
  return formData
}

// 提交后的钩子
const afterSubmit = () => {
  formRef.value.resetExceptFields('type')
  formRef.value.setFieldValue('type', 1)
}
onMounted(() => {
  // changeEvent()
  typeChange()
})
</script>

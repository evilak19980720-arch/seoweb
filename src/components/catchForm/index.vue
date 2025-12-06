<template>
  <div v-loading="loading">
    <form-create :rule="rules" v-model:api="form" :option="config.option" @submit="onSubmit" v-model="formData" />
  </div>
</template>
<script lang="ts" setup>
// @ts-nocheck
import { onMounted, ref, watch } from 'vue'
import http from '@/support/http'
import { useFormSubmit } from '@/composables/curd/useFormSubmit'
import { useShow } from '@/composables/curd/useShow'
import { cloneDeep } from 'lodash'
interface Config {
  api: string
  rules: Array
  option: Object
  primary: string | number | undefined
}

interface Props {
  config: Config
  isPage?: boolean | null
  beforeSubmit?: Function | null
  afterSubmit?: Function | null
}

const formData = defineModel()
const props = defineProps<Props>()

const form = ref({})
const { loading, submitForm, isSuccess, close } = useFormSubmit(props.config.api, props.config.primary)
const rules = ref(cloneDeep(props.config.rules))

// props primary
if (props.config.primary) {
  useShow(props.config.api, props.config.primary, formData)
}

// 获取 form create api 对象操作
const getForm = () => {
  return form.value
}

// 获取 form data
const getFormData = () => {
  return form.value.formData()
}

const setFieldValue = (field: string, value: any) => {
  return form.value.setValue(field, value)
}

const setFormData = (formData: any) => {
  return form.value.setValue(formData)
}

const setData = (key: string, data: any) => {
  return form.value.setData(key, data)
}

const getFields = (): Array<string> => {
  return form.value.fields()
}

// 提交表单
const onSubmit = formData => {
  try {
    if (props.beforeSubmit) {
      formData = props.beforeSubmit(formData)
    }
    console.log(formData)
    submitForm(formData)
  } catch (error) {
    console.error('提交报错:', error)
  }
}
/**
 * 重置某个字段
 *
 * @param field
 */
const resetExceptFields = (field: Array<string> | string) => {
  const fields = getFields()

  // 过滤 fields 里面的 field
  if (typeof field === 'string') {
    fields.splice(fields.indexOf(field), 1)
  } else {
    field.forEach((f: string) => {
      fields.splice(fields.indexOf(f), 1)
    })
  }

  form.value.resetFields(fields)
}
// 置空表单值
const emptyFieldsValue = (field: Array<string> | string) => {
  const fields = getFields()

  if (typeof field === 'string') {
    fields.splice(fields.indexOf(field), 1)
  } else {
    fields.forEach((f: string) => {
      fields.splice(fields.indexOf(f), 1)
    })
  }

  fields.forEach((f: string) => {
    setFieldValue(f, null)
  })
}

// 刷新表单
const refresh = () => {
  form.value.refresh()
}
defineExpose({ getForm, getFormData, setFormData, setFieldValue, setData, getFields, resetExceptFields, emptyFieldsValue })

// 监听提交是否成功
const watchSuccess = () => {
  watch(
    () => isSuccess.value,
    (newValue, oldValue) => {
      if (newValue) {
        if (props.afterSubmit) {
          props.afterSubmit()
        } else {
          emptyFieldsValue()
        }
      }
    }
  )
}

onMounted(() => {
  // 关闭 Dialog
  if (!props.isPage) {
    const closeDialog = inject('closeDialog')
    close(() => closeDialog())
  }

  watchSuccess()
})
</script>
<style scoped>
/* Add your styles here */
:deep(.fc-form-footer .fc-form-item .el-form-item__content) {
  @apply flex justify-end !important;
}
</style>

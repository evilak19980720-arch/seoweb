import http from '@/support/http'
import { ref, unref, watch } from 'vue'
import { Code } from '@/enum/app'
import Message from '@/support/message'
import { AxiosResponse } from 'axios'
import { isFunction } from '@/support/helper'

// get table list
export function useFormSubmit(path: string, id: string | number | null = null, _formData: object = {}) {
  const formData = ref<object>(_formData)

  const loading = ref<boolean>(false)
  const isClose = ref<boolean>(false)

  const isSuccess = ref<boolean>(false)
  // 创建前 hook
  const beforeCreate = ref()
  // 更新前 hook
  const beforeUpdate = ref()

  const afterCreate = ref()
  const afterUpdate = ref()
  // store
  function store(path: string, id: string | number | null = null) {
    loading.value = true
    let promise: Promise<AxiosResponse> | null = null
    if (id) {
      if (isFunction(beforeUpdate.value)) {
        beforeUpdate.value()
      }

      promise = http.put(path + '/' + id, unref(formData))
    } else {
      if (isFunction(beforeCreate.value)) {
        beforeCreate.value()
      }

      promise = http.post(path, unref(formData))
    }

    promise
      .then(r => {
        isClose.value = true
        isSuccess.value = true
        Message.success(r.data.message)
        // 创建后的操作
        if (!id && isFunction(afterCreate.value)) {
          afterCreate.value()
        }
        // 更新后的操作
        if (id && isFunction(afterUpdate.value)) {
          afterUpdate.value()
        }
      })
      .finally(() => {
        loading.value = false
      })
  }

  // 提交表单
  const submitForm = (data: object) => {
    formData.value = data
    store(path, id)
  }

  const close = (func: Function) => {
    watch(isClose, function (value) {
      if (value && isFunction(func)) {
        func()
      }
    })
  }

  return { loading, submitForm, isSuccess, close, beforeCreate, beforeUpdate, afterCreate, afterUpdate }
}

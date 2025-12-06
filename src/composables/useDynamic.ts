import http from '@/support/http'
import { ref } from 'vue'
import { isFunction, isUndefined, strToFunction } from '@/support/helper'

interface Form {
  api: string
  rules: Array<any>
  option: Object
}
interface Data {
  form: Form
  table: any
}
export function useDynamic(path: string, callback: Function | null = null) {
  const loading = ref<boolean>(true)

  const form = ref({
    api: '',
    rules: [],
    option: {}
  })

  const table = ref({})

  const init = (key: string | null = null) => {
    http.get(path, { key: key }).then(r => {
      loading.value = false
      if (!isUndefined(r.data.data.table)) {
        table.value = r.data.data.table
        // @ts-ignore
        table.value.columns.forEach((column: any) => {
          // 如果返回的是字符串,需要转换成函数
          if (column.filter && !isFunction(column.filter)) {
            column.filter = strToFunction(column.filter)
          }

          // Switch 刷新
          if (column.switchRefresh && !isFunction(column.switchRefresh)) {
            column.switchRefresh = strToFunction(column.switchRefresh)
          }
        })

        if (isFunction(callback)) {
          // 如果回调函数存在，执行回调函数
          // @ts-ignore
          table.value = callback(table.value)
        }
      }

      if (!isUndefined(r.data.data.form)) {
        form.value = {
          api: r.data.data.table.api,
          rules: r.data.data.form.rules,
          option: r.data.data.form.option
        }
      }
    })
  }

  init()
  const refreshDynamic = (k: string) => {
    init(k)
  }

  return { table, form, loading, refreshDynamic }
}

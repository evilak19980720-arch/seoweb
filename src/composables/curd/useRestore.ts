import http from '@/support/http'
import { Code } from '@/enum/app'
import Message from '@/support/message'
import { ref, watch } from 'vue'
import { isFunction } from '@/support/helper'

export function useRestore(confirm: string = '确认恢复吗') {
  const isRetored = ref(false)

  const beforeDestroy = ref()

  // fetch list
  function restore(path: string, id: string | number, isForce: boolean = false) {
    Message.confirm(confirm + '?', function () {
      // before destroy
      if (isFunction(beforeDestroy.value)) {
        beforeDestroy.value()
      }
      console.log(isForce)
      http
        .put(path + '/restore/' + id)
        .then(r => {
          if (r.data.code === Code.SUCCESS) {
            Message.success(r.data.message)
            isRetored.value = true
          } else {
            Message.error(r.data.message)
          }
        })
        .finally(() => {})
    })
  }

  const restored = (reset: Function) => {
    watch(isRetored, function (value) {
      if (value) {
        isRetored.value = false
        reset()
      }
    })
  }

  return { restore, restored }
}

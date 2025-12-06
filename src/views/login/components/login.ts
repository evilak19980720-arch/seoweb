import { reactive, ref } from 'vue'
import type { FormInstance } from 'element-plus'
import { useUserStore } from '@/stores/modules/user'
import router from '@/router'

export const useLogin = (p: Object, r: object) => {
  const params = reactive(p)

  const loading = ref(false)

  const rules = reactive(r)

  const form = ref<FormInstance>()

  const submit = (loginForm: FormInstance | undefined) => {
    if (!loginForm) return
    loginForm.validate(validate => {
      if (validate) {
        loading.value = true
        const store = useUserStore()

        store
          .login(params as any)
          .then(() => {
            loading.value = false
            router.push({ path: '/' })
          })
          .catch(e => {
            loading.value = false
          })
      }
    })
  }

  return {
    params,

    rules,

    loading,

    submit,

    form
  }
}

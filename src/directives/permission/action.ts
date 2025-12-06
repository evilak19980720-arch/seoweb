import { useUserStore } from '@/stores/modules/user'

function checkAction(el: any, action: any) {
  if (action.value === null) {
    return true
  } else {
    if (action.value && typeof action.value === 'string') {
      const userStore = useUserStore()
      const actions = userStore.getActions
      if (!actions?.includes(action.value.replaceAll('@', '.').toLowerCase())) {
        // el.style.display = 'none'
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else {
      throw new Error('need action! Like v-action="module.controller.action"')
    }
  }
}

export default {
  mounted(el: any, binding: any) {
    checkAction(el, binding)
  },

  updated(el: any, binding: any) {
    checkAction(el, binding)
  }
}

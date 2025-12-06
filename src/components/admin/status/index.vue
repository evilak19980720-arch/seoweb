<template>
  <el-switch @change="enabled(api, id as string | number)" :active-value="activeValue" :inactive-value="inactiveValue" :model-value="status" :loading="loading" />
</template>

<script lang="ts" setup>
import { useEnabled } from '@/composables/curd/useEnabled'
import { Status } from '@/enum/app'
import { ref } from 'vue'

defineProps({
  api: {
    required: true,
    type: String
  },
  id: {
    required: false,
    type: [String, Number]
  }
})

const status = defineModel()
const emits = defineEmits(['refresh'])
// @ts-ignore
const { enabled, success, loading, afterEnabled } = useEnabled()

const activeValue = ref<boolean | number | string>()
const inactiveValue = ref<boolean | number | string>()

if (typeof status.value === 'boolean') {
  activeValue.value = true
  inactiveValue.value = false
} else {
  activeValue.value = Status.ENABLE
  inactiveValue.value = Status.DISABLE
}

success(() => {
  status.value = activeValue.value ? inactiveValue.value : activeValue.value
  // emits('update:modelValue', props.modelValue === activeValue.value ? inactiveValue.value : activeValue.value)
})

afterEnabled.value = () => {
  emits('refresh')
}
</script>

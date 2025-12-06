<template>
  <el-select v-bind="$attrs" class="w-full" clearable filterable>
    <el-option v-for="option in options" :key="option.value" :label="option.label" :value="option.value">
      <slot />
    </el-option>
  </el-select>
</template>

<script lang="ts" setup>
import http from '@/support/http'
import { onMounted, ref, watch } from 'vue'

const props = defineProps({
  api: {
    type: String,
    require: false
  },
  query: {
    type: Object,
    default: null
  },
  options: {
    type: Array<Option>,
    require: false,
    default: () => []
  }
})

interface Option {
  label: string
  value: string | number
}

const options = ref<Array<Option>>([])

const getOptions = () => {
  if (props.options.length > 0) {
    options.value = props.options
  } else {
    http.get('options/' + props.api, props.query).then(r => {
      options.value = r.data.data
    })
  }
}

onMounted(() => {
  getOptions()
})

watch(props, function () {
  getOptions()
})
</script>

<template>
  <el-select v-bind="$attrs" class="w-full" clearable filterable>
    <template v-if="group">
      <el-option-group v-for="group in elOptions" :key="group.label" :label="group.label">
        <el-option v-for="item in group.options" :key="item.value" :label="item.label" :value="item.value" />
      </el-option-group>
    </template>
    <el-option v-for="option in elOptions" :key="option.value" :label="option.label" :value="option.value" v-else>
      <slot />
    </el-option>
  </el-select>
</template>

<script lang="ts" setup>
import http from '@/support/http'
import { ref, watch } from 'vue'

const props = defineProps({
  options: {
    type: Array,
    require: false,
    default: () => {
      return []
    }
  },
  api: {
    type: String,
    require: false,
    default: ''
  },
  group: {
    type: Boolean,
    default: false
  },
  query: {
    type: Object,
    default: null
  }
})

interface Option {
  label: string
  value: string | number
}

interface GroupOption {
  label: string
  options: Array<Option>
}

const getOptions = () => {
  if (props.api) {
    http.get('options/' + props.api, props.query).then(r => {
      elOptions.value = r.data.data
    })
  }
}

const elOptions: any = props.group ? ref<Array<GroupOption>>() : ref<Array<Option>>()
if (props.api) {
  if (!props.query) {
    getOptions()
  } else {
    watch(props, function () {
      getOptions()
    })
  }
} else {
  elOptions.value = props.options
}

watch(
  () => props.options,
  () => {
    elOptions.value = props.options
  },
  { deep: true }
)
</script>

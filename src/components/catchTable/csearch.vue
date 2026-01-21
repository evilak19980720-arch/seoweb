<template>
  <div class="flex gap-2 pl-2 w-full" :class="gridClass">
    <template v-for="(item, k) in visibleFields" :key="k">
      <div :class="'align-items-center ' + (item.type === 'range' ? ' col-span-2' : '')">
        <el-form-item :label="item.label" v-if="item.type === 'input'">
          <el-input :placeholder="item.placeholder" v-model="queryStore.getTableQuery[item.name]" clearable />
        </el-form-item>
        <el-form-item :label="item.label" v-if="item.type === 'select'">
          <Select :api="item.api" :options="item.options" v-model="queryStore.getTableQuery[item.name]" :query="item.query" :placeholder="item.placeholder" />
        </el-form-item>
        <el-form-item :label="item.label" v-if="item.type === 'input-number'">
          <el-input-number v-model="queryStore.getTableQuery[item.name]" :placeholder="item.placeholder" clearable />
        </el-form-item>
        <el-form-item :label="item.label" v-if="item.type === 'date'">
          <el-date-picker type="date" v-model="queryStore.getTableQuery[item.name]" :placeholder="item.placeholder" clearable value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item :label="item.label" v-if="item.type === 'datetime'">
          <el-date-picker type="datetime" v-model="queryStore.getTableQuery[item.name]" :placeholder="item.placeholder" clearable value-format="YYYY-MM-DD HH:mm:ss" />
        </el-form-item>
        <el-form-item :label="item.label" v-if="item.type === 'tree'">
          <el-tree-select v-model="queryStore.getTableQuery[item.name]" value-key="id" :placeholder="item.placeholder" clearable :data="item.options" check-strictly :props="item.props" />
        </el-form-item>
        <!-- 远程选择 -->
        <el-form-item :label="item.label" v-if="item.type === 'remote-select'">
          <RemoteSelect v-model="queryStore.getTableQuery[item.name]" :label="item.props.label" :value="item.props.value" :table="item.props.table" />
        </el-form-item>
        <el-form-item :label="item.label" v-if="item.type === 'remote-api-select'">
          <RemoteApiSelect v-model="queryStore.getTableQuery[item.name]" :label="item.props.label" :value="item.props.value" :api="item.props.api" />
        </el-form-item>
        <div class="flex flex-wrap w-full" v-show="item.type === 'range'">
          <el-form-item :label="item.label">
            <div class="flex gap-x-2">
              <div v-for="(sitem, key) in item.children" :key="key">
                <el-input v-model="queryStore.getTableQuery[sitem.name]" :placeholder="sitem.placeholder" v-if="sitem.type === 'input'" clearable />
                <Select
                  :api="sitem.api"
                  :options="sitem.options"
                  v-model="queryStore.getTableQuery[sitem.name]"
                  :query="sitem.query"
                  :placeholder="sitem.placeholder"
                  clearable
                  v-if="sitem.type === 'select'"
                />
                <el-input-number v-model="queryStore.getTableQuery[sitem.name]" :placeholder="sitem.placeholder" v-if="sitem.type === 'input-number'" clearable />
                <el-date-picker type="date" v-model="queryStore.getTableQuery[sitem.name]" :placeholder="sitem.placeholder" v-if="sitem.type === 'date'" clearable value-format="YYYY-MM-DD" />
                <el-date-picker
                  type="datetime"
                  v-model="queryStore.getTableQuery[sitem.name]"
                  :placeholder="sitem.placeholder"
                  v-if="sitem.type === 'datetime'"
                  clearable
                  value-format="YYYY-MM-DD HH:mm:ss"
                />
              </div>
            </div>
          </el-form-item>
        </div>
      </div>
    </template>

    <!-- 按钮区域 - 智能定位 -->
    <div class="flex gap-2 items-end" :class="buttonGridClass">
      <el-button type="primary" @click="search" :disabled="loading" class="min-w-[80px]">
        {{ t('system.search') }}
      </el-button>
      <el-button @click="reset" :disabled="loading" class="min-w-[80px]">
        {{ t('system.reset') }}
      </el-button>
      <!-- 展开/收起
      <el-button @click="expandSearch()" v-if="props.fields.length > 3" text circle>
        <Icon :name="expand ? 'chevron-up' : 'chevron-down'" className="w-4 h-4" />
      </el-button>-->
    </div>
  </div>
</template>
<script lang="ts" setup>
// @ts-nocheck
import { onMounted, reactive, ref, computed } from 'vue'
import { isBoolean, t } from '@/support/helper'
import { useQueryStore } from './useQueryStore'
import RemoteApiSelect from '@/components/admin/remote/RemoteApiSelect.vue'
import RemoteSelect from '@/components/admin/remote/RemoteSelect.vue'
type itemType = 'input' | 'select' | 'input-number' | 'date' | 'datetime' | 'range' | 'tree'
interface Option {
  label: string
  value: string | number
}
interface field {
  type: itemType
  label: string
  name: string
  api?: string
  placeholder?: string
  default?: any
  options?: Array<Option>
  children?: Array<field>
  show?: boolean
  props?: Object // 树形 props
  query?: object
}

const props = defineProps({
  fields: {
    type: Array<field>,
    default: () => {
      return []
    }
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const queryStore = useQueryStore()
const emits = defineEmits(['search', 'reset'])
const expand = ref<boolean>(false)
const defaults = {}
const _fields = ref<Array<field>>(props.fields)
_fields.value = _fields.value?.map(field => {
  if (!field.placeholder && field.type !== 'range') {
    field.placeholder = (field.type === 'select' ? '请选择' : '请输入') + field.label
  }
  field.show = isBoolean(field.show) ? field.show : true

  // 填充默认值
  if (field.default) {
    queryStore.getTableQuery[field.name] = field.default
    defaults[field.name] = field.default
  }

  // 填充 range 组件的默认值
  if (field.type === 'range' && field.children?.length > 0) {
    field.children?.forEach(item => {
      if (item.default) {
        queryStore.getTableQuery[item.name] = item.default
        defaults[item.name] = item.default
      }
    })
  }
  return reactive(field)
})

const search = () => {
  emits('search')
}

/**
 * 搜索重置
 */
const reset = () => {
  emits('reset')
}
const expandSearch = () => {
  expand.value = !expand.value
}

// 计算显示的字段
const visibleFields = computed(() => {
  if (props.fields.length <= 3 || expand.value) {
    return _fields.value.filter(field => field.show)
  }
  return _fields.value
})

// 计算 grid 类名
const gridClass = computed(() => {
  const visibleCount = visibleFields.value.length
  const rangeCount = visibleFields.value.filter(field => field.type === 'range').length
  const actualFieldCount = visibleCount + rangeCount // range 字段占 2 列

  // 根据字段数量和屏幕大小动态调整列数
  if (actualFieldCount === 1) {
    return 'flex-col sm:grid sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
  } else if (actualFieldCount === 2) {
    return 'flex-col sm:grid sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
  } else if (actualFieldCount <= 3) {
    return 'flex-col sm:grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
  } else {
    return 'flex-col sm:grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5'
  }
})

// 计算按钮的 grid 位置类名
const buttonGridClass = computed(() => {
  const visibleCount = visibleFields.value.length
  const rangeCount = visibleFields.value.filter(field => field.type === 'range').length
  const actualFieldCount = visibleCount + rangeCount

  if (actualFieldCount === 1) {
    // 单个字段时，按钮紧跟在后面
    return 'col-start-2 sm:col-start-3 lg:col-start-4 xl:col-start-5'
  } else if (actualFieldCount === 2) {
    // 两个字段时，按钮在第三列开始
    return 'col-start-3 sm:col-start-4 lg:col-start-5 xl:col-start-6'
  } else {
    // 多个字段时，按钮右对齐
    return 'col-start-1 sm:col-start-2 lg:col-start-3 xl:col-start-4 2xl:col-start-5 justify-self-end'
  }
})

onMounted(() => {
  queryStore.setDefaults(defaults)
})
defineExpose({ reset })
</script>
<style scoped>
:deep(.el-form-item__label) {
  font-size: 14px !important;
}

:deep(.el-form-item) {
  margin-bottom: 0px !important;
}
</style>

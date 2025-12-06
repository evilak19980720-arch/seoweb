<template>
  <div class="w-full">
    <!-- 简单键值对模式的表格布局 -->
    <template v-if="!isCustomMode">
      <VueDraggable v-model="normalizedData" target=".el-table__body tbody" :animation="150" @end="easyModeUpdate">
        <el-table :data="normalizedData" class="w-full rounded-md border border-gray-200" :class="{ 'table-empty': !normalizedData.length }">
          <el-table-column :label="keyLabel" width="200">
            <template #header>
              <div class="font-medium text-gray-700">{{ keyLabel }}</div>
            </template>
            <template #default="{ row, $index }">
              <el-input v-model="row[props.keyField]" class="w-full" :placeholder="`请输入${keyLabel}`" @update:model-value="updateValue($index, props.keyField, $event)" />
            </template>
          </el-table-column>

          <el-table-column :label="valueLabel">
            <template #header>
              <div class="font-medium text-gray-700">{{ valueLabel }}</div>
            </template>
            <template #default="{ row, $index }">
              <el-input v-model="row[props.valueField]" class="w-full" :placeholder="`请输入${valueLabel}`" @update:model-value="updateValue($index, props.valueField, $event)" />
            </template>
          </el-table-column>

          <el-table-column v-if="props.showOperate" width="80" align="center">
            <template #header>
              <div class="font-medium text-gray-700">操作</div>
            </template>
            <template #default="{ $index }">
              <div class="flex justify-center items-center space-x-2">
                <el-button plain :icon="Delete" circle size="small" @click="removeItem($index)" />
                <el-button plain class="cursor-move drag-handle" circle size="small">
                  <el-icon><Operation /></el-icon>
                </el-button>
              </div>
            </template>
          </el-table-column>

          <!-- 空数据显示 -->
          <template #empty>
            <div class="py-4 text-center text-gray-500">暂无数据，请点击下方按钮添加</div>
          </template>
        </el-table>
      </VueDraggable>
    </template>

    <!-- 复杂数据结构的自定义模板布局 -->
    <template v-else>
      <div class="rounded-md border border-gray-200 custom-template-container">
        <!-- 表头行 -->
        <div class="flex p-3 bg-gray-50 header-row">
          <slot name="header">
            <div v-for="(column, index) in props.columns" :key="index" :style="{ width: column.width || 'auto', flex: column.flex || 1 }" class="px-2 font-medium text-gray-700">
              {{ column.label }}
            </div>
            <div v-if="props.showOperate" class="w-20 font-medium text-center text-gray-700">操作</div>
          </slot>
        </div>

        <!-- 数据行 -->
        <div class="data-rows">
          <template v-if="normalizedData.length">
            <div v-for="(item, index) in normalizedData" :key="index" class="flex items-center p-3 border-t border-gray-200 data-row">
              <slot name="row" :row="item" :index="index" :update="(field, value) => updateCustomValue(index, field, value)">
                <template v-for="(column, colIndex) in props.columns" :key="colIndex">
                  <div :style="{ width: column.width || 'auto', flex: column.flex || 1 }" class="px-2">
                    <el-input v-model="item[column.prop]" class="w-full" :placeholder="`请输入${column.label}`" @update:model-value="updateCustomValue(index, column.prop, $event)" />
                  </div>
                </template>
                <div v-if="props.showOperate" class="flex justify-center space-x-2 w-20">
                  <el-button plain :icon="Delete" circle size="small" @click="removeItem(index)" />
                  <el-button plain class="cursor-move drag-handle" circle size="small">
                    <el-icon><Operation /></el-icon>
                  </el-button>
                </div>
              </slot>
            </div>
          </template>
          <template v-else>
            <div class="py-8 text-center text-gray-500">暂无数据，请点击下方按钮添加</div>
          </template>
        </div>
      </div>
    </template>

    <!-- 添加按钮 -->
    <div v-if="showAdd" class="mt-2">
      <el-button plain :icon="Plus" @click="addItem" class="w-full">
        {{ isCustomMode.value ? '添加数据' : `添加${keyLabel}${valueLabel}对` }}
      </el-button>
    </div>

    <!-- JSON预览（可选，可切换） -->
    <div v-if="showPreview" class="mt-4">
      <el-collapse>
        <el-collapse-item title="数据预览" name="preview">
          <pre class="overflow-auto p-2 max-h-40 text-xs bg-gray-100 rounded">{{ JSON.stringify(modelValue, null, 2) }}</pre>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, watch, computed } from 'vue'
import { Delete, Plus, Operation } from '@element-plus/icons-vue'
import { VueDraggable } from 'vue-draggable-plus'

// 定义组件的类型
type KeyValuePair = Record<string, string>

type CustomItem = Record<string, any>

type ModelValueType = KeyValuePair[] | CustomItem[] | Record<string, string>

interface Column {
  label: string
  prop: string
  width?: string
  flex?: number
}

interface Props {
  /**
   * 是否显示JSON预览
   */
  showPreview?: boolean
  /**
   * 自定义模板标志（可选，如果未提供将自动检测）
   */
  customTemplate?: boolean
  /**
   * 自定义模板的列定义
   */
  columns?: Column[]
  /**
   * 自定义模板的默认空项
   */
  defaultItem?: Record<string, any>
  /**
   * 自动检测数据类型（默认：true）
   */
  autoDetect?: boolean
  /**
   * 键名字段名（默认：'key'）
   */
  keyField?: string
  /**
   * 键值字段名（默认：'value'）
   */
  valueField?: string
  /**
   * 键名标签（默认：'键名'）
   */
  keyLabel?: string
  /**
   * 键值标签（默认：'键值'）
   */
  valueLabel?: string
  /**
   * 是否显示添加按钮（默认：true）
   */
  showAdd?: boolean
  /**
   * 是否显示操作栏（默认：true）
   */
  showOperate?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showPreview: false,
  customTemplate: undefined,
  columns: () => [],
  defaultItem: () => ({}),
  autoDetect: true,
  keyField: 'key',
  valueField: 'value',
  keyLabel: '键名',
  valueLabel: '键值',
  showAdd: true,
  showOperate: true
})

// 使用更通用的类型作为模型值
const modelValue = defineModel<ModelValueType>('modelValue', { required: true })

// 键名和键值标签文本
const keyLabel = computed(() => props.keyLabel)
const valueLabel = computed(() => props.valueLabel)

// 根据props或数据结构确定是否处于自定义模式
const isCustomMode = computed(() => {
  // 如果明确设置了，使用该值
  if (props.customTemplate !== undefined) {
    return props.customTemplate
  }

  // 如果启用了自动检测，则基于数据结构进行检测
  if (props.autoDetect && modelValue.value) {
    // 检查是否是具有键值对的对象（非数组）
    if (!Array.isArray(modelValue.value) && typeof modelValue.value === 'object') {
      return false // 这是一个简单的键值对对象
    }

    // 检查是否是具有复杂结构的对象数组
    if (Array.isArray(modelValue.value) && modelValue.value.length > 0) {
      const firstItem = modelValue.value[0]
      // 如果只有keyField和valueField属性，则视为简单模式
      const keyField = props.keyField
      const valueField = props.valueField
      if (Object.keys(firstItem).length === 2 && keyField in firstItem && valueField in firstItem) {
        return false
      }
      // 否则是复杂结构
      return true
    }

    // 对于空数组或其他情况，默认为简单模式
    return false
  }

  // 如果禁用了自动检测且未设置customTemplate，则默认为false
  return false
})

// 使用 ref 而不是 computed，使其可以被修改
const normalizedData = ref<any[]>([])

// 初始化和更新 normalizedData
const updateNormalizedData = () => {
  if (!modelValue.value) {
    normalizedData.value = []
    return
  }

  // 如果是具有键值对的对象（非数组），则转换为数组格式
  if (!Array.isArray(modelValue.value) && typeof modelValue.value === 'object') {
    normalizedData.value = Object.entries(modelValue.value).map(([key, value]) => {
      const item: Record<string, any> = {}
      item[props.keyField] = key
      item[props.valueField] = value
      return item
    })
    return
  }

  // 否则按原样返回
  normalizedData.value = [...modelValue.value]
}

// 初始化
updateNormalizedData()

// 保存时如果需要，将数组转换回对象
const updateModelValue = (newValue: any[]) => {
  // 如果原始值是对象（非数组），则转换回该格式
  if (!Array.isArray(modelValue.value) && typeof modelValue.value === 'object') {
    const obj: Record<string, string> = {}
    newValue.forEach(item => {
      const keyField = props.keyField
      const valueField = props.valueField
      if (keyField in item && valueField in item) {
        obj[item[keyField]] = item[valueField]
      }
    })
    modelValue.value = obj
  } else {
    // 否则保持数组格式
    modelValue.value = newValue
  }
}

// 添加一个新的空项
const addItem = () => {
  if (isCustomMode.value) {
    // 对于自定义模板，使用提供的defaultItem或创建一个空对象
    const newItem: CustomItem = { ...props.defaultItem }
    const newArray = [...normalizedData.value, newItem]
    updateModelValue(newArray)
  } else {
    // 对于标准键值对
    const newItem: Record<string, string> = {}
    newItem[props.keyField] = ''
    newItem[props.valueField] = ''
    const newArray = [...normalizedData.value, newItem]
    updateModelValue(newArray)
  }
}

// 通过索引删除项
const removeItem = (index: number) => {
  const newArray = [...normalizedData.value]
  newArray.splice(index, 1)
  updateModelValue(newArray)
}

// 更新键值对项的特定字段
const updateValue = (index: number, field: string, value: string) => {
  if (!isCustomMode.value) {
    const newArray = [...normalizedData.value] as KeyValuePair[]
    newArray[index][field] = value
    updateModelValue(newArray)
  }
}

// 更新自定义模板项的自定义字段
const updateCustomValue = (index: number, field: string, value: any) => {
  const newArray = [...normalizedData.value] as CustomItem[]
  if (newArray[index]) {
    newArray[index][field] = value
    updateModelValue(newArray)
  }
}

// 监听 modelValue 的变化
watch(
  () => modelValue.value,
  () => {
    // 当外部数据变化时更新内部数据
    updateNormalizedData()
  },
  { deep: true }
)

// 拖拽结束后的处理函数
const easyModeUpdate = () => {
  // 拖拽结束后更新模型值
  updateModelValue(normalizedData.value)
}
</script>

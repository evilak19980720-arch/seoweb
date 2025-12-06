<template>
  <el-form ref="formRef" :model="formData" :rules="rules" label-position="top">
    <el-form-item label="目标模型" prop="targetModel">
      <el-select v-model="formData.targetModel" filterable clearable placeholder="选择目标模型" @change="handleTargetModelChange" class="w-full">
        <el-option-group v-for="module in modules" :key="module.title" :label="module.title">
          <el-option v-for="model in module.models" :key="model.model" :label="model.model" :value="model.model">
            <div class="flex items-center justify-between">
              <span>{{ model.model }}</span>
              <span class="text-xs text-gray-400">{{ model.table }}</span>
            </div>
          </el-option>
        </el-option-group>
      </el-select>
      <Prompt text="要最终关联的目标模型类名" />
    </el-form-item>

    <el-form-item label="中间模型" prop="throughModel">
      <el-select v-model="formData.throughModel" filterable clearable placeholder="选择中间模型" @change="handleThroughModelChange" class="w-full">
        <el-option-group v-for="module in modules" :key="module.title" :label="module.title">
          <el-option v-for="model in module.models" :key="model.model" :label="model.model" :value="model.model">
            <div class="flex items-center justify-between">
              <span>{{ model.model }}</span>
              <span class="text-xs text-gray-400">{{ model.table }}</span>
            </div>
          </el-option>
        </el-option-group>
      </el-select>
      <Prompt text="中间关联模型类名" />
    </el-form-item>

    <el-form-item label="第一外键" prop="firstKey">
      <el-select v-model="formData.firstKey" filterable clearable allow-create placeholder="选择或输入第一外键" class="w-full">
        <el-option v-for="field in throughModelFields" :key="field" :label="field" :value="field" />
      </el-select>
      <Prompt text="第一外键 firstKey" />
    </el-form-item>

    <el-form-item label="第二外键" prop="secondKey">
      <el-select v-model="formData.secondKey" filterable clearable allow-create placeholder="选择或输入第二外键" class="w-full">
        <el-option v-for="field in targetModelFields" :key="field" :label="field" :value="field" />
      </el-select>
      <Prompt text="第二外键 secondKey" />
    </el-form-item>

    <el-form-item label="本地键" prop="localKey">
      <el-select v-model="formData.localKey" filterable clearable allow-create placeholder="选择或输入本地键" class="w-full">
        <el-option v-for="field in availableFields" :key="field" :label="field" :value="field" />
      </el-select>
      <Prompt text="本地键 localKey" />
    </el-form-item>

    <el-form-item label="第二本地键" prop="secondLocalKey">
      <el-select v-model="formData.secondLocalKey" filterable clearable allow-create placeholder="选择或输入第二本地键" class="w-full">
        <el-option v-for="field in throughModelFields" :key="field" :label="field" :value="field" />
      </el-select>
      <Prompt text="第二本地键 secondLocalKey" />
    </el-form-item>

    <el-form-item label="关联方法名" prop="relation">
      <el-input v-model="formData.relation" placeholder="例如: posts" clearable />
      <Prompt text="在当前模型中调用的关联方法名称" />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useModelRelation } from './useModelRelation'

interface HasManyThroughParams {
  targetModel: string
  throughModel: string
  firstKey: string
  secondKey: string
  localKey: string
  secondLocalKey: string
  relation: string
}

// 使用模型关系 hook
const {
  modules,
  availableFields,
  targetModelFields,
  throughModelFields,
  handleTargetModelChange: hookHandleTargetModelChange,
  handleThroughModelChange: hookHandleThroughModelChange,
  getPluralRelationName,
  loadCurrentModelFields
} = useModelRelation()

const model = defineModel<HasManyThroughParams>({
  default: () => ({
    targetModel: '',
    throughModel: '',
    firstKey: '',
    secondKey: '',
    localKey: '',
    secondLocalKey: '',
    relation: ''
  })
})

const formRef = ref<FormInstance>()

const formData = reactive<HasManyThroughParams>({
  targetModel: model.value?.targetModel || '',
  throughModel: model.value?.throughModel || '',
  firstKey: model.value?.firstKey || '',
  secondKey: model.value?.secondKey || '',
  localKey: model.value?.localKey || '',
  secondLocalKey: model.value?.secondLocalKey || '',
  relation: model.value?.relation || ''
})

// 关联方法名（复数形式）
const relationName = computed(() => {
  if (!formData.relation) {
    if (!formData.targetModel) return ''
    return getPluralRelationName(formData.targetModel)
  }

  return formData.relation
})

// 处理目标模型变更
const handleTargetModelChange = (modelName: string) => {
  if (!modelName) return

  // 使用 hook 中的方法处理目标模型变更
  hookHandleTargetModelChange(modelName, formData)

  // 自动设置关联方法名
  if (!formData.relation) {
    formData.relation = getPluralRelationName(modelName)
  }

  // 如果已有中间模型，自动设置第二外键
  if (formData.throughModel && !formData.secondKey) {
    const throughModelParts = formData.throughModel.split('\\')
    const throughModelShortName = throughModelParts[throughModelParts.length - 1].toLowerCase()
    formData.secondKey = `${throughModelShortName}_id`
  }
}

// 处理中间模型变更
const handleThroughModelChange = (modelName: string) => {
  if (!modelName) return

  // 使用 hook 中的方法处理中间模型变更
  hookHandleThroughModelChange(modelName, formData, {
    targetModelField: 'targetModel',
    firstKeyField: 'firstKey',
    secondLocalKeyField: 'secondLocalKey'
  })
}

// 初始化当前模型字段
const initCurrentModelFields = () => {
  // 加载当前模型字段
  loadCurrentModelFields(formData, 'localKey')
}

// Laravel hasManyThrough validation rules
const rules = reactive<FormRules>({
  targetModel: [{ required: true, message: '目标模型是必填项', trigger: 'change' }],
  throughModel: [{ required: true, message: '中间模型是必填项', trigger: 'change' }],
  firstKey: [{ required: false, message: '第一外键为可选项', trigger: 'change' }],
  secondKey: [{ required: false, message: '第二外键为可选项', trigger: 'change' }],
  localKey: [{ required: false, message: '本地键为可选项', trigger: 'change' }],
  secondLocalKey: [{ required: false, message: '中间键为可选项', trigger: 'change' }],
  relation: [{ required: true, message: '关联方法名是必填项', trigger: 'change' }]
})

// 初始化
initCurrentModelFields()

// 初始化时，如果已有模型，加载其字段
if (formData.targetModel) {
  handleTargetModelChange(formData.targetModel)
}

if (formData.throughModel) {
  handleThroughModelChange(formData.throughModel)
}

// 监听表单数据变化，自动更新 model
watch(
  formData,
  newVal => {
    model.value = { ...newVal }
  },
  { deep: true }
)
</script>

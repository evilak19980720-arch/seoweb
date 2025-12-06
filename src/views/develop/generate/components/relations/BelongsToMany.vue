<template>
  <div class="p-4 mb-4 border border-gray-200 rounded-md">
    <el-form ref="formRef" :model="formData" :rules="rules" label-position="top">
      <el-form-item label="关联模型" prop="relatedModel">
        <el-select v-model="formData.relatedModel" filterable clearable placeholder="选择关联模型" @change="handleModelChange" class="w-full">
          <el-option-group v-for="module in modules" :key="module.title" :label="module.title">
            <el-option v-for="model in module.models" :key="model.model" :label="model.model" :value="model.model">
              <div class="flex items-center justify-between">
                <span>{{ model.model }}</span>
                <span class="text-xs text-gray-400">{{ model.table }}</span>
              </div>
            </el-option>
          </el-option-group>
        </el-select>
        <Prompt text="要关联的模型类名" />
      </el-form-item>

      <el-form-item label="中间表名称" prop="table">
        <el-select v-model="formData.table" filterable clearable placeholder="选择关联模型" @change="handlePivotTable" class="w-full">
          <el-option-group v-for="module in modules" :key="module.title" :label="module.title">
            <el-option v-for="model in module.models" :key="model.model" :label="model.model" :value="model.model">
              <div class="flex items-center justify-between">
                <span>{{ model.model }}</span>
                <span class="text-xs text-gray-400">{{ model.table }}</span>
              </div>
            </el-option>
          </el-option-group>
        </el-select>
        <Prompt text="默认为两个模型名称的单数形式按字母顺序连接（如 role_user）" />
      </el-form-item>

      <el-form-item label="当前模型外键" prop="foreignPivotKey">
        <el-select v-model="formData.foreignPivotKey" filterable clearable allow-create placeholder="选择或输入当前模型外键" class="w-full">
          <el-option v-for="field in relatedModelFields" :key="field" :label="field" :value="field" />
        </el-select>
        <Prompt text="中间表中引用当前模型的外键名称" />
      </el-form-item>

      <el-form-item label="关联模型外键" prop="relatedPivotKey">
        <el-select v-model="formData.relatedPivotKey" filterable clearable allow-create placeholder="选择或输入关联模型外键" class="w-full">
          <el-option v-for="field in relatedModelFields" :key="field" :label="field" :value="field" />
        </el-select>
        <Prompt text="中间表中引用关联模型的外键名称" />
      </el-form-item>

      <el-form-item label="当前模型主键" prop="parentKey">
        <el-select v-model="formData.parentKey" filterable clearable allow-create placeholder="选择或输入当前模型主键" class="w-full">
          <el-option v-for="field in availableFields" :key="field" :label="field" :value="field" />
        </el-select>
        <Prompt text="当前模型的主键" />
      </el-form-item>

      <el-form-item label="关联模型主键" prop="relatedKey">
        <el-input v-model="formData.relatedKey" clearable placeholder="关联模型主键" />
        <Prompt text="关联模型的主键" />
      </el-form-item>

      <el-form-item label="关联方法名" prop="relation">
        <el-input v-model="formData.relation" placeholder="例如: roles" clearable />
        <Prompt text="在当前模型中调用的关联方法名称" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useModelRelation } from './useModelRelation'

interface BelongsToManyParams {
  relatedModel: string
  table: string
  foreignPivotKey: string
  relatedPivotKey: string
  parentKey: string
  relatedKey: string
  relation: string
}

// 使用模型关系 hook
const { modules, availableFields, relatedModelFields, handleRelatedModelChange, getPluralRelationName, generatePivotTableName, loadCurrentModelFields } = useModelRelation()

const model = defineModel<BelongsToManyParams>({
  default: () => ({
    relatedModel: '',
    table: '',
    foreignPivotKey: '',
    relatedPivotKey: '',
    parentKey: '',
    relatedKey: '',
    relation: ''
  })
})

const formRef = ref<FormInstance>()

const formData = reactive<BelongsToManyParams>({
  relatedModel: model.value?.relatedModel || '',
  table: model.value?.table || '',
  foreignPivotKey: model.value?.foreignPivotKey || '',
  relatedPivotKey: model.value?.relatedPivotKey || '',
  parentKey: model.value?.parentKey || '',
  relatedKey: model.value?.relatedKey || '',
  relation: model.value?.relation || ''
})

// 关联方法名（复数形式）
const relationName = computed(() => {
  if (!formData.relation) {
    if (!formData.relatedModel) return ''
    return getPluralRelationName(formData.relatedModel)
  }

  return formData.relation
})

// 处理模型变更
const handleModelChange = (modelName: string) => {
  if (!modelName) return

  // 使用 hook 中的方法处理模型变更
  handleRelatedModelChange(modelName, formData, {
    ownerKey: 'relatedKey'
  })

  // 加载当前模型字段
  loadCurrentModelFields(formData, 'parentKey')

  // 自动设置中间表名称
  if (!formData.table) {
    formData.table = ''
    // formData.table = generatePivotTableName(modelName)
  }

  // 自动设置外键
  if (!formData.foreignPivotKey) {
    formData.foreignPivotKey = ''
  }

  // 自动设置关联键
  formData.relatedPivotKey = ''

  // 自动设置关联方法名

  formData.relation = getPluralRelationName(modelName)
}

// 处理关联模型
const handlePivotTable = (modelName: string) => {
  // 使用 hook 中的方法处理模型变更
  handleRelatedModelChange(modelName, formData, {
    ownerKey: 'relatedKey'
  })

  // 加载当前模型字段
  loadCurrentModelFields(formData, 'parentKey')
}

// Laravel belongsToMany validation rules
const rules = reactive<FormRules>({
  relatedModel: [{ required: true, message: '关联模型是必填项', trigger: 'change' }],
  table: [{ required: true, message: '中间表是必填项', trigger: 'change' }],
  foreignPivotKey: [{ required: false, message: '当前模型外键为可选项', trigger: 'change' }],
  relatedPivotKey: [{ required: false, message: '关联模型外键为可选项', trigger: 'change' }],
  parentKey: [{ required: false, message: '当前模型主键为可选项', trigger: 'change' }],
  relatedKey: [{ required: false, message: '关联模型主键为可选项', trigger: 'change' }],
  relation: [{ required: true, message: '关联方法名是必填项', trigger: 'change' }]
})

// 初始化时，如果已有模型，加载其字段
if (formData.relatedModel) {
  handleModelChange(formData.relatedModel)
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

<template>
  <el-form ref="formRef" :model="formData" :rules="rules" label-position="top">
    <el-form-item label="关联模型" prop="relatedModel">
      <el-select v-model="formData.relatedModel" filterable placeholder="选择关联模型" @change="handleModelChange" class="w-full">
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

    <el-form-item label="外键" prop="foreignKey">
      <el-select v-model="formData.foreignKey" filterable allow-create placeholder="选择或输入外键" class="w-full">
        <el-option v-for="field in relatedModelFields" :key="field" :label="field" :value="field" />
      </el-select>
      <Prompt text="默认为当前模型名称加上 _id (如 user_id)" />
    </el-form-item>

    <el-form-item label="本地键" prop="localKey">
      <el-select v-model="formData.localKey" filterable allow-create placeholder="选择或输入本地键" class="w-full">
        <el-option v-for="field in availableFields" :key="field" :label="field" :value="field" />
      </el-select>
      <Prompt text="默认为当前模型的主键 (通常是 id)" />
    </el-form-item>

    <el-form-item label="关联方法名" prop="relation">
      <el-input v-model="formData.relation" placeholder="例如: profile" />
      <Prompt text="在当前模型中调用的关联方法名称" />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useModelRelation } from './useModelRelation'

interface HasOneParams {
  relatedModel: string
  foreignKey: string
  localKey: string
  relation: string
}

// 使用模型关系 hook
const { modules, availableFields, relatedModelFields, handleRelatedModelChange, getSingularRelationName, loadCurrentModelFields } = useModelRelation()

const model = defineModel<HasOneParams>({
  default: () => ({
    relatedModel: '',
    foreignKey: '',
    localKey: '',
    relation: ''
  })
})

const formRef = ref<FormInstance>()

const formData = reactive<HasOneParams>({
  relatedModel: model.value?.relatedModel || '',
  foreignKey: model.value?.foreignKey || '',
  localKey: model.value?.localKey || '',
  relation: model.value?.relation || ''
})

// 关联方法名
const relationName = computed(() => {
  if (!formData.relation) {
    if (!formData.relatedModel) return ''
    return getSingularRelationName(formData.relatedModel)
  }

  return formData.relation
})

// 处理模型变更
const handleModelChange = (modelName: string) => {
  if (!modelName) return

  // 使用 hook 中的方法处理模型变更
  handleRelatedModelChange(modelName, formData, {
    foreignKey: 'foreignKey',
    localKey: 'localKey'
  })

  // 加载当前模型字段
  loadCurrentModelFields(formData, 'localKey')

  // 自动设置关联方法名
  formData.relation = getSingularRelationName(modelName)
}

// Laravel hasOne validation rules
const rules = reactive<FormRules>({
  relatedModel: [{ required: true, message: '关联模型是必填项', trigger: 'change' }],
  foreignKey: [{ required: false, message: '外键为可选项', trigger: 'change' }],
  localKey: [{ required: false, message: '本地键为可选项', trigger: 'change' }],
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

import { ref, inject, computed } from 'vue'
import { useGenerateStore } from '../store'
/**
 * 模型关系 hook，用于处理模型选择和字段更新的通用逻辑
 *
 * @param options 配置选项
 * @returns 返回模型关系相关的状态和方法
 */
export function useModelRelation(
  options: {
    currentModelName?: string // 当前模型名称，如 'App\\Models\\User'
    currentModelShortName?: string // 当前模型简称，如 'user'
  } = { currentModelName: '', currentModelShortName: '' }
) {
  const { currentModelName, currentModelShortName } = options

  // 注入模块数据
  const modules = inject<any[]>('modules', [])
  // 当前模型的字段
  const availableFields = ref<string[]>([])
  // 关联模型的字段
  const relatedModelFields = ref<string[]>([])
  // 中间模型的字段（用于 through 关系）
  const throughModelFields = ref<string[]>([])
  // 目标模型的字段（用于 through 关系）
  const targetModelFields = ref<string[]>([])
  const generateStore = useGenerateStore()
  const structures = computed(() => generateStore.structures)

  structures.value.forEach((structure: any) => {
    availableFields.value.push(structure.field)
  })
  /**
   * 查找模型信息
   * @param modelName 模型全名，如 'App\\Models\\User'
   * @returns 模型信息或 null
   */
  const findModelInfo = (modelName?: string) => {
    if (!modelName) return null
    // @ts-ignore
    for (const module of modules.value) {
      const foundModel = module.models.find((m: any) => m.model === modelName)
      if (foundModel) {
        return foundModel
      }
    }
    return null
  }

  /**
   * 从模型全名中提取简短名称
   * @param modelName 模型全名，如 'App\\Models\\User'
   * @returns 模型简称，如 'user'
   */
  const getModelShortName = (modelName: string) => {
    if (!modelName) return ''

    const modelParts = modelName.split('\\')
    return modelParts[modelParts.length - 1].toLowerCase()
  }

  /**
   * 生成单数形式的关联方法名
   * @param modelName 模型全名
   * @returns 关联方法名（单数）
   */
  const getSingularRelationName = (modelName: string) => {
    return getModelShortName(modelName)
  }

  /**
   * 生成复数形式的关联方法名
   * @param modelName 模型全名
   * @returns 关联方法名（复数）
   */
  const getPluralRelationName = (modelName: string) => {
    const shortName = getModelShortName(modelName)
    return shortName ? shortName : ''
  }

  /**
   * 生成中间表名称
   * @param modelName 关联模型全名
   * @returns 中间表名称
   */
  const generatePivotTableName = (modelName: string) => {
    if (!modelName) return ''

    const relatedModelPart = getModelShortName(modelName)

    // 按字母顺序排序
    const parts = [currentModelShortName, relatedModelPart].sort()
    return parts.join('_')
  }

  /**
   * 处理关联模型变更
   * @param modelName 模型全名
   * @param formData 表单数据对象
   * @param fieldKeys 需要设置的字段键名配置
   */
  const handleRelatedModelChange = (
    modelName: string,
    formData: any,
    fieldKeys: {
      foreignKey?: string
      ownerKey?: string
      localKey?: string
    } = {}
  ) => {
    if (!modelName) return

    const modelInfo = findModelInfo(modelName)
    if (modelInfo) {
      // 更新关联模型字段
      relatedModelFields.value = modelInfo.fields || []
      // 设置默认主键
      if (fieldKeys.ownerKey && !formData[fieldKeys.ownerKey]) {
        formData[fieldKeys.ownerKey] = ''
      }
    }
  }

  /**
   * 处理目标模型变更（用于 through 关系）
   * @param modelName 模型全名
   * @param formData 表单数据对象
   * @param throughModelField 中间模型字段名
   */
  const handleTargetModelChange = (modelName: string, formData: any, throughModelField?: string) => {
    if (!modelName) return

    const modelInfo = findModelInfo(modelName)
    if (modelInfo) {
      // 更新目标模型字段
      targetModelFields.value = modelInfo.fields || []

      // 如果有中间模型，自动设置第二外键
      if (throughModelField && formData[throughModelField] && !formData.secondKey) {
        const throughModelParts = formData[throughModelField].split('\\')
        const throughModelShortName = throughModelParts[throughModelParts.length - 1].toLowerCase()
        formData.secondKey = `${throughModelShortName}_id`
      }
    }
  }

  /**
   * 处理中间模型变更
   * @param modelName 模型全名
   * @param formData 表单数据对象
   * @param options 配置选项
   */
  const handleThroughModelChange = (
    modelName: string,
    formData: any,
    options: {
      targetModelField?: string
      firstKeyField?: string
      secondLocalKeyField?: string
    } = {}
  ) => {
    if (!modelName) return

    const modelInfo = findModelInfo(modelName)
    if (modelInfo) {
      // 更新中间模型字段
      throughModelFields.value = modelInfo.fields || []

      // 自动设置默认值
      if (options.secondLocalKeyField && !formData[options.secondLocalKeyField]) {
        formData[options.secondLocalKeyField] = 'id' // 默认主键
      }

      // 如果有目标模型，自动设置第二外键
      if (options.targetModelField && formData[options.targetModelField] && !formData.secondKey) {
        const shortName = getModelShortName(modelName)
        formData.secondKey = `${shortName}_id`
      }
    }
  }

  /**
   * 加载当前模型的字段
   * @param formData 表单数据对象
   * @param localKeyField 本地键字段名
   */
  const loadCurrentModelFields = (formData: any, localKeyField?: string) => {
    const currentModel = findModelInfo(currentModelName)
    if (currentModel) {
      availableFields.value = currentModel.fields || []
      if (localKeyField && !formData[localKeyField]) {
        formData[localKeyField] = 'id'
      }
    }
  }

  return {
    modules,
    availableFields,
    relatedModelFields,
    throughModelFields,
    targetModelFields,
    findModelInfo,
    getModelShortName,
    getSingularRelationName,
    getPluralRelationName,
    generatePivotTableName,
    handleRelatedModelChange,
    handleTargetModelChange,
    handleThroughModelChange,
    loadCurrentModelFields
  }
}

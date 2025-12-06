<template>
  <div class="flex items-center cursor-pointer gap-x-1" @click="visible = true">
    <div v-if="!relationsData.length" class="flex items-center gap-x-1"><CirclePlus /> <span class="text-indigo-500">添加模型关联关系</span></div>
    <div v-else class="flex items-center gap-x-1"><CirclePlus /> <span class="text-indigo-500">编辑模型关联关系</span></div>
  </div>
  <Dialog v-model="visible" title="模型关联关系" width="1000px" append-to-body>
    <div class="flex justify-end mb-4" v-if="relationsData.length > 0">
      <el-button type="primary" @click="addRelation">新增关联关系</el-button>
    </div>

    <div>
      <div v-if="relationsData.length === 0" class="flex items-center justify-center h-36">
        <el-button type="primary" @click="addRelation">新增关联关系</el-button>
      </div>
      <div class="min-h-96" v-else>
        <el-collapse v-model="activeName" accordion>
          <el-collapse-item :name="key" v-for="(relationData, key) in relationsData" :key="key">
            <template #title>
              <div class="flex items-center gap-x-2"><Delete class="w-4 h-4 hover:text-red-500" @click.once="removeRelation(relationData.index)" />{{ getRelateTitle(relationData.relation) }}</div>
            </template>
            <el-form>
              <el-form-item label="选择关联关系" label-width="120px">
                <el-select v-model="relationData.relation" placeholder="请选择关联关系" filterable clearable>
                  <el-option v-for="item in relations" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
            </el-form>
            <!-- 动态渲染关联组件 -->
            <el-form-item label="选择关联模型" v-if="relationData.relation" label-width="120px">
              <div class="w-full">
                <component :is="relationComponents[relationData.relation]" v-model="relationData.data" />
              </div>
            </el-form-item>
          </el-collapse-item>
        </el-collapse>
      </div>

      <div class="flex justify-end">
        <el-button type="primary" class="mt-4" @click="confirm">确定</el-button>
      </div>
    </div>
  </Dialog>
</template>

<script lang="ts" setup>
// @ts-nocheck
import http from '@/support/http'
import { ref, computed, shallowRef, watch, provide } from 'vue'
import RelationComponents from './relations'
import { CirclePlus, Delete } from '@element-plus/icons-vue'
import type { CollapseIconPositionType } from 'element-plus'
import Message from '@/support/message'

const position = ref<CollapseIconPositionType>('left')

const visible = ref(false)
const activeName = ref(0)
// 定义组件接收的 v-model
const modelValue = defineModel<Array<any>>([])
console.log(modelValue.value)
// 关联类型列表
const relations = [
  {
    label: '一对一',
    value: 'hasOne'
  },
  {
    label: '一对多',
    value: 'hasMany'
  },
  {
    label: '多对一（一对多反向)',
    value: 'belongsTo'
  },
  {
    label: '多对多',
    value: 'belongsToMany'
  },
  {
    label: '远程一对一',
    value: 'hasOneThrough'
  },
  {
    label: '远程一对多',
    value: 'hasManyThrough'
  }
]

const getRelateTitle = (relation: string) => {
  // 根据关联类型获取标题
  const relationItem = relations.find(item => item.value === relation)
  return relationItem ? relationItem.label : '未选关联关系'
}
interface relationData {
  index: number // 关联关系索引
  relation: string // 关联类型
  data: any // 关联数据
}
// 模块接口数据
interface moduleInterface {
  title: string // 模块名称
  models: modelInterface[] // 模块模型数据
}

// 模型结构数据
interface modelInterface {
  model: string // 模型名称
  table: string // 模型对应的 table
  fields: string[] // 模型的字段
}
// 管理关系数组
const relationsData = ref<relationData[]>(modelValue.value || [])
// 关联组件映射
const relationComponents = shallowRef(RelationComponents)
const addRelation = () => {
  let index = 1
  if (relationsData.value.length > 0) {
    index = relationsData.value[relationsData.value.length - 1]['index'] + 1
  }
  console.log(index)
  // 添加新的关联关系
  relationsData.value.push({
    index: index,
    relation: null,
    data: {}
  })
}

/**
 * 移除关联关系
 *
 * @param index
 */
const removeRelation = (index: number) => {
  // 删除指定索引的关联关系，整个重置组织索引
  relationsData.value = relationsData.value.filter(item => item.index !== index)
}
// 获取模型数据
const modules = ref<moduleInterface[]>([])
const getModels = () => {
  http.get('/options/models').then(res => {
    modules.value = res.data.data
  })
}
getModels()
// 提供模块数据给子组件
provide('modules', modules)

// 更新 model value
const confirm = () => {
  if (!isRelationNameUnique(relationsData.value)) {
    return false
  } else {
    modelValue.value = [...relationsData.value]
    visible.value = false
    Message.success('模型关联关系已保存')
  }
}

// 判断关联方法名是否重复
const isRelationNameUnique = (relationName: string) => {
  let relationMethods = []
  let isHasUnique = true
  relationsData.value.forEach(item => {
    if (relationMethods.indexOf(item.data.relation) === -1) {
      relationMethods.push(item.data.relation)
      console.log('添加关联方法名:', item.data.relation)
    } else {
      Message.error(`${item.relation}的模型[ ${item.data.relatedModel} ]的关联方法名 "${item.data.relation}" 重复了，请修改`)
      isHasUnique = false
    }
  })
  return isHasUnique
}

// 监听 v-model 数据，更新
watch(
  () => modelValue.value,
  newVal => {
    if (newVal) {
      relationsData.value = newVal
    }
  },
  { immediate: true, deep: true }
)
</script>

<template>
  <div class="p-10 mx-auto w-full sm:w-3/4">
    <VueDraggable v-model="structures" target=".el-table__body tbody" :animation="150" @end="onEnd">
      <el-table :data="structures" class="w-full draggable" :lazy="false">
        <!-- 字段名称 -->
        <el-table-column prop="field" :label="$t('generate.schema.structure.field_name.name')" align="center">
          <template #default="scope">
            <div v-if="scope.row.isEditing">
              <el-input v-model="scope.row.field" placeholder="字段名称（小写字母开头）" @blur="validateField(scope.row)" @keyup.enter="saveRow(scope.row)" />
            </div>
            <div v-else class="flex overflow-hidden justify-center items-center px-3 py-2 rounded transition-colors duration-200 cursor-pointer min-h-8 hover:bg-gray-50" @click="editRow(scope.row)">
              {{ scope.row.field || '点击编辑' }}
            </div>
          </template>
        </el-table-column>

        <!-- 字段类型 -->
        <el-table-column prop="type" :label="$t('generate.schema.structure.type.name')" align="center">
          <template #default="scope">
            <div v-if="scope.row.isEditing">
              <el-select v-model="scope.row.type" placeholder="选择类型" filterable class="w-full">
                <el-option v-for="item in types" :key="item" :label="item" :value="item" />
              </el-select>
            </div>
            <div v-else class="flex overflow-hidden justify-center items-center px-3 py-2 rounded transition-colors duration-200 cursor-pointer min-h-8 hover:bg-gray-50" @click="editRow(scope.row)">
              <el-tag v-if="scope.row.type" type="success">{{ scope.row.type }}</el-tag>
              <span v-else class="italic text-gray-400">点击选择</span>
            </div>
          </template>
        </el-table-column>

        <!-- 长度 -->
        <el-table-column :label="$t('generate.schema.structure.length')" align="center">
          <template #default="scope">
            <div v-if="scope.row.isEditing">
              <el-input-number v-model="scope.row.length" :min="0" class="w-full" />
            </div>
            <div v-else class="flex overflow-hidden justify-center items-center px-3 py-2 rounded transition-colors duration-200 cursor-pointer min-h-8 hover:bg-gray-50" @click="editRow(scope.row)">
              {{ scope.row.length || '-' }}
            </div>
          </template>
        </el-table-column>

        <!-- 是否为空 -->
        <el-table-column :label="$t('generate.schema.structure.nullable')" align="center">
          <template #default="scope">
            <div v-if="scope.row.isEditing">
              <el-switch v-model="scope.row.nullable" />
            </div>
            <div v-else class="flex overflow-hidden justify-center items-center px-3 py-2 rounded transition-colors duration-200 cursor-pointer min-h-8 hover:bg-gray-50" @click="editRow(scope.row)">
              <el-tag v-if="scope.row.nullable">是</el-tag>
              <el-tag v-else type="info">否</el-tag>
            </div>
          </template>
        </el-table-column>

        <!-- 默认值 -->
        <el-table-column :label="$t('generate.schema.structure.default')">
          <template #default="scope">
            <div v-if="scope.row.isEditing">
              <el-input v-model="scope.row.default" placeholder="默认值" :disabled="scope.row.nullable" />
            </div>
            <div v-else class="flex overflow-hidden justify-center items-center px-3 py-2 rounded transition-colors duration-200 cursor-pointer min-h-8 hover:bg-gray-50" @click="editRow(scope.row)">
              <span class="w-full truncate">{{ scope.row.default || '-' }}</span>
            </div>
          </template>
        </el-table-column>

        <!-- 唯一 -->
        <el-table-column :label="$t('generate.schema.structure.unique')" align="center">
          <template #default="scope">
            <div v-if="scope.row.isEditing">
              <el-switch v-model="scope.row.unique" />
            </div>
            <div v-else class="flex overflow-hidden justify-center items-center px-3 py-2 rounded transition-colors duration-200 cursor-pointer min-h-8 hover:bg-gray-50" @click="editRow(scope.row)">
              <el-tag v-if="scope.row.unique" type="warning">是</el-tag>
              <el-tag v-else type="info">否</el-tag>
            </div>
          </template>
        </el-table-column>

        <!-- 注释 -->
        <el-table-column :label="$t('generate.schema.structure.comment')" align="center">
          <template #default="scope">
            <div v-if="scope.row.isEditing">
              <el-input v-model="scope.row.comment" placeholder="字段注释" />
            </div>
            <div v-else class="flex overflow-hidden justify-center items-center px-3 py-2 rounded transition-colors duration-200 cursor-pointer min-h-8 hover:bg-gray-50" @click="editRow(scope.row)">
              <span class="w-full truncate">{{ scope.row.comment || '点击添加注释' }}</span>
            </div>
          </template>
        </el-table-column>

        <!-- 操作 -->
        <el-table-column :label="$t('generate.schema.structure.operate')" width="120" fixed="right" align="center">
          <template #default="scope">
            <div v-if="scope.row.isEditing">
              <el-button type="success" :icon="Check" @click="saveRow(scope.row)" size="small" />
              <el-button :icon="Close" @click="cancelEdit(scope.row)" size="small" />
            </div>
            <div v-else>
              <el-button type="primary" :icon="Edit" @click="editRow(scope.row)" size="small" />
              <el-button type="danger" :icon="Delete" @click="deleteField(scope.row.id)" size="small" />
            </div>
          </template>
        </el-table-column>
      </el-table>
    </VueDraggable>

    <CommonFieldsPanel :existing-fields="existingFieldNames" @add-field="handleAddCommonField" @add-custom-field="addField" />

    <div class="flex justify-between pl-24 mx-auto mt-4 w-full sm:w-80">
      <el-button @click="emits('prev')">{{ $t('system.prev') }}</el-button>
      <el-button type="primary" @click="next">{{ $t('system.confirm') }}</el-button>
      <router-link to="/develop/schemas">
        <el-button>返回</el-button>
      </router-link>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useSchemaStore, Structure } from '../store'
import { Delete, Plus, Edit, Check, Close } from '@element-plus/icons-vue'
import CommonFieldsPanel from './fieldsPanel.vue'
import Message from '@/support/message'
import http from '@/support/http'
import { Code } from '@/enum/app'
import { VueDraggable } from 'vue-draggable-plus'
import router from '@/router'

const schemaStore = useSchemaStore()
const emits = defineEmits(['prev', 'next'])

// 初始化
const structures = ref(schemaStore.getStructures)

// 计算已存在的字段名列表
const existingFieldNames = computed(() => {
  return structures.value.map(structure => structure.field).filter(Boolean)
})

// 监听 store 变化
watch(
  () => schemaStore.getStructures,
  () => {
    structures.value = schemaStore.getStructures
  }
)

// 默认添加 ID 字段
const addDefaultIdField = () => {
  if (structures.value.length === 0) {
    const defaultIdField = {
      ...schemaStore.initStructure(),
      field: 'id',
      type: 'id',
      length: 0,
      nullable: false,
      unique: false,
      default: '',
      comment: 'ID',
      id: Date.now(),
      isEditing: false,
      isNew: false
    }

    structures.value.push(defaultIdField)
    schemaStore.addStructure(defaultIdField)
  }
}

// 组件挂载时检查是否需要添加默认 ID 字段
onMounted(() => {
  addDefaultIdField()
})

// 处理添加常见字段
const handleAddCommonField = (fieldConfig: any) => {
  const newStructure = {
    ...schemaStore.initStructure(),
    ...fieldConfig,
    id: Date.now(), // 使用时间戳作为临时 ID
    isEditing: false,
    isNew: false
  }

  structures.value.push(newStructure)
  schemaStore.addStructure(newStructure)
}

// 新增字段
const addField = () => {
  const newStructure = {
    ...schemaStore.initStructure(),
    id: Date.now(), // 使用时间戳作为临时 ID
    isEditing: true,
    isNew: true
  }

  structures.value.push(newStructure)
  schemaStore.setStructures(structures.value)
}

// 编辑行
const editRow = (row: Structure & { isEditing?: boolean; originalData?: Structure }) => {
  // 保存原始数据用于取消编辑
  row.originalData = { ...row }
  row.isEditing = true
}

// 保存行
const saveRow = (row: Structure & { isEditing?: boolean; isNew?: boolean; originalData?: Structure }) => {
  // 验证必填字段
  if (!row.field || !row.type) {
    Message.error('字段名称和类型为必填项')
    return
  }

  // 验证字段名格式
  const fieldPattern = /^[a-z][a-z0-9_]*$/
  if (!fieldPattern.test(row.field)) {
    Message.error('字段名必须以小写字母开头，只能包含小写字母、数字和下划线')
    return
  }

  // 验证字段名是否重复
  if (isExistField(row.field, row.id)) {
    Message.error(`${row.field} 已存在，请修改字段名称`)
    return
  }

  // 如果是新增的行，添加到 store
  if (row.isNew) {
    row.id = structures.value.length + 1
    schemaStore.addStructure(row)
    row.isNew = false
  } else {
    // 更新现有行
    schemaStore.addStructure(row)
  }

  row.isEditing = false
  delete row.originalData
}

// 取消编辑
const cancelEdit = (row: Structure & { isEditing?: boolean; isNew?: boolean; originalData?: Structure }) => {
  if (row.isNew) {
    // 如果是新增的行，直接删除
    structures.value = structures.value.filter(item => item.id !== row.id)
    schemaStore.setStructures(structures.value)
  } else {
    // 恢复原始数据
    if (row.originalData) {
      Object.assign(row, row.originalData)
      delete row.originalData
    }
    row.isEditing = false
  }
}

// 验证字段
const validateField = (row: Structure) => {
  if (row.field && isExistField(row.field, row.id)) {
    Message.error(`${row.field} 已存在，请修改字段名称`)
  }
}

// 检查字段是否存在
const isExistField = (field: string, id: number = 0) => {
  const fields: Array<string> = []
  structures.value.forEach((structure: Structure) => {
    if (id > 0) {
      if (structure.id !== id) {
        fields.push(structure.field)
      }
    } else {
      fields.push(structure.field)
    }
  })

  return fields.indexOf(field) !== -1
}

// 删除字段
const deleteField = (id: number) => {
  structures.value = structures.value.filter((s: Structure) => {
    return !(s.id === id)
  })
  schemaStore.setStructures(structures.value)
}

// 下一步
const next = () => {
  if (schemaStore.getStructures.length < 1) {
    Message.error('请先填写表结构数据')
  } else {
    // 检查是否有正在编辑的行
    const editingRow = structures.value.find((row: any) => row.isEditing)
    if (editingRow) {
      Message.error('请先保存正在编辑的字段')
      return
    }

    http.post('schema', schemaStore.$state).then(r => {
      if (r.data.code === Code.SUCCESS) {
        Message.success('创建成功')
        schemaStore.finished()
        router.push('/develop/schemas')
      }
    })
  }
}

// 调整数据结构
const onEnd = () => {
  schemaStore.setStructures(structures.value)
}

// 字段类型选项
const types: string[] = [
  'id',
  'smallIncrements',
  'mediumIncrements',
  'increments',
  'smallInteger',
  'integer',
  'bigIncrements',
  'bigInteger',
  'mediumInteger',
  'unsignedInteger',
  'unsignedMediumInteger',
  'unsignedSmallInteger',
  'unsignedTinyInteger',
  'string',
  'text',
  'binary',
  'boolean',
  'char',
  'dateTimeTz',
  'dateTime',
  'date',
  'decimal',
  'double',
  'float',
  'geometryCollection',
  'geometry',
  'ipAddress',
  'json',
  'jsonb',
  'lineString',
  'longText',
  'macAddress',
  'mediumText',
  'multiLineString',
  'multiPoint',
  'multiPolygon',
  'nullableMorphs',
  'nullableTimestamps',
  'nullableUuidMorphs',
  'point',
  'polygon',
  'timeTz',
  'time',
  'timestampTz',
  'timestamp',
  'timestampsTz',
  'timestamps',
  'tinyIncrements',
  'tinyInteger',
  'tinyText',
  'uuid',
  'year'
]
</script>

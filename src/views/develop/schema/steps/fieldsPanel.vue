<template>
  <div class="mt-6">
    <!-- 常见字段一行靠右 -->
    <div class="flex justify-end">
      <div class="flex flex-wrap gap-2 items-center">
        <span class="mr-2 text-sm font-medium text-gray-700">常见字段</span>
        <el-button size="small" @click="addCommonField('id')">
          <el-icon class="mr-1"><Plus /></el-icon>ID
        </el-button>
        <el-button size="small" @click="addCommonField('status')">
          <el-icon class="mr-1"><Plus /></el-icon>状态
        </el-button>
        <el-button size="small" @click="addCommonField('sort')">
          <el-icon class="mr-1"><Plus /></el-icon>排序
        </el-button>
        <el-button size="small" @click="addCommonField('parent_id')">
          <el-icon class="mr-1"><Plus /></el-icon>父级ID
        </el-button>
        <el-button size="small" @click="addCommonField('user_id')">
          <el-icon class="mr-1"><Plus /></el-icon>用户ID
        </el-button>

        <!-- 自定义添加按钮 -->
        <el-button type="success" size="small" :icon="Plus" @click="$emit('addCustomField')">新增字段</el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Plus } from '@element-plus/icons-vue'
import Message from '@/support/message'

// 定义 emits
const emit = defineEmits<{
  addField: [fieldConfig: any]
  addCustomField: []
}>()

// 定义 props
interface Props {
  existingFields: string[]
}

const props = defineProps<Props>()

// 常见字段配置
const commonFields = {
  id: {
    field: 'id',
    type: 'id',
    length: 0,
    nullable: false,
    unique: false,
    default: '',
    comment: 'ID'
  },
  status: {
    field: 'status',
    type: 'tinyInteger',
    length: 0,
    nullable: false,
    unique: false,
    default: 1,
    comment: '状态:1=启用,2=禁用'
  },
  sort: {
    field: 'sort',
    type: 'integer',
    length: 0,
    nullable: false,
    unique: false,
    default: 0,
    comment: '排序值'
  },
  parent_id: {
    field: 'parent_id',
    type: 'integer',
    length: 0,
    nullable: true,
    unique: false,
    default: 0,
    comment: '父级ID'
  },
  user_id: {
    field: 'user_id',
    type: 'integer',
    length: 0,
    nullable: false,
    unique: false,
    default: '',
    comment: '用户ID'
  }
}

// 添加常见字段
const addCommonField = (fieldType: string) => {
  const fieldConfig = commonFields[fieldType as keyof typeof commonFields]
  if (!fieldConfig) return

  // 检查字段是否已存在
  if (props.existingFields.includes(fieldConfig.field)) {
    Message.error(`字段 ${fieldConfig.field} 已存在`)
    return
  }

  emit('addField', fieldConfig)
}
</script>

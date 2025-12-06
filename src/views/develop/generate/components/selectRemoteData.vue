<template>
  <el-button :type="formData?.table ? 'success' : 'primary'" class="w-24" @click="visible = true">{{ formData?.table ? '编辑数据源' : '新增数据源' }}</el-button>
  <Dialog v-model="visible" append-to-body :destroy-on-close="false" title="选择远程数据源">
    <el-form :model="formData" label-width="120px" class="pr-4" ref="remoteParamsFormRef">
      <el-form-item
        label="数据表"
        prop="table"
        :rules="[
          {
            required: true,
            message: '请选择数据表'
          }
        ]"
      >
        <el-select v-model="formData.table" placeholder="请选择数据表" filterable clearable @change="filterTableFields(formData.table)">
          <el-option v-for="item in tables" :key="item.name" :value="item.name">
            <div class="flex justify-between px-2">
              <span>{{ item.name }}</span>
              <span>
                {{ item.comment }}
              </span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item
        label="Value 字段"
        prop="value"
        :rules="[
          {
            required: true,
            message: '请选择 Value 字段'
          }
        ]"
      >
        <el-select v-model="formData.value" placeholder="请选择 Value 字段" filterable clearable>
          <el-option v-for="field in fields" :key="field" :value="field" :label="field" />
        </el-select>
      </el-form-item>

      <el-form-item
        label="Label 字段"
        prop="label"
        :rules="[
          {
            required: true,
            message: '请选择 Label 字段'
          }
        ]"
      >
        <el-select v-model="formData.label" placeholder="请选择 Label 字段" filterable clearable>
          <el-option v-for="field in fields" :key="field" :value="field" :label="field" />
        </el-select>
      </el-form-item>

      <el-form-item label="父级字段" prop="pid">
        <el-select v-model="formData.pid" placeholder="请选择树形结构父级字段" filterable clearable>
          <el-option v-for="field in fields" :key="field" :value="field" :label="field" />
        </el-select>
      </el-form-item>

      <div class="flex justify-end">
        <el-button type="primary" @click="confirm(remoteParamsFormRef)">{{ $t('system.confirm') }}</el-button>
      </div>
    </el-form>
  </Dialog>
</template>
<script lang="ts" setup>
import Message from '@/support/message'
import { ref, watch } from 'vue'
import type { FormInstance } from 'element-plus'
const remoteParamsFormRef = ref<FormInstance>()

const visible = ref(false)
interface requestParams {
  table: string
  value?: string
  label?: string
  pid?: string
}

const modelValue = defineModel<requestParams>()
const formData = ref<requestParams>({
  table: '',
  value: '',
  label: '',
  pid: ''
})

interface Table {
  name: string
  comment: string
  columns: Array<string>
}
const props = defineProps<{
  tables: Array<Table>
}>()

const fields = ref<Array<string>>([])

const filterTableFields = (tableName: string) => {
  getTableFields(tableName)
  formData.value.value = ''
  formData.value.label = ''
  formData.value.pid = ''
}

// 获取表字段
const getTableFields = (tableName: string) => {
  fields.value = props.tables.find(table => table.name === tableName)?.columns || []
}

const confirm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      modelValue.value = formData.value
      visible.value = false
      Message.success('数据源已添加')
    } else {
      console.log('error submit!', fields)
    }
  })
}

// 监听数据
watch(
  () => modelValue.value,
  newValue => {
    // @ts-ignore
    if (newValue) {
      formData.value = newValue
    }
  },
  { immediate: true, deep: true }
)

watch(
  () => props.tables,
  () => {
    getTableFields(formData.value.table)
  },
  { immediate: true, deep: true }
)
</script>

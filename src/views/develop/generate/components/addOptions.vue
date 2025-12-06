<template>
  <div>
    <el-button @click="visible = true">{{ options.length > 0 ? '编辑选项' : '添加选项' }}</el-button>
    <Dialog width="600px" title="添加选项" v-model="visible" append-to-body>
      <Arrays v-model="options" keyField="label" valueField="value" keyLabel="Label" valueLabel="值" :showPreview="true" />
      <!--<arrays v-model="userData" :columns="columns" :defaultItem="defaultUser" />-->
      <div class="flex justify-end">
        <el-button type="primary" class="mt-4" @click="confirm">确定</el-button>
      </div>
    </Dialog>
  </div>
</template>
<script lang="ts" setup>
// @ts-nocheck
import Message from '@/support/message'
import { ref } from 'vue'

const modelValue = defineModel<Array<any> | Object>({
  default: () => []
})
/** 
const columns = [
  { label: '姓名', prop: 'name', width: '150px' },
  { label: '性别', prop: 'gender', width: '100px' },
  { label: '年龄', prop: 'age', width: '80px' },
  { label: '成绩', prop: 'score', flex: 1 }
]

// 定义新增项的默认值
const defaultUser = {
  name: '',
  gender: '男',
  age: '',
  score: ''
}

// 初始数据
const userData = ref([
  { name: '张三', gender: '男', age: '23', score: '80' },
  { name: '李四', gender: '男', age: '26', score: '90' }
])*/
const options = ref(modelValue.value || [])
const visible = ref(false)
const confirm = () => {
  if (!isDuplicate()) {
    return false
  } else {
    modelValue.value = options.value
    visible.value = false
  }
}

// 判断 options 的 label 或者 value 是否重复
const isDuplicate = () => {
  const values: string[] = []
  const labels: string[] = []
  let hasDuplicate = true
  // @ts-ignore
  options.value.forEach((option: any) => {
    if (option.value) {
      if (values.includes(option.value)) {
        Message.error(`值 "${option.value}" 已经存在`)
        hasDuplicate = false
      } else {
        values.push(option.value)
      }
    }
    if (option.label) {
      if (labels.includes(option.label)) {
        Message.error(`Label 值"${option.label}" 已经存在`)

        hasDuplicate = false
      } else {
        labels.push(option.label)
      }
    }
  })

  return hasDuplicate
}
</script>

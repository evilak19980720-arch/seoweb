<template>
  <div>
    <el-popover placement="right" :width="400" trigger="click">
      <template #reference>
        <el-input v-model="icon" name="icon" clearable :placeholder="placeholder">
          <template #prefix>
            <Icon :name="icon" className="w-5 h-5" v-if="icon" />
          </template>
        </el-input>
      </template>
      <div>
        <Icons v-model="icon" @close="closeSelectIcon" />
      </div>
    </el-popover>
  </div>
</template>
<script lang="ts" setup>
import { useOpen } from '@/composables/curd/useOpen'

const { visible } = useOpen()
// 关闭选择 icon
const closeSelectIcon = () => {
  visible.value = false
}

defineProps({
  title: {
    type: String,
    default: '选择图标'
  },
  placeholder: {
    type: String,
    require: false
  }
})
// 定义文件 v-model
const icon = defineModel({
  type: String,
  default: '',
  required: true
})
</script>

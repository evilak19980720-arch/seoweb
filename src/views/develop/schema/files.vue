<template>
  <div>
    <el-tabs v-model="activeName">
      <el-tab-pane label="控制器文件" name="controller">
        <Code :code="files.controller_file" lang="php" v-model="files.controller_file" :filepath="files.controller_path" />
      </el-tab-pane>
      <el-tab-pane label="模型文件" name="model">
        <Code :code="files.model_file" lang="php" v-model="files.model_file" :filepath="files.model_path" />
      </el-tab-pane>
      <el-tab-pane label="请求文件" name="request">
        <Code :code="files.request_file" lang="php" v-model="files.request_file" :filepath="files.request_path" />
      </el-tab-pane>
      <el-tab-pane label="前端 table 文件" name="table">
        <Code :code="files.table_file" lang="javascript" v-model="files.table_file" :filepath="files.table_path" />
      </el-tab-pane>
      <el-tab-pane label="前端 form 文件" name="form">
        <Code :code="files.form_file" lang="javascript" v-model="files.form_file" :filepath="files.form_path" />
      </el-tab-pane>
    </el-tabs>

    <div class="flex justify-center w-full mt-5">
      <el-button type="primary" @click="save()">保存</el-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import http from '@/support/http'
import Message from '@/support/message'

const props = defineProps({
  schema_id: {
    type: Number,
    default: null
  }
})

const files = ref({
  controller_file: '',
  model_file: '',
  request_file: '',
  table_file: '',
  form_file: '',
  controller_path: '',
  model_path: '',
  request_path: '',
  table_path: '',
  form_path: ''
})

const activeName = ref('controller')
const show = () => {
  http.get(`schema/files/${props.schema_id}`).then(r => {
    Object.assign(files.value, r.data.data)
  })
}
onMounted(() => {
  show()
})

const save = () => {
  http.put(`schema/files/${props.schema_id}`, files).then(r => {
    show()
    Message.success('保存成功')
  })
}
</script>

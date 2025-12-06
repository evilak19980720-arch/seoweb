<template>
  <div>
    <catch-table
      :columns="[
        {
          prop: 'module',
          label: '所属模块'
        },
        {
          prop: 'name',
          label: 'schema名称'
        },
        {
          slot: 'columns',
          label: '字段'
        },
        {
          slot: 'soft_delete',
          label: '?软删'
        },
        {
          prop: 'created_at',
          label: '创建时间'
        },
        {
          type: 'operate',
          label: '操作',
          update: false
        }
      ]"
      :api="api"
      :search-form="[
        {
          type: 'input',
          label: '模块名称',
          name: 'module'
        },
        {
          type: 'input',
          label: 'Schema 名称',
          name: 'name'
        }
      ]"
      ref="tableRef"
      destroy-confirm="确认删除吗? 删除后数据表将会保留，如需删除相关表，请手动进行删除!"
      :operation="false"
    >
      <template #operation>
        <router-link to="/develop/schema/create">
          <Add />
        </router-link>
        <el-button @click="existSchemaVisible = true">选择已有表</el-button>
      </template>
      <template #columns="scope">
        <el-button size="small" type="success" @click="view(scope.row.id)">
          <Icon name="eye" class="mr-1 w-3" />
          查看
        </el-button>
      </template>
      <template #soft_delete="scope">
        <el-tag v-if="scope.row.is_soft_delete">是</el-tag>
        <el-tag type="danger" v-else>否</el-tag>
      </template>
      <template #_operate="scope">
        <router-link :to="'/develop/generate/' + scope.row.id">
          <el-button type="warning" size="small" text><Icon name="wrench-screwdriver" class="mr-1 w-3" /> 生成代码</el-button>
        </router-link>
        <el-button type="primary" @click="viewFiles(scope.row.id)" size="small" text>文件列表</el-button>
      </template>

      <!-- 弹出层 
      <template #dialog>
        <Create :api="api" />
      </template>-->
    </catch-table>
    <!-- schema 表结构 -->
    <Dialog v-model="schemaVisible" title="Schema 结构" width="650px" destroy-on-close>
      <Show :id="id" :api="api" />
    </Dialog>

    <!-- 文件弹出层 -->
    <Dialog v-model="fileVisible" title="文件列表" width="1200px" destroy-on-close>
      <Files :schema_id="schemaId" />
    </Dialog>

    <!-- 从已有 Schema 选择 -->
    <Dialog v-model="existSchemaVisible" title="选择已有表" width="650px" destroy-on-close>
      <addExistSchema :api="api" @close="closeExistSchemaVisible" />
    </Dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import Create from './create.vue'
import Show from './show.vue'
import addExistSchema from './addExistSchema.vue'
import Files from './files.vue'

const schemaVisible = ref<boolean>(false)
const existSchemaVisible = ref<boolean>(false)
const fileVisible = ref<boolean>(false)

const api = 'schema'

const id = ref()
const schemaId = ref()
// 查看表结构
const view = (primaryId: number | string) => {
  schemaVisible.value = true

  id.value = primaryId
}
// 查看文件列表
const viewFiles = (primaryId: number | string) => {
  fileVisible.value = true
  schemaId.value = primaryId
}
const tableRef = ref()
const closeExistSchemaVisible = () => {
  existSchemaVisible.value = false
  tableRef.value.reset()
}
</script>

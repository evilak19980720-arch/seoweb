<template>
  <div>
    <VueDraggable v-model="sortStructures" target=".el-table__body tbody" :animation="150" @end="onEnd">
      <el-table :data="structures">
        <el-table-column prop="field" :label="$t('generate.schema.structure.field_name.name')" width="200">
          <template #default="scope">
            <div class="flex items-center gap-x-1"><Rank class="w-4 h-4" /> {{ scope.row.field }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="label" :label="$t('generate.schema.structure.form_label')" width="250">
          <template #default="scope">
            <el-input v-model="scope.row.label" />
          </template>
        </el-table-column>
        <el-table-column prop="label" :label="$t('generate.schema.structure.form_component')">
          <template #default="scope">
            <div class="grid items-center grid-cols-2 gap-x-2">
              <Select :options="formComponents" v-model="scope.row.form_component" placeholder="选择组件" :key="formComponentKey" />

              <div class="flex items-center gap-x-2" v-if="scope.row.form_component === 'enum'">
                <Select :options="dictionaries" v-model="scope.row.dictionary" placeholder="选择字典" />
                <div class="w-12 text-indigo-700">
                  <router-link to="/system/dictionary">新增</router-link>
                </div>
              </div>

              <SelectRemoteData v-if="scope.row.form_component && isRemoteComponent(scope.row.form_component)" :tables="tables" v-model="scope.row.remote_data_params" />

              <addOptions v-model="scope.row.options" v-if="scope.row.form_component && isOptionsComponent(scope.row.form_component)" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="list" :label="$t('generate.schema.structure.render')" align="center">
          <template #default="scope">
            <el-checkbox v-model="scope.row.list" :label="$t('generate.schema.structure.list')" size="large" />
            <el-checkbox v-model="scope.row.form" :label="$t('generate.schema.structure.form')" size="large" />
            <el-checkbox v-model="scope.row.export" :label="$t('generate.schema.structure.export')" size="large" />
            <el-checkbox v-model="scope.row.import" :label="$t('generate.schema.structure.import')" size="large" />
          </template>
        </el-table-column>
        <el-table-column prop="search_op" :label="$t('generate.schema.structure.search_op.name')" width="180">
          <template #default="scope">
            <el-select v-model="scope.row.search_op" :placeholder="$t('generate.schema.structure.search_op.placeholder')" class="w-full">
              <el-option v-for="op in operates" :key="op" :label="op" :value="op" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="validates" :label="$t('generate.schema.structure.rules.name')">
          <template #default="scope">
            <el-select v-model="scope.row.validates" :placeholder="$t('generate.schema.structure.rules.placeholder')" multiple filterable allow-create clearable class="w-full">
              <el-option v-for="validate in validates" :key="validate" :label="validate" :value="validate" />
            </el-select>
          </template>
        </el-table-column>
        <!--<el-table-column prop="comment" label="注释" />-->
        <el-table-column prop="id" :label="$t('generate.schema.structure.operate')" width="180">
          <template #default="scope">
            <el-button type="danger" :icon="Delete" @click="deleteField(scope.row.field)" size="small" />
          </template>
        </el-table-column>
      </el-table>
    </VueDraggable>
  </div>
</template>
<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useGenerateStore, Structure } from './store'
import { Delete, Rank } from '@element-plus/icons-vue'
import http from '@/support/http'
import { VueDraggable } from 'vue-draggable-plus'
import SelectRemoteData from './selectRemoteData.vue'
import addOptions from './addOptions.vue'

const generateStore = useGenerateStore()
const dictionaries = ref()
const structures = computed(() => {
  return generateStore.getStructures
})
const codeGen = computed(() => {
  return generateStore.getCodeGen
})
// 排序结构
const sortStructures = ref<Structure[]>([])

const deleteField = (field: string) => {
  generateStore.filterStructures(field)
}
const operates: string[] = ['=', '!=', '>', '>=', '<', '<=', 'like', 'RLike', 'LLike', 'in']
const validates: string[] = [
  'required',
  'integer',
  'numeric',
  'string',
  'timezone',
  'url',
  'uuid',
  'date',
  'alpha',
  'alpha_dash',
  'alpha_num',
  'boolean',
  'email',
  'image',
  'file',
  'ip',
  'ipv4',
  'ipv6',
  'mac_address',
  'json',
  'nullable',
  'present',
  'prohibited'
]
const formComponents = ref([])
const formComponentKey = ref(0)
// 数据表数据
const tables = ref([])
// 获取表单组件
const getFormComponents = () => {
  http.get('options/formComponent').then(r => {
    formComponentKey.value++
    formComponents.value = r.data.data
  })
}

// 获取表数据
const getTablesFields = () => {
  http.get('options/tableFields').then(r => {
    tables.value = r.data.data
  })
}

watch(
  () => codeGen.value.dymaic,
  () => {
    generateStore.resetFormComponents()
    http.get('options/formComponent', { dymaic: codeGen.value.dymaic ? 1 : 0 }).then(r => {
      formComponentKey.value++
      formComponents.value = r.data.data
    })
  }
)

// 监听导入导出
watch(
  () => codeGen.value.operations,
  newValue => {
    structures.value.forEach((structure: any) => {
      structure.export = newValue?.includes('export')
    })

    structures.value.forEach((structure: any) => {
      structure.import = newValue?.includes('import')
    })

    console.log(newValue)
  }
)

// 是否是远程组件
const isRemoteComponent = (nama: string) => {
  // 以 remote 为开头
  return nama.startsWith('remote')
}

// 是否是 options 组件
const isOptionsComponent = (nama: string) => {
  // 以 options 为开头
  return ['select', 'radio', 'switch', 'checkbox'].indexOf(nama) !== -1
}
// 调整数据结构
const onEnd = () => {
  console.log(sortStructures.value)
  generateStore.setStructures(sortStructures.value)
}

onMounted(() => {
  http.get('options/Dictionaries').then(r => {
    dictionaries.value = r.data.data
  })
  getFormComponents()
  getTablesFields()
})
watch(
  () => structures.value,
  newValue => {
    sortStructures.value = newValue
  },
  { deep: true }
)
</script>

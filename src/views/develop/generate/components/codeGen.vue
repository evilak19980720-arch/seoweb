<template>
  <el-card class="box-card" shadow="never">
    <template #header>
      <div>
        <span>{{ $t('generate.code.title') }}</span>
      </div>
    </template>
    <div class="w-full sm:w-[40%] mx-auto">
      <el-form :model="gen" ref="form" label-width="100px">
        <el-form-item
          :label="$t('generate.code.module.name')"
          prop="module"
          :rules="[
            {
              required: true,
              message: $t('generate.code.module.verify')
            }
          ]"
        >
          <Select v-model="gen.module" clearable :placeholder="$t('generate.code.module.placeholder')" api="modules" class="w-full" filterable />
        </el-form-item>
        <el-form-item
          :label="$t('generate.code.controller.name')"
          prop="controller"
          :rules="[
            {
              required: true,
              message: $t('generate.code.controller.verify')
            }
          ]"
        >
          <el-input v-model="gen.controller" clearable :placeholder="$t('generate.code.controller.placeholder')" />
        </el-form-item>
        <el-form-item :label="$t('generate.code.model.name')" prop="model" :rules="[{ required: true, message: '请输入模型名称' }]">
          <el-input v-model="gen.model" clearable :placeholder="$t('generate.code.model.placeholder')">
            <template #append>
              <selectRelations v-model="gen.relations" />
            </template>
          </el-input>
        </el-form-item>
        <!-- 菜单名称 -->
        <el-form-item :label="$t('generate.code.menu.name')" prop="menu">
          <el-input v-model="gen.menu" clearable :placeholder="$t('generate.code.menu.placeholder')" />
        </el-form-item>
        <el-form-item :label="$t('generate.code.operation.name')" prop="operations">
          <el-checkbox-group v-model="gen.operations">
            <el-checkbox
              v-for="item in [
                { label: $t('generate.code.operation.export'), value: 'export' },
                { label: $t('generate.code.operation.import'), value: 'import' }
              ]"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
              {{ item.label }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <div class="flex">
          <el-form-item :label="$t('generate.code.paginate.name')" prop="paginate">
            <el-switch v-model="gen.paginate" inline-prompt :active-text="$t('system.yes')" :inactive-text="$t('system.no')" />
          </el-form-item>
          <el-form-item label-width="15px">
            <div class="text-sm text-gray-300">{{ $t('generate.code.paginate.placeholder') }}</div>
          </el-form-item>
          <el-form-item :label="$t('generate.code.gen.form')" prop="form" label-width="150px">
            <el-switch v-model="gen.form" inline-prompt :active-text="$t('system.yes')" :inactive-text="$t('system.no')" />
          </el-form-item>
          <el-form-item :label="$t('generate.code.gen.dymaic')" prop="dymaic" label-width="150px" v-if="false">
            <el-switch v-model="gen.dymaic" inline-prompt :active-text="$t('system.yes')" :inactive-text="$t('system.no')" />
          </el-form-item>
          <el-form-item :label="$t('generate.code.gen.dialogForm')" prop="dialogForm" v-if="gen.dymaic">
            <el-switch v-model="gen.dialogForm" inline-prompt :active-text="$t('system.yes')" :inactive-text="$t('system.no')" />
          </el-form-item>
        </div>
      </el-form>
    </div>
    <Structure />
    <div class="flex justify-center pt-5 w-full">
      <router-link to="/develop/schemas">
        <el-button>{{ $t('system.back') }}</el-button>
      </router-link>
      <el-button type="primary" @click="submitGenerate(form)" class="ml-5">{{ $t('system.finish') }}</el-button>
    </div>
  </el-card>
</template>
<script lang="ts" setup>
// @ts-nocheck
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useGenerateStore } from './store'
import type { FormInstance } from 'element-plus'
import http from '@/support/http'
import Structure from './structure.vue'
import { useRouter } from 'vue-router'
import { Code } from '@/enum/app'
import selectRelations from './selectRelations.vue'

const generateStore = useGenerateStore()
const gen = computed(() => {
  return generateStore.getCodeGen
})
const rendering = ref<boolean>(true) // 是否显示结构化表单
const router = useRouter()
const relations = ref([]) // 关联关系
const schemaId = router.currentRoute.value.params.schema

generateStore.updateSchemaData(schemaId)
/**onMounted(() => {
  if (!generateStore.getSchemaId) {
    generateStore.setSchemaId(schemaId)
    getSchema()
  } else {
    if (schemaId !== generateStore.getSchemaId) {
      generateStore.setSchemaId(schemaId)
      generateStore.resetStructures()
      getSchema()
    }
  }
})*/

const form = ref<FormInstance>()
const submitGenerate = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.validate(valid => {
    if (valid) {
      http.post('generate', generateStore.$state).then(r => {
        if (r.data.code === Code.SUCCESS) {
          generateStore.$reset()
        }
      })
      // emits('next')
    } else {
      return false
    }
  })
}
</script>

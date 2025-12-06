<template>
  <div>
    <div class="flex flex-col justify-center p-10 mt-5 w-full bg-white item-center dark:bg-regal-dark">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/develop/schemas' }">Schema 管理</el-breadcrumb-item>
        <el-breadcrumb-item>创建 Schema</el-breadcrumb-item>
      </el-breadcrumb>
      <el-steps :active="currentStep" align-center class="mt-10">
        <el-step title="Schema 配置" />
        <el-step title="字段结构" />
      </el-steps>

      <Schema v-if="currentStep === 0" @next="nextStep" />
      <Structure v-if="currentStep === 1" @prev="prevStep" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import Schema from './steps/schemaInline.vue'
import Structure from './steps/structureInline.vue'
import { useSchemaStore } from './store'

const schemaStore = useSchemaStore()

const currentStep = ref(0)

const nextStep = () => {
  currentStep.value = 1
}

const prevStep = () => {
  currentStep.value = 0
}

schemaStore.start()
</script>

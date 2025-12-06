<template>
  <div class="flex flex-col justify-center py-10 pl-5 pr-5 bg-white rounded gap-y-10 dark:bg-regal-dark">
    <div class="flex flex-col gap-y-5">
      <h2>表格操作按钮组</h2>
      <div>
        <Add />
        <Update />
        <Destroy />
        <show />
      </div>
    </div>

    <div class="flex flex-col gap-y-5">
      <h2>地区选择器</h2>
      <Area />
    </div>

    <div class="flex flex-col gap-y-5">
      <h2>状态切换</h2>
      <Status v-model="status" api="" />
      <Prompt text="状态组件主要用于表格列表数据快速切换，需要设置对应 api" />
    </div>

    <div class="flex flex-col gap-y-5">
      <h2>头像</h2>
      <Cavatar />
    </div>

    <div class="flex flex-col gap-y-5">
      <h2>弹窗</h2>
      <Dialog v-model="visible" title="测试">
        <div>这里是内容</div>
      </Dialog>
      <div>
        <Add text="打开" @click="visible = true" />
      </div>
    </div>

    <div class="flex flex-col gap-y-5">
      <h2>快速选择</h2>
      <div>
        <Select api="dataRange" v-model="datarange" />
      </div>
    </div>
    <div class="flex flex-col gap-y-5">
      <h2>待补充</h2>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
const status = ref(1)
const visible = ref(false)
const datarange = ref(null)
</script>

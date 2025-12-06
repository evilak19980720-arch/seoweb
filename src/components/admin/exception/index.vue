<template>
  <el-drawer v-model="appStore.isExceptionShow" direction="btt" size="60%" :show-close="true">
    <template #default>
      <div class="w-full m-auto xl:w-2/3" v-if="appStore.exceptions.trace.length > 0">
        <div class="w-full px-4 py-10 xl:w-2/3">
          <div class="text-base">⚠️ 错误信息</div>
          <span class="text-xl">{{ appStore.exceptions.message }}</span>
        </div>
        <div class="flex p-2 pl-4 gap-x-10">
          <div class="flex flex-col overflow-auto gap-y-3 max-h-[45rem] left-files w-[40rem]">
            <div
              @click="scrollToLine(getUniqueElementName(t.file, t.line, k), k)"
              :class="'w-full px-4 py-8 text-base break-words rounded-lg cursor-pointer bg-slate-100' + (k === defaultChecked ? ' border-l-4 border-red-500' : '')"
              v-for="(t, k) in appStore.exceptions.trace"
              :key="k"
            >
              {{ t.file }} : <span class="text-sm">{{ t.line }}</span>
            </div>
          </div>
          <div class="flex flex-col overflow-auto h-[45rem] left-content">
            <div :id="getUniqueElementName(t.file, t.line, k)" class="h-[45rem] p-5" v-for="(t, k) in appStore.exceptions.trace" :key="k">
              <div class="font-mono text-xl" v-if="t.file">{{ t.file }}</div>
              <div class="min-w-0 h-[40rem] p-5 flex flex-col bg-slate-200 mt-5 rounded-2xl text-lg pl-10 justify-center overflow-auto">
                <div v-for="(c, k) in t.content" :key="k" :class="'flex h-10 rounded  ' + (c.line === t.line ? 'text-red-500' : '')">
                  <div class="flex pt-2 pl-2 font-mono">
                    <span v-if="c.line === t.line">👉️</span> <span v-else>{{ c.line }}</span>
                  </div>
                  <pre class="w-full px-5 pt-2 font-mono text-left" v-html="c.content"></pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="w-full m-auto xl:w-2/3" v-else v-html="appStore.getServerPring"></div>
    </template>
  </el-drawer>
</template>
<script lang="ts" setup>
// @ts-nocheck
import { useAppStore } from '@/stores/modules/app'
import { ref } from 'vue'
const appStore = useAppStore()
const defaultChecked = ref(0)
const scrollToLine = (id: string, k) => {
  const lineElement = document.getElementById(`${id}`)
  if (lineElement) {
    lineElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  defaultChecked.value = k
}

// 获取唯一的 element name
const getUniqueElementName = (file: string, line: number, k: number) => {
  return file + '_' + line + '_' + k
}
</script>
<style scope>
.el-drawer__header {
  display: none;
}
.left-files::-webkit-scrollbar {
  display: none; /* Safari and Chrome */
}
.left-files {
  -ms-overflow-style: none; /* Internet Explorer 10+ */
  scrollbar-width: none; /* Firefox */
}
.left-content::-webkit-scrollbar {
  display: none; /* Safari and Chrome */
}
.left-content {
  -ms-overflow-style: none; /* Internet Explorer 10+ */
  scrollbar-width: none; /* Firefox */
}

pre {
  margin-left: 0 !important;
  text-align: left;
}
</style>

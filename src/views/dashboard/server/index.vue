<template>
  <div>
    <Server />

    <Info />
    <!--<Introduce class="grid col-span-2" />-->

    <div class="grid grid-cols-1 gap-4 mt-3 md:grid-cols-2">
      <Introduce />
      <el-card shadow="never">
        <template #header>
          <div class="flex flex-row justify-between">
            <span class="text-lg">项目动态</span>
          </div>
        </template>
        <ul>
          <li class="flex pt-2 border-b border-b-slate-200 dark:border-b-slate-700">
            <div><el-avatar src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" /></div>
            <div class="flex flex-col ml-4">
              <div class="text">JaguarJack 提交一个 PR</div>
              <div class="mt-1 mb-2 text-sm text-gray-400">1 小时前</div>
            </div>
          </li>
          <li class="flex pt-2 border-b border-b-slate-200 dark:border-b-slate-700">
            <div><el-avatar src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" /></div>
            <div class="flex flex-col mt-1 ml-4">
              <div>JaguarJack 关闭了一个 Issue</div>
              <div class="mt-1 mb-2 text-sm text-gray-400">2 小时前</div>
            </div>
          </li>
          <li class="flex pt-2 border-b border-b-slate-200 dark:border-b-slate-700">
            <div><el-avatar src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" /></div>
            <div class="flex flex-col mt-1 ml-4">
              <div>JaguarJack 提交新的 commit</div>
              <div class="mt-1 mb-2 text-sm text-gray-400">24 小时前</div>
            </div>
          </li>
          <li class="flex pt-2 border-b border-b-slate-200 dark:border-b-slate-700">
            <div><el-avatar src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" /></div>
            <div class="flex flex-col mt-1 ml-4">
              <div>JaguarJack 创建了一个 new project</div>
              <div class="mt-1 mb-2 text-sm text-gray-400">2021.10.26</div>
            </div>
          </li>
        </ul>
      </el-card>
    </div>
  </div>
</template>
<script lang="ts" setup>
import Introduce from './introduce.vue'
import Server from './server.vue'
import Info from './info.vue'
</script>

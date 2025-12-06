<template>
  <div class="w-full">
    <el-card shadow="never">
      <template #header>
        <div class="flex flex-row justify-between">
          <span class="text-lg">项目基于</span>
        </div>
      </template>
      <div class="grid grid-cols-1 gap-1 sm:grid-cols-3">
        <el-card shadow="hover">
          <div class="flex justify-between">
            <Vue class="w-10 h-10" />
            <div class="text-lg">
              <el-link href="https://cn.vuejs.org/" target="_blank" underline="hover"><el-button type="success" size="small">GO</el-button></el-link>
            </div>
          </div>
          <div class="pt-2 text-sm text-gray-400">渐进式 JavaScript 框架 易学易用，性能出色，适用场景丰富的 Web 前端框架Go</div>
        </el-card>
        <el-card shadow="hover">
          <div class="flex justify-between">
            <Laravel class="w-10 h-10" />
            <div class="text-lg">
              <el-link href="https://learnku.com/docs/laravel" target="_blank" underline="hover"><el-button type="danger" size="small">GO</el-button></el-link>
            </div>
          </div>
          <div class="pt-2 text-sm text-gray-400">Laravel 是一个具有表现力、优雅语法的 Web 应用程序框架</div>
        </el-card>
        <el-card shadow="hover">
          <div class="flex justify-between">
            <Element class="w-10 h-10" />
            <div class="text-lg">
              <el-link href="https://element-plus.org/" target="_blank" underline="hover"><el-button type="primary" size="small">GO</el-button></el-link>
            </div>
          </div>
          <div class="pt-2 text-sm text-gray-400">Element Plus 基于 Vue3，面向设计师和开发者的组件库</div>
        </el-card>
        <el-card shadow="hover">
          <div class="flex justify-between">
            <Tailwindcss class="w-10 h-10" />
            <div class="text-lg">
              <el-link href="https://tailwindcss.com/" target="_blank" underline="hover"><el-button size="small">GO</el-button></el-link>
            </div>
          </div>
          <div class="pt-2 text-sm text-gray-400">Tailwind CSS 是一个功能类优先的 CSS 框架，无需离开您的HTML，即可快速建立现代网站</div>
        </el-card>
        <el-card shadow="hover">
          <div class="flex justify-between">
            <Composer class="w-10 h-10" />
            <div class="text-lg">
              <el-link href="https://getcomposer.org/" target="_blank" underline="hover"><el-button type="info" size="small">GO</el-button></el-link>
            </div>
          </div>
          <div class="pt-2 text-sm text-gray-400">Composer 是 PHP 中用于依赖管理的工具。它允许您声明项目所依赖的库，并将为您管理（安装/更新）它们。</div>
        </el-card>
        <el-card shadow="hover">
          <div class="flex justify-between">
            <Vite class="w-10 h-10" />
            <div class="text-lg">
              <el-link href="https://cn.vitejs.dev/" target="_blank" underline="hover"><el-button type="warning" size="small">Go</el-button></el-link>
            </div>
          </div>
          <div class="pt-2 text-sm text-gray-400">Vite 下一代的前端工具链 为开发提供极速响应</div>
        </el-card>
      </div>
    </el-card>
  </div>
</template>
<script lang="ts" setup>
// @ts-ignores
import Laravel from '~icons/logos/laravel'
// @ts-ignores
import Vue from '~icons/logos/vue'
// @ts-ignores
import Vite from '~icons/logos/vitejs'
// @ts-ignores
import Element from '~icons/logos/element'
// @ts-ignores
import Composer from '~icons/logos/composer'
// @ts-ignores
import Tailwindcss from '~icons/logos/tailwindcss-icon'
</script>

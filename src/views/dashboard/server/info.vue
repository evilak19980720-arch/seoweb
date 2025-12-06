<template>
  <div class="grid grid-cols-1 gap-4 mt-3 md:grid-cols-3">
    <div class="flex flex-col p-3 bg-white dark:divide-gray-500 divide-y rounded dark:bg-regal-dark">
      <h1 class="flex text-xl dark:text-gray-200">服务器信息</h1>
      <div class="flex items-center justify-between h-12 px-2 mt-3">
        <div class="dark:text-gray-200">操作系统</div>
        <el-tag>{{ info?.server.server_os }}</el-tag>
      </div>
      <div class="flex items-center justify-between h-12 px-2">
        <div class="dark:text-gray-200">PHP 版本</div>
        <el-tag>{{ info?.server.version }}</el-tag>
      </div>
      <div class="flex items-center justify-between h-12 px-2">
        <div class="dark:text-gray-200">Web Server</div>
        <el-tag>{{ info?.server.server_software }}</el-tag>
      </div>
      <div class="flex items-center justify-between h-12 px-2">
        <div class="dark:text-gray-200">数据库版本</div>
        <el-tag>{{ info?.server.database }}</el-tag>
      </div>
      <div class="flex items-center justify-between h-12 px-2">
        <div class="dark:text-gray-200">Host</div>
        <el-tag>{{ info?.server.host }}</el-tag>
      </div>
      <div class="flex items-center justify-between h-12 px-2">
        <div class="dark:text-gray-200">支持最大内存</div>
        <el-tag>{{ info?.server.memory_limit }}</el-tag>
      </div>
      <div class="flex items-center justify-between h-12 px-2">
        <div class="dark:text-gray-200">最大执行时间</div>
        <el-tag>{{ info?.server.max_execution_time }}</el-tag>
      </div>
      <div class="flex items-center justify-between h-12 px-2">
        <div class="dark:text-gray-200">上传文件大小</div>
        <el-tag>{{ info?.server.upload_max_filesize }}</el-tag>
      </div>
      <div class="flex items-center justify-between h-12 px-2">
        <div class="dark:text-gray-200">SSL 是否安装</div>
        <el-tag>{{ info?.server.ssl_installed }}</el-tag>
      </div>
      <div class="flex items-center justify-between h-12 px-2">
        <div class="dark:text-gray-200">Openssl 是否安装</div>
        <el-tag>{{ info?.server.openssl }}</el-tag>
      </div>
      <div class="flex items-center justify-between h-12 px-2">
        <div class="dark:text-gray-200">PDO 是否安装</div>
        <el-tag>{{ info?.server.pdo }}</el-tag>
      </div>
      <!--<div class="flex items-center justify-between h-12 px-2">
        <div class="dark:text-gray-200">Tokenizer 是否安装</div>
        <el-tag>{{ info?.server.tokenizer }}</el-tag>
      </div>-->
    </div>

    <div class="flex flex-col p-3 bg-white dark:divide-gray-500 divide-y rounded dark:bg-regal-dark">
      <h1 class="text-xl dark:text-gray-200">项目信息</h1>
      <div class="flex items-center justify-between h-12 px-2 mt-3">
        <div class="dark:text-gray-200">Laravel 版本</div>
        <el-tag>{{ info?.laravel.version }}</el-tag>
      </div>
      <div class="flex items-center justify-between h-12 px-2">
        <div class="dark:text-gray-200">CatchAdmin 版本</div>
        <el-tag>{{ info?.laravel.catchadmin }}</el-tag>
      </div>
      <div class="flex items-center justify-between h-12 px-2">
        <div class="dark:text-gray-200">时区</div>
        <el-tag>{{ info?.laravel.timezone }}</el-tag>
      </div>
      <div class="flex items-center justify-between h-12 px-2">
        <div class="dark:text-gray-200">是否开启调试模式</div>
        <el-tag>{{ info?.laravel.debug_mode }}</el-tag>
      </div>
      <div class="flex items-center justify-between h-12 px-2">
        <div class="dark:text-gray-200">Storage 目录可写?</div>
        <el-tag>{{ info?.laravel.storage_dir_writable }}</el-tag>
      </div>
      <div class="flex items-center justify-between h-12 px-2">
        <div class="dark:text-gray-200">Cache 目录可写?</div>
        <el-tag>{{ info?.laravel.cache_dir_writable }}</el-tag>
      </div>
      <div class="flex items-center justify-between h-12 px-2">
        <div class="dark:text-gray-200">缓存驱动</div>
        <el-tag>{{ info?.laravel.cache_driver }}</el-tag>
      </div>
      <div class="flex items-center justify-between h-12 px-2">
        <div class="dark:text-gray-200">Session 驱动</div>
        <el-tag>{{ info?.laravel.session_driver }}</el-tag>
      </div>
      <div class="flex items-center justify-between h-12 px-2">
        <div class="dark:text-gray-200">Laravel 项目大小</div>
        <el-tag>{{ info?.laravel.app_size }}</el-tag>
      </div>
      <div class="flex items-center justify-between h-12 px-2">
        <div class="dark:text-gray-200">Laravel 依赖大小</div>
        <el-tag>{{ info?.laravel.vendor_size }}</el-tag>
      </div>
      <div class="flex items-center justify-between h-12 px-2">
        <div class="dark:text-gray-200">前端项目大小</div>
        <el-tag>{{ info?.laravel.web_size }}</el-tag>
      </div>
    </div>

    <div class="flex flex-col p-3 bg-white dark:divide-gray-500 divide-y rounded dark:bg-regal-dark" v-loading="loading">
      <h1 class="mb-3 text-xl dark:text-gray-200">项目依赖</h1>
      <div class="flex items-center justify-between h-10 px-2" v-for="(value, key) in info?.packages" :key="key">
        <div class="text-sm dark:text-gray-200">{{ key }}</div>
        <el-tag>{{ value }}</el-tag>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import http from '@/support/http'
import { ref } from 'vue'
interface server {
  host: string
  version: string
  server_software: string
  server_os: string
  database: string
  memory_limit: string
  max_execution_time: string
  upload_max_filesize: string
  database_connection_name: string
  ssl_installed: boolean
  openssl: boolean
  pdo: boolean
  mbstring: boolean
  tokenizer: boolean
  xml: boolean
}

interface laravel {
  version: string
  catchadmin: string
  timezone: string
  debug_mode: boolean
  storage_dir_writable: boolean
  cache_dir_writable: boolean
  cache_driver: string
  session_driver: string
  app_size: string
  vendor_size: string
  web_size: string
}

interface info {
  server: server
  laravel: laravel
  packages: Object
}

const info = ref<info>()
const loading = ref(false)
const getServerInfo = () => {
  loading.value = true
  http
    .get('server/info')
    .then(r => {
      info.value = r.data.data
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
}

getServerInfo()
</script>

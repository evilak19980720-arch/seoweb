<template>
  <div class="p-5 mx-auto max-w-4xl">
    <h2 class="pb-3 mb-8 text-3xl font-bold text-gray-800 border-b-2 border-blue-500">分片上传示例</h2>

    <!-- v-model使用示例 -->
    <div class="p-6 mb-8 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h3 class="mb-4 text-xl font-semibold text-gray-700">v-model获取文件路径</h3>
      <p class="mb-4 text-sm text-gray-600">使用v-model可以直接获取上传成功后的文件路径：</p>

      <ChunkUpload v-model="uploadedFilePath" action="/upload/chunk" />

      <div v-if="uploadedFilePath" class="p-3 mt-4 text-sm bg-green-50 rounded border border-green-200">
        <div class="font-medium text-green-800">✅ 文件上传成功！</div>
        <div class="text-green-600">文件路径: {{ uploadedFilePath }}</div>
      </div>
    </div>

    <!-- 基本使用示例 -->
    <div class="p-6 mb-8 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h3 class="mb-4 text-xl font-semibold text-gray-700">基本使用（简洁模式）</h3>
      <p class="mb-4 text-sm text-gray-600">默认只显示进度条，不显示分片技术细节：</p>

      <ChunkUpload action="/upload/chunk" @upload-success="handleSuccess" @upload-error="handleError" />
    </div>

    <!-- 显示分片信息示例 -->
    <div class="p-6 mb-8 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h3 class="mb-4 text-xl font-semibold text-gray-700">显示分片信息（调试模式）</h3>
      <p class="mb-4 text-sm text-gray-600">如需查看详细的分片上传进度，可开启分片信息显示：</p>

      <ChunkUpload action="/upload/chunk" :show-chunk-info="true" @upload-success="handleDebugSuccess" @upload-error="handleDebugError" />
    </div>

    <!-- 自定义配置示例 -->
    <div class="p-6 mb-8 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h3 class="mb-4 text-xl font-semibold text-gray-700">自定义配置</h3>
      <p class="mb-4 text-sm text-gray-600">可以配置文件大小限制、分片大小、文件类型等：</p>

      <ChunkUpload
        action="/upload/chunk"
        :chunk-size="5 * 1024 * 1024"
        :max-file-size="500 * 1024 * 1024"
        accept=".pdf,.doc,.docx,.zip,.rar"
        disk="documents"
        path="large-files"
        @upload-success="handleCustomSuccess"
        @upload-error="handleCustomError"
      />
    </div>

    <!-- 程序化控制示例 -->
    <div class="p-6 mb-8 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h3 class="mb-4 text-xl font-semibold text-gray-700">程序化控制</h3>
      <p class="mb-4 text-sm text-gray-600">可以通过代码控制文件上传：</p>

      <div class="flex gap-3 mb-4">
        <input ref="fileInputRef" type="file" class="hidden" @change="handleFileSelect" />
        <el-button @click="selectFile" type="primary">选择文件</el-button>
        <el-button @click="clearFiles" type="warning">清除文件</el-button>
      </div>

      <ChunkUpload ref="programmaticUploadRef" action="/upload/chunk" @upload-success="handleProgrammaticSuccess" @upload-error="handleProgrammaticError" />
    </div>

    <!-- 上传记录 -->
    <div class="p-6 bg-gray-50 rounded-lg border border-gray-200">
      <h3 class="mb-4 text-xl font-semibold text-gray-700">上传记录</h3>
      <div v-if="uploadRecords.length === 0" class="py-8 text-center text-gray-500">暂无上传记录</div>
      <div v-else class="space-y-3">
        <div
          v-for="(record, index) in uploadRecords"
          :key="index"
          class="flex justify-between items-center p-4 bg-white rounded border"
          :class="{
            'border-green-200 bg-green-50': record.status === 'success',
            'border-red-200 bg-red-50': record.status === 'error'
          }"
        >
          <div>
            <div class="font-medium text-gray-800">{{ record.fileName }}</div>
            <div class="text-sm text-gray-500">{{ record.time }} - {{ record.type }}</div>
          </div>
          <div class="flex gap-2 items-center">
            <el-icon v-if="record.status === 'success'" class="text-green-500"><Check /></el-icon>
            <el-icon v-else class="text-red-500"><Close /></el-icon>
            <span
              class="text-sm"
              :class="{
                'text-green-600': record.status === 'success',
                'text-red-600': record.status === 'error'
              }"
            >
              {{ record.status === 'success' ? '上传成功' : '上传失败' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 代码示例 -->
    <div class="p-6 mt-8 text-gray-100 bg-gray-900 rounded-lg">
      <h3 class="mb-4 text-xl font-semibold text-white">使用代码示例</h3>
      <pre class="overflow-x-auto text-sm"><code>&lt;template&gt;
  &lt;!-- v-model获取文件路径（推荐） --&gt;
  &lt;ChunkUpload v-model="filePath" action="/upload/chunk" /&gt;
  &lt;div v-if="filePath"&gt;文件路径: \{\{ filePath \}\}&lt;/div&gt;

  &lt;!-- 最简单的使用方式（默认简洁模式） --&gt;
  &lt;ChunkUpload
    action="/upload/chunk"
    @upload-success="handleSuccess"
    @upload-error="handleError"
  /&gt;

  &lt;!-- 显示分片信息（调试模式） --&gt;
  &lt;ChunkUpload
    action="/upload/chunk"
    :show-chunk-info="true"
    @upload-success="handleSuccess"
    @upload-error="handleError"
  /&gt;

  &lt;!-- 带配置的使用方式 --&gt;
  &lt;ChunkUpload
    v-model="customFilePath"
    action="/upload/chunk"
    :chunk-size="5 * 1024 * 1024"     &lt;!-- 5MB分片 --&gt;
    :max-file-size="100 * 1024 * 1024" &lt;!-- 最大100MB --&gt;
    accept=".pdf,.doc,.docx"           &lt;!-- 限制文件类型 --&gt;
    disk="documents"                   &lt;!-- 存储磁盘 --&gt;
    path="uploads/large-files"         &lt;!-- 存储路径 --&gt;
    @upload-success="handleSuccess"
    @upload-error="handleError"
  /&gt;
&lt;/template&gt;

&lt;script setup&gt;
import { ref } from 'vue'
import ChunkUpload from '@/components/admin/upload/ChunkUpload.vue'

// v-model绑定的文件路径
const filePath = ref('')
const customFilePath = ref('')

const handleSuccess = (response) =&gt; {
  console.log('上传成功:', response)
}

const handleError = (error) =&gt; {
  console.error('上传失败:', error)
}
&lt;/script&gt;</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElIcon } from 'element-plus'

// v-model示例
const uploadedFilePath = ref<string>('')
import { Check, Close } from '@element-plus/icons-vue'
import ChunkUpload from '@/components/admin/upload/ChunkUpload.vue'

// 引用
const programmaticUploadRef = ref()
const fileInputRef = ref<HTMLInputElement>()

// 上传记录
interface UploadRecord {
  fileName: string
  type: string
  status: 'success' | 'error'
  time: string
  message?: string
}

const uploadRecords = ref<UploadRecord[]>([])

// 添加上传记录
function addRecord(fileName: string, type: string, status: 'success' | 'error', message?: string) {
  const now = new Date()
  const timeString = now.toLocaleString()

  uploadRecords.value.unshift({
    fileName: fileName || '未知文件',
    type,
    status,
    time: timeString,
    message
  })

  // 限制记录数量
  if (uploadRecords.value.length > 10) {
    uploadRecords.value = uploadRecords.value.slice(0, 10)
  }
}

// 基本使用的回调
function handleSuccess(response: any) {
  console.log('基本上传成功:', response)
  addRecord(response.fileName || '未知文件', '基本上传', 'success')
}

function handleError(error: string) {
  console.error('基本上传失败:', error)
  addRecord('未知文件', '基本上传', 'error', error)
}

// 显示分片信息的回调
function handleDebugSuccess(response: any) {
  console.log('调试模式上传成功:', response)
  addRecord(response.fileName || '未知文件', '调试模式', 'success')
}

function handleDebugError(error: string) {
  console.error('调试模式上传失败:', error)
  addRecord('未知文件', '调试模式', 'error', error)
}

// 自定义配置的回调
function handleCustomSuccess(response: any) {
  console.log('自定义上传成功:', response)
  addRecord(response.fileName || '未知文件', '自定义配置', 'success')
}

function handleCustomError(error: string) {
  console.error('自定义上传失败:', error)
  addRecord('未知文件', '自定义配置', 'error', error)
}

// 程序化控制的回调
function handleProgrammaticSuccess(response: any) {
  console.log('程序化上传成功:', response)
  addRecord(response.fileName || '未知文件', '程序化控制', 'success')
}

function handleProgrammaticError(error: string) {
  console.error('程序化上传失败:', error)
  addRecord('未知文件', '程序化控制', 'error', error)
}

// 程序化控制方法
function selectFile() {
  fileInputRef.value?.click()
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0 && programmaticUploadRef.value) {
    programmaticUploadRef.value.uploadFile(files[0])
  }
}

function clearFiles() {
  if (programmaticUploadRef.value) {
    programmaticUploadRef.value.clearFiles()
  }
}
</script>

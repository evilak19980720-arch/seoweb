<template>
  <div class="flex gap-x-2">
    <div class="w-1/4 pr-3 bg-white dark:bg-regal-dark">
      <div class="flex justify-between pt-3 pb-3 pl-3 pr-2 text-gray-500 border-b border-gray-200 border-solid">
        <div>附件分类</div>
        <div>
          <Icon name="plus" className="w-5 h-5 text-gray-500 cursor-pointer" @click="categoryVisible = true" />
        </div>
      </div>
      <div class="mt-3 pl-6 text-sm text-[#606266] cursor-pointer w-full hover:bg-[#f5f7fa] pt-1 pb-1" @click="searchCategory('')">全部</div>
      <el-tree class="mt-1" :data="categories" node-key="id" default-expand-all :expand-on-click-node="false" :props="{ label: 'title', chilren: 'children' }">
        <template #default="{ node, data }">
          <div class="flex justify-between w-full">
            <div @click="searchCategory(data.id)" class="w-2/3">{{ node.label }}</div>
            <div class="flex items-center justify-center w-1/3 pr-2">
              <Icon name="pencil" className="w-5 h-5 p-1 text-gray-500 cursor-pointer mr-1 border border-solid rounded-full" @click="updateCategory(data.title, data.id, data.parent_id)" />
              <Icon name="plus" className="w-5 h-5 p-1 text-gray-500 cursor-pointer mr-1 border border-solid rounded-full" @click="addCategory('', data.id)" />
              <Icon name="trash" className="w-5 h-5 p-1 text-red-600 cursor-pointer border border-solid rounded-full" @click="delCategory(data.id)" />
            </div>
          </div>
        </template>
      </el-tree>
    </div>

    <div class="w-3/4">
      <div>
        <div class="flex justify-between">
          <uploadAttachment :api="api" :categoryId="categoryId" @refresh="afterUpload" />
          <div class="w-3/5">
            <el-input v-model="query.filename" placeholder="文件名称">
              <template #append>
                <el-button :icon="Search" @click="getAttachments" />
              </template>
            </el-input>
          </div>
        </div>
        <div v-if="!attachments.length">
          <el-empty description="暂无数据" />
        </div>
        <div class="grid grid-cols-6 gap-4 mt-2 h-60" v-else>
          <div v-for="(attachment, k) in attachments" :key="k" class="relative group w-28 h-28">
            <div v-if="attachment.mimetype.indexOf('image') !== -1" class="w-full h-full p-1 bg-[#f5f7fa]" @click="selectAttachment(attachment.path)">
              <el-image class="w-full h-full rounded-lg cursor-pointer" :src="attachment.path" :zoom-rate="1.2" fit="cover" />
            </div>
            <div v-else class="h-full cursor-pointer">
              <div class="flex flex-col items-end justify-center w-full h-full break-all" @click="selectAttachment(attachment.path)">
                <div class="flex justify-center w-full text-center">
                  <el-icon><Document class="w-10 h-10" /></el-icon>
                </div>
                <div>
                  {{ getFilename(attachment.path) }}
                </div>
              </div>
            </div>
            <!-- 删除 -->
            <div
              @click="delAttachment(attachment.id)"
              class="w-5 h-5 z-50 bg-[#f5f7fa] rounded-full border border-solid border-gray-300 justify-center -top-2 -right-2 absolute leading-4 cursor-pointer hidden group-hover:flex"
            >
              x
            </div>
            <!-- 遮罩 -->
            <div
              class="z-[100] w-full h-full flex justify-center items-center bg-gray-100 opacity-60 absolute top-0 cursor-pointer"
              v-if="selectedAttachments.indexOf(attachment.path) > -1"
              @click="selectAttachment(attachment.path)"
            >
              <Icon name="check-circle" className="w-16 h-16 text-green-900" />
            </div>
          </div>
        </div>
        <!-- 分页 -->
        <div class="flex justify-between mt-5">
          <el-pagination
            background
            layout="prev, pager, next"
            :current-page="page"
            :page-size="limit"
            @current-change="changePage"
            @size-change="changeLimit"
            :total="+total"
            :page-sizes="[12, 16, 20]"
          />
          <el-button type="primary" @click="confirmSelect">确定</el-button>
        </div>
      </div>
    </div>
    <!-- 分类 弹窗-->
    <Dialog v-model="categoryVisible" title="分类" destroy-on-close width="400">
      <div>
        <el-input v-model="categoryData.title" placeholder="请输入附件分类名称" show-word-limit maxlength="20" />
      </div>
      <div class="flex justify-end mt-5">
        <el-button type="primary" @click="addAttachmentCategory">确定</el-button>
      </div>
    </Dialog>
  </div>
</template>

<script lang="ts" setup>
// @ts-nocheck
import http from '@/support/http'
import uploadAttachment from './components/uploadAttachment.vue'
import { onMounted, ref } from 'vue'
import Message from '@/support/message'
import { Search, Document } from '@element-plus/icons-vue'
import { unique, getFilename } from '@/support/helper'
const api = 'system/attachments'
const attachmentCategoryApi = 'system/attachment/category'

// const attachments = ref<Array<any>>([])
const page = ref<number>(1)
const limit = ref<number>(12)
const total = ref<number>()
const selectedAttachments = ref<Array<string>>([])
const attachments = ref<Array<any>>([])
const attachmentsModel = defineModel({
  type: Array<string>,
  default: [],
  require: true
})
const props = defineProps({
  multi: {
    type: Boolean,
    default: false
  }
})

const emits = defineEmits(['closeDialog'])

// 获取附件
const getAttachments = () => {
  http.get(api, query.value).then(r => {
    attachments.value = r.data.data
    page.value = r.data.page
    total.value = parseInt(r.data.total)
    limit.value = r.data.limit
  })
}

// 选择附件
const selectAttachment = (path: string) => {
  if (props.multi) {
    if (selectedAttachments.value.indexOf(path) === -1) {
      selectedAttachments.value.push(path)
    } else {
      selectedAttachments.value = selectedAttachments.value.filter(item => {
        return item !== path
      })
    }
  } else {
    selectedAttachments.value[0] = path
  }
}

const confirmSelect = () => {
  if (selectedAttachments.value.length === 0) {
    Message.error('请先选择附件')
  } else {
    attachmentsModel.value = props.multi ? unique(attachmentsModel.value.concat(selectedAttachments.value)) : selectedAttachments.value
    selectedAttachments.value = []
    emits('closeDialog')
  }
}
const categories = ref()
const categoryVisible = ref(false)
const categoryId = ref<number>(0)

const query = ref<{ category_id: number | string; filename: string; page: number; limit: number }>({
  page: page.value,
  limit: limit.value,
  category_id: '',
  filename: ''
})

const searchCategory = (id: number | string) => {
  query.value.category_id = id
  categoryId.value = parseInt(id) as number
  getAttachments()
}
const changeLimit = (limit: number) => {
  query.value.limit = limit
  getAttachments()
}

const changePage = (page: number) => {
  query.value.page = page
  getAttachments()
}

const delAttachment = (id: number) => {
  Message.confirm('确定删除该附件吗?', () => {
    http.delete(api + '/' + id).then(r => {
      Message.success(r.data.message)
      getAttachments()
    })
  })
}

// 上传之后
const afterUpload = () => {
  getAttachments()
}

// 分类操作
interface categoryInterface {
  parent_id: number
  title: string
  id: number
}
const categoryData = ref<categoryInterface>({
  title: '',
  parent_id: 0,
  id: 0
})
// 获取分类
const getAttachmentCategory = () => {
  http.get('system/attachment/category').then(r => {
    categories.value = r.data.data
  })
}

// 新增分类
const addCategory = (title: string = '', parentId: number = 0) => {
  categoryData.value.title = title
  categoryData.value.parent_id = parentId
  categoryVisible.value = true
}
// 更新分类
const updateCategory = (title: string, id: number, parentId: number) => {
  categoryData.value.title = title
  categoryData.value.parent_id = parentId
  categoryData.value.id = id
  categoryVisible.value = true
}

// 删除分类
const delCategory = (id: number) => {
  Message.confirm('确定删除该附件分类吗?', () => {
    http.delete(attachmentCategoryApi + '/' + id).then(r => {
      getAttachmentCategory()
    })
  })
}
// 请求后台
const addAttachmentCategory = () => {
  if (!categoryData.value.title) {
    Message.error('请先输入分类名称')
  } else {
    if (categoryData.value.id) {
      http.put(attachmentCategoryApi + '/' + categoryData.value.id, { title: categoryData.value.title, parent_id: categoryData.value.parent_id }).then(r => {
        categoryVisible.value = false
        getAttachmentCategory()
        categoryData.value.title = ''
        categoryData.value.parent_id = 0
        categoryData.value.id = 0
      })
    } else {
      http.post(attachmentCategoryApi, { title: categoryData.value.title, parent_id: categoryData.value.parent_id }).then(r => {
        categoryVisible.value = false
        getAttachmentCategory()
        categoryData.value.title = ''
        categoryData.value.parent_id = 0
      })
    }
  }
}

onMounted(() => {
  getAttachmentCategory()
  getAttachments()
})
</script>
<style scoped>
:deep(.el-tree-node) {
  @apply mt-2;
}
</style>

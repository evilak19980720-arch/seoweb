<!--
 - 数据表格
 - 二次封装 ElementPlus 表格
 - author JaguarJack
 - 仅限 pro 试用
-->
<template>
  <div>
    <div v-if="searchFields.length > 0 && showSearch" class="flex flex-wrap gap-5 pt-5 pr-5 pb-5 pl-5 bg-white dark:bg-regal-dark">
      <csearch :fields="searchFields" @search="doSearch" @reset="reset" ref="csearchRef" :loading="loading" />
      <slot name="csearch" />
    </div>
    <slot name="middle" />
    <div class="pr-5 pb-5 pl-5 mt-3 bg-white dark:bg-regal-dark" :style="{ height: height }" ref="catch-table">
      <!-- 表格头部 -->
      <div class="pt-5 h-16" v-if="showHeader">
        <!-- 多选 -->
        <div v-if="multiSelectIds.length > 0" class="flex justify-between">
          <div class="flex pt-2 text-sm text-slate-400"><Icon name="check" class="mr-2" /> 已选 {{ multiSelectIds.length }} 条数据</div>
          <div class="flex gap-2">
            <!--批量操作的插槽-->
            <slot name="multiOperate" />
            <!-- 批量恢复 -->
            <el-button v-if="isHasTrash()" @click="restore(props.api, multiSelectIds.join(','))" type="success" plain size="small">
              <Icon name="arrow-uturn-left" className="w-4 h-4 mr-1" /> 恢复
            </el-button>
            <!-- 批量删除 -->
            <el-button v-if="multiDelShow" @click="destroy(props.api, multiSelectIds.join(','), isHasTrash() ? true : false)" type="danger" plain size="small">
              <Icon name="trash" className="w-4 h-4 mr-1" />删除
            </el-button>
          </div>
        </div>
        <!-- 正常头部 -->
        <div class="flex flex-row justify-between" v-else>
          <div class="flex gap-x-2">
            <!-- 新增 -->
            <Add @click="openDialog" v-if="operation" v-action="permissionAction('store')" />
            <!-- 回收站 -->
            <el-button v-if="trash" @click="getTrash" type="success"> <Icon name="trash" className="w-4 h-4 mr-1" /> 回收站</el-button>
            <!-- 导出 -->
            <Export :api="api" :exportUrl="exportUrl" v-action="permissionAction('export')" :query="queryStore.getTableQuery" v-if="exports" />
            <!-- 导入 -->
            <Import :action="importUrl" v-if="importUrl" v-action="permissionAction('import')" @afterImport="reset()" />
            <!-- 动态左侧操作插槽 -->
            <Action v-if="action?.operation" :action="action?.operation" :scope="null" />
            <!-- 左侧操作插槽 -->
            <slot name="operation" />
          </div>
          <!---表头 tools-->
          <div class="flex flex-row justify-end w-1/3 tools" v-if="showTools">
            <!-- 刷新 仅刷新当前页数据 -->
            <el-button text circle @click="csearchRef ? doSearch() : reset()">
              <el-icon><RefreshRight /></el-icon>
            </el-button>
            <!-- 密度 -->
            <el-button text circle>
              <el-dropdown size="small" @command="setTableSize">
                <el-icon><More /></el-icon>
                <template #dropdown>
                  <el-dropdown-menu class="mt-2 w-20">
                    <el-dropdown-item command="large" :class="{ 'is-active': tableSize === 'large' }">宽松</el-dropdown-item>
                    <el-dropdown-item command="default" divided>默认</el-dropdown-item>
                    <el-dropdown-item command="small" divided>紧凑</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-button>
            <!-- 栏目 -->
            <el-button text circle>
              <el-popover placement="bottom" :width="100" trigger="hover" title="列设置">
                <template #reference>
                  <Icon name="squares-plus" className="w-4 h-4" />
                </template>
                <template #default>
                  <div v-for="column in tableColumns" :key="column.prop">
                    <el-checkbox v-model="column.show" v-if="!column.type || column.type === 'operate'">
                      {{ column.label }}
                    </el-checkbox>
                  </div>
                </template>
              </el-popover>
            </el-button>
            <el-button @click="showSearch = !showSearch" text circle>
              <Icon name="magnifying-glass" className="w-4 h-4" />
            </el-button>
          </div>
        </div>
      </div>
      <div class="mt-3" :style="{ height: 'auto' }">
        <el-table
          v-loading="loading"
          v-bind="$attrs"
          :data="tableData"
          :row-key="rowKey"
          ref="catchtable"
          :height="height"
          :size="tableSize"
          :border="border"
          :empty-text="emptyText"
          :summary-method="summaryMethod"
          :span-method="spanMethod"
          :default-sort="sort"
          @sort-change="customSortChange"
          @filter-change="filterChange"
          @selection-change="multiSelect"
          class="catchtable"
        >
          <!-- 无数据展示 -->
          <template #empty>
            <div>{{ emptyText }}</div>
          </template>
          <!-- column 展示 -->
          <template v-for="(column, index) in tableColumns" :key="index">
            <!--- selection | expand -->
            <el-table-column
              v-if="column.show && (column.type === 'selection' || column.type === 'expand')"
              :type="column.type"
              :prop="column.prop"
              :label="column.label"
              :width="column.width"
              :min-width="column['min-width']"
              :align="column.align"
              :fixed="column.fixed"
            >
              <template #default="scope" v-if="column.slot">
                <slot :name="column.slot" v-bind="scope" />
              </template>
            </el-table-column>
            <!--- type === index -->
            <el-table-column
              v-if="column.show && column.type === 'index'"
              :type="column.type"
              :prop="column.prop"
              :label="column.label"
              :width="column.width"
              :min-width="column['min-width']"
              :align="column.align"
              :index="column.index"
              :fixed="column.fixed"
            />
            <!--- type === operate -->
            <el-table-column
              v-if="column.show && column.type === 'operate'"
              :label="column.label"
              :width="column.width"
              :min-width="column['min-width']"
              :align="column.align"
              :fixed="column.fixed"
            >
              <template #default="scope">
                <Action v-if="action?.prepend" :action="action?.prepend" :scope="scope" />
                <slot name="_operate" v-bind="scope" />
                <Update v-if="column.update && !isHasTrash()" @click="openDialog(scope.row)" v-action="permissionAction('update')" />
                <Restore v-if="isHasTrash() && trash" @click="restore(api, scope.row[primaryName])" v-action="permissionAction('restore')" />
                <Destroy v-if="column.destroy" @click="destroy(api, scope.row[primaryName], isHasTrash() ? true : false)" v-action="permissionAction('destroy')" />
                <Action v-if="action?.append" :action="action?.append" :scope="scope" />
                <slot name="operate" v-bind="scope" />
              </template>
            </el-table-column>
            <!--- 多级表头 || normal -->
            <tcolumns :column="column" v-if="column.show && !column.type" :api="api" @refresh="doSearch()">
              <template v-for="slot in Object.keys($slots)" #[slot]="scope: Record<string, any>">
                <slot :name="slot" v-bind="scope" />
              </template>
            </tcolumns>
          </template>
        </el-table>
      </div>
      <!--- 分页 -->
      <div v-if="showPaginate()">
        <el-pagination
          background
          :layout="layout"
          :current-page="page"
          :page-size="limit"
          @current-change="changePage"
          @size-change="changeLimit"
          :total="+total"
          :page-sizes="limits"
          class="flex justify-end mt-5"
        />
      </div>
      <Dialog v-model="visible" :title="title" destroy-on-close :width="dialogWidth" :height="dialogHeight">
        <slot name="dialog" v-bind="row" />
      </Dialog>
    </div>
  </div>
</template>

<script lang="ts" setup>
// @ts-nocheck
import { reactive, ref, computed, onMounted, provide, watch, nextTick } from 'vue'
import tcolumns from './tcolumns.vue'
// import ctcolumns from './ctcolumns'
import { Column, SItem } from './ctable'
import csearch from './csearch.vue'
import { isBoolean } from '@/support/helper'
import useSearch from './useSearch'
import { useDestroy } from '@/composables/curd/useDestroy'
import { useRestore } from '@/composables/curd/useRestore'
import { More, RefreshRight } from '@element-plus/icons-vue'
import { useQueryStore } from './useQueryStore'
import Action from './components/tableAction/index.vue'
// define props
const props = defineProps({
  // 请求接口
  api: {
    type: String,
    default: null
  },
  // 高度
  height: {
    type: [String, Number],
    default: () => {
      return 'auto'
    }
  },
  border: {
    type: Boolean,
    default: true
  },
  // table 的尺寸 'large', 'default', 'small'
  size: {
    type: String,
    default: 'default'
  },
  // 行数据的 Key，用来优化 Table 的渲染
  rowKey: {
    type: [String, Function],
    default: ''
  },
  // 空数据显示文本
  emptyText: {
    type: String,
    default: () => {
      return '暂无数据'
    }
  },
  // 自定义的合计计算方法 function({ columns, data })
  summaryMethod: {
    type: Function,
    default: () => {
      return null
    }
  },
  // 合并行或列的计算方法 function({ row, column, rowIndex, columnIndex })
  spanMethod: {
    type: Function,
    default: () => {
      return null
    }
  },

  // 分页设置
  pagination: {
    type: Boolean,
    default: true
  },
  // 每页显示数量
  limit: {
    type: Number,
    default: 10
  },
  // 页码
  page: {
    type: Number,
    default: 1
  },
  // 显示数量集合
  limits: {
    type: Array,
    default: () => {
      return [10, 20, 30, 40, 50]
    }
  },
  layout: {
    type: String,
    default: () => {
      return 'total,sizes,prev, pager,next'
    }
  },
  // 表格列设置
  columns: {
    type: Array<Column>,
    default: () => {
      return []
    }
  },
  // 排序
  sort: {
    type: Object,
    default: () => {
      return { order: '' }
    }
  },
  // 排序事件
  sortChange: {
    type: Function,
    default: null
  },
  // 筛选事件
  filterChange: {
    type: Function,
    default: null
  },
  searchForm: {
    type: Array<SItem>,
    default: () => {
      return []
    }
  },
  operation: {
    type: Boolean,
    default: true
  },
  showTools: {
    type: Boolean,
    default: true
  },
  primaryName: {
    type: String,
    default: 'id'
  },
  // 默认参数
  defaultParams: {
    type: Object,
    default: () => {
      return {}
    }
  },
  // 删除确认提示语
  destroyConfirm: {
    type: String,
    default: '确定删除吗'
  },
  dialogWidth: {
    type: String,
    default: ''
  },
  dialogHeight: {
    type: String,
    default: ''
  },
  exports: {
    type: Boolean,
    default: false
  },
  exportUrl: {
    type: String,
    default: ''
  },
  importUrl: {
    type: String,
    default: ''
  },
  searchable: {
    type: Boolean,
    default: true
  },
  // 回收站配置
  trash: {
    type: Boolean,
    default: false
  },
  // 批量删除是否展示
  multiDelShow: {
    type: Boolean,
    default: true
  },
  defaultMultiSelection: {
    type: Array<String | Number>,
    default: []
  },
  showHeader: {
    type: Boolean,
    default: true
  },
  // 动态插槽，专门提供给 APi 使用
  action: {
    type: Object,
    default: () => ({})
  },
  // 权限前缀，使用模块+控制器
  permission: {
    type: [String, null],
    default: () => {
      return null
    }
  }
})

// table 对象
const catchtable = ref()
const row = ref()
// search 对象
const csearchRef = ref()
// 搜索
const searchFields = ref<Array<any>>(props.searchForm)
const queryStore = useQueryStore()

// 显示分页
const showPaginate = () => {
  if (props.rowKey) {
    return false
  }

  return props.pagination
}

// eslint-disable-next-line vue/no-dupe-keys
const { limit, page, total, changeLimit, changePage, doSearch, reset, loading, data, getTableData } = useSearch(props.api, showPaginate(), props.limit, props.page)

// init query
queryStore.initQuery(showPaginate() ? { page: page.value, limit: limit.value } : {})

// 多选 ID
const multiSelectIds = ref<Array<string | number>>([])
// 获取 table data
const tableData = computed(() => data.value?.data)
// 表格 columns
const tableColumns = ref<Array<Column>>([])

// 初始化 columns
const initColumns = () => {
  props.columns.forEach(c => {
    // 默认显示
    c.show = isBoolean(c.show) ? c.show : true
    // 更新操作和删除操作
    if (c.type === 'operate') {
      c.update = isBoolean(c.update) ? c.update : true
      c.destroy = isBoolean(c.destroy) ? c.destroy : true
    }

    tableColumns.value.push(reactive(c))
  })
}

// 排序
const customSortChange = (column: any, prop: string, order: string) => {
  if (props.sortChange) {
    return props.sortChange(column, prop, order)
  } else {
    // 排序
    let sort = 'desc'
    if (column.order === 'ascending') {
      sort = 'asc'
    }
    queryStore.setMerge({ sortField: column.prop, order: sort })
    // searchParams.value = Object.assign(searchParams.value, { sortField: column.prop, order: sort })
    // 排序之后重新请求
    getTableData()
  }
}

// dialog
const visible = ref<boolean>(false)
const title = ref<string>()
const openDialog = (v = null, dialogTitle: string = '') => {
  row.value = v

  visible.value = true
  // @ts-ignore
  title.value = dialogTitle || (v?.id ? '更新' : '新增')
}

const closeDialog = (isReset: boolean = true) => {
  visible.value = false
  if (isReset) {
    reset()
  } else {
    doSearch()
  }
}
// 批量选择
const multiSelect = (rows: Array<any>) => {
  multiSelectIds.value = []
  rows.forEach(item => {
    multiSelectIds.value.push(item.id)
  })
}
// 获取批量选择的 IDs
const getMultiSelectIds = () => {
  return multiSelectIds.value
}

const tableSize = ref<string>(props.size)
// 设置 table 的size
const setTableSize = (command: string | number | object) => {
  tableSize.value = command as string
}
const showSearch = ref<boolean>(props.searchable)

// 删除
const { destroy, deleted } = useDestroy(props.destroyConfirm)
// 恢复
const { restore, restored } = useRestore()
// onMounted
onMounted(() => {
  deleted(reset)
  restored(reset)
  setDefaultParams(props.defaultParams)
  getTableData()
})
// 页面初始化
initColumns()

// action 字符串
const permissionAction = (action: string) => {
  return props.permission ? props.permission + '.' + action : null
}
// 暴露外部的 delete
const del = (api: string, id: any) => {
  destroy(api, id)
  deleted(reset)
}

// 设置默认搜索参数
const setDefaultParams = (params: Object) => {
  queryStore.setMerge(params)
  queryStore.setDefaults(params)
  // searchParams.value = Object.assign(searchParams.value, params)
  // searchParams.value = Object.assign(searchParams.value, getDefaultParams())
}

// 回收站列表
const getTrash = () => {
  queryStore.setMerge({
    trashed: 1
  })
  doSearch()
}

const isHasTrash = () => {
  return queryStore.getTrashed
  // const defaultParams = searchParams.value
  // @ts-ignore
  // return !!defaultParams.trashed
}

const getTableQuery = () => {
  return queryStore.getTableQuery
}
// 曝露方法
defineExpose({ doSearch, openDialog, del, closeDialog, reset, setDefaultParams, getMultiSelectIds, getTableQuery })
// 注入
provide('closeDialog', (isReset: boolean = false) => {
  closeDialog(isReset)
})
provide('refresh', () => {
  doSearch()
})

// 自动选中
watch(
  () => data.value,
  newValue => {
    if (props.defaultMultiSelection.length > 0) {
      nextTick(() => {
        const data = newValue?.data as Array<any>
        data.forEach((item: any) => {
          if (props.defaultMultiSelection.indexOf(item.id) > -1) {
            catchtable.value.toggleRowSelection(item, true)
          }
        })
      })
    }
  },
  {
    deep: true
  }
)
</script>
<style scoped lang="scss">
:deep(.tools .el-button) {
  background-color: var(--el-fill-color-light) !important;
}

:deep(.catchtable .el-table__header .el-table__cell) {
  background: var(--catch-table-header-bg-color) !important;
}
</style>

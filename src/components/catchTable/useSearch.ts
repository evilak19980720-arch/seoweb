import { ref } from 'vue'
import http from '@/support/http'
import { useQueryStore } from './useQueryStore'
interface response {
  code: number
  data: Array<Object> | Object
  message: string
  total?: number
  page?: number
  limit?: number
}

export default function useSearch(api: string | Function, isPagination: boolean, pageLimit: number, currentPage: number) {
  // 默认设置分页参数
  const limit = ref<number>(pageLimit)
  const page = ref<number>(currentPage)
  const total = ref<number>(0)
  const loading = ref<boolean>(false)
  // 搜索参数
  // const searchParams = ref<Object>({})
  const data = ref<response>()
  const queryStore = useQueryStore()

  if (isPagination) {
    queryStore.setPageAndLimit(currentPage, pageLimit)
  }

  // 分页切换
  const changePage = (p: number) => {
    page.value = p
    setPaginateParams(p)
  }

  // limit 切换
  const changeLimit = (l: number) => {
    limit.value = l
    page.value = 1
    setPaginateParams(0, l)
  }

  // 设置分页查询参数
  const setPaginateParams = (page: number = 0, limit: number = 0) => {
    if (page) {
      queryStore.setPage(page)
    }
    if (limit) {
      queryStore.setLimit(limit)
    }

    getTableData()
  }

  // 执行 search
  const doSearch = (params: Object | null = null, append: boolean = true) => {
    if (params !== null) {
      queryStore.setMerge(params)
    }
    getTableData()
  }

  // 重置 || 刷新
  const reset = () => {
    queryStore.setResetQuery()

    // searchParams.value = Object.assign(getDefaultParams(), defaults)
    if (isPagination) {
      // 这里会调用 getTableData 方法
      setPaginateParams(currentPage, pageLimit)
    } else {
      getTableData()
    }
  }

  const getTableData = () => {
    loading.value = true
    http.get(api as string, queryStore.getTableQuery).then(r => {
      loading.value = false
      data.value = r.data
      if (isPagination) {
        total.value = r.data.total
      }
    })
  }

  return { limit, page, total, changeLimit, setPaginateParams, changePage, doSearch, reset, loading, data, getTableData }
}

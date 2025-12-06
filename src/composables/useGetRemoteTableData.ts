import http from '@/support/http'
import { ref, watch } from 'vue'

/**
 * 获取远程数据
 *
 * @param table
 * @param value
 * @param label
 * @param pid
 * @param filter
 * @returns
 */
export function useGetRemoteTableData(table: string, value: string, label: string, pid: string | null = null) {
  const loading = ref<boolean>(false)
  const options = ref<Array<any>>([])
  const filter = ref<any>(null)

  const getTableData = () => {
    loading.value = true
    http
      .get(`/options/tableData`, { table, value, label, pid, filter: filter.value })
      .then(response => {
        const responseData = response.data
        options.value = responseData.data
      })
      .catch(error => {
        console.error('Error fetching options:', error)
      })
      .finally(() => {
        loading.value = false
      })
  }
  getTableData()
  watch(
    () => filter,
    () => {
      getTableData()
    },
    { immediate: true, deep: true }
  )

  return { options, loading, filter }
}

/**
 * 获取远程组件的分页数据
 *
 * @param table
 * @param value
 * @param label
 * @param filter
 * @returns
 */
export function useGetRemoteTablePaginateData(table: string, value: string, label: string) {
  const loading = ref<boolean>(false)
  const page = ref<number>(1)
  const limit = ref<number>(10)
  const total = ref<number>(0)
  const options = ref<Array<any>>([])
  const filter = ref<any>(null)

  const getTableData = () => {
    loading.value = true
    http
      .get(`/options/tableData`, { table, value, label, limit: limit.value, page: page.value, filter: filter.value })
      .then(response => {
        const responseData = response.data.data
        options.value = responseData.data
        total.value = responseData.total
        page.value = responseData.page
        limit.value = responseData.limit
        console.log('Fetched options for table:', table, options.value)
      })
      .catch(error => {
        console.error('Error fetching options:', error)
      })
      .finally(() => {
        loading.value = false
      })
  }

  watch(
    () => [page.value, limit.value, filter.value],
    () => {
      getTableData()
    },
    { immediate: true, deep: true }
  )

  return { options, loading, page, limit, total, filter }
}

export function useGetDataByApi(api: string) {
  const loading = ref<boolean>(false)
  const page = ref<number>(1)
  const limit = ref<number>(10)
  const total = ref<number>(0)
  const options = ref<Array<any>>([])
  const filter = ref<any>(null)

  const getTableData = () => {
    loading.value = true
    http
      .get(api, { limit: limit.value, page: page.value, keywords: filter.value })
      .then(response => {
        const responseData = response.data
        options.value = responseData.data
        total.value = responseData.total
        page.value = responseData.page
        limit.value = responseData.limit
        console.log(options.value)
      })
      .catch(error => {
        console.error('Error fetching options:', error)
      })
      .finally(() => {
        loading.value = false
      })
  }

  watch(
    () => [page.value, limit.value, filter.value],
    () => {
      getTableData()
    },
    { immediate: true, deep: true }
  )

  return { options, loading, page, limit, total, filter }
}

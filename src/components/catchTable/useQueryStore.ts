import { defineStore } from 'pinia'
import router from '@/router'

interface query {
  // 存储 table query 的 map
  query: Map<string, Object>
  // 存储默认 query
  defaults: Map<string, Object>
}

export const useQueryStore = defineStore('tableQuery', {
  state: (): query => {
    return {
      query: new Map(),
      defaults: new Map()
    }
  },
  getters: {
    /**
     * 获取表格 Query
     * @returns
     */
    getTableQuery(): Object {
      return this.query.get(this.getUniqueKey) || {}
    },

    /**
     * 获取表格默认
     * @returns
     */
    getTableQueryDefaults(): Object {
      return this.defaults.get(this.getUniqueKey) || {}
    },

    /**
     * 获取唯一KEY
     * @returns
     */
    getUniqueKey() {
      return router.currentRoute.value.path
    },

    /**
     * 获取回收站参数
     * @returns
     */
    getTrashed(): boolean {
      // @ts-ignore
      return !!this.getTableQuery.trashed
    }
  },
  actions: {
    initQuery(params: Object) {
      this.query.set(this.getUniqueKey, { ...params })
      return this.getTableQuery
    },
    /**
     * 唯一 KEY
     * @returns
     */
    uniqueKey() {
      return router.currentRoute.value.path
    },

    /**
     * 设置默认 Query 参数
     *
     * @param defaults
     */
    setDefaults(defaults: Object) {
      this.defaults.set(this.getUniqueKey, Object.assign({ ...this.getTableQueryDefaults }, defaults))
    },

    /**
     * 重置 Query 参数
     */
    setResetQuery() {
      this.query.set(this.getUniqueKey, { ...this.getTableQueryDefaults })
    },

    /**
     * 设置页码
     * @param page
     */
    setPage(page: number) {
      this.query.set(this.getUniqueKey, { ...Object.assign(this.getTableQuery, { page }) })
    },

    /**
     * 设置每页限制
     * @param limit
     */
    setLimit(limit: number) {
      this.query.set(this.getUniqueKey, { ...Object.assign(this.getTableQuery, { limit }) })
    },
    setPageAndLimit(page: number, limit: number) {
      if (page) {
        this.setPage(page)
      }

      if (limit) {
        this.setLimit(limit)
      }
    },

    /**
     * 合并参数
     * @param params
     */
    setMerge(params: object) {
      this.query.set(this.getUniqueKey, { ...Object.assign(this.getTableQuery, params) })
    }
  }
})

/**
 * 插件加载器
 * 使用 vue3-sfc-loader 运行时加载远程 .vue 组件
 */
import type { Component } from 'vue'
import * as Vue from 'vue'
import { loadModule } from 'vue3-sfc-loader'
import { pluginContext } from './PluginContext'
import http from '@/support/http'
import Message from '@/support/message'

/** 组件缓存 */
const componentCache = new Map<string, Component>()

/** 文件内容缓存 */
const fileCache = new Map<string, string>()

/** 共享的 moduleCache（包含 vue 和已加载的模块）*/
const moduleCache: Record<string, any> = Object.create(null)
moduleCache.vue = Vue

/** 有效 JS 标识符检查 */
const isValidIdentifier = (name: string) => /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name)

/**
 * 获取 SFC Loader 配置
 * 参考: https://github.com/FranckFreiburger/vue3-sfc-loader
 */
function getLoaderOptions() {
  return {
    moduleCache,

    // TypeScript 和类属性语法支持
    additionalBabelParserPlugins: ['typescript', 'classProperties', 'classPrivateProperties'],
    compilerOptions: {
      ts: 'typescript', // Use 'typescript' or a custom TypeScript compiler path
    },
    // 路径解析
    pathResolve({ refPath, relPath }: { refPath?: string; relPath: string }) {
      if (relPath.startsWith('./') || relPath.startsWith('../')) {
        return refPath ? new URL(relPath, refPath).href : relPath
      }
      return relPath
    },

    // 获取文件内容
    async getFile(url: string) {
      // 1. 懒加载模块（@/support/http 等）
      const lazyLoader = pluginContext.getLazyModule(url)
      if (lazyLoader) {
        const mod = await lazyLoader()

        // 挂载到全局，生成 re-export 代码
        ;(window as any).__PM__ = (window as any).__PM__ || {}
        ;(window as any).__PM__[url] = mod

        const keys = Object.keys(mod)
        let code = `const m = window.__PM__["${url}"];\n`

        if (keys.includes('default')) code += 'export default m.default;\n'
        keys.filter(k => k !== 'default' && isValidIdentifier(k))
            .forEach(k => { code += `export const ${k} = m["${k}"];\n` })
        if (!keys.length) code += 'export default m;\n'

        return { getContentData: () => code, type: '.mjs' }
      }

      // 2. 从缓存读取
      if (fileCache.has(url)) {
        const content = fileCache.get(url)!
        const ext = url.includes('.') ? '.' + url.split('.').pop() : '.vue'
        // 保持 .ts 类型以便 vue3-sfc-loader 使用 TypeScript 解析
        const type = ext === '.js' ? '.mjs' : ext
        return {
          getContentData: (asBinary: boolean) => asBinary ? new TextEncoder().encode(content).buffer : content,
          type
        }
      }

      // 3. 远程文件（请求并缓存）
      const res = await http.get(url)
      const resData = res.data.data

      // 处理 bundle 格式响应（包含多个文件）
      if (resData && typeof resData === 'object' && resData.files) {
        const baseUrl = url.substring(0, url.lastIndexOf('/'))
        // 缓存所有文件
        for (const [path, fileContent] of Object.entries(resData.files)) {
          const fullUrl = baseUrl + path
          fileCache.set(fullUrl, fileContent as string)
        }
        // 返回入口文件内容
        const entryContent = resData.files[resData.entry] as string
        if (!entryContent) {
          throw new Error(`入口文件 ${resData.entry} 不存在`)
        }
        const content = entryContent
        const ext = url.includes('.') ? '.' + url.split('.').pop() : '.vue'
        // 保持 .ts 类型以便 vue3-sfc-loader 使用 TypeScript 解析
        const type = ext === '.js' ? '.mjs' : ext
        return {
          getContentData: (asBinary: boolean) => asBinary ? new TextEncoder().encode(content).buffer : content,
          type
        }
      }

      // 单文件响应
      const content = resData as string
      fileCache.set(url, content)

      const ext = url.includes('.') ? '.' + url.split('.').pop() : '.vue'
      // 保持 .ts 类型以便 vue3-sfc-loader 使用 TypeScript 解析
        const type = ext === '.js' ? '.mjs' : ext

      return {
        getContentData: (asBinary: boolean) => asBinary ? new TextEncoder().encode(content).buffer : content,
        type
      }
    },

    // 处理特殊模块类型
    handleModule(type: string, source: string) {
      if (type === '.json') return JSON.parse(source)
    },

    // 添加样式
    addStyle(style: string) {
      const el = Object.assign(document.createElement('style'), { textContent: style })
      document.head.insertBefore(el, document.head.getElementsByTagName('style')[0] || null)
    },

    // 编译缓存（使用 localStorage）
    compiledCache: {
      set(key: string, str: string) {
        try {
          localStorage.setItem(`sfc:${key}`, str)
        } catch { /* ignore quota exceeded */ }
      },
      get(key: string) {
        return localStorage.getItem(`sfc:${key}`) ?? undefined
      }
    },

    // 日志
    log(type: string, ...args: any[]) {
      if (import.meta.env.DEV) console[type as 'log']?.(...args)
    }
  }
}

/**
 * 加载远程 Vue 组件
 *
 * @param url 组件 URL（后端返回的 .vue 文件地址）
 * @returns Vue 组件
 *
 * @example
 * ```typescript
 * const MyPlugin = await loadRemoteComponent('http://api.com/plugins/order.vue')
 * ```
 */
export async function loadRemoteComponent(url: string): Promise<Component> {
  if (componentCache.has(url)) return componentCache.get(url)!

  try {
    const component = await loadModule(url, getLoaderOptions() as any) as Component
    if (!component) throw new Error('Component is undefined')
    componentCache.set(url, component)
    return component
  } catch (error) {
    const message = error instanceof Error ? error.message : '插件加载失败'
    console.error(`[PluginLoader] 加载失败: ${url}`, error)
    // 手动显示错误提示（路由导航期间拦截器的提示可能不显示）
    Message.error(message)
    throw error
  }
}

/**
 * 创建异步组件加载器（用于路由 component 配置）
 *
 * Vue Router 建议直接使用返回 Promise 的函数，而不是 defineAsyncComponent
 *
 * @param url 组件 URL
 * @returns 返回组件 Promise 的函数
 *
 * @example
 * ```typescript
 * // 在路由配置中使用
 * {
 *   path: '/plugin/order',
 *   component: createAsyncPluginComponent('http://api.com/plugins/order.vue')
 * }
 * ```
 */
export function createAsyncPluginComponent(url: string): () => Promise<Component> {
  return () => loadRemoteComponent(url)
}

/**
 * 清除组件缓存
 * @param url 指定 URL，不传则清除全部
 */
export function clearCache(url?: string): void {
  if (url) {
    componentCache.delete(url)
  } else {
    componentCache.clear()
  }
}

/**
 * 检查 URL 是否是远程插件组件
 */
export function isRemoteComponent(url: string): boolean {
  return url.startsWith('http://') ||
         url.startsWith('https://') ||
         url.startsWith('/api/') ||
         url.startsWith('api/')
}

// 默认导出
export default {
  loadRemoteComponent,
  createAsyncPluginComponent,
  clearCache,
  isRemoteComponent
}

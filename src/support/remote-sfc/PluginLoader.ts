/**
 * 插件加载器
 * 使用 vue3-sfc-loader 运行时加载远程 .vue 组件
 */
import type { Component } from 'vue'
import * as Vue from 'vue'
import { markRaw } from 'vue'
import { loadModule } from 'vue3-sfc-loader'
import { pluginContext } from './PluginContext'
import http from '@/support/http'
import Message from '@/support/message'

// 缓存
const componentCache = new Map<string, Component>()
const loadingCache = new Map<string, Promise<Component>>() // 并发控制
const fileCache = new Map<string, string>()
const componentPathCache = new Map<string, string | null>()

// 单例复用
const textEncoder = new TextEncoder()
const validIdRe = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/
const isValidId = (n: string) => validIdRe.test(n)

// 模块缓存
const moduleCache: Record<string, any> = Object.create(null)
moduleCache.vue = Vue
const globalModules: Record<string, any> = (window as any).__PM__ = (window as any).__PM__ || {}

/** 生成 re-export 代码 */
function genReExport(url: string, mod: any): string {
  const safeUrl = url.replace(/\\/g, '\\\\').replace(/"/g, '\\"') // 转义特殊字符
  const keys = Object.keys(mod)
  let code = `const m = window.__PM__["${safeUrl}"];\n`
  if ('default' in mod) code += 'export default m.default;\n'
  keys.filter(k => k !== 'default' && isValidId(k)).forEach(k => { code += `export const ${k} = m["${k}"];\n` })
  if (!keys.length) code += 'export default m;\n'
  return code
}

/** 创建文件响应 */
function fileResp(content: string, url: string) {
  const ext = url.includes('.') ? '.' + url.split('.').pop() : '.vue'
  return {
    getContentData: (bin: boolean) => bin ? textEncoder.encode(content).buffer : content,
    type: ext === '.js' ? '.mjs' : ext
  }
}

/** 组件名转路径（带缓存） */
function componentNameToPath(name: string): string | null {
  if (componentPathCache.has(name)) return componentPathCache.get(name)!
  const pascal = name.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
  const camel = pascal.charAt(0).toLowerCase() + pascal.slice(1)
  const paths = [
    `@/components/${pascal}/index.vue`, `@/components/${pascal}/index`, `@/components/${pascal}.vue`,
    `@/components/${name}/index.vue`, `@/components/${name}/index`, `@/components/${name}.vue`,
    `@/components/${camel}/index.vue`, `@/components/${camel}/index`,
  ]
  for (const p of paths) {
    if (pluginContext.hasModule(p)) { componentPathCache.set(name, p); return p }
  }
  componentPathCache.set(name, null)
  return null
}

/** SFC Loader 配置 */
const loaderOptions = {
  moduleCache,
  additionalBabelParserPlugins: ['typescript', 'classProperties', 'classPrivateProperties'],
  compilerOptions: { ts: 'typescript' },

  pathResolve({ refPath, relPath }: { refPath?: string; relPath: string }) {
    if (relPath.startsWith('./') || relPath.startsWith('../')) {
      return refPath ? new URL(relPath, refPath).href : relPath
    }
    return componentNameToPath(relPath) || relPath
  },

  async handleModule(type: string, getContentData: any, path: string) {
    const cache = pluginContext.getModuleCache()
    if (cache[path]) return cache[path]
    if (type === '.json') return JSON.parse(typeof getContentData === 'function' ? getContentData(false) : getContentData)
    return undefined
  },

  async getFile(url: string) {
    // 预加载模块
    const cache = pluginContext.getModuleCache()
    if (cache[url]) {
      const cached = cache[url]
      globalModules[url] = cached
      return { getContentData: () => genReExport(url, cached), type: '.mjs' }
    }
    // 懒加载模块
    const loader = pluginContext.getLazyModule(url)
    if (loader) {
      const mod = await loader()
      globalModules[url] = mod
      return { getContentData: () => genReExport(url, mod), type: '.mjs' }
    }
    // 文件缓存
    if (fileCache.has(url)) return fileResp(fileCache.get(url)!, url)
    // 远程文件
    const resData = (await http.get(url)).data.data
    if (!resData) throw new Error(`文件内容为空: ${url}`)
    if (resData.files) {
      const base = url.substring(0, url.lastIndexOf('/') + 1)
      Object.entries(resData.files).forEach(([p, c]) => fileCache.set(base + p.replace(/^\//, ''), c as string))
      if (!resData.files[resData.entry]) throw new Error(`入口文件 ${resData.entry} 不存在`)
      return fileResp(resData.files[resData.entry] as string, url)
    }
    const content = typeof resData === 'string' ? resData : JSON.stringify(resData)
    fileCache.set(url, content)
    return fileResp(content, url)
  },

  addStyle(style: string) {
    const el = Object.assign(document.createElement('style'), { textContent: style })
    document.head.insertBefore(el, document.head.getElementsByTagName('style')[0] || null)
  },

  compiledCache: {
    set(key: string, str: string) { try { localStorage.setItem(`sfc:${key}`, str) } catch {} },
    get(key: string) { return localStorage.getItem(`sfc:${key}`) ?? undefined }
  },

  log(type: string, ...args: any[]) {
    if (import.meta.env.DEV) console[type as 'log']?.(...args)
  }
}

/** 加载远程 Vue 组件（并发控制 + markRaw 避免响应式化） */
export async function loadRemoteComponent(url: string): Promise<Component> {
  // 缓存命中
  if (componentCache.has(url)) return componentCache.get(url)!
  // 并发控制：同一 URL 多次调用只加载一次
  if (loadingCache.has(url)) return loadingCache.get(url)!

  const promise = (async () => {
    try {
      const component = await loadModule(url, loaderOptions as any) as Component
      if (!component) throw new Error('Component is undefined')
      // markRaw: 避免 Vue 将组件转为响应式对象（性能优化）
      const rawComponent = markRaw(component)
      componentCache.set(url, rawComponent)
      return rawComponent
    } catch (error) {
      console.error(`[PluginLoader] 加载失败: ${url}`, error)
      Message.error(error instanceof Error ? error.message : '插件加载失败')
      throw error
    } finally {
      loadingCache.delete(url) // 加载完成后移除
    }
  })()

  loadingCache.set(url, promise)
  return promise
}

/** 创建异步组件加载器（用于路由） */
export function createAsyncPluginComponent(url: string): () => Promise<Component> {
  return () => loadRemoteComponent(url)
}

/** 清除组件缓存 */
export function clearCache(url?: string): void {
  if (url) {
    componentCache.delete(url)
    loadingCache.delete(url)
  } else {
    componentCache.clear()
    loadingCache.clear()
  }
}

/** 清理模块缓存 */
export function clearModuleCache(url?: string): void {
  if (url) {
    delete globalModules[url]
    componentPathCache.delete(url)
    fileCache.delete(url)
  } else {
    Object.keys(globalModules).forEach(k => delete globalModules[k])
    componentPathCache.clear()
    fileCache.clear()
  }
}

/** 检查是否远程组件 */
export function isRemoteComponent(url: string|null): boolean {
  if (! url) {
      return false
  }

  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/api/') || url.startsWith('api/')
}

export default { loadRemoteComponent, createAsyncPluginComponent, clearCache, clearModuleCache, isRemoteComponent }

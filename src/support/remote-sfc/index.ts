/**
 * CatchAdmin 插件加载器
 * 
 * 基于 vue3-sfc-loader 实现运行时动态加载 .vue 组件
 * 
 * @example
 * ```typescript
 * import { loadRemoteComponent, createAsyncPluginComponent } from '@/support/remote-sfc'
 * 
 * // 方式1: 直接加载
 * const MyPlugin = await loadRemoteComponent('http://api.com/plugins/order.vue')
 * 
 * // 方式2: 异步组件（用于路由）
 * const route = {
 *   path: '/plugin/order',
 *   component: createAsyncPluginComponent('http://api.com/plugins/order.vue')
 * }
 * ```
 */

import type { App } from 'vue'
import { pluginContext } from './PluginContext'

// 导出核心功能
export {
  loadRemoteComponent,
  createAsyncPluginComponent,
  clearCache,
  isRemoteComponent
} from './PluginLoader'

// 导出上下文（用于注册额外的依赖）
export { pluginContext } from './PluginContext'

// 导出类型
export type { PluginRouteConfig, LoadedPluginComponent } from './types'

/**
 * 初始化插件系统
 * 在 Vue 应用启动时调用
 */
export function initPluginSystem(app: App): void {
  // 注入全局属性
  app.provide('pluginContext', pluginContext)
  
  console.log('[PluginSystem] 已初始化')
}

export default {
  install: initPluginSystem
}

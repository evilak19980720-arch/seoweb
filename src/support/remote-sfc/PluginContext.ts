/**
 * 插件上下文 - 依赖注入
 *
 * 提供插件可用的所有依赖模块，支持按需懒加载
 */
import * as Vue from 'vue'
import * as VueRouter from 'vue-router'
import * as Pinia from 'pinia'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@heroicons/vue/24/outline'
import * as ElementPlusIcons from '@element-plus/icons-vue'

/**
 * 插件上下文类
 * 管理插件可用的所有模块和依赖
 */
export class PluginContext {
  /** 预加载的模块缓存（立即可用） */
  private moduleCache: Record<string, any> = {}

  /** 懒加载模块（按需加载） */
  private lazyModules: Record<string, () => Promise<any>> = {}

  constructor() {
    this.initCoreModules()
    this.initLazyModules()
  }

  /**
   * 初始化核心模块（必须预加载）
   */
  private initCoreModules(): void {
    // Vue 核心 - 必须预加载
    this.moduleCache['vue'] = Vue

    // Vue Router
    this.moduleCache['vue-router'] = VueRouter

    // Pinia 状态管理
    this.moduleCache['pinia'] = Pinia

    // Element Plus UI 框架
    this.moduleCache['element-plus'] = ElementPlus

    // Heroicons 图标
    this.moduleCache['@heroicons/vue/24/outline'] = ElementPlusIconsVue

    // Element Plus Icons
    this.moduleCache['@element-plus/icons-vue'] = ElementPlusIcons
  }

  /**
   * 初始化懒加载模块
   * 这些模块只在被 import 时才会加载
   */
  private initLazyModules(): void {
    // VueUse 工具库
    this.lazyModules['@vueuse/core'] = () => import('@vueuse/core')

    // Echarts 图表
    this.lazyModules['echarts'] = () => import('echarts')
    this.lazyModules['vue-echarts'] = () => import('vue-echarts')

    // Moment 日期处理
    this.lazyModules['moment'] = () => import('moment')

    // Vue I18n 国际化
    this.lazyModules['vue-i18n'] = () => import('vue-i18n')

    // Heroicons 图标库
    this.lazyModules['@heroicons/vue/24/outline'] = () => import('@heroicons/vue/24/outline')

    // Element Plus 组件库
    this.lazyModules['element-plus'] = () => import('element-plus')
    this.lazyModules['@element-plus/icons-vue'] = () => import('@element-plus/icons-vue')

    // 项目内部支持模块 - 懒加载
    this.lazyModules['@/support/request'] = () => import('@/support/request')
    this.lazyModules['@/support/http'] = () => import('@/support/http')
    this.lazyModules['@/support/helper'] = () => import('@/support/helper')
    this.lazyModules['@/support/cache'] = () => import('@/support/cache')
    this.lazyModules['@/support/message'] = () => import('@/support/message')
    this.lazyModules['@/composables/useSse'] = () => import('@/composables/useSse')

    // 自动收集项目内组件（使用 Vite 的 import.meta.glob）
    this.collectProjectModules()
  }

  /**
   * 收集项目内所有可用的组件和模块
   * 使用 import.meta.glob 实现按需懒加载
   */
  private collectProjectModules(): void {
    // 收集所有组件
    const components = import.meta.glob('../../components/**/*.vue')
    for (const path in components) {
      // 转换路径格式: ./components/xxx.vue -> @/components/xxx.vue
      const relativePath = path.replace(/^(\.\/|\.\.\/)+/, '')
      const modulePath = `@/${relativePath}`
      this.lazyModules[modulePath] = components[path] as () => Promise<any>

      // 同时支持不带 @/ 前缀的路径
      const shortPath = relativePath
      this.lazyModules[shortPath] = components[path] as () => Promise<any>
    }

    // 收集 composables
    const composables = import.meta.glob('../../composables/**/*.ts')
    for (const path in composables) {
      const relativePath = path.replace(/^(\.\/|\.\.\/)+/, '')
      const modulePath = `@/${relativePath}`
      this.lazyModules[modulePath] = composables[path] as () => Promise<any>
    }

    // 收集 stores
    const stores = import.meta.glob('../../stores/modules/*.ts')
    for (const path in stores) {
      const relativePath = path.replace(/^(\.\/|\.\.\/)+/, '')
      const modulePath = `@/${relativePath}`
      this.lazyModules[modulePath] = stores[path] as () => Promise<any>
    }

    // 收集 layout 组件
    const layouts = import.meta.glob('../../layout/**/*.vue')
    for (const path in layouts) {
      const relativePath = path.replace(/^(\.\/|\.\.\/)+/, '')
      const modulePath = `@/${relativePath}`
      this.lazyModules[modulePath] = layouts[path] as () => Promise<any>
    }
  }

  /**
   * 获取模块缓存（用于 vue3-sfc-loader 的 moduleCache 选项）
   */
  getModuleCache(): Record<string, any> {
    return { ...this.moduleCache }
  }

  /**
   * 注册自定义模块到缓存
   * @param name 模块名称
   * @param module 模块内容
   */
  registerModule(name: string, module: any): void {
    this.moduleCache[name] = module
  }

  /**
   * 注册懒加载模块
   * @param name 模块名称
   * @param loader 加载函数
   */
  registerLazyModule(name: string, loader: () => Promise<any>): void {
    this.lazyModules[name] = loader
  }

  /**
   * 获取懒加载模块的加载函数
   * @param name 模块名称
   */
  getLazyModule(name: string): (() => Promise<any>) | undefined {
    return this.lazyModules[name]
  }

  /**
   * 检查模块是否可用（预加载或懒加载）
   * @param name 模块名称
   */
  hasModule(name: string): boolean {
    return name in this.moduleCache || name in this.lazyModules
  }

  /**
   * 异步获取模块（自动处理懒加载）
   * @param name 模块名称
   */
  async getModule(name: string): Promise<any> {
    // 先检查预加载缓存
    if (this.moduleCache[name]) {
      return this.moduleCache[name]
    }

    // 检查懒加载模块
    const lazyLoader = this.lazyModules[name]
    if (lazyLoader) {
      const module = await lazyLoader()
      // 加载后缓存起来，避免重复加载
      this.moduleCache[name] = module
      return module
    }

    return undefined
  }

  /**
   * 获取所有可用模块的名称列表
   */
  getAvailableModules(): string[] {
    return [
      ...Object.keys(this.moduleCache),
      ...Object.keys(this.lazyModules)
    ]
  }

  /**
   * 批量预加载模块
   * @param moduleNames 需要预加载的模块名称列表
   */
  async preloadModules(moduleNames: string[]): Promise<void> {
    const promises = moduleNames.map(name => this.getModule(name))
    await Promise.all(promises)
  }
}

// 导出单例实例
export const pluginContext = new PluginContext()

export default pluginContext

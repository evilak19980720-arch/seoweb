/**
 * 插件上下文 - 依赖注入
 *
 * 提供插件可用的所有依赖模块，支持按需懒加载
 */
import * as Vue from 'vue'
import * as VueRouter from 'vue-router'
import * as Pinia from 'pinia'
import ElementPlus from 'element-plus'
import * as HeroIcons from '@heroicons/vue/24/outline'
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
    this.moduleCache['@heroicons/vue/24/outline'] = HeroIcons

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

    // ========== 项目内部 Support 模块 - 懒加载 ==========
    const supportPaths = ['request', 'http', 'helper', 'cache', 'message']
    for (const name of supportPaths) {
      const fullPath = `@/support/${name}`
      this.lazyModules[fullPath] = () => import(`../../support/${name}.ts`)
      this.lazyModules[fullPath + '.ts'] = this.lazyModules[fullPath]
    }

    // ========== 项目内部 Stores - 懒加载 ==========
    // 注册常用 stores 的多种路径别名
    this.lazyModules['@/stores/modules/app'] = () => import('@/stores/modules/app')
    this.lazyModules['@/stores/modules/user'] = () => import('@/stores/modules/user')
    this.lazyModules['@/stores/modules/user/permissions'] = () => import('@/stores/modules/user/permissions')
    this.lazyModules['@/stores/modules/tabs'] = () => import('@/stores/modules/tabs')
    this.lazyModules['@/stores'] = () => import('@/stores')

    // ========== 项目内部 Composables - 懒加载 ==========
    const curdComposables = ['useCreate', 'useShow', 'useDestroy', 'useEnabled', 'useGetList', 'useOpen', 'useRestore', 'useFormSubmit', 'useExcelDownload']
    for (const name of curdComposables) {
      const fullPath = `@/composables/curd/${name}`
      this.lazyModules[fullPath] = () => import(`../../composables/curd/${name}.ts`)
      this.lazyModules[fullPath + '.ts'] = this.lazyModules[fullPath]
    }
    
    // 其他常用 composables
    this.lazyModules['@/composables/useSse'] = () => import('@/composables/useSse')
    this.lazyModules['@/composables/useUpload'] = () => import('@/composables/useUpload')
    this.lazyModules['@/composables/useChunkUpload'] = () => import('@/composables/useChunkUpload')
    this.lazyModules['@/composables/useDynamic'] = () => import('@/composables/useDynamic')
    this.lazyModules['@/composables/useGetRemoteTableData'] = () => import('@/composables/useGetRemoteTableData')

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
      
      // 不带 .vue 后缀的路径
      const pathWithoutVue = modulePath.replace(/\.vue$/, '')
      if (!this.lazyModules[pathWithoutVue]) {
        this.lazyModules[pathWithoutVue] = components[path] as () => Promise<any>
      }
      
      // 不带 /index.vue 的路径
      const pathWithoutIndex = pathWithoutVue.replace(/\/index$/, '')
      if (pathWithoutIndex !== pathWithoutVue && !this.lazyModules[pathWithoutIndex]) {
        this.lazyModules[pathWithoutIndex] = components[path] as () => Promise<any>
      }
    }

    // 收集 composables
    const composables = import.meta.glob('../../composables/**/*.ts')
    for (const path in composables) {
      const relativePath = path.replace(/^(\.\/|\.\.\/)+/, '')
      const modulePath = `@/${relativePath}`
      this.lazyModules[modulePath] = composables[path] as () => Promise<any>
      // 同时注册不带 .ts 后缀的路径
      const pathWithoutExt = modulePath.replace(/\.ts$/, '')
      if (!this.lazyModules[pathWithoutExt]) {
        this.lazyModules[pathWithoutExt] = composables[path] as () => Promise<any>
      }
    }

    // 收集 stores（递归匹配所有子目录）
    const stores = import.meta.glob('../../stores/**/*.ts')
    for (const path in stores) {
      const relativePath = path.replace(/^(\.\/|\.\.\/)+/, '')
      const modulePath = `@/${relativePath}`
      this.lazyModules[modulePath] = stores[path] as () => Promise<any>
      // 同时注册不带 .ts 后缀的路径
      const pathWithoutExt = modulePath.replace(/\.ts$/, '')
      if (!this.lazyModules[pathWithoutExt]) {
        this.lazyModules[pathWithoutExt] = stores[path] as () => Promise<any>
      }
      // 注册不带 /index 的路径
      const pathWithoutIndex = pathWithoutExt.replace(/\/index$/, '')
      if (pathWithoutIndex !== pathWithoutExt && !this.lazyModules[pathWithoutIndex]) {
        this.lazyModules[pathWithoutIndex] = stores[path] as () => Promise<any>
      }
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
    return this.moduleCache // 直接返回引用，避免每次创建新对象
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
   * 路径归一化 - 尝试多种路径变体
   * @param name 原始模块路径
   * @returns 可能的路径变体列表
   */
  private normalizePaths(name: string): string[] {
    const variants: string[] = [name]
    
    // 如果没有后缀，尝试添加 .ts
    if (!name.endsWith('.ts') && !name.endsWith('.vue') && !name.endsWith('.js')) {
      variants.push(name + '.ts')
      variants.push(name + '/index.ts')
      variants.push(name + '/index')
    }
    
    // 如果以 .ts 结尾，尝试不带后缀
    if (name.endsWith('.ts')) {
      variants.push(name.replace(/\.ts$/, ''))
    }
    
    // 如果以 /index.ts 结尾，尝试不带 index
    if (name.endsWith('/index.ts')) {
      variants.push(name.replace(/\/index\.ts$/, ''))
    }
    if (name.endsWith('/index')) {
      variants.push(name.replace(/\/index$/, ''))
    }
    
    return variants
  }

  /**
   * 获取懒加载模块的加载函数（支持路径归一化）
   * @param name 模块名称
   */
  getLazyModule(name: string): (() => Promise<any>) | undefined {
    // 先直接查找
    if (this.lazyModules[name]) return this.lazyModules[name]
    // 尝试路径变体（跳过第一个，因为已经检查过）
    const variants = this.normalizePaths(name)
    for (let i = 1; i < variants.length; i++) {
      if (this.lazyModules[variants[i]]) return this.lazyModules[variants[i]]
    }
    return undefined
  }

  /**
   * 检查模块是否可用（预加载或懒加载，支持路径归一化）
   * @param name 模块名称
   */
  hasModule(name: string): boolean {
    // 先直接检查
    if (name in this.moduleCache || name in this.lazyModules) return true
    // 检查路径变体（跳过第一个，因为已检查过）
    const variants = this.normalizePaths(name)
    for (let i = 1; i < variants.length; i++) {
      if (variants[i] in this.moduleCache || variants[i] in this.lazyModules) return true
    }
    return false
  }

  /**
   * 异步获取模块（自动处理懒加载，支持路径归一化）
   * @param name 模块名称
   */
  async getModule(name: string): Promise<any> {
    const variants = this.normalizePaths(name)
    
    // 先检查预加载缓存
    for (const variant of variants) {
      if (this.moduleCache[variant]) {
        return this.moduleCache[variant]
      }
    }

    // 检查懒加载模块
    for (const variant of variants) {
      const lazyLoader = this.lazyModules[variant]
      if (lazyLoader) {
        const module = await lazyLoader()
        // 加载后缓存起来，避免重复加载（同时缓存原始路径）
        this.moduleCache[variant] = module
        this.moduleCache[name] = module
        return module
      }
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

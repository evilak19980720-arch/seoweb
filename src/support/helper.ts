/**
 * Helper 助教函数集合
 */

import Cache from '@/support/cache'
import i18n from '@/i18n'
import moment from 'moment'
import type { RouteRecordRaw } from 'vue-router'
const AUTH_TOKEN = 'auth_token'

/**
 * env get
 *
 * @param key
 * @param defaultValue
 */
export function env(key: string, defaultValue: any = null): any {
  const env = import.meta.env

  return !isUndefined(env[key]) ? env[key] : defaultValue
}

/**
 * remember token
 *
 * @param token
 */
export function rememberAuthToken(token: string): void {
  Cache.set(AUTH_TOKEN, token)
}

/**
 * remove auth token
 */
export function removeAuthToken(): void {
  Cache.del(AUTH_TOKEN)
}

/**
 * get auth token
 *
 */
export function getAuthToken(): string | null {
  return Cache.get(AUTH_TOKEN)
}

/**
 * get bearer token
 *
 * @returns
 */
export function getBearerToken(): string | null {
  return 'Bearer ' + getAuthToken()
}

/**
 * 是否是小屏幕
 * @return
 */
export function isMiniScreen(): boolean {
  return window.document.body.clientWidth < 500
}

/**
 * translate
 *
 * @param translate
 * @returns
 */
export function t(translate: string) {
  return i18n.global.t(translate)
}

/**
 * is undefined
 *
 * @param value
 * @returns
 */
export function isUndefined(value: any): boolean {
  return value === undefined
}

/**
 * set page title
 *
 * @param title
 */
export function setPageTitle(title: string) {
  const siteTitle: string = _window('title') ? _window('title') : env('VITE_APP_NAME')

  if (isUndefined(siteTitle) || ! siteTitle) {
    document.title = title
  } else {
    document.title =  title + '-' + siteTitle
  }
}

/**
 * is function?
 *
 * @param value
 */
export function isFunction(value: any) {
  return typeof value === 'function'
}

export function _window(key: string) {
  if (window.hasOwnProperty('admin_config')) {
    // @ts-ignore
    return window.admin_config[key]
  }

  return null
}

/**
 * 获取 base url
 *
 * @returns
 */
export function getBaseUrl() {
  const baseUrl = _window('BASE_URL') ? _window('BASE_URL') : env('VITE_BASE_URL')

  const originUrl = `${window.location.origin}/api`

  // 租户模式
  if (isTenancyMode()) {
    return originUrl
  }

  return baseUrl
}

/**
 * 是否是租户模式
 *
 * @returns
 */
export function isTenancyMode() {
  return env('VITE_TENANCY_MODE', false)
}

/**
 * is boolean
 * @param value
 * @returns
 */
export function isBoolean(value: any): boolean {
  return typeof value === 'boolean'
}

/**
 *
 * @param value
 * @returns
 */
export function isNumber(value: any): boolean {
  return typeof value === 'number'
}

/**
 * 首字母大写
 *
 * @param str
 * @returns
 */
export function ucfirst(str: string): string {
  return str[0].toUpperCase() + str.slice(1)
}

/**
 * 首字母小写
 * @param str
 * @returns
 */
export function lcfirst(str: string): string {
  return str[0].toLowerCase() + str.slice(1)
}

/**
 *
 * @param e
 * @returns
 */
export function randomString(e: number = 10): string {
  const t = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
  const a = t.length
  let n: string = ''
  for (let i = 0; i < e; i++) {
    n += t.charAt(Math.floor(Math.random() * a))
  }
  return n
}

/**
 * 生成唯一的文件名称
 * @param filename
 * @returns
 */
export function generateFilename(filename: string) {
  const ext = filename.split('.')
  ext.shift()
  const timestamp = Date.now()
  return timestamp + randomString() + '.' + ext.join('.')
}

/**
 * 数组去重
 * @param arr
 * @returns
 */
export function unique(arr: Array<any>) {
  return Array.from(new Set(arr))
}

/**
 * 是否是生产环境
 * @returns
 */
export function isProd() {
  return (env('PROD', false) === true || env('PRODUCTION', false) === true) && env('MODE', false) === 'production'
}

// 获取文件 ext
export const getFileExt = (filename: string): string => {
  return filename.substring(filename.lastIndexOf('.')).toLowerCase()
}

// 获取文件名
export const getFilename = (filename: string): string => {
  return filename.substring(filename.lastIndexOf('/') + 1)
}

// date 函数
export const date = (format: string, timestamp: number): string => {
  return moment(timestamp * 1000).format(format)
}

/**
 * 由于是前后端分离，所以必须使用加上 http://host 才能显示
 *
 * 如果前后端项目是同一个域名 则不需要
 */
export const warpHost = (path: string | null) => {
  if (!path) {
    return path
  }

  if (path.indexOf('http://') > -1 || path.indexOf('https://') > -1) {
    return path
  }

  const serverURL: string = (getBaseUrl() as string).replace('/api', '').trim()

  const currentHost = location.protocol + '//' + location.host
  console.log(currentHost, serverURL)
  if (serverURL.indexOf(currentHost) < 0) {
    // 如果 path 不是以 / 开头 并且 serverUrl 也不是以 / 结尾 凭接的时候
    // 则是 serverURL + '/' + path
    if (!path.startsWith('/') && !serverURL.endsWith('/')) {
      return serverURL + '/' + path
    }
    return serverURL + path
  }

  return path
}

/**
 * 字符串转换成函数
 *
 * @param str
 * @param params
 * @returns
 */
export const strToFunction = (str: string, params?: any) => {
  if (params) {
    return new Function('return ' + str)(params)
  }

  return new Function('return ' + str)()
}


/**
 * 获取登录路由地址
 *
 * @returns
 */
export function getLoginPath() {
  const loginPath = _window('LOGIN_PATH') ? _window('LOGIN_PATH') : env('VITE_LOGIN_PATH')

  if (isUndefined(loginPath) || ! loginPath) {
    return '/login'
  }

  return loginPath
}

/**
 * 动态加载模块路由
 * 自动扫描 views 子目录中的 routes.ts 文件并加载
 *
 * @returns RouteRecordRaw[] 路由数组
 */
export function loadModuleRoute(): RouteRecordRaw[] {
  const dynamicRoutes: RouteRecordRaw[] = []

  // 使用 Vite 的 import.meta.glob 扫描所有 views 子目录下的 routes.ts
  const routeModules = import.meta.glob('../views/**/routes.ts', { eager: true })

  Object.keys(routeModules).forEach((path) => {
    const module = routeModules[path] as any

    // 如果模块导出了路由数组（命名导出）
    if (module.pluginRoutes && Array.isArray(module.pluginRoutes)) {
      dynamicRoutes.push(...module.pluginRoutes)
    }

    // 也支持 default 导出
    if (module.default && Array.isArray(module.default)) {
      dynamicRoutes.push(...module.default)
    }
  })

  return dynamicRoutes
}

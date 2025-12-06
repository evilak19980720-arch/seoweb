import Cache from '@/support/cache'
import { createI18n } from 'vue-i18n'
import type { App } from 'vue'
import http from '@/support/http'

// 语言包缓存的键名
const LANG_CACHE_KEY = 'cached_lang_pack_'
// 缓存时间戳的键名
const LANG_CACHE_TIME_KEY = 'cached_lang_time_'
// 缓存有效期（24小时，单位：毫秒）
const CACHE_EXPIRY_TIME = 24 * 60 * 60 * 1000

// 创建i18n实例
const i18n = createI18n({
  locale: Cache.get('language') || 'zh',
  fallbackLocale: 'zh',
  globalInjection: true,
  legacy: false,
  messages: {} // 初始化为空对象，语言包将从缓存或后端加载
})

// 扩展 i18n 类型
declare module 'vue-i18n' {
  interface I18n {
    loadLanguage: (lang: string) => Promise<boolean>
  }
}

/**
 * 设置语言包到i18n实例
 * @param locale 语言代码
 * @param data 语言包数据
 */
const setLanguagePack = (locale: string, data: any): void => {
  i18n.global.setLocaleMessage(locale, data)
  i18n.global.locale.value = locale
  Cache.set('language', locale)
}

/**
 * 从缓存加载语言包（支持过期缓存兜底）
 * @param locale 语言代码
 * @param allowExpired 是否允许使用过期缓存
 * @returns boolean 是否成功加载
 */
const loadFromCache = (locale: string, allowExpired = false): boolean => {
  try {
    const cachedData = Cache.get(`${LANG_CACHE_KEY}${locale}`)
    if (!cachedData) return false

    // 检查缓存是否有效
    const cacheTime = Cache.get(`${LANG_CACHE_TIME_KEY}${locale}`)
    const isValid = cacheTime && Date.now() - parseInt(cacheTime) < CACHE_EXPIRY_TIME

    if (isValid || allowExpired) {
      const parsedData = typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData
      setLanguagePack(locale, parsedData)
      return true
    }
  } catch (error) {}
  return false
}

/**
 * 从后端加载语言包
 * @param locale 语言代码
 */
const loadFromBackend = async (locale: string) => {
  try {
    await http.get(`/lang/${locale}`).then((response:any) => {
      setLanguagePack(locale, response.data.data)
      // 缓存语言包和时间戳
      Cache.set(`${LANG_CACHE_KEY}${locale}`, JSON.stringify(response.data.data))
      Cache.set(`${LANG_CACHE_TIME_KEY}${locale}`, Date.now().toString())
    })
  } catch (error) {
    console.log('语言包加载失败', error)
  }
}

/**
 * 加载语言包（缓存优先策略）
 * @param locale 语言代码
 */
const loadTranslations = async (locale: string): Promise<boolean> => {
  // 1. 优先使用有效缓存
  if (loadFromCache(locale)) return true

  // 2. 尝试从后端加载
  await loadFromBackend(locale)

  // 3. 使用过期缓存兜底
  if (loadFromCache(locale, true)) return true

  // 4. 回退到默认语言
  return locale !== 'zh' ? loadTranslations('zh') : false
}

// 将 loadLanguage 方法挂载到 i18n 对象上
i18n.loadLanguage = loadTranslations

/**
 * 初始化i18n
 * @param app Vue应用实例
 */
export async function bootstrapI18n(app: App): Promise<void> {
  const defaultLocale = Cache.get('language') || 'zh'

  try {
    // 尝试加载语言包，失败时自动兜底到空语言包
    if (!(await loadTranslations(defaultLocale))) {
      setLanguagePack('zh', {})
    }
  } catch (error) {
    setLanguagePack('zh', {})
  }

  app.use(i18n)
}

export default i18n

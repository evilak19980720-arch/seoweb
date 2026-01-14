// 动态语言包模式：后端加载，stale-while-revalidate 策略
import Cache from '@/support/cache'
import { createI18n } from 'vue-i18n'
import type { App } from 'vue'
import http from '@/support/http'

const LANG_CACHE_KEY = 'cached_lang_pack_'
const LANG_CACHE_TIME_KEY = 'cached_lang_time_'
const CACHE_EXPIRY_TIME = 24 * 60 * 60 * 1000 // 24小时

const i18n = createI18n({
  locale: Cache.get('language') || 'zh',
  fallbackLocale: 'zh',
  globalInjection: true,
  legacy: false,
  messages: {}
})

declare module 'vue-i18n' {
  interface I18n {
    loadLanguage: (lang: string) => Promise<boolean>
  }
}

const setLanguagePack = (locale: string, data: any): void => {
  i18n.global.setLocaleMessage(locale, data)
  i18n.global.locale.value = locale
  Cache.set('language', locale)
}

const getCachedLanguagePack = (locale: string): any | null => {
  try {
    const cachedData = Cache.get(`${LANG_CACHE_KEY}${locale}`)
    if (!cachedData) return null
    return typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData
  } catch {
    return null
  }
}

const isCacheExpired = (locale: string): boolean => {
  const cacheTime = Cache.get(`${LANG_CACHE_TIME_KEY}${locale}`)
  if (!cacheTime) return true
  return Date.now() - parseInt(cacheTime) >= CACHE_EXPIRY_TIME
}

const loadFromBackend = async (locale: string, silent = false): Promise<boolean> => {
  try {
    const response = await http.get(`/lang/${locale}`)
    if (response.data?.data) {
      Cache.set(`${LANG_CACHE_KEY}${locale}`, JSON.stringify(response.data.data))
      Cache.set(`${LANG_CACHE_TIME_KEY}${locale}`, Date.now().toString())
      if (!silent) {
        setLanguagePack(locale, response.data.data)
      }
      return true
    }
    return false
  } catch {
    return false
  }
}

// stale-while-revalidate：有缓存立即使用，过期时后台静默更新
const loadTranslations = async (locale: string): Promise<boolean> => {
  const cachedData = getCachedLanguagePack(locale)

  if (cachedData) {
    setLanguagePack(locale, cachedData)
    if (isCacheExpired(locale)) {
      loadFromBackend(locale, true)
    }
    return true
  }

  if (await loadFromBackend(locale)) return true
  return locale !== 'zh' ? loadTranslations('zh') : false
}

i18n.loadLanguage = loadTranslations

export async function bootstrapI18n(app: App): Promise<void> {
  const defaultLocale = Cache.get('language') || 'zh'

  try {
    if (!(await loadTranslations(defaultLocale))) {
      setLanguagePack('zh', {})
    }
  } catch {
    setLanguagePack('zh', {})
  }

  app.use(i18n)
}

export default i18n

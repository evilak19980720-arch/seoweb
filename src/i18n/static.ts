// 静态语言包模式：本地文件，同步加载
import Cache from '@/support/cache'
import { createI18n } from 'vue-i18n'
import type { App } from 'vue'
import zh from './languages/zh'
import en from './languages/en'

const messages = { zh, en }

const i18n = createI18n({
  locale: Cache.get('language') || 'zh',
  fallbackLocale: 'zh',
  globalInjection: true,
  legacy: false,
  messages
})

declare module 'vue-i18n' {
  interface I18n {
    loadLanguage: (lang: string) => Promise<boolean>
  }
}

// 切换语言
i18n.loadLanguage = async (lang: string): Promise<boolean> => {
  if (messages[lang as keyof typeof messages]) {
    i18n.global.locale.value = lang
    Cache.set('language', lang)
    return true
  }
  return false
}

export function bootstrapI18n(app: App): void {
  app.use(i18n)
}

export default i18n

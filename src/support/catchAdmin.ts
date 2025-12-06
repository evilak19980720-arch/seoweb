import { createApp } from 'vue'
import type { App as app } from 'vue'
import App from '@/App.vue'
import router, { bootstrapRouter } from '@/router'
import ElementPlus from 'element-plus'
import zh from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
import { bootstrapStore } from '@/stores'
import Cache from './cache'
import { bootstrapI18n } from '@/i18n'
import guard from '@/router/guard'
import { bootstrapDirectives } from '@/directives'
import { bootstrapFormCreate } from '@/components/catchForm'
import { Language } from 'element-plus/es/locale'
import { bootstrapEcharts } from './echarts'
import hljsVuePlugin from '@highlightjs/vue-plugin'
import { createVersionPolling } from 'version-polling'
import Message from './message'
import { useAppStore } from '@/stores/modules/app'
/**
 * catchadmin
 */
export default class CatchAdmin {
  protected app: app

  protected element: string

  /**
   * construct
   *
   * @param ele
   */
  constructor(ele: string = '#app') {
    this.app = createApp(App)
    this.element = ele
  }

  /**
   * admin boot
   */
  async bootstrap(): Promise<void> {
    try {
      // 先初始化非异步组件
      this.useElementPlus().usePinia()

      // 异步加载 i18n
      await this.useI18n()

      // 继续初始化其他组件
      this.installDirectives().installForm().useRouter().installEcharts().useHighlightPlugin().useFormCreate().initAppSetting().useVersionPolling().mount()
    } catch (error) {
      console.error('应用启动失败:', error)
    }
  }

  /**
   * 挂载节点
   *
   * @returns
   */
  protected mount(): void {
    this.app.mount(this.element)
  }

  /**
   * 加载路由
   *
   * @returns
   */
  protected useRouter(): CatchAdmin {
    guard(router)

    bootstrapRouter(this.app)

    return this
  }

  /**
   * ui
   * 加载 Element Plus
   * @returns
   */
  protected useElementPlus(): CatchAdmin {
    // 默认语言包
    const languages: Record<string, Language> = {
      zh,
      en
    }
    const language = Cache.get('language') || 'zh'

    // 初始化 Element Plus
    this.app.use(ElementPlus, {
      locale: languages[language]
    })

    return this
  }

  /**
   * use pinia
   */
  protected usePinia(): CatchAdmin {
    bootstrapStore(this.app)

    return this
  }

  /**
   * use i18n
   * 使用服务端加载的多语言功能
   */
  protected async useI18n(): Promise<CatchAdmin> {
    try {
      // 异步初始化 i18n（内部会加载默认语言包）
      await bootstrapI18n(this.app)
      return this
    } catch (error) {
      return this
    }
  }

  /**
   * install directives
   * 安装指令
   * @protected
   */
  protected installDirectives(): CatchAdmin {
    bootstrapDirectives(this.app)

    return this
  }

  /**
   * 安装 form 表单
   * @returns
   */
  protected installForm(): CatchAdmin {
    // bootstrapCatchForm(this.app)

    return this
  }

  protected installEcharts(): CatchAdmin {
    bootstrapEcharts(this.app)
    return this
  }

  protected useHighlightPlugin(): CatchAdmin {
    this.app.use(hljsVuePlugin)
    return this
  }

  protected useFormCreate(): CatchAdmin {
    bootstrapFormCreate(this.app)
    return this
  }

  protected initAppSetting(): CatchAdmin {
    const appStore = useAppStore()
    appStore.setSetting()
    return this
  }

  protected useVersionPolling(): CatchAdmin {
    createVersionPolling({
      pollingInterval: 5 * 60 * 1000, // 每 1 分钟检测一次
      vcType: 'chunkHash',
      chunkName: 'index',
      silent: process.env.NODE_ENV === 'development', // 开发环境下不检测
      onUpdate: self => {
        Message.confirm('有新的版本，点击确定更新新版本！', () => self.onRefresh()).catch(() => self.onCancel())
      }
    })

    return this
  }
}

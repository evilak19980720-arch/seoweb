import { Code } from '@/enum/app'
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { getAuthToken, getBaseUrl, isUndefined, removeAuthToken } from './helper'
import Message from './message'
import router from '@/router'
import ResponseData from '@/types/responseData'
import { isRef, unref } from 'vue'
import { useAppStore } from '@/stores/modules/app'
type responseType = 'arraybuffer' | 'document' | 'json' | 'text' | 'stream' | 'blob'

/**
 * http util
 */
class Request {
  /**
   * axios config
   * @protected
   */
  protected config: AxiosRequestConfig = {}

  /**
   * base url
   * @protected
   */
  protected baseURL: string = ''

  /**
   * http request timeout
   *
   * @protected
   */
  protected timeout: number = 0

  /**
   * http request headers
   *
   * @protected
   */
  protected headers: { [k: string]: string } = {}

  /**
   * axios instance
   *
   * @protected
   */
  // @ts-ignore
  protected request: AxiosInstance

  /**
   * 响应结构
   *
   * @protected
   */
  protected responseType: responseType = 'json'

  public init() {
    this.request = axios.create(this.getConfig())
    this.interceptorsOfRequest()
    this.interceptorsOfResponse()
    return this
  }

  /**
   * get request
   *
   * @param path
   * @param params
   */
  public get(path: string, params: object = {}) {
    this.init()
    return this.request.get(this.baseURL + path, {
      params
    })
  }

  /**
   * post request
   *
   * @param path
   * @param data
   */
  public post(path: string, data: object = {}) {
    this.init()
    if (isRef(data)) {
      data = unref(data) as Object
    }
    return this.request.post(this.baseURL + path, data)
  }

  /**
   * put request
   *
   * @param path
   * @param data
   */
  public put(path: string, data: object = {}) {
    this.init()
    if (isRef(data)) {
      data = unref(data) as Object
    }
    return this.request.put(this.baseURL + path, data)
  }

  /**
   * delete request
   *
   * @param path
   */
  public delete(path: string) {
    this.init()
    return this.request.delete(this.baseURL + path)
  }

  /**
   * set timeout
   *
   * @param timeout
   * @returns
   */
  public setTimeout(timeout: number): Request {
    this.timeout = timeout

    return this
  }

  /**
   * set baseurl
   *
   * @param url
   * @returns
   */
  public setBaseUrl(url: string): Request {
    this.baseURL = url

    return this
  }

  /**
   * set headers
   *
   * @param key
   * @param value
   * @returns
   */
  public setHeader(key: string, value: string): Request {
    this.headers[key] = value

    return this
  }

  /**
   * get axios 配置
   *
   * @returns
   */
  protected getConfig(): AxiosRequestConfig {
    // set base url
    this.config.baseURL = getBaseUrl()
    //
    this.config.responseType = this.responseType
    // set timeout
    this.config.timeout = this.timeout ? this.timeout : 10000

    // set ajax request
    this.headers['X-Requested-With'] = 'XMLHttpRequest'
    // set dashboard request
    this.headers['Request-from'] = 'Dashboard'
    this.config.headers = this.headers
    return this.config
  }

  public setResponseType(type: responseType) {
    this.responseType = type

    return this
  }

  /**
   * 添加请求拦截器
   *
   */
  public interceptorsOfRequest(): void {
    // @ts-ignore
    this.request.interceptors.request.use((config: AxiosRequestConfig) => {
      const token = getAuthToken()
      if (token) {
        if (!config.headers) {
          config.headers = {}
        }

        config.headers.authorization = 'Bearer ' + token
      }

      return config
    })
  }

  /**
   * 添加响应拦截器
   *
   */
  public interceptorsOfResponse(): void {
    this.request.interceptors.response.use(
      response => {
        // 如果是 blob response type, 直接返回 response
        if (response.request.responseType === 'blob') {
          return response
        }
        // json response
        const r: ResponseData = response.data
        const code = r.code
        const message = r.message
        // success response
        if (code === 1e4) {
          return response
        }

        if (code === 10004) {
          Message.error(message || 'Error')
        } else if (code === Code.LOST_LOGIN || code === Code.LOGIN_EXPIRED) {
          // to re-login
          Message.confirm(message + '，需要重新登陆', function () {
            removeAuthToken()
            router.push('/login')
          })
        } else if (code === Code.LOGIN_BLACKLIST || code === Code.USER_FORBIDDEN) {
          Message.error(message || 'Error')
          removeAuthToken()
          // to login page
          router.push('/login')
        } else {
          Message.error(message || 'Error')
        }
        return Promise.reject(new Error(message || 'Error'))
      },
      error => {
        if (!isUndefined(error.response)) {
          // 打印数据
          if (typeof error.response.data === 'string') {
            // 异常抽屉展示
            const appStore = useAppStore()
            appStore.setIsExceptionShow(
              true,
              {
                message: '',
                trace: []
              },
              error.response.data
            )
          } else {
            const trace = error.response.data.trace
            // 如果没有 trace 堆栈信息
            if (trace instanceof Array || error.response.data?.startsWith('<script>')) {
              // 异常抽屉展示
              const appStore = useAppStore()
              appStore.setIsExceptionShow(
                true,
                {
                  message: error.response.data.message,
                  trace: trace instanceof Array ? trace : []
                },
                trace instanceof Array ? '' : error.response.data
              )
            }
            Message.error(error.response.data?.message || 'Internal Server Error')
          }
        } else {
          Message.error('服务异常: ' + error.message)
        }
        return Promise.reject('服务异常: ' + error)
      }
    )
  }
}
export default Request

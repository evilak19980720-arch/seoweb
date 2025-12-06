import { ElMessage, ElMessageBox } from 'element-plus'
import { t } from './helper'

export default class Message {
  /**
   * success
   *
   * @param message
   */
  static success(message: string): void {
    this.message(message, 'success')
  }

  /**
   * error
   *
   * @param message
   */
  static error(message: string, asHtml: boolean = false): void {
    this.message(message, 'error', asHtml)
  }

  /**
   * warning
   *
   * @param message
   */
  static warning(message: string): void {
    this.message(message, 'warning')
  }

  /**
   * confirm
   *
   * @param message
   * @param callback
   */
  static confirm(message: string, callback: any): Promise<any> {
    return ElMessageBox.confirm(message, t('system.warning'), {
      confirmButtonText: t('system.confirm'),
      cancelButtonText: t('system.cancel'),
      type: 'warning',
      customClass: 'message-box'
    }).then(callback)
  }

  /**
   * message
   *
   * @param message
   * @param type
   */
  protected static message(message: string, type: any, asHtml: boolean = false) {
    ElMessage({
      dangerouslyUseHTMLString: asHtml,
      message,

      type
    })
  }
}

import { useUserStore } from '@/stores/modules/user'
import { getAuthToken, removeAuthToken, setPageTitle, getLoginPath } from '@/support/helper'
import progress from '@/support/progress'
import { WhiteListPage } from '@/enum/app'
import { Router, RouteRecordRaw } from 'vue-router'
import { usePermissionsStore } from '@/stores/modules/user/permissions'
import { Menu } from '@/types/Menu'
import { toRaw } from 'vue'
import Message from '@/support/message'

const guard = (router: Router) => {
  // white list
  const loginPath = getLoginPath()
  const whiteList: string[] = [loginPath, '/404']
  router.beforeEach(async (to, from, next) => {
    // set page title
    setPageTitle(to.meta.title as unknown as string)
    // page start
    progress.start()
    // 获取用户的 token
    const authToken = getAuthToken()
    // 如果 token 存在
    if (authToken) {
      // 如果进入 /login 页面，重定向到首页
      if (to.path === loginPath) {
        next({ path: '/' })
      } else {
        const userStore = useUserStore()
        // 获取用户ID
        if (userStore.getId) {
          next()
        } else {
          try {
            // 阻塞获取用户信息
            await userStore.getUserInfo()
            // 如果后端没有返回 permissions，前台则只使用静态路由
            if (userStore.getPermissions !== undefined) {
              // 挂载路由（实际是从后端获取用户的权限）
              const permissionStore = usePermissionsStore()
              // 动态路由挂载
              const asyncRoutes = permissionStore.getAsyncMenusFrom(toRaw(userStore.getPermissions), true)
              asyncRoutes.forEach((route: Menu) => {
                router.addRoute(route as unknown as RouteRecordRaw)
              })
              // 在动态路由之后挂载匹配 404 路由
              router.addRoute({
                path: '/:pathMatch(.*)*',
                redirect: '/404'
              })
            }
            next({ ...to, replace: true })
          } catch (e) {
            Message.error('Vue Route 导航异常: ' + (e as Error).message)
            removeAuthToken()
            next({ path: `${loginPath}?redirect=/${to.path}` })
          }
        }
      }
      progress.done()
    } else {
      // 如果不在白名单
      if (whiteList.indexOf(to.path) !== -1) {
        next()
      } else {
        next({ path: loginPath })
      }
      progress.done()
    }
  })

  router.afterEach(() => {
    progress.done()
  })
}

export default guard

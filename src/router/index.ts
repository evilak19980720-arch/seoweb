import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import type { App } from 'vue'
import { isProd, getLoginPath, loadModuleRoute } from '@/support/helper'
// module routers
// import { getModuleViewComponents } from './constantRoutes'

const notInProdRoute = () => {
  if (isProd()) {
    return [] as RouteRecordRaw[]
  } else {
    return [
      {
        path: '/develop',
        name: 'develop',
        component: () => import('@/layout/index.vue'),
        meta: { title: '开发工具', icon: 'wrench-screwdriver' },
        children: [
          {
            path: 'modules',
            name: 'modules',
            meta: { title: '模块管理', keepalive: false },
            component: () => import('@/views/develop/module/index.vue')
          },
          {
            path: 'schemas',
            name: 'schemas',
            meta: { title: 'Schemas', keepalive: false },
            component: () => import('@/views/develop/schema/index.vue')
          },
          {
            path: 'schema/create',
            name: 'schema_create',
            meta: { title: 'Schema 创建', hidden: true, active_menu: '/develop/schemas', keepalive: false },
            component: () => import('@/views/develop/schema/createWithSteps.vue')
          },
          {
            path: 'generate/:schema',
            name: 'generate',
            meta: { title: '代码生成', hidden: true, active_menu: '/develop/schemas', keepalive: false },
            component: () => import('@/views/develop/generate/index.vue')
          }
        ]
      },
      // 自定义静态路由菜单
    ] as RouteRecordRaw[]
  }
}
// 动态加载模版
// getModuleViewComponents()
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    name: 'dashboard',
    meta: { title: 'DashBoard', icon: 'home' },
    component: () => import('@/layout/index.vue'),
    children: [
      {
        path: 'basic',
        name: 'basic',
        meta: { title: '基础', hidden: false, keepalive: false },
        component: () => import('@/views/dashboard/server/index.vue')
      },
      {
        path: 'sales',
        name: 'sales',
        meta: { title: '销量', hidden: false, keepalive: false },
        component: () => import('@/views/dashboard/sales/index.vue')
      }
    ]
  }
].concat(notInProdRoute() as any).concat(loadModuleRoute() as any)

// default routes, it will not change to menus
const defaultRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: '/',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard/basic',
    children: [
      {
        path: '/404',
        name: '404',
        meta: { title: '404', keepalive: false },
        component: () => import('@/components/404/index.vue')
      }
    ]
  },
  {
    path: '/users',
    component: () => import('@/layout/index.vue'),
    children: [
      {
        path: 'center',
        name: 'user-center',
        meta: { title: '个人中心', keepalive: false },
        component: () => import('@/views/user/center.vue')
      }
    ]
  },
  {
    path: '/system',
    component: () => import('@/layout/index.vue'),
    children: [
      {
        path: 'setting',
        name: 'system-setting',
        meta: { title: '系统设置', keepalive: false },
        component: () => import('@/views/system/basic/index.vue')
      }
    ]
  },
  {
    path: getLoginPath(),
    name: 'login',
    meta: { title: '登录', keepalive: false },
    component: () => import('@/views/login/index.vue')
  }
]

const routes = constantRoutes.concat(defaultRoutes)

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  // 路由滚动
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0, behavior: 'smooth' }
  }
})

export function bootstrapRouter(app: App) {
  app.use(router)
}

export default router

import { defineStore } from 'pinia'
import { User } from '@/types/User'
import http from '@/support/http'
import { rememberAuthToken, removeAuthToken, randomString, isUndefined } from '@/support/helper'
import Message from '@/support/message'
import router from '@/router'
import { Permission } from '@/types/Permission'
import { usePermissionsStore } from './permissions'
import { MenuType } from '@/enum/app'

export const useUserStore = defineStore('UserStore', {
  state: (): User => {
    return {
      id: 0,

      username: '',

      avatar: '',

      email: '',

      remember_token: '',

      status: 0,

      permissions: [] as Permission[],

      roles: [] as string[],

      actions: []
    }
  },

  getters: {
    getId(): number {
      return this.id
    },
    getNickname(): string {
      return this.username
    },

    getAvatar(): string {
      return this.avatar
    },

    getRoles(): string[] | undefined {
      return this.roles
    },

    getPermissions(): Permission[] | undefined {
      return this.permissions
    },

    getActions(): Array<String> | undefined {
      return this.actions
    }
  },

  actions: {
    isSuperAdmin(): boolean {
      return this.id === 1
    },
    setUsername(username: string) {
      this.username = username
    },

    setId(id: number) {
      this.id = id
    },

    setRememberToken(token: string) {
      this.remember_token = token
    },

    setAvatar(avatar: string) {
      this.avatar = avatar
    },

    setRoles(roles: string[]) {
      this.roles = roles
    },

    setPermissions(permissions: Permission[]) {
      this.permissions = permissions
    },

    setEmail(email: string) {
      this.email = email
    },

    setStatus(status: number) {
      this.status = status
    },

    setActions(permissions: Permission[]) {
      const actions: Array<String> = []
      permissions?.forEach(permission => {
        if (permission.type === MenuType.Button_Type) {
          const a: string = permission.module + '.' + permission.permission_mark.replace('@', '.')
          actions.push(a.toLowerCase())
        }
      })
      this.actions = actions
    },
    /**
     * login
     *
     * @param params
     * @returns
     */
    login(params: Object) {
      // 解构参数，防止影响到登录输入框
      const data = { ...params }
      const random = randomString()
      // @ts-ignore
      if (!isUndefined(data.password)) {
        // @ts-ignore
        data.password = btoa(random + data.password)
      }
      return new Promise<void>((resolve, reject) => {
        http
          .setHeader('Request-Auth', random)
          .post('/login', data)
          .then(response => {
            const { token } = response.data.data
            rememberAuthToken(token)
            this.setRememberToken(token)
            resolve()
          })
          .catch(e => {
            reject(e)
          })
      })
    },

    /**
     * logout
     */
    logout() {
      http
        .post('/logout')
        .then(() => {
          removeAuthToken()
          this.$reset()
          const permissionsStore = usePermissionsStore()
          permissionsStore.$reset()
          router.push({ name: 'login' })
        })
        .catch(e => {
          Message.error(e.message)
        })
    },

    /**
     * user info
     */
    getUserInfo() {
      return new Promise((resolve, reject) => {
        http
          .get('/user/online')
          .then(response => {
            const { id, username, email, avatar, permissions, roles, rememberToken, status } = response.data.data
            // set user info
            this.setId(id)
            this.setUsername(username)
            this.setEmail(email)
            this.setRoles(roles)
            this.setRememberToken(rememberToken)
            this.setStatus(status)
            this.setAvatar(avatar)
            this.setPermissions(permissions)
            this.setActions(permissions)
            resolve(response.data.data)
          })
          .catch(e => {
            reject(e)
          })
      })
    }
  }
})

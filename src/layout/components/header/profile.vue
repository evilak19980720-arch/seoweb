<template>
  <div class="header-action header-profile">
    <el-dropdown
      size="large"
      placement="bottom-end"
      class="flex items-center justify-center w-full h-full"
      popper-class="profile-dropdown"
    >
      <div class="flex items-center">
        <cavatar />
      </div>
      <template #dropdown>
        <el-dropdown-menu class="py-1 !border-none !shadow-none">
          <!-- 用户信息区 -->
          <el-dropdown-item disabled class="!p-0 !cursor-default !bg-transparent">
            <div class="flex items-center px-4 py-2.5 mx-1">
              <cavatar />
              <div class="flex flex-col ml-3 min-w-0">
                <span class="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                  {{ userStore.getNickname }}
                </span>
                <span class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">管理员</span>
              </div>
            </div>
          </el-dropdown-item>

          <!-- 分割线 -->
          <div class="mx-3 my-1 border-t border-slate-100 dark:border-slate-700/60"></div>

          <!-- 菜单项 -->
          <el-dropdown-item class="!p-0 !bg-transparent">
            <router-link
              :to="{ path: '/users/center' }"
              class="flex items-center gap-2 w-full px-4 py-2 mx-1 rounded-lg text-sm text-slate-600 no-underline transition-colors duration-150 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700/40 dark:hover:text-slate-100"
            >
              <Icon name="user" className="w-4 h-4" />
              个人信息
            </router-link>
          </el-dropdown-item>
          <el-dropdown-item class="!p-0 !bg-transparent">
            <router-link
              :to="{ path: '/system/setting' }"
              class="flex items-center gap-2 w-full px-4 py-2 mx-1 rounded-lg text-sm text-slate-600 no-underline transition-colors duration-150 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700/40 dark:hover:text-slate-100"
            >
              <Icon name="cog-6-tooth" className="w-4 h-4" />
              系统设置
            </router-link>
          </el-dropdown-item>

          <!-- 分割线 -->
          <div class="mx-3 my-1 border-t border-slate-100 dark:border-slate-700/60"></div>

          <!-- 退出按钮 -->
          <el-dropdown-item class="!p-0 !bg-transparent" @click="logout">
            <div class="flex items-center gap-2 w-full px-4 py-2 mx-1 rounded-lg text-sm text-rose-600 cursor-pointer transition-colors duration-150 hover:bg-rose-50/80 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300">
              <Icon name="power" className="w-4 h-4" />
              退出登录
            </div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/stores/modules/user'
import Message from '@/support/message'

const userStore = useUserStore()

const logout = () => {
  Message.confirm('确定退出系统吗?', () => {
    userStore.logout()
  })
}
</script>

<style scoped>
:deep(.profile-dropdown) {
  width: 14rem;
  border-radius: 0.75rem;
  border: 1px solid rgb(226 232 240 / 0.8);
  background: rgb(255 255 255 / 0.95);
  backdrop-filter: blur(4px);
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  padding: 0 !important;
}

:deep(.profile-dropdown .el-popper__arrow) {
  display: none;
}

.dark :deep(.profile-dropdown) {
  border-color: rgb(51 65 85 / 0.6);
  background: rgb(30 41 59 / 0.95);
}
</style>

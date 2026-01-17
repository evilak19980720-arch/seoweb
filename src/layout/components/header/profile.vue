<template>
  <div class="header-action header-profile">
    <el-dropdown
      size="large"
      placement="bottom-end"
      class="flex items-center justify-center w-full h-full"
      popper-class="profile-dropdown rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-regal-dark"
    >
      <div class="flex items-center">
        <cavatar />
      </div>
      <template #dropdown>
        <el-dropdown-menu class="w-52 py-2">
          <el-dropdown-item disabled class="px-2">
            <cavatar />
            <div class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-md font-semibold tracking-wide text-slate-400">
              {{ userStore.getNickname }}
            </div>
          </el-dropdown-item>
          <el-dropdown-item class="group px-2">
            <div
              class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 transition  dark:text-slate-200 "
            >
              <Icon name="user" className="w-4 h-4" />
              <router-link :to="{ path: '/users/center' }" class="w-full">个人信息</router-link>
            </div>
          </el-dropdown-item>
          <el-dropdown-item class="group px-2">
            <div
              class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 transition dark:text-slate-200 "
            >
              <Icon name="cog-6-tooth" className="w-4 h-4" />
              <router-link :to="{ path: '/system/setting' }" class="w-full">系统设置</router-link>
            </div>
          </el-dropdown-item>
          <el-dropdown-item divided class="group px-2" @click="logout">
            <div
              class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-rose-600 transition dark:text-rose-400 "
            >
              <Icon name="power" className="w-4 h-4" />
              退 出
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

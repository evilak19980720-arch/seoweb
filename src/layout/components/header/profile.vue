<template>
  <div class="flex w-full pl-1 pr-1 outline-none hover:cursor-pointer">
    <el-dropdown size="large" placement="bottom-end" class="flex items-center justify-center w-full hover:cursor-pointer">
      <div class="flex outline-none lg:items-center">
        <cavatar />
      </div>
      <template #dropdown>
        <el-dropdown-menu class="w-28">
          <el-dropdown-item>
            {{ userStore.getNickname }}
          </el-dropdown-item>
          <el-dropdown-item>
            <Icon name="user" />
            <router-link :to="{ path: '/users/center' }" class="w-full">个人信息</router-link>
          </el-dropdown-item>
          <el-dropdown-item>
            <Icon name="cog-6-tooth" />
            <router-link :to="{ path: '/system/setting' }" class="w-full">系统设置</router-link>
          </el-dropdown-item>
          <el-dropdown-item divided @click="logout">
            <Icon name="power" className="mr-1 w-4 h-4" />
            退 出
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

<template>
  <div class="grid w-10 h-10 mt-2 rounded-full place-items-center hover:cursor-pointer">
    <Icon name="moon" @click="changeTheme()" v-if="isDark" />
    <Icon name="sun" @click="changeTheme()" v-else />
  </div>
</template>

<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'
import { useAppStore } from '@/stores/modules/app'
import { unref } from 'vue'

const appStore = useAppStore()
const isDark = useDark()

const toggleDark = useToggle(isDark)

function changeTheme() {
  appStore.setDarkMode(!unref(isDark))
  toggleDark()
}
</script>

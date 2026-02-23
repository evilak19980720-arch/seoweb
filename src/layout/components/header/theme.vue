<template>
  <div class="header-action" @click="changeTheme()">
    <Transition name="theme-icon" mode="out-in">
      <Icon name="moon" v-if="isDark" key="dark" class="theme-icon" />
      <Icon name="sun" v-else key="light" class="theme-icon" />
    </Transition>
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

<style scoped>
.theme-icon {
  transition: transform 0.2s;
}

.theme-icon-enter-active,
.theme-icon-leave-active {
  transition: all 0.25s ease;
}

.theme-icon-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.6);
}

.theme-icon-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.6);
}
</style>

<template>
  <div>
    <div :class="sideClasses" class="sider-container">
      <!--logo -->
      <Logo />
      <div class="sider-menu-scroll">
        <!-- menu item -->
        <Menu :menu-class="'pt-1 ' + menuClass" />
      </div>
    </div>
    <Mask v-if="isMobile && appStore.isExpand" @click="appStore.changeExpaned()" />
  </div>
</template>

<script lang="ts" setup>
import { useAppStore } from '@/stores/modules/app'
import { computed, onMounted, ref, watch } from 'vue'
import { isMiniScreen } from '@/support/helper'

const isMobile = ref(isMiniScreen())
const appStore = useAppStore()

const sideClasses = computed(() => {
  const isVertical = appStore.getVertical
  const isExpand = appStore.isExpand

  const base = 'h-screen'
  const position = isVertical
    ? 'z-[1000] sm:z-[999] absolute top-0 sm:fixed left-0 sm:left-20'
    : 'z-[1000] sm:z-0 absolute top-0 left-0 sm:fixed'

  const width = isExpand
    ? 'sider-expanded'
    : isVertical
      ? 'sider-collapsed-vertical'
      : 'sider-collapsed-single'

  return [base, position, width]
})

const menuClass = ref<string>()

watch(appStore.$state, () => {
  menuClass.value = isExpandWhenInMobile()
})

onMounted(() => {
  window.onresize = () => {
    isMobile.value = isMiniScreen()
    menuClass.value = isExpandWhenInMobile()
  }
  appStore.isExpand = true
})

function isExpandWhenInMobile(): string {
  return !appStore.isExpand && isMobile.value ? 'hidden' : ''
}
</script>

<style scoped>
.sider-container {
  background-color: var(--sider-menu-bg-color);
  border-right: 1px solid var(--el-border-color-lighter);
  transition: width 280ms cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.sider-expanded {
  width: 240px;
}

.sider-collapsed-vertical {
  width: 0;
}

@media (min-width: 640px) {
  .sider-collapsed-vertical {
    width: 0;
  }
}

.sider-collapsed-single {
  width: 0;
}

@media (min-width: 640px) {
  .sider-collapsed-single {
    width: 64px;
  }
}

.sider-menu-scroll {
  @apply overflow-auto pb-20 flex-1;
  scrollbar-width: thin;
  scrollbar-color: rgba(144, 147, 153, 0.3) transparent;
}

.sider-menu-scroll::-webkit-scrollbar {
  width: 2px;
}

.sider-menu-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.sider-menu-scroll::-webkit-scrollbar-thumb {
  background: rgba(144, 147, 153, 0.3);
  border-radius: 25px;
}

.sider-menu-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(144, 147, 153, 0.5);
}
</style>

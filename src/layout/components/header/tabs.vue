<script setup lang="ts">
import { useNavTabStore } from '@/stores/modules/tabs'
import ContextMenu from './contextMenu.vue'
import { computed, ref } from 'vue'

const navTabStore = useNavTabStore()
const tabs = computed(() => navTabStore.getNavTabs)
const contextMenuRef = ref<InstanceType<typeof ContextMenu>>()
</script>

<template>
  <div
    ref="container"
    v-if="tabs.length > 0"
    class="z-10 w-full shrink-0 py-1.5 bg-[var(--header-bg-color)] border-b border-[var(--el-border-color-lighter)]"
  >
    <div class="flex items-center h-full px-3 gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div
        v-for="tag in tabs"
        :key="tag.name"
        :class="[
          'group flex items-center gap-1 rounded-md text-xs cursor-pointer whitespace-nowrap select-none border transition-all duration-150 ease-in-out',
          'hover:border-[color-mix(in_srgb,var(--el-color-primary)_40%,transparent)] hover:text-[var(--el-color-primary)]',
          tag.is_active
            ? 'bg-[color-mix(in_srgb,var(--el-color-primary)_8%,transparent)] border-[color-mix(in_srgb,var(--el-color-primary)_30%,transparent)] text-[var(--el-color-primary)] font-medium'
            : 'border-[var(--el-border-color-lighter)] text-[var(--el-text-color-regular)] bg-[var(--header-bg-color)]',
          !tag.meta.affix ? 'pl-3 py-1 pr-1.5' : 'px-3 py-1'
        ]"
        @click.prevent="navTabStore.selectTab(tag)"
        @contextmenu.prevent="(e) => contextMenuRef?.open(e, tag)"
      >
        <span>{{ tag.meta.title }}</span>
        <span
          v-if="!tag.meta.affix"
          :class="[
            'rounded-xs p-0.5 transition-opacity duration-150 group-hover:opacity-100',
            'hover:bg-[color-mix(in_srgb,var(--el-color-primary)_15%,transparent)] hover:text-[var(--el-color-primary)]',
            tag.is_active
              ? 'opacity-60 text-[var(--el-color-primary)]'
              : 'opacity-0 text-[var(--el-text-color-secondary)]'
          ]"
          @click.stop="navTabStore.removeTargetTab(tag)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </span>
      </div>
      <ContextMenu ref="contextMenuRef" />
    </div>
  </div>
</template>

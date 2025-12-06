<script setup lang="ts">
import { useNavTabStore } from '@/stores/modules/tabs'
import ContextMenu from './contextMenu.vue'
import { computed } from 'vue'
const navTabStore = useNavTabStore()
const tabs = computed(() => navTabStore.getNavTabs)
</script>

<template>
  <div class="flex z-10 gap-x-2 items-center py-2 w-full h-10 bg-white border-l border-gray-200 shadow-md dark:border-x-gray-800 dark:bg-regal-dark sm:px-3" ref="container" v-if="tabs.length > 0">
    <ContextMenu>
      <el-tag
        class="hover:cursor-pointer"
        v-for="(tag, index) in tabs"
        :key="index"
        :closable="!tag.meta.affix"
        :disable-transitions="false"
        :effect="tag.is_active ? 'dark' : 'plain'"
        @click.prevent="navTabStore.selectTab(tag)"
        @close="navTabStore.removeTab(index)"
      >
        {{ tag.meta.title }}
      </el-tag>
    </ContextMenu>
  </div>
</template>

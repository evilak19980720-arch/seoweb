<template>
  <div class="header-action">
    <el-dropdown
      size="large"
      placement="bottom-end"
      class="flex items-center justify-center w-full cursor-pointer"
      popper-class="lang-dropdown"
      @command="selectLanguage"
    >
      <Icon name="language" />
      <template #dropdown>
        <el-dropdown-menu class="py-2 !border-none !shadow-none">
          <!-- 标题 -->
          <div class="px-4 py-2 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Language
          </div>
          <el-dropdown-item
            v-for="lang in langs"
            :key="lang.value"
            :command="lang.value"
            :disabled="lang.value === defaultLang"
            class="!p-0 !bg-transparent"
          >
            <div
              class="flex items-center justify-between w-full px-4 py-2.5 mx-1 rounded-lg transition-all duration-150 ease-out"
              :class="
                lang.value === defaultLang
                  ? 'font-semibold text-indigo-600 bg-indigo-50/60 dark:text-indigo-400 dark:bg-indigo-500/10'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700/40 dark:hover:text-slate-100'
              "
              style="width: calc(100% - 0.5rem)"
            >
              <span class="text-sm">{{ $t('system.' + lang.label) }}</span>
              <Icon
                v-if="lang.value === defaultLang"
                name="check"
                className="w-4 h-4 text-indigo-500 dark:text-indigo-400"
              />
            </div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script lang="ts" setup>
import { reactive, computed } from 'vue'
import { useAppStore } from '@/stores/modules/app'

const langs = reactive([
  { label: 'chinese', value: 'zh' },
  { label: 'english', value: 'en' }
])

const appStore = useAppStore()
// select default languages
const defaultLang = computed(() => {
  return appStore.getLocale
})

// select language
const selectLanguage = (value: 'zh' | 'en') => {
  appStore.changeLocale(value)
  location.reload()
}
</script>

<style scoped>
:deep(.lang-dropdown) {
  width: 12rem;
  border-radius: 0.75rem;
  border: 1px solid rgb(226 232 240 / 0.8);
  background: rgb(255 255 255 / 0.95);
  backdrop-filter: blur(4px);
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  padding: 0 !important;
}

:deep(.lang-dropdown .el-popper__arrow) {
  display: none;
}

.dark :deep(.lang-dropdown) {
  border-color: rgb(51 65 85 / 0.6);
  background: rgb(30 41 59 / 0.95);
}
</style>

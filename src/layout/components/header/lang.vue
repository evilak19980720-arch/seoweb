<template>
  <div class="header-action">
    <div class="flex pl-1 pr-1 hover:cursor-pointer">
      <el-dropdown
        size="large"
        class="flex items-center justify-center w-full hover:cursor-pointer"
        popper-class="lang-dropdown rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-regal-dark"
        @command="selectLanguage"
      >
        <Icon name="language" />
        <template #dropdown>
          <el-dropdown-menu class="py-1">
            <el-dropdown-item v-for="lang in langs" :key="lang.value" :command="lang.value" :disabled="lang.value == defaultLang">
              <div class="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-sm transition">
                <span
                  :class="
                    lang.value === defaultLang
                      ? 'font-semibold text-slate-900 dark:text-slate-100 w-full'
                      : 'text-slate-600 dark:text-slate-300'
                  "
                >
                  {{ $t('system.' + lang.label) }}
                </span>
              </div>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
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

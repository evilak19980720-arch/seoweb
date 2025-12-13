<template>
  <!-- 搜索图标触发器 -->
  <div class="hidden w-10 h-10 mt-2 rounded-full outline-none sm:grid place-items-center hover:cursor-pointer">
    <Icon name="magnifying-glass" class="hidden sm:block" @click="openSearch" />
  </div>

  <!-- 搜索面板 -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-[9999999999999] flex items-start justify-center pt-[10vh] bg-black/50 backdrop-blur-sm"
        @click.self="closeSearch"
        @keydown="handleKeydown"
      >
        <!-- 搜索卡片 -->
        <div class="w-full max-w-5xl mx-4">
          <!-- 顶部区域 - 与遮罩层融为一体 -->
          <!-- Logo 区域 -->
          <div v-if="logoSrc" class="flex items-center justify-center py-4">
            <img :src="logoSrc" alt="Logo" class="w-10 h-10 rounded-full" />
          </div>

          <!-- 搜索输入框 -->
          <div class="px-0 py-3">
            <div class="flex items-center gap-3 px-4 py-2.5 w-full bg-transparent rounded-lg border border-white/30 dark:border-gray-600/50">
              <Icon name="magnifying-glass" class="w-5 h-5 text-white/70" />
              <input
                ref="searchInputRef"
                v-model="searchKeyword"
                type="text"
                placeholder="搜索页面，支持名称、标识以及URL的模糊查询"
                class="flex-1 text-sm bg-transparent border-none outline-none text-white placeholder-white/50"
                @keydown.down.prevent="selectNext"
                @keydown.up.prevent="selectPrev"
                @keydown.enter.prevent="navigateToSelected"
                @keydown.esc.prevent="closeSearch"
              />
            </div>
          </div>

          <!-- 快捷键提示 -->
          <div class="flex items-center justify-center gap-6 px-4 py-2 text-xs text-white/80">
            <div class="flex items-center gap-1.5">
              <kbd class="px-1.5 py-0.5 bg-white/20 rounded text-white font-mono">Ctrl+K</kbd>
              <span>唤醒搜索面板</span>
            </div>
            <div class="flex items-center gap-1.5">
              <Icon name="chevron-up" class="w-4 h-4" />
              <Icon name="chevron-down" class="w-4 h-4" />
              <span>切换搜索结果</span>
            </div>
            <div class="flex items-center gap-1.5">
              <kbd class="px-1.5 py-0.5 bg-white/20 rounded text-white font-mono">Enter</kbd>
              <span>进入页面</span>
            </div>
            <div class="flex items-center gap-1.5">
              <kbd class="px-1.5 py-0.5 bg-white/20 rounded text-white font-mono">Esc</kbd>
              <span>关闭搜索面板</span>
            </div>
          </div>

          <!-- 菜单列表 - 实色背景带圆角和阴影 -->
          <div ref="menuListRef" class="menu-list mt-3 max-h-[50vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
            <!-- 搜索模式：显示扁平化结果 -->
            <ul v-if="searchKeyword.trim()" class="py-2">
              <li
                v-for="(item, index) in filteredFlatMenus"
                :key="item.path"
                class="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
                :class="[
                  selectedIndex === index
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                ]"
                @click="navigateTo(item)"
                @mouseenter="selectedIndex = index"
              >
                <!-- 菜单图标 -->
                <div class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                  <Icon :name="item.icon || 'document'" class="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </div>
                <!-- 菜单信息 -->
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium truncate">{{ item.title }}</div>
                  <div class="text-xs text-gray-400 truncate">{{ item.path }}</div>
                </div>
              </li>
              <!-- 无搜索结果 -->
              <li v-if="filteredFlatMenus.length === 0" class="px-4 py-8 text-center text-gray-400">
                <Icon name="magnifying-glass" class="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>未找到匹配的菜单</p>
              </li>
            </ul>

            <!-- 默认模式：显示树形结构 -->
            <div v-else class="py-2">
              <template v-for="(menu, menuIndex) in treeMenus" :key="menu.path">
                <!-- 一级菜单分组标题 -->
                <div class="px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {{ menu.title }}
                </div>
                <!-- 子菜单列表 -->
                <ul v-if="menu.children?.length">
                  <li
                    v-for="(child, childIndex) in menu.children"
                    :key="child.path"
                    class="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors"
                    :class="[
                      isSelected(menuIndex, childIndex)
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                    ]"
                    @click="navigateTo(child)"
                    @mouseenter="setSelected(menuIndex, childIndex)"
                  >
                    <!-- 菜单图标 -->
                    <div class="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700">
                      <Icon :name="child.icon || 'document'" class="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                    </div>
                    <!-- 菜单信息 -->
                    <div class="flex-1 min-w-0">
                      <div class="text-sm truncate">{{ child.title }}</div>
                    </div>
                    <!-- 路径 -->
                    <div class="text-xs text-gray-400 truncate max-w-[200px]">{{ child.path }}</div>
                  </li>
                </ul>
              </template>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
import { usePermissionsStore } from '@/stores/modules/user/permissions'
import { useAppStore } from '@/stores/modules/app'
import { Menu } from '@/types/Menu'
import router from '@/router'
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import LogoPng from '@/public/assets/logo.png'
import { warpHost } from '@/support/helper'

// 搜索面板可见状态
const visible = ref(false)
// 搜索关键词
const searchKeyword = ref('')
// 当前选中的菜单索引（用于树形结构）
const selectedMenuIndex = ref(0)
const selectedChildIndex = ref(0)
// 当前选中索引（用于搜索结果）
const selectedIndex = ref(0)
// 搜索输入框引用
const searchInputRef = ref<HTMLInputElement | null>(null)
// 菜单列表引用
const menuListRef = ref<HTMLElement | null>(null)

// 权限菜单数据
const permissionStore = usePermissionsStore()

// 应用设置（获取 logo）
const appStore = useAppStore()
const setting = computed(() => appStore.getSetting)

// Logo 图片源
const logoSrc = computed(() => {
  if (setting.value?.dashboard?.logo) {
    return warpHost(setting.value.dashboard.logo)
  }
  return LogoPng
})

// 扁平化菜单项接口
interface FlatMenuItem {
  title: string
  path: string
  icon?: string
}

// 树形菜单项接口
interface TreeMenuItem {
  title: string
  path: string
  icon?: string
  children?: FlatMenuItem[]
}

/**
 * 判断菜单是否为叶子节点（可跳转的页面）
 */
const isLeafMenu = (menu: Menu): boolean => {
  // 没有子菜单的是叶子节点
  if (!menu.children || menu.children.length === 0) {
    return true
  }
  // 有 redirect 且不是 noRedirect 的也可以跳转
  if (menu.redirect && menu.redirect !== 'noRedirect') {
    return false // 有 redirect 说明是分组
  }
  return false
}

/**
 * 构建树形菜单结构（只保留可跳转的叶子节点）
 */
const buildTreeMenus = (menus: Menu[] | undefined): TreeMenuItem[] => {
  const result: TreeMenuItem[] = []

  menus?.forEach(menu => {
    // 处理没有 meta 的单层菜单
    if (menu.meta === undefined) {
      const child = menu.children?.[0]
      if (child?.meta?.title && child?.path) {
        // 单层菜单作为独立分组
        result.push({
          title: child.meta.title as string,
          path: child.path,
          icon: child.meta.icon as string | undefined,
          children: [{
            title: child.meta.title as string,
            path: child.path,
            icon: child.meta.icon as string | undefined
          }]
        })
      }
    } else if (menu.meta?.title) {
      // 收集该菜单下的所有叶子节点
      const leafChildren = collectLeafMenus(menu.children)
      if (leafChildren.length > 0) {
        result.push({
          title: menu.meta.title as string,
          path: menu.path,
          icon: menu.meta.icon as string | undefined,
          children: leafChildren
        })
      }
    }
  })

  return result
}

/**
 * 递归收集所有叶子菜单
 */
const collectLeafMenus = (menus: Menu[] | undefined): FlatMenuItem[] => {
  const result: FlatMenuItem[] = []

  menus?.forEach(menu => {
    if (menu.meta?.hidden) return // 跳过隐藏菜单

    if (isLeafMenu(menu)) {
      // 叶子节点，添加到结果
      if (menu.meta?.title && menu.path) {
        result.push({
          title: menu.meta.title as string,
          path: menu.path,
          icon: menu.meta.icon as string | undefined
        })
      }
    } else {
      // 非叶子节点，递归处理子菜单
      result.push(...collectLeafMenus(menu.children))
    }
  })

  return result
}

/**
 * 递归扁平化菜单树（只保留叶子节点）
 */
const flattenLeafMenus = (menus: Menu[] | undefined): FlatMenuItem[] => {
  const result: FlatMenuItem[] = []

  menus?.forEach(menu => {
    if (menu.meta?.hidden) return // 跳过隐藏菜单

    // 处理没有 meta 的单层菜单
    if (menu.meta === undefined) {
      const child = menu.children?.[0]
      if (child?.meta?.title && child?.path) {
        result.push({
          title: child.meta.title as string,
          path: child.path,
          icon: child.meta.icon as string | undefined
        })
      }
    } else if (isLeafMenu(menu)) {
      // 叶子节点
      if (menu.meta?.title && menu.path) {
        result.push({
          title: menu.meta.title as string,
          path: menu.path,
          icon: menu.meta.icon as string | undefined
        })
      }
    } else {
      // 非叶子节点，递归处理
      result.push(...flattenLeafMenus(menu.children))
    }
  })

  return result
}

// 树形菜单
const treeMenus = computed(() => buildTreeMenus(permissionStore.getMenus))

// 所有叶子菜单项（扁平化）
const allFlatMenus = computed(() => flattenLeafMenus(permissionStore.getMenus))

// 根据关键词过滤后的扁平菜单
const filteredFlatMenus = computed(() => {
  const keyword = searchKeyword.value.toLowerCase().trim()
  if (!keyword) {
    return allFlatMenus.value
  }
  return allFlatMenus.value.filter(item =>
    item.title.toLowerCase().includes(keyword) ||
    item.path.toLowerCase().includes(keyword)
  )
})

// 获取所有可选择的菜单项（用于键盘导航）
const allSelectableItems = computed(() => {
  const items: { menuIndex: number; childIndex: number; item: FlatMenuItem }[] = []
  treeMenus.value.forEach((menu, menuIndex) => {
    menu.children?.forEach((child, childIndex) => {
      items.push({ menuIndex, childIndex, item: child })
    })
  })
  return items
})

// 判断是否选中
const isSelected = (menuIndex: number, childIndex: number): boolean => {
  return selectedMenuIndex.value === menuIndex && selectedChildIndex.value === childIndex
}

// 设置选中项
const setSelected = (menuIndex: number, childIndex: number) => {
  selectedMenuIndex.value = menuIndex
  selectedChildIndex.value = childIndex
}

// 监听过滤结果变化，重置选中索引
watch(filteredFlatMenus, () => {
  selectedIndex.value = 0
})

// 监听搜索关键词变化
watch(searchKeyword, () => {
  selectedIndex.value = 0
  selectedMenuIndex.value = 0
  selectedChildIndex.value = 0
})

/**
 * 打开搜索面板
 */
const openSearch = () => {
  visible.value = true
  searchKeyword.value = ''
  selectedIndex.value = 0
  selectedMenuIndex.value = 0
  selectedChildIndex.value = 0
  nextTick(() => {
    searchInputRef.value?.focus()
  })
}

/**
 * 关闭搜索面板
 */
const closeSearch = () => {
  visible.value = false
}

/**
 * 选择下一项
 */
const selectNext = () => {
  if (searchKeyword.value.trim()) {
    // 搜索模式
    if (selectedIndex.value < filteredFlatMenus.value.length - 1) {
      selectedIndex.value++
      scrollToSelected()
    }
  } else {
    // 树形模式
    const currentFlatIndex = allSelectableItems.value.findIndex(
      item => item.menuIndex === selectedMenuIndex.value && item.childIndex === selectedChildIndex.value
    )
    if (currentFlatIndex < allSelectableItems.value.length - 1) {
      const next = allSelectableItems.value[currentFlatIndex + 1]
      selectedMenuIndex.value = next.menuIndex
      selectedChildIndex.value = next.childIndex
      scrollToSelected()
    }
  }
}

/**
 * 选择上一项
 */
const selectPrev = () => {
  if (searchKeyword.value.trim()) {
    // 搜索模式
    if (selectedIndex.value > 0) {
      selectedIndex.value--
      scrollToSelected()
    }
  } else {
    // 树形模式
    const currentFlatIndex = allSelectableItems.value.findIndex(
      item => item.menuIndex === selectedMenuIndex.value && item.childIndex === selectedChildIndex.value
    )
    if (currentFlatIndex > 0) {
      const prev = allSelectableItems.value[currentFlatIndex - 1]
      selectedMenuIndex.value = prev.menuIndex
      selectedChildIndex.value = prev.childIndex
      scrollToSelected()
    }
  }
}

/**
 * 滚动到选中项
 */
const scrollToSelected = () => {
  nextTick(() => {
    const selectedElement = menuListRef.value?.querySelector('[class*="bg-blue-50"], [class*="bg-blue-900"]')
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  })
}

/**
 * 导航到选中的菜单
 */
const navigateToSelected = () => {
  if (searchKeyword.value.trim()) {
    // 搜索模式
    const selectedMenu = filteredFlatMenus.value[selectedIndex.value]
    if (selectedMenu) {
      navigateTo(selectedMenu)
    }
  } else {
    // 树形模式
    const selected = allSelectableItems.value.find(
      item => item.menuIndex === selectedMenuIndex.value && item.childIndex === selectedChildIndex.value
    )
    if (selected) {
      navigateTo(selected.item)
    }
  }
}

/**
 * 导航到指定菜单
 */
const navigateTo = (item: FlatMenuItem) => {
  router.push({ path: item.path })
  closeSearch()
}

/**
 * 处理键盘事件
 */
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    closeSearch()
  }
}

/**
 * 全局快捷键处理
 */
const handleGlobalKeydown = (e: KeyboardEvent) => {
  // Ctrl + K 打开搜索
  if (e.ctrlKey && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    if (visible.value) {
      closeSearch()
    } else {
      openSearch()
    }
  }
}

// 注册全局快捷键监听
onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<style scoped>
/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 菜单列表滚动条样式 */
.menu-list::-webkit-scrollbar {
  width: 6px;
}

.menu-list::-webkit-scrollbar-track {
  background: transparent;
}

.menu-list::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.menu-list::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.7);
}
</style>

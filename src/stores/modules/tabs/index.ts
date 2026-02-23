import { defineStore } from 'pinia'
import router from '@/router'

interface TabMeta {
  title: string
  affix: boolean
}

export interface Tab {
  name: string
  fullPath: string
  path: string
  is_active: boolean
  meta: TabMeta
}

const defaultTab: Tab = {
  name: 'basic',
  fullPath: '/dashboard/basic',
  path: '/dashboard/basic',
  is_active: true,
  meta: {
    title: '基础',
    affix: true
  }
}

export const useNavTabStore = defineStore('nav_tabs', {
  state: () => {
    return {
      tabs: [defaultTab] as Array<Tab>,
      refreshKey: 0
    }
  },

  persist: {
    storage: sessionStorage
  },

  getters: {
    getNavTabs(state): Array<Tab> {
      return state.tabs
    },

    getRefreshKey(state): number {
      return state.refreshKey
    }
  },

  actions: {
    addTabs(newTab: Tab): void {
      if (this.tabs.length >= 20) {
        console.log('最多添加 20 个 tab 标签')
        return
      }

      let isExist = false
      this.tabs.forEach((t: Tab) => {
        if (t.name === newTab.name) {
          isExist = true
          t.is_active = true
        } else {
          t.is_active = false
        }
      })

      if (!isExist) {
        this.tabs.push(newTab)
      }
    },

    getActiveTabIndex(): number | null {
      for (let i = 0; i < this.tabs.length; i++) {
        if (this.tabs[i].is_active) {
          return i
        }
      }

      return null
    },

    selectTab(tab: Tab): void {
      this.tabs.forEach(t => {
        t.is_active = t.name === tab.name
      })

      router.push(tab.fullPath)
    },

    removeTab(index: number): void {
      const activeIndex = this.getActiveTabIndex()
      this.tabs.splice(index, 1)

      if (activeIndex === index) {
        const nextIndex = Math.min(index, this.tabs.length - 1)
        this.tabs[nextIndex].is_active = true
        router.push(this.tabs[nextIndex].fullPath)
      } else if (activeIndex !== null && activeIndex > index) {
        router.push(this.tabs[activeIndex - 1].fullPath)
      }
    },

    refreshTab(tab: Tab): void {
      this.selectTab(tab)
      this.refreshKey++
    },

    removeTargetTab(tab: Tab): void {
      if (tab.meta.affix) {
        return
      }
      const index = this.tabs.findIndex(t => t.name === tab.name)
      if (index !== -1) {
        this.removeTab(index)
      }
    },

    removeAllTabs(): void {
      this.tabs = [defaultTab]
      router.replace({ path: defaultTab.fullPath })
    },

    removeOtherTabs(targetTab: Tab): void {
      this.tabs = this.tabs.filter(t => t.meta.affix || t.name === targetTab.name)
      const hasActive = this.tabs.some(t => t.is_active)
      if (!hasActive) {
        const target = this.tabs.find(t => t.name === targetTab.name)
        if (target) {
          this.selectTab(target)
        }
      }
    }
  }
})

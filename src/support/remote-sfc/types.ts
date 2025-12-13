import type { Component } from 'vue'

export interface PluginRouteConfig {
  path: string
  name?: string
  component: string
  meta?: {
    title?: string
    icon?: string
    hidden?: boolean
    [key: string]: any
  }
  children?: PluginRouteConfig[]
  redirect?: string
}

export interface LoadedPluginComponent {
  path: string
  component: Component
  loadedAt: number
}

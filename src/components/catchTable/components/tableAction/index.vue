<template>
  <span :class="action.class">
    <template v-for="(component, index) in action.components" :key="index">
      <component :is="components[component.name]" v-bind="component" v-on="parseEvents(component.events || {})" :class="component.class" v-if="!component.route" />
      <router-link v-else :to="parseRoute(component.route, scope)" :key="index">
        <component :is="components[component.name]" v-bind="component" :class="component.class" />
      </router-link>
    </template>
  </span>
</template>
<script setup lang="ts">
// @ts-nocheck
import normal from '@/components/admin/buttons/normal.vue'
import { isFunction, strToFunction } from '@/support/helper'
const components = {
  normal
}
interface ComponentConfig {
  name: keyof typeof components
  class?: string
  [key: string]: any
}
interface Action {
  name: string
  class?: string
  components: ComponentConfig[]
}
const props = defineProps<{
  action: Action
  scope?: any
}>()

// 解析 event，支持动态
const parseEvents = (events: Record<string, Function | string>) => {
  const parsedEvents: Record<string, any> = {}
  for (const [key, value] of Object.entries(events)) {
    if (isFunction(value)) {
      parsedEvents[key] = () => value(props.scope)
    } else {
      parsedEvents[key] = strToFunction(value, props.scope)
    }
  }
  return parsedEvents
}

// 解析路由参数
const parseRoute = (route: string, scope: any) => {
  if (!scope) {
    return route
  }

  return route.replace(/:(\w+)/g, (_, key) => scope.row[key] || `:${key}`)
}
</script>

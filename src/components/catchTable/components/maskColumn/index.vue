<template>
  <div class="flex gap-x-3">{{ icon === 'eye' ? maskString : content }} <Icon :name="icon" @click="view()" class="cursor-pointer" /></div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'

interface Prop {
  content?: any
}

const icon = ref('eye-slash')
icon.value = 'eye'
const props = defineProps<Prop>()
const maskString = '*'.repeat(props.content.length)

// 截取
const view = () => {
  icon.value = icon.value === 'eye' ? 'eye-slash' : 'eye'
}
</script>

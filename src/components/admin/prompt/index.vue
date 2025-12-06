<template>
  <div :class="'text-sm text-gray-400 mt-1 ' + className">{{ text }}</div>
</template>
<script lang="ts" setup>
defineProps({
  text: {
    type: String,
    require: false
  },

  className: {
    type: String,
    require: false
  }
})
</script>

<template>
  <div class="grid grid-cols-1 gap-y-2 md:gap-y-0 md:grid-cols-4 gap-x-4">
    <el-card class="rounded-md" shadow="hover" v-for="(item, key) in sales" :key="key">
      <div class="grid gap-y-2">
        <div class="text-md">{{ item.title }}</div>
        <div class="flex">
          <div class="flex items-center text-2xl">￥</div>
          <div class="ml-1 text-2xl font-bold">{{ item.sale }}</div>
        </div>
        <div class="flex justify-between w-full">
          <div class="flex text-gray-700 gap-x-1">
            <div class="flex items-center ml-1">
              <span>￥</span>

              <div class="flex items-center font-bold text-gray-500 text-md">{{ item.yesterday }}</div>
            </div>
          </div>
          <div class="text-green-500">{{ item.grow }}</div>
        </div>
      </div>
    </el-card>
  </div>
</template>
<script setup lang="ts">
const sales = [
  { title: '销售额', sale: '10,000', yesterday: '9,000', grow: '+5%' },
  { title: '利润', sale: '8,000', yesterday: '6,000', grow: '+10%' },
  { title: '收入', sale: '30,000', yesterday: '23,000', grow: '+15%' },
  { title: '成本', sale: '20,000', yesterday: '19,000', grow: '+20%' }
]
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-x-3">
    <el-card shadow="hover">
      <h3 class="mb-2 text-base font-bold">负载</h3>
      <!-- circle progress -->
      <div class="py-2">
        <v-chart class="chart" autoresize :option="total()" />
      </div>
      <div class="w-full text-center dark:text-gray-100">运行中</div>
    </el-card>
    <el-card shadow="hover">
      <h3 class="mb-2 text-base font-bold">CPU 使用率</h3>

      <!-- circle progress -->
      <div class="py-2">
        <v-chart class="chart" autoresize :option="cpu()" />
      </div>

      <div class="w-full text-center dark:text-gray-100">4核心</div>
    </el-card>
    <el-card shadow="hover">
      <h3 class="mb-2 text-base font-bold">内存使用率</h3>

      <!-- circle progress -->
      <div class="py-2">
        <v-chart class="chart" autoresize :option="memory()" />
      </div>

      <div class="w-full text-center dark:text-gray-100">3530 / 7675(MB)</div>
    </el-card>
    <el-card shadow="hover">
      <h3 class="mb-2 text-base font-bold dark:text-gray-100 ">硬盘使用率</h3>

      <!-- circle progress -->
      <div class="py-2">
        <v-chart class="chart" autoresize :option="disk()" />
      </div>

      <div class="w-full text-center dark:text-gray-100">43.48G / 58.88G</div>
    </el-card>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue'

const getGauge = () => {
  return {
    series: [
      {
        type: 'gauge',
        startAngle: 90,
        endAngle: -270,
        pointer: {
          show: false
        },
        progress: {
          show: true,
          overlap: false,
          roundCap: true,
          clip: false,
          itemStyle: {
            borderWidth: 1,
            borderColor: '#464646'
          }
        },
        axisLine: {
          lineStyle: {
            width: 10
          }
        },
        splitLine: {
          show: false,
          distance: 0,
          length: 10
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          show: false,
          distance: 60
        },
        data: [],
        title: {
          fontSize: 14
        },
        detail: {
          width: 50,
          height: 50,
          show: true,
          fontSize: 20,
          formatter: '{value}%'
        }
      }
    ]
  }
}

const totlaCount = ref(60)
const cpuCount = ref(50)
const memoryCount = ref(36)
const diskCount = ref(23)
const total = () => {
  const gauge = getGauge()
  gauge.series[0].data = [
    {
      value: totlaCount.value,
      detail: {
        valueAnimation: true,
        offsetCenter: ['0%', '10%']
      }
    } as never
  ]
  return gauge
}
const cpu = () => {
  const gauge = getGauge()
  gauge.series[0].data = [
    {
      value: cpuCount.value,
      detail: {
        valueAnimation: true,
        offsetCenter: ['0%', '10%']
      }
    } as never
  ]
  return gauge
}
const memory = () => {
  const gauge = getGauge()
  gauge.series[0].data = [
    {
      value: memoryCount.value,
      detail: {
        valueAnimation: true,
        offsetCenter: ['0%', '10%']
      }
    } as never
  ]
  return gauge
}
const disk = () => {
  const gauge = getGauge()
  gauge.series[0].data = [
    {
      value: diskCount.value,
      detail: {
        valueAnimation: true,
        offsetCenter: ['0%', '10%']
      }
    } as never
  ]
  return gauge
}
onMounted(() => {
  setInterval(function () {
    totlaCount.value = +(Math.random() * 100).toFixed(2)
    cpuCount.value = +(Math.random() * 100).toFixed(2)
    memoryCount.value = +(Math.random() * 100).toFixed(2)
    diskCount.value = +(Math.random() * 100).toFixed(2)
  }, 3000)
})
</script>
<style scoped>
.chart {
  height: 200px;
}
</style>

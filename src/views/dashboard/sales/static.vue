<template>
  <div class="grid gap-y-3">
    <div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-3">
        <div class="bg-white rounded dark:bg-regal-dark">
          <v-chart class="chart" autoresize :option="weekSales" />
        </div>
        <div class="bg-white rounded dark:bg-regal-dark">
          <v-chart class="px-3 py-5 chart" autoresize :option="trafficResource" />
        </div>
      </div>
    </div>
    <div class="grid bg-white rounded dark:bg-regal-dark">
      <v-chart class="chart" autoresize :option="monthSales" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
// 月销量
const monthSales = {
  xAxis: {
    data: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
  },
  yAxis: {
    name: '月销量'
  },
  series: [
    {
      data: [10, 22, 28, 43, 49, 50, 90, 70, 80, 54, 67, 34],
      type: 'line',
      stack: 'x'
    },
    {
      data: [5, 4, 3, 5, 10, 11, 24, 35, 44, 44, 66, 73, 33],
      type: 'line',
      stack: 'x'
    }
  ]
}
// 周销量
const weekSales = {
  xAxis: {
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },
  yAxis: {
    name: '人流量/销售量'
  },
  series: [
    {
      name: '人流量',
      type: 'bar',
      data: [23, 24, 18, 25, 18, 30, 100],
      barGap: '20%',
      barCategoryGap: '40%'
    },
    {
      name: '销售量',
      type: 'bar',
      data: [12, 14, 9, 9, 11, 15, 50]
    }
  ]
}
const trafficResource = ref({
  title: {
    text: '流量来源',
    left: 'center'
  },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b} : {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 'left',
    data: ['广泛', '邮件', '网络广告', '视频广告', '搜索引擎']
  },
  series: [
    {
      name: '流量来源',
      type: 'pie',
      radius: '55%',
      center: ['50%', '60%'],
      data: [
        { value: 335, name: '广泛' },
        { value: 310, name: '邮件' },
        { value: 234, name: '网络广告' },
        { value: 135, name: '视频广告' },
        { value: 1548, name: '搜索引擎' }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
})
</script>
<style scoped>
.chart {
  height: 400px;
}
</style>

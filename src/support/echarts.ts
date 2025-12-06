import { use } from 'echarts/core'
import { PieChart, BarChart, LineChart, GaugeChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { App } from 'vue'
import ECharts from 'vue-echarts'

use([TitleComponent, TooltipComponent, LegendComponent, PieChart, CanvasRenderer, GridComponent, BarChart, LineChart, GaugeChart])

export function bootstrapEcharts(app: App) {
  app.component('v-chart', ECharts)
}

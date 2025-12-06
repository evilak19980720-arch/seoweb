export type columnType = 'expand' | 'selection' | 'index' | 'operate'
export type fixed = 'fiexed' | 'right' | 'left'
export interface Column {
  type?: columnType // 类型 expand select index
  label?: string
  prop?: string
  'min-width'?: string | number
  width?: number | string
  slot?: string
  header: string // 表头插槽名称
  align?: string
  fixed?: fixed
  sortable?: boolean | string
  'sort-method'?: Function | string
  'sort-by'?: Function | string
  resizable?: boolean
  formatter?: Function | string // function(row, column, cellValue, index)
  'header-align'?: string
  'class-name'?: string
  selectable?: Function | string // function(row, index)
  show: boolean
  index?: number | Function | string // 如果设置了 type=index，可以通过传递 index 属性来自定义索引
  children?: Array<Column> // 多级表头
  filter?: Function | string
  ellipsis?: boolean | number // 当文字太多时，可以使用省略文字
  switch?: boolean // swith 字段状态切换
  mask?: boolean // mask 模式 abcd -> ****
  switchRefresh?: Function | string // switch refresh 刷新
  // 图片预览
  image?: boolean
  preview: boolean // 默认不预览
  // 标签
  tags?: boolean | Array<number>
  // vue 路由
  route?: string
  // 链接🔗
  link?: boolean
  link_text?: string
  // 操作
  update?: boolean // 编辑操作
  destroy?: boolean // 删除操作
  class?: string // tailwindcss 样式
}

// 分页
export interface paginate {
  layout: string
  limit: number
  page: number
  limits: Array<number>
  total: number
  changePage: Function
  changeLimit: Function
}

// option
export interface Option {
  label: string
  value: string | number
}
// 搜索 item
export interface SItem {
  type: string
  name: string
  default: any
  options: Array<Option>
}

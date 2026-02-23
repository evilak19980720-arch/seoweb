<template>
  <!-- 通知 -->
  <div class="header-action hidden sm:grid" ref="messageRef" v-click-outside="onClickOutside">
    <el-badge :value="unreadCount" :hidden="unreadCount === 0">
      <Icon name="bell" />
    </el-badge>
    <el-popover
      ref="popoverRef"
      :virtual-ref="messageRef"
      trigger="hover"
      virtual-triggering
      :width="360"
      popper-class="notification-popover"
    >
      <div class="flex flex-col w-[360px]">
        <!-- 面板 Header -->
        <div class="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-700/60">
          <span class="text-sm font-semibold text-slate-800 dark:text-slate-100">通知中心</span>
          <button
            v-if="unreadCount > 0"
            class="text-xs text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
            @click="markAllRead"
          >
            全部已读
          </button>
        </div>

        <!-- Tabs -->
        <el-tabs v-model="activeTab" class="notification-tabs">
          <el-tab-pane :label="`消息(${messages.length})`" name="message">
            <div class="max-h-72 overflow-y-auto notification-scroll">
              <div
                v-for="(msg, key) in messages"
                :key="key"
                class="flex items-start gap-3 px-5 py-3.5 cursor-pointer transition-colors duration-150 hover:bg-slate-50/80 dark:hover:bg-slate-700/30"
              >
                <div class="relative shrink-0">
                  <el-avatar
                    src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
                    class="h-9 w-9"
                  />
                  <!-- 未读圆点 -->
                  <span
                    v-if="msg.unread"
                    class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-indigo-500 rounded-full ring-2 ring-white dark:ring-slate-800"
                  ></span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-slate-700 dark:text-slate-200 leading-snug truncate">
                    {{ msg.content }}
                  </p>
                  <span class="text-xs text-slate-400 dark:text-slate-500 mt-1 block">{{ msg.time }}</span>
                </div>
              </div>
              <!-- 空状态 -->
              <div v-if="messages.length === 0" class="py-8 text-center text-slate-400">
                <Icon name="bell" className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p class="text-sm">暂无消息</p>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane :label="`通知(${notices.length})`" name="notice">
            <div class="max-h-72 overflow-y-auto notification-scroll">
              <div
                v-for="(notice, key) in notices"
                :key="key"
                class="flex items-start gap-3 px-5 py-3.5 cursor-pointer transition-colors duration-150 hover:bg-slate-50/80 dark:hover:bg-slate-700/30"
              >
                <div class="relative shrink-0">
                  <div class="w-9 h-9 rounded-full grid place-items-center bg-indigo-50 dark:bg-indigo-500/10">
                    <Icon name="bell-alert" className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  </div>
                  <span
                    v-if="notice.unread"
                    class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-indigo-500 rounded-full ring-2 ring-white dark:ring-slate-800"
                  ></span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-slate-700 dark:text-slate-200 leading-snug truncate">
                    {{ notice.content }}
                  </p>
                  <span class="text-xs text-slate-400 dark:text-slate-500 mt-1 block">{{ notice.time }}</span>
                </div>
              </div>
              <div v-if="notices.length === 0" class="py-8 text-center text-slate-400">
                <Icon name="bell" className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p class="text-sm">暂无通知</p>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>

        <!-- 面板 Footer -->
        <div class="border-t border-slate-100 dark:border-slate-700/60">
          <button class="flex items-center justify-center w-full py-3 text-sm text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all duration-150 dark:text-indigo-400 dark:hover:text-indigo-300 dark:hover:bg-indigo-500/5 group">
            查看全部通知
            <Icon name="arrow-right" className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </el-popover>
  </div>
</template>
<script setup lang="ts">
import { ref, unref, computed } from 'vue'
import { ClickOutside as vClickOutside } from 'element-plus'
const messageRef = ref()
const popoverRef = ref()
const activeTab = ref('message')

const onClickOutside = () => {
  unref(popoverRef).popperRef?.delayHide?.()
}

const messages = ref([
  { content: '你收到好友申请', time: '5 分钟前', unread: true },
  { content: '你收到 pro 的 license 授权', time: '1 小时前', unread: true },
  { content: '你收到管理员通知', time: '2 小时前', unread: false }
])

const notices = ref([
  { content: '系统将于今晚 22:00 进行维护升级', time: '3 小时前', unread: true }
])

const unreadCount = computed(() => {
  return messages.value.filter(m => m.unread).length + notices.value.filter(n => n.unread).length
})

const markAllRead = () => {
  messages.value.forEach(m => (m.unread = false))
  notices.value.forEach(n => (n.unread = false))
}
</script>

<style scoped>
:deep(.notification-popover) {
  border-radius: 0.75rem;
  border: 1px solid rgb(226 232 240 / 0.8);
  background: rgb(255 255 255 / 0.95);
  backdrop-filter: blur(4px);
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  padding: 0 !important;
  overflow: hidden;
}

.dark :deep(.notification-popover) {
  border-color: rgb(51 65 85 / 0.6);
  background: rgb(30 41 59 / 0.95);
}

/* Tabs 样式覆盖 */
:deep(.notification-tabs) {
  --el-tabs-header-height: 38px;
}

:deep(.notification-tabs .el-tabs__header) {
  padding: 0 1.25rem;
  margin-bottom: 0;
  border-bottom: 1px solid rgb(241 245 249);
}

.dark :deep(.notification-tabs .el-tabs__header) {
  border-bottom-color: rgb(51 65 85 / 0.6);
}

:deep(.notification-tabs .el-tabs__item) {
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.025em;
  color: var(--el-text-color-secondary);
}

:deep(.notification-tabs .el-tabs__item.is-active) {
  color: var(--el-color-primary);
}

:deep(.notification-tabs .el-tabs__active-bar) {
  border-radius: 9999px;
  height: 2px;
}

:deep(.notification-tabs .el-tabs__nav-wrap::after) {
  display: none;
}

/* 滚动条 */
.notification-scroll::-webkit-scrollbar {
  width: 4px;
}

.notification-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.notification-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 2px;
}

.notification-scroll::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.5);
}
</style>

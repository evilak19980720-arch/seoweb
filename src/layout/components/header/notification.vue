<template>
  <!-- 通知 -->
  <div class="header-action hidden sm:grid" ref="messageRef" v-click-outside="onClickOutside">
    <el-badge :value="3">
      <Icon name="bell" />
    </el-badge>
    <el-popover
      ref="popoverRef"
      :virtual-ref="messageRef"
      trigger="hover"
      virtual-triggering
      :width="320"
      popper-class="notification-dropdown overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-regal-dark"
    >
      <div class="w-80">
        <el-tabs model-value="message" class="notification-tabs">
          <el-tab-pane label="消息(8)" name="message">
            <div class="px-3 pb-3 pt-1">
              <div class="flex flex-col divide-y divide-slate-200/70 rounded-lg bg-slate-50/60 dark:divide-slate-700 dark:bg-regal-deep-dark/40">
                <div
                  class="flex items-start gap-3 px-3 py-3 text-sm text-slate-700 transition hover:bg-white/70 dark:text-slate-200 dark:hover:bg-slate-700/60"
                  v-for="(message, key) in messages"
                  :key="key"
                >
                  <el-avatar
                    src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
                    class="h-8 w-8 shrink-0"
                  />
                  <div class="leading-relaxed">
                    {{ message }}
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="通知(1)" name="notice">
            <div class="px-3 pb-3 pt-1">
              <div class="flex flex-col divide-y divide-slate-200/70 rounded-lg bg-slate-50/60 dark:divide-slate-700 dark:bg-regal-deep-dark/40">
                <div
                  class="flex items-start gap-3 px-3 py-3 text-sm text-slate-700 transition hover:bg-white/70 dark:text-slate-200 dark:hover:bg-slate-700/60"
                  v-for="(message, key) in messages"
                  :key="key"
                >
                  <el-avatar
                    src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
                    class="h-8 w-8 shrink-0"
                  />
                  <div class="leading-relaxed">
                    {{ message }}
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-popover>
  </div>
</template>
<script setup lang="ts">
import { ref, unref } from 'vue'
import { ClickOutside as vClickOutside } from 'element-plus'
const messageRef = ref()
const popoverRef = ref()
const onClickOutside = () => {
  unref(popoverRef).popperRef?.delayHide?.()
}

const messages = ref()

messages.value = ['你收到好友申请', '你收到 pro 的 license 授权', '你收到管理员通知']
</script>

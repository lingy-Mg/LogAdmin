<template>
  <div class="log-admin">
    <!-- 顶部菜单栏 -->
    <HeaderBar :connected="connected" :auto-scroll="autoScroll" :total-count="logs.length" :level-stats="levelStats"
      @scroll-to-bottom="scrollToBottom" @show-device-manager="showDeviceManager = true"
      @toggle-auto-scroll="toggleAutoScroll" @clear-logs="handleClearLogs" @update:autoScroll="autoScroll = $event" />

    <!-- 筛选条 -->
    <FiltersBar :filters="filters" :device-list="deviceList" @update:deviceId="filters.deviceId = $event"
      @update:level="filters.level = $event" @update:keyword="filters.keyword = $event" @reset="resetFilters" />

    <!-- 日志显示区 -->
    <main class="log-area">
      <LogList ref="logListRef" :logs="filteredLogs" :selected-log="selectedLog" :device-aliases="deviceAliases"
        :keyword="filters.keyword" @select="selectLog" />

      <!-- 右侧详情面板 -->
      <LogDetail :log="selectedLog" :device-aliases="deviceAliases" @close="unselectLog" />
    </main>

    <!-- 设备管理对话框 -->
    <DeviceManager v-model:visible="showDeviceManager" :devices="deviceList" @save-alias="handleSaveDeviceAlias" />
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import HeaderBar from '@/components/HeaderBar.vue'
import FiltersBar from '@/components/FiltersBar.vue'
import LogList from '@/components/LogList.vue'
import LogDetail from '@/components/LogDetail.vue'
import DeviceManager from '@/components/DeviceManager.vue'
import { useSocket } from '@/composables/useSocket'
import { useLogs } from '@/composables/useLogs'
import { clearLogsAPI, saveDeviceAliasAPI } from '@/utils/api'
import { config } from '@/config'

// Socket 连接
const { connected, logs, deviceAliases } = useSocket()

// 日志管理
const { filters, selectedLog, filteredLogs, levelStats, deviceList, resetFilters, selectLog, unselectLog } = useLogs(logs,
  deviceAliases)

// UI 状态
const autoScroll = ref(config.log.autoScroll)
const showDeviceManager = ref(false)
const logListRef = ref(null)

// 滚动到底部
function scrollToBottom() {
  if (!autoScroll.value) return
  nextTick(() => {
    logListRef.value?.scrollToBottom()
  })
}

// 切换自动滚动
function toggleAutoScroll() {
  autoScroll.value = !autoScroll.value
  if (autoScroll.value) {
    scrollToBottom()
  }
}

// 清空日志
async function handleClearLogs() {
  logs.value = []
  await clearLogsAPI()
}

// 保存设备别名
async function handleSaveDeviceAlias(deviceId, alias) {
  await saveDeviceAliasAPI(deviceId, alias)
}
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #0f172a;
}

#app {
  width: 100%;
  height: 100%;
}

/* Element Plus 深色模式全局覆盖 */
.el-popper.is-dark {
  background: #1e293b !important;
  border: 1px solid rgba(148, 163, 184, 0.2) !important;
  color: #e2e8f0 !important;
}

.el-popper.is-dark .el-popper__arrow::before {
  background: #1e293b !important;
  border: 1px solid rgba(148, 163, 184, 0.2) !important;
}

/* Select 下拉框深色样式 */
.el-select-dropdown {
  background-color: #0f172a !important;
  border: 1px solid rgba(148, 163, 184, 0.3) !important;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.5) !important;
}

.el-select-dropdown__wrap {
  background-color: #0f172a !important;
}

.el-select-dropdown__list {
  background-color: #0f172a !important;
  padding: 4px !important;
}

.el-select-dropdown__item {
  color: #cbd5e1 !important;
  background-color: transparent !important;
  border-radius: 6px !important;
  margin: 2px 0 !important;
  transition: all 0.2s !important;
}

.el-select-dropdown__item:hover {
  background-color: #334155 !important;
  color: #f1f5f9 !important;
}

.el-select-dropdown__item.selected {
  background-color: #6366f1 !important;
  color: #ffffff !important;
  font-weight: 600 !important;
}

.el-select-dropdown__item.is-disabled {
  color: #475569 !important;
  background-color: transparent !important;
}

.el-select-dropdown__empty {
  color: #64748b !important;
  background-color: #0f172a !important;
}

/* Select 组件本身的样式 */
.el-select {
  --el-select-input-focus-border-color: #6366f1;
}

.el-select .el-input__wrapper {
  background-color: #0f172a !important;
}

.el-select .el-input__wrapper.is-focus {
  background-color: #1e293b !important;
}

.el-select .el-select__caret {
  color: #94a3b8 !important;
}

.el-select .el-select__caret.is-reverse {
  color: #6366f1 !important;
}

/* Select 可搜索时的输入框 */
.el-select__popper .el-select-dropdown__wrap .el-scrollbar__view .el-select-dropdown__item .el-select-dropdown__item-span {
  color: #cbd5e1 !important;
}

/* 下拉框滚动条样式 */
.el-select-dropdown .el-scrollbar__bar {
  opacity: 1;
}

.el-select-dropdown .el-scrollbar__thumb {
  background-color: #475569 !important;
}

.el-select-dropdown .el-scrollbar__thumb:hover {
  background-color: #64748b !important;
}

.el-select-dropdown .el-scrollbar__track {
  background-color: #1e293b !important;
}

.el-menu--horizontal {
  border-bottom: none !important;
}

.el-menu--horizontal .el-menu-item {
  color: rgba(226, 232, 240, 0.85) !important;
  border-bottom: 2px solid transparent !important;
}

.el-menu--horizontal .el-menu-item:hover {
  background-color: rgba(226, 232, 240, 0.1) !important;
  color: #fff !important;
}

.el-menu--horizontal .el-sub-menu__title {
  color: rgba(226, 232, 240, 0.85) !important;
  border-bottom: 2px solid transparent !important;
}

.el-menu--horizontal .el-sub-menu__title:hover {
  background-color: rgba(226, 232, 240, 0.1) !important;
  color: #fff !important;
}

.el-sub-menu__icon-arrow {
  color: rgba(226, 232, 240, 0.85) !important;
}

/* 下拉菜单深色 */
.el-menu--popup {
  background-color: #1e293b !important;
  border: 1px solid rgba(148, 163, 184, 0.2) !important;
}

.el-menu--popup .el-menu-item {
  color: #cbd5e1 !important;
}

.el-menu--popup .el-menu-item:hover {
  background-color: #334155 !important;
  color: #f1f5f9 !important;
}

/* 按钮深色样式 */
.el-button {
  border-color: rgba(148, 163, 184, 0.2);
}

.el-button--small {
  height: 32px;
  padding: 0 15px;
}

.el-button--default {
  background-color: #334155;
  border-color: rgba(148, 163, 184, 0.3);
  color: #e2e8f0;
}

.el-button--default:hover {
  background-color: #475569;
  border-color: rgba(148, 163, 184, 0.4);
  color: #f1f5f9;
}

.el-button--danger {
  background-color: #7f1d1d;
  border-color: #991b1b;
  color: #fca5a5;
}

.el-button--danger:hover {
  background-color: #991b1b;
  border-color: #b91c1c;
  color: #fecaca;
}

.el-button--danger.is-plain {
  background-color: rgba(127, 29, 29, 0.2);
  border-color: #991b1b;
  color: #fca5a5;
}

.el-button--danger.is-plain:hover {
  background-color: rgba(127, 29, 29, 0.4);
  border-color: #b91c1c;
  color: #fecaca;
}

/* Input 输入框深色样式 */
.el-input {
  --el-input-text-color: #e2e8f0;
  --el-input-border-color: rgba(148, 163, 184, 0.2);
  --el-input-hover-border-color: rgba(99, 102, 241, 0.4);
  --el-input-focus-border-color: #6366f1;
  --el-input-bg-color: #0f172a;
  --el-input-placeholder-color: #64748b;
}

.el-input__wrapper {
  background-color: #0f172a !important;
  box-shadow: 0 0 0 1px rgba(148, 163, 184, 0.2) inset !important;
}

.el-input__wrapper:hover {
  box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.4) inset !important;
}

.el-input__wrapper.is-focus {
  box-shadow: 0 0 0 1px #6366f1 inset !important;
  background-color: #1e293b !important;
}

.el-input__inner {
  color: #e2e8f0 !important;
}

.el-input__inner::placeholder {
  color: #64748b !important;
}

.el-input__prefix,
.el-input__suffix {
  color: #94a3b8 !important;
}

.el-input__clear,
.el-input__clear:hover {
  color: #94a3b8 !important;
}

.el-input__clear:hover {
  color: #e2e8f0 !important;
}

/* Select 内部文字颜色 */
.el-select .el-input__inner {
  color: #e2e8f0 !important;
}

.el-select__placeholder {
  color: #64748b !important;
}

.el-select .el-select__selected-item {
  color: #e2e8f0 !important;
}

/* Tag 深色样式 */
.el-tag {
  border-color: rgba(148, 163, 184, 0.2);
}

.el-tag.el-tag--dark {
  background-color: #334155;
  border-color: #475569;
  color: #cbd5e1;
}

.el-tag--success.el-tag--dark {
  background-color: #064e3b;
  border-color: #059669;
  color: #6ee7b7;
}

.el-tag--warning.el-tag--dark {
  background-color: #78350f;
  border-color: #f59e0b;
  color: #fcd34d;
}

.el-tag--danger.el-tag--dark {
  background-color: #7f1d1d;
  border-color: #dc2626;
  color: #fca5a5;
}

/* Switch 深色样式 */
.el-switch {
  --el-switch-off-color: #334155;
}

.el-switch__core {
  background-color: #334155;
  border-color: #475569;
}

.el-switch.is-checked .el-switch__core {
  background-color: #6366f1;
  border-color: #6366f1;
}

.el-switch__label {
  color: #94a3b8;
}

.el-switch__label.is-active {
  color: #e2e8f0;
}

/* Divider 深色样式 */
.el-divider--vertical {
  background-color: rgba(148, 163, 184, 0.2);
}

/* Tooltip 深色样式 */
.el-tooltip__popper.is-dark {
  background: #1e293b !important;
  color: #e2e8f0 !important;
  border: 1px solid rgba(148, 163, 184, 0.2) !important;
}
</style>

<style scoped>
.log-admin {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  overflow: hidden;
}

.log-area {
  flex: 1;
  min-height: 200px;
  padding: 0 16px 16px 16px;
  overflow: hidden;
  display: flex;
  gap: 16px;
}
</style>

<template>
  <div class="log-admin">
    <!-- 顶部菜单栏 -->
    <HeaderBar :connected="connected" :auto-scroll="autoScroll" :total-count="logs.length" :level-stats="levelStats"
      @scroll-to-bottom="logListRef?.scrollToBottom()" @show-device-manager="showDeviceManager = true"
      @toggle-auto-scroll="toggleAutoScroll" @clear-logs="handleClearLogs" @update:autoScroll="autoScroll = $event" />

    <!-- 筛选条 -->
    <FiltersBar :filters="filters" :device-list="deviceList" @update:deviceId="filters.deviceId = $event"
      @update:level="filters.level = $event" @update:keyword="filters.keyword = $event" @reset="resetFilters" />

    <!-- 日志显示区 -->
    <main class="log-area">
      <LogList ref="logListRef" :logs="filteredLogs" :selected-log="selectedLog" :device-aliases="deviceAliases"
        :keyword="filters.keyword" :auto-scroll="autoScroll" @select="selectLog"
        @update:autoScroll="autoScroll = $event" />

      <!-- 右侧详情面板 -->
      <LogDetail :log="selectedLog" :device-aliases="deviceAliases" @close="unselectLog" />
    </main>

    <!-- 设备管理对话框 -->
    <DeviceManager v-model:visible="showDeviceManager" :devices="deviceList" @save-alias="handleSaveDeviceAlias" />
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
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

// 切换自动滚动
function toggleAutoScroll() {
  autoScroll.value = !autoScroll.value
  // 开启时会由 LogList 组件自动滚动到底部
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

// ESC 快捷键处理
function handleKeyDown(event) {
  if (event.key === 'Escape') {
    // 如果详情面板打开,先关闭详情面板
    if (selectedLog.value) {
      unselectLog()
      return
    }
    
    // 如果设备管理对话框打开,关闭对话框
    if (showDeviceManager.value) {
      showDeviceManager.value = false
      return
    }
    
    // 否则直接清空日志
    if (logs.value.length > 0) {
      handleClearLogs()
    }
  }
}

// 挂载和卸载快捷键监听
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
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

/* Element Plus 深色模式微调 - 只保留必要的自定义 */

/* 菜单栏样式 */
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

/* 下拉菜单 */
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

/* 分割线 */
.el-divider--vertical {
  background-color: rgba(148, 163, 184, 0.2);
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

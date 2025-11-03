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
        :keyword="filters.keyword" :has-detail="!!selectedLog" @select="selectLog" />

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
}

#app {
  width: 100%;
  height: 100%;
}
</style>

<style scoped>
.log-admin {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f7f8fa 0%, #e9ecf1 100%);
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

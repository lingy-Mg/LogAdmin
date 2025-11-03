<template>
  <div class="log-admin">
    <!-- 顶部菜单栏 -->
    <header class="app-header">
      <div class="brand">
        <div class="logo-icon">📝</div>
        <div class="logo-text">LogAdmin</div>
      </div>

      <el-menu class="top-menu" mode="horizontal" :ellipsis="false" background-color="transparent"
        active-text-color="#fff" text-color="rgba(255,255,255,.85)">
        <el-menu-item index="1" @click="scrollToBottom">实时</el-menu-item>
        <el-menu-item index="2" @click="showDeviceManager = true">设备</el-menu-item>
        <el-sub-menu index="3">
          <template #title>设置</template>
          <el-menu-item index="3-1" @click="toggleAutoScroll">
            {{ autoScroll ? '关闭自动滚动' : '开启自动滚动' }}
          </el-menu-item>
          <el-menu-item index="3-2" @click="clearLogs">清空日志</el-menu-item>
        </el-sub-menu>
      </el-menu>

      <div class="header-right">
        <div class="stats-chips">
          <el-tag size="small" effect="dark" round>总: {{ logs.length }}</el-tag>
          <el-tag size="small" type="success" round>INFO: {{ levelStats.INFO }}</el-tag>
          <el-tag size="small" type="warning" round>WARN: {{ levelStats.WARN }}</el-tag>
          <el-tag size="small" type="danger" round>ERROR: {{ levelStats.ERROR }}</el-tag>
        </div>

        <el-divider direction="vertical" />

        <el-switch v-model="autoScroll" size="small" inline-prompt :active-text="'自动滚动'" :inactive-text="'手动'" />

        <!-- <el-button size="small" @click="showDeviceManager = true">📱 设备管理</el-button> -->
        <el-button size="small" type="danger" plain @click="clearLogs">🗑 清空</el-button>

        <el-tooltip :content="connected ? '已连接' : '未连接'" placement="bottom">
          <div class="connection" :class="{ connected }">
            <span class="dot"></span>
            <span class="txt">{{ connected ? '已连接' : '未连接' }}</span>
          </div>
        </el-tooltip>
      </div>
    </header>

    <!-- 顶部筛选条 -->
    <section class="filters-bar">
      <el-form :inline="true" label-width="56px" class="filters-form">
        <el-form-item label="设备">
          <el-select v-model="filters.deviceId" placeholder="全部设备" clearable filterable size="small"
            style="min-width: 220px" @change="handleFilter">
            <el-option v-for="device in deviceList" :key="device.deviceId" :label="device.alias || device.deviceId"
              :value="device.deviceId" />
          </el-select>
        </el-form-item>

        <el-form-item label="级别">
          <el-select v-model="filters.level" placeholder="全部级别" clearable size="small" style="min-width: 160px"
            @change="handleFilter">
            <el-option label="DEBUG" value="DEBUG">
              <span class="level-badge debug">DEBUG</span>
            </el-option>
            <el-option label="INFO" value="INFO">
              <span class="level-badge info">INFO</span>
            </el-option>
            <el-option label="WARN" value="WARN">
              <span class="level-badge warn">WARN</span>
            </el-option>
            <el-option label="ERROR" value="ERROR">
              <span class="level-badge error">ERROR</span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="搜索">
          <el-input v-model="filters.keyword" placeholder="关键词..." clearable size="small" style="min-width: 280px"
            @input="handleFilter">
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button size="small"
            @click="filters.deviceId = ''; filters.level = ''; filters.keyword = ''; handleFilter()">重置</el-button>
        </el-form-item>
      </el-form>
    </section>

    <!-- 底部日志显示栏 -->
    <main class="log-area">
      <div class="log-container" ref="logContainer" :class="{ 'with-detail': selectedLog }">
        <div v-for="log in filteredLogs" :key="log.id" class="log-line" :class="{ active: selectedLog?.id === log.id }"
          @click="selectLog(log)">
          <span class="log-text" :style="{ color: getLevelColor(log.level) }">
            <span class="log-time-part">[{{ formatTime(log.timestamp) }}]</span>
            <span class="log-level-part">[{{ log.level }}]</span>
            <span class="log-device-part" :title="log.deviceId">[{{ getDeviceDisplay(log.deviceId) }}]</span>
            <span class="log-message-part" v-html="highlightKeyword(log.message)"></span>
          </span>
        </div>

        <div v-if="filteredLogs.length === 0" class="empty">
          <el-empty description="暂无日志数据" />
        </div>
      </div>

      <!-- 右侧详情面板 -->
      <transition name="slide-fade">
        <div v-if="selectedLog" class="log-detail-panel">
          <div class="detail-header">
            <h3>📋 日志详情</h3>
            <el-button text @click="selectedLog = null" class="close-btn">
              <el-icon size="18">
                <Close />
              </el-icon>
            </el-button>
          </div>

          <div class="detail-content">
            <!-- 基本信息 -->
            <div class="detail-section">
              <h4 class="section-title">基本信息</h4>
              <div class="detail-item">
                <span class="item-label">时间戳:</span>
                <span class="item-value">{{ formatFullTime(selectedLog.timestamp || selectedLog.ts) }}</span>
              </div>
              <div class="detail-item">
                <span class="item-label">日志级别:</span>
                <span class="item-value">
                  <span class="level-badge" :class="(selectedLog.level || '').toLowerCase()">
                    {{ selectedLog.level }}
                  </span>
                </span>
              </div>
              <div class="detail-item">
                <span class="item-label">设备ID:</span>
                <span class="item-value device-id">{{ selectedLog.deviceId }}</span>
              </div>
              <div v-if="deviceAliases[selectedLog.deviceId]" class="detail-item">
                <span class="item-label">设备别名:</span>
                <span class="item-value">{{ deviceAliases[selectedLog.deviceId] }}</span>
              </div>
            </div>

            <!-- 消息内容 -->
            <div class="detail-section">
              <h4 class="section-title">消息内容</h4>
              <div class="message-box">{{ selectedLog.message || selectedLog.msg }}</div>
            </div>

            <!-- Unity 日志特有字段 -->
            <div v-if="selectedLog.app" class="detail-section">
              <h4 class="section-title">应用信息</h4>
              <div class="detail-item">
                <span class="item-label">应用名称:</span>
                <span class="item-value">{{ selectedLog.app }}</span>
              </div>
              <div v-if="selectedLog.platform" class="detail-item">
                <span class="item-label">运行平台:</span>
                <span class="item-value">{{ selectedLog.platform }}</span>
              </div>
              <div v-if="selectedLog.path" class="detail-item">
                <span class="item-label">路径标识:</span>
                <span class="item-value">{{ selectedLog.path }}</span>
              </div>
              <div v-if="selectedLog.source_type" class="detail-item">
                <span class="item-label">来源类型:</span>
                <span class="item-value">{{ selectedLog.source_type }}</span>
              </div>
            </div>

            <!-- Extra 扩展信息 -->
            <div v-if="selectedLog.extra && Object.keys(selectedLog.extra).length > 0" class="detail-section">
              <h4 class="section-title">扩展信息</h4>
              <div v-for="(value, key) in selectedLog.extra" :key="key" class="detail-item">
                <span class="item-label">{{ key }}:</span>
                <span class="item-value">{{ formatValue(value) }}</span>
              </div>
            </div>

            <!-- 原始数据 -->
            <div class="detail-section">
              <h4 class="section-title">原始数据 (JSON)</h4>
              <pre class="json-box">{{ JSON.stringify(selectedLog, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </transition>
    </main>

    <!-- 设备管理对话框 -->
    <el-dialog v-model="showDeviceManager" title="📱 设备管理" width="720px" class="device-dialog">
      <div class="device-manager">
        <el-table :data="deviceList" style="width: 100%" size="small" border>
          <el-table-column prop="deviceId" label="设备ID" width="260">
            <template #default="scope">
              <el-tooltip :content="scope.row.deviceId" placement="top">
                <span class="device-id-cell">{{ scope.row.deviceId }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="设备别名">
            <template #default="scope">
              <el-input v-model="scope.row.alias" placeholder="输入设备别名" size="small"
                @blur="saveDeviceAlias(scope.row.deviceId, scope.row.alias)"
                @keyup.enter="saveDeviceAlias(scope.row.deviceId, scope.row.alias)">
                <template #append>
                  <el-button size="small" @click="saveDeviceAlias(scope.row.deviceId, scope.row.alias)">保存</el-button>
                </template>
              </el-input>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <el-button @click="showDeviceManager = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
/**
 * 设计要点：
 * 1) 顶部菜单栏承载品牌、菜单与全局操作；筛选条独立成卡片，保持简洁。
 * 2) 底部为暗色等宽字体日志区，自动滚动可开关，关键词高亮。
 * 3) 保留原有 Socket.IO 事件、过滤、设备别名、清空日志等功能。
 */
import { ref, computed, onUnmounted, nextTick } from 'vue'
import { io } from 'socket.io-client'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import { Search, Close } from '@element-plus/icons-vue'

// -------------------- 状态 --------------------
const socket = io('http://localhost:3000') // TODO: 生产环境改为相对路径或配置项
const logs = ref([])                       // 全量日志
const connected = ref(false)               // 连接状态
const autoScroll = ref(true)               // 自动滚动
const logContainer = ref(null)             // 日志容器
const showDeviceManager = ref(false)       // 设备管理对话框
const deviceAliases = ref({})              // 设备别名表
const selectedLog = ref(null)              // 选中的日志（用于详情显示）

const filters = ref({
  deviceId: '',  // 设备筛选
  level: '',     // 级别筛选
  keyword: ''    // 关键词筛选
})

// -------------------- Socket 事件 --------------------
socket.on('connect', () => {
  connected.value = true
  ElMessage.success('连接成功')
})

socket.on('disconnect', () => {
  connected.value = false
  ElMessage.warning('连接断开')
})

socket.on('log:history', (history) => {
  logs.value = history || []
  scrollToBottom()
})

socket.on('device:aliases', (aliases) => {
  deviceAliases.value = aliases || {}
})

socket.on('device:alias:update', ({ deviceId, alias }) => {
  if (!deviceId) return
  if (alias) deviceAliases.value[deviceId] = alias
  else delete deviceAliases.value[deviceId]
})

socket.on('device:aliases:update', (aliases) => {
  deviceAliases.value = aliases || {}
})

socket.on('log:new', (log) => {
  logs.value.push(log)
  // 控制内存：仅保留最近 N 条
  if (logs.value.length > 1000) {
    logs.value = logs.value.slice(-1000)
  }
  scrollToBottom()
})

socket.on('log:clear', () => {
  logs.value = []
  ElMessage.info('日志已清空')
})

// -------------------- 计算属性 --------------------
/** 过滤日志 */
const filteredLogs = computed(() => {
  let result = logs.value

  // 设备筛选：支持按 ID 与别名匹配
  if (filters.value.deviceId) {
    const searchTerm = filters.value.deviceId.toLowerCase()
    result = result.filter(l => {
      const id = (l.deviceId || '').toLowerCase()
      const alias = (deviceAliases.value[l.deviceId] || '').toLowerCase()
      return id.includes(searchTerm) || alias.includes(searchTerm)
    })
  }

  // 级别筛选
  if (filters.value.level) {
    result = result.filter(l => l.level === filters.value.level)
  }

  // 关键词筛选
  if (filters.value.keyword) {
    const kw = filters.value.keyword.toLowerCase()
    result = result.filter(l => (l.message || '').toLowerCase().includes(kw))
  }

  return result
})

/** 级别统计 */
const levelStats = computed(() => {
  const stats = { DEBUG: 0, INFO: 0, WARN: 0, ERROR: 0 }
  logs.value.forEach(l => {
    if (stats.hasOwnProperty(l.level)) stats[l.level]++
  })
  return stats
})

/** 设备列表（供选择与管理） */
const deviceList = computed(() => {
  const ids = [...new Set(logs.value.map(l => l.deviceId).filter(Boolean))]
  return ids.map(id => ({ deviceId: id, alias: deviceAliases.value[id] || '' }))
})

// -------------------- 方法 --------------------
/** 滚动到底部 */
function scrollToBottom() {
  if (!autoScroll.value || !logContainer.value) return
  nextTick(() => {
    logContainer.value.scrollTop = logContainer.value.scrollHeight
  })
}

/** 切换自动滚动 */
function toggleAutoScroll() {
  autoScroll.value = !autoScroll.value
  scrollToBottom()
}

/** 清空日志（本地与服务端） */
function clearLogs() {
  logs.value = []
  fetch('http://localhost:3000/api/logs', { method: 'DELETE' }).catch(() => { })
}

/** 处理筛选变更 */
function handleFilter() {
  // 筛选后便于查看最新
  nextTick(scrollToBottom)
}

/** 格式化时间 */
function formatTime(timestamp) {
  return dayjs(timestamp).format('HH:mm:ss.SSS')
}

/** 格式化完整时间 */
function formatFullTime(timestamp) {
  if (!timestamp) return 'N/A'
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss.SSS')
}

/** 获取级别对应颜色 */
function getLevelColor(level) {
  const colors = {
    DEBUG: '#9aa0a6',
    INFO: '#4EC9B0',
    WARN: '#FFA500',
    ERROR: '#F44747'
  }
  return colors[level] || '#9aa0a6'
}

/** 关键词高亮，进行正则转义避免特殊字符带来问题 */
function highlightKeyword(message = '') {
  if (!filters.value.keyword) return escapeHtml(message)
  const keyword = escapeRegExp(filters.value.keyword)
  const regex = new RegExp(`(${keyword})`, 'gi')
  return escapeHtml(message).replace(regex, '<mark>$1</mark>')
}

/** 获取设备显示名（优先别名） */
function getDeviceDisplay(deviceId) {
  return deviceAliases.value[deviceId] || deviceId
}

/** 保存设备别名 */
async function saveDeviceAlias(deviceId, alias) {
  try {
    const response = await fetch('http://localhost:3000/api/devices/alias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, alias })
    })
    const result = await response.json()
    if (result.success) {
      ElMessage.success('设备别名已保存')
      if (alias) deviceAliases.value[deviceId] = alias
      else delete deviceAliases.value[deviceId]
    } else {
      ElMessage.error('保存失败: ' + (result.error || 'unknown'))
    }
  } catch (e) {
    ElMessage.error('保存失败: ' + e.message)
  }
}

/** 工具：转义正则 */
function escapeRegExp(str = '') {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** 工具：转义 HTML */
function escapeHtml(str = '') {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/** 选中日志 */
function selectLog(log) {
  selectedLog.value = log
}

/** 格式化值（处理对象和数组） */
function formatValue(value) {
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return String(value)
}

onUnmounted(() => {
  socket.disconnect()
})
</script>

<style>
/* 重置 body 边距，确保满屏布局 */
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
/* ===== 布局骨架 ===== */
.log-admin {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f7f8fa 0%, #e9ecf1 100%);
  --header-h: 64px;
  overflow: hidden;
}

/* ===== 顶部菜单栏 ===== */
.app-header {
  flex-shrink: 0;
  height: var(--header-h);
  display: flex;
  align-items: center;
  padding: 0 16px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: #fff;
  box-shadow: 0 4px 18px rgba(39, 15, 106, 0.25);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-right: 12px;
}

.logo-icon {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: rgba(255, 255, 255, .15);
  backdrop-filter: blur(6px);
  font-size: 18px;
}

.logo-text {
  font-weight: 700;
  letter-spacing: .3px;
  font-size: 16px;
}

.top-menu {
  flex: 1;
  background: transparent;
  border-bottom: none;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stats-chips {
  display: flex;
  align-items: center;
  gap: 6px;
}

.connection {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, .12);
  color: #fff;
  font-size: 12px;
  user-select: none;
}

.connection .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f59e0b;
  /* 未连接：橙 */
  box-shadow: 0 0 0 2px rgba(255, 255, 255, .15) inset;
}

.connection.connected .dot {
  background: #22c55e;
  /* 已连接：绿 */
}

/* ===== 筛选条 ===== */
.filters-bar {
  flex-shrink: 0;
  padding: 12px 16px;
}

.filters-form {
  width: 100%;
  padding: 12px;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(31, 38, 135, 0.12);
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.level-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.level-badge.debug {
  background: #eef2f7;
  color: #64748b;
}

.level-badge.info {
  background: #ecfdf5;
  color: #059669;
}

.level-badge.warn {
  background: #fef3c7;
  color: #b45309;
}

.level-badge.error {
  background: #fee2e2;
  color: #b91c1c;
}

/* ===== 日志显示区（底部） ===== */
.log-area {
  flex: 1;
  min-height: 200px;
  padding: 0 16px 16px 16px;
  overflow: hidden;
  display: flex;
  gap: 16px;
}

.log-container {
  height: 100%;
  overflow-y: auto;
  border-radius: 14px;
  background: #1e1e1e;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  box-shadow: 0 10px 24px rgba(0, 0, 0, .18);
  padding: 16px 20px;
  transition: all 0.3s ease;
}

.log-container.with-detail {
  flex: 1;
  min-width: 0;
}

.log-container::-webkit-scrollbar {
  width: 8px;
}

.log-container::-webkit-scrollbar-track {
  background: #2d2d2d;
  border-radius: 4px;
}

.log-container::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 4px;
}

.log-container::-webkit-scrollbar-thumb:hover {
  background: #777;
}

.log-line {
  padding: 6px 0;
  border-bottom: 1px solid #2a2a2a;
  line-height: 1.75;
  transition: background .15s;
  cursor: pointer;
}

.log-line:hover {
  background: rgba(255, 255, 255, .035);
}

.log-line.active {
  background: rgba(79, 70, 229, 0.15);
  border-left: 3px solid #4f46e5;
  padding-left: 8px;
}

.log-text {
  font-size: 13.5px;
  font-weight: 500;
  display: block;
}

.log-time-part {
  color: #808080;
  margin-right: 8px;
}

.log-level-part {
  font-weight: 700;
  margin-right: 8px;
}

.log-device-part {
  color: #4EC9B0;
  font-weight: 700;
  margin-right: 8px;
  cursor: help;
}

.log-message-part {
  color: #e6e6e6;
  word-break: break-all;
}

mark {
  background: #ffd700;
  color: #000;
  padding: 0 4px;
  border-radius: 3px;
  font-weight: 700;
}

/* 空状态 */
.empty {
  display: grid;
  place-items: center;
  height: 100%;
}

/* ===== 右侧详情面板 ===== */
.log-detail-panel {
  width: 480px;
  height: 100%;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, .12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.detail-header {
  flex-shrink: 0;
  padding: 16px 20px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.detail-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.close-btn {
  color: #fff !important;
  padding: 4px;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1) !important;
}

.detail-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.detail-content::-webkit-scrollbar {
  width: 6px;
}

.detail-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.detail-content::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.detail-content::-webkit-scrollbar-thumb:hover {
  background: #999;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: #4f46e5;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #e5e7eb;
}

.detail-item {
  display: flex;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
  align-items: flex-start;
}

.detail-item:last-child {
  border-bottom: none;
}

.item-label {
  flex-shrink: 0;
  width: 100px;
  font-size: 13px;
  color: #6b7280;
  font-weight: 600;
}

.item-value {
  flex: 1;
  font-size: 13px;
  color: #1f2937;
  word-break: break-all;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.item-value.device-id {
  color: #4f46e5;
  font-weight: 600;
}

.message-box {
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  font-size: 13px;
  line-height: 1.6;
  color: #1f2937;
  word-break: break-word;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.json-box {
  padding: 12px;
  background: #1e1e1e;
  border-radius: 8px;
  border: 1px solid #2a2a2a;
  font-size: 12px;
  line-height: 1.5;
  color: #e6e6e6;
  overflow-x: auto;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  margin: 0;
}

.json-box::-webkit-scrollbar {
  height: 6px;
}

.json-box::-webkit-scrollbar-track {
  background: #2d2d2d;
  border-radius: 3px;
}

.json-box::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 3px;
}

.level-badge.debug {
  background: #eef2f7;
  color: #64748b;
}

.level-badge.info {
  background: #ecfdf5;
  color: #059669;
}

.level-badge.warn,
.level-badge.warning {
  background: #fef3c7;
  color: #b45309;
}

.level-badge.error,
.level-badge.fatal {
  background: #fee2e2;
  color: #b91c1c;
}

/* 过渡动画 */
.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* ===== 设备管理对话框 ===== */
.device-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: #fff;
  padding: 16px;
  margin: 0;
}

.device-dialog :deep(.el-dialog__title) {
  color: #fff;
  font-size: 16px;
  font-weight: 700;
}

.device-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: #fff;
}

.device-dialog :deep(.el-dialog__body) {
  padding: 16px;
}

.device-manager {
  padding: 6px 0;
}

.device-id-cell {
  display: inline-block;
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  color: #409eff;
}

/* 响应式微调 */
@media (max-width: 960px) {
  .header-right {
    gap: 6px;
  }

  .stats-chips {
    display: none;
  }

  .log-detail-panel {
    width: 400px;
  }
}

@media (max-width: 768px) {
  .log-detail-panel {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    max-width: 400px;
    z-index: 1000;
  }
}
</style>

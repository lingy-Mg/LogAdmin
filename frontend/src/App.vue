<template>
  <div class="log-admin">
    <!-- 顶部栏 -->
    <div class="header">
      <div class="header-left">
        <h1>📝 LogAdmin</h1>
        <span class="subtitle">实时日志管理系统</span>
      </div>
      <div class="header-right">
        <el-tag :type="connected ? 'success' : 'danger'" effect="dark">
          {{ connected ? '● 已连接' : '○ 未连接' }}
        </el-tag>
        <el-tag type="info" effect="plain">
          共 {{ logs.length }} 条日志
        </el-tag>
      </div>
    </div>

    <!-- 过滤器 -->
    <div class="filters">
      <el-select 
        v-model="filters.deviceId" 
        placeholder="🔍 设备ID或别名"
        clearable
        filterable
        allow-create
        default-first-option
        style="width: 250px"
        @change="handleFilter"
      >
        <el-option
          v-for="device in deviceList"
          :key="device.deviceId"
          :label="device.alias || device.deviceId"
          :value="device.deviceId"
        >
          <span style="float: left">{{ device.alias || device.deviceId }}</span>
          <span v-if="device.alias" style="float: right; color: #8492a6; font-size: 12px">
            {{ device.deviceId }}
          </span>
        </el-option>
      </el-select>
      
      <el-select 
        v-model="filters.level" 
        placeholder="📊 日志级别"
        clearable
        style="width: 150px"
        @change="handleFilter"
      >
        <el-option label="DEBUG" value="DEBUG" />
        <el-option label="INFO" value="INFO" />
        <el-option label="WARN" value="WARN" />
        <el-option label="ERROR" value="ERROR" />
      </el-select>
      
      <el-input 
        v-model="filters.keyword" 
        placeholder="🔎 关键词搜索"
        clearable
        style="width: 250px"
        @input="handleFilter"
      />
      
      <el-button-group>
        <el-button 
          :type="autoScroll ? 'primary' : ''" 
          @click="toggleAutoScroll"
        >
          {{ autoScroll ? '⏸️ 暂停滚动' : '▶️ 自动滚动' }}
        </el-button>
        <el-button @click="clearLogs">🗑️ 清空</el-button>
        <el-button @click="showDeviceManager = true">📱 设备管理</el-button>
      </el-button-group>

      <div class="stats">
        <el-tag type="success" size="small">INFO: {{ levelStats.INFO }}</el-tag>
        <el-tag type="warning" size="small">WARN: {{ levelStats.WARN }}</el-tag>
        <el-tag type="danger" size="small">ERROR: {{ levelStats.ERROR }}</el-tag>
      </div>
    </div>

    <!-- 日志容器 -->
    <div class="log-container" ref="logContainer">
      <div 
        v-for="log in filteredLogs" 
        :key="log.id" 
        class="log-line"
      >
        <span 
          class="log-text" 
          :style="{ color: getLevelColor(log.level) }"
        >
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

    <!-- 设备管理对话框 -->
    <el-dialog
      v-model="showDeviceManager"
      title="📱 设备管理"
      width="600px"
    >
      <div class="device-manager">
        <el-table :data="deviceList" style="width: 100%">
          <el-table-column prop="deviceId" label="设备ID" width="200">
            <template #default="scope">
              <el-tooltip :content="scope.row.deviceId" placement="top">
                <span class="device-id-cell">{{ scope.row.deviceId }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="设备别名">
            <template #default="scope">
              <el-input
                v-model="scope.row.alias"
                placeholder="输入设备别名"
                @blur="saveDeviceAlias(scope.row.deviceId, scope.row.alias)"
                @keyup.enter="saveDeviceAlias(scope.row.deviceId, scope.row.alias)"
              >
                <template #append>
                  <el-button @click="saveDeviceAlias(scope.row.deviceId, scope.row.alias)">
                    保存
                  </el-button>
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
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { io } from 'socket.io-client'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'

// 状态
const socket = io('http://localhost:3000')
const logs = ref([])
const connected = ref(false)
const autoScroll = ref(true)
const logContainer = ref(null)
const showDeviceManager = ref(false)
const deviceAliases = ref({})

const filters = ref({
  deviceId: '',
  level: '',
  keyword: ''
})

// 连接状态
socket.on('connect', () => {
  connected.value = true
  ElMessage.success('连接成功')
})

socket.on('disconnect', () => {
  connected.value = false
  ElMessage.warning('连接断开')
})

// 接收历史日志
socket.on('log:history', (history) => {
  logs.value = history
  scrollToBottom()
})

// 接收设备别名
socket.on('device:aliases', (aliases) => {
  deviceAliases.value = aliases
  console.log('📱 收到设备别名:', aliases)
})

// 设备别名更新
socket.on('device:alias:update', ({ deviceId, alias }) => {
  if (alias) {
    deviceAliases.value[deviceId] = alias
  } else {
    delete deviceAliases.value[deviceId]
  }
})

socket.on('device:aliases:update', (aliases) => {
  deviceAliases.value = aliases
})

// 接收新日志
socket.on('log:new', (log) => {
  logs.value.push(log)
  if (logs.value.length > 1000) {
    logs.value = logs.value.slice(-1000)
  }
  scrollToBottom()
})

// 清空日志
socket.on('log:clear', () => {
  logs.value = []
  ElMessage.info('日志已清空')
})

// 过滤日志
const filteredLogs = computed(() => {
  let result = logs.value
  
  if (filters.value.deviceId) {
    const searchTerm = filters.value.deviceId.toLowerCase()
    result = result.filter(l => {
      const deviceId = l.deviceId.toLowerCase()
      const alias = (deviceAliases.value[l.deviceId] || '').toLowerCase()
      // 支持通过设备ID或别名搜索
      return deviceId.includes(searchTerm) || alias.includes(searchTerm)
    })
  }
  
  if (filters.value.level) {
    result = result.filter(l => l.level === filters.value.level)
  }
  
  if (filters.value.keyword) {
    result = result.filter(l => 
      l.message.toLowerCase().includes(filters.value.keyword.toLowerCase())
    )
  }
  
  return result
})

// 级别统计
const levelStats = computed(() => {
  const stats = { DEBUG: 0, INFO: 0, WARN: 0, ERROR: 0 }
  logs.value.forEach(log => {
    if (stats.hasOwnProperty(log.level)) {
      stats[log.level]++
    }
  })
  return stats
})

// 设备列表（用于设备管理）
const deviceList = computed(() => {
  const devices = [...new Set(logs.value.map(l => l.deviceId))]
  return devices.map(id => ({
    deviceId: id,
    alias: deviceAliases.value[id] || ''
  }))
})

// 自动滚动
function scrollToBottom() {
  if (autoScroll.value && logContainer.value) {
    nextTick(() => {
      logContainer.value.scrollTop = logContainer.value.scrollHeight
    })
  }
}

function toggleAutoScroll() {
  autoScroll.value = !autoScroll.value
}

// 清空日志
function clearLogs() {
  logs.value = []
  fetch('http://localhost:3000/api/logs', { method: 'DELETE' })
}

// 处理过滤
function handleFilter() {
  // 过滤后滚动到底部
  nextTick(scrollToBottom)
}

// 格式化时间
function formatTime(timestamp) {
  return dayjs(timestamp).format('HH:mm:ss.SSS')
}

// 获取级别类型
function getLevelType(level) {
  const types = {
    DEBUG: 'info',
    INFO: 'success',
    WARN: 'warning',
    ERROR: 'danger'
  }
  return types[level] || 'info'
}

// 获取级别颜色
function getLevelColor(level) {
  const colors = {
    DEBUG: '#888888',
    INFO: '#4EC9B0',
    WARN: '#FFA500',
    ERROR: '#F44747'
  }
  return colors[level] || '#888888'
}

// 高亮关键词
function highlightKeyword(message) {
  if (!filters.value.keyword) return message
  const keyword = filters.value.keyword
  const regex = new RegExp(`(${keyword})`, 'gi')
  return message.replace(regex, '<mark>$1</mark>')
}

// 获取设备显示名称（别名或ID）
function getDeviceDisplay(deviceId) {
  return deviceAliases.value[deviceId] || deviceId
}

// 保存设备别名
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
      if (alias) {
        deviceAliases.value[deviceId] = alias
      } else {
        delete deviceAliases.value[deviceId]
      }
    } else {
      ElMessage.error('保存失败: ' + result.error)
    }
  } catch (error) {
    ElMessage.error('保存失败: ' + error.message)
  }
}

onUnmounted(() => {
  socket.disconnect()
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.log-admin {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 15px;
}

.header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
}

.subtitle {
  font-size: 14px;
  opacity: 0.9;
}

.header-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.filters {
  background: white;
  padding: 20px 40px;
  display: flex;
  gap: 12px;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  flex-wrap: wrap;
}

.stats {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.log-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px 40px;
  background: #1e1e1e;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
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
  padding: 8px 0;
  border-bottom: 1px solid #333;
  line-height: 1.8;
  transition: background 0.2s;
}

.log-line:hover {
  background: rgba(255, 255, 255, 0.05);
}

.log-text {
  font-size: 14px;
  font-weight: 500;
  display: block;
}

.log-time-part {
  color: #666;
  margin-right: 8px;
}

.log-level-part {
  font-weight: 600;
  margin-right: 8px;
}

.log-device-part {
  color: #4EC9B0;
  font-weight: 600;
  margin-right: 8px;
  cursor: help;
}

.log-message-part {
  color: #ddd;
}

mark {
  background: #ffd700;
  color: #000;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 600;
}

.empty {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.device-manager {
  padding: 10px 0;
}

.device-id-cell {
  display: inline-block;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  color: #409eff;
}

:deep(.el-dialog__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  margin: 0;
}

:deep(.el-dialog__title) {
  color: white;
  font-size: 18px;
  font-weight: 600;
}

:deep(.el-dialog__headerbtn .el-dialog__close) {
  color: white;
}

:deep(.el-dialog__body) {
  padding: 20px;
}
</style>

/**
 * Socket.IO 连接管理
 * 封装 WebSocket 连接、事件监听和消息处理
 */

import { ref, onUnmounted } from 'vue'
import { io } from 'socket.io-client'
import { ElMessage } from 'element-plus'
import { config } from '@/config'
import { SOCKET_EVENTS } from '@/constants/log'

export function useSocket() {
  // 状态
  const connected = ref(false)
  const logs = ref([])
  const deviceAliases = ref({})

  // 创建 Socket 连接
  const socket = io(config.websocket.url, {
    reconnection: config.websocket.reconnection,
    reconnectionDelay: config.websocket.reconnectionDelay,
    reconnectionDelayMax: config.websocket.reconnectionDelayMax,
    reconnectionAttempts: config.websocket.reconnectionAttempts
  })

  // 连接事件
  socket.on(SOCKET_EVENTS.CONNECT, () => {
    connected.value = true
    ElMessage.success('连接成功')
  })

  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    connected.value = false
    ElMessage.warning('连接断开')
  })

  // 日志事件
  socket.on(SOCKET_EVENTS.LOG_HISTORY, (history) => {
    logs.value = history || []
  })

  socket.on(SOCKET_EVENTS.LOG_NEW, (log) => {
    logs.value.push(log)
    // 限制内存中的日志数量
    if (logs.value.length > config.log.maxLogs) {
      logs.value = logs.value.slice(-config.log.maxLogs)
    }
  })

  socket.on(SOCKET_EVENTS.LOG_CLEAR, () => {
    logs.value = []
    ElMessage.info('日志已清空')
  })

  // 设备别名事件
  socket.on(SOCKET_EVENTS.DEVICE_ALIASES, (aliases) => {
    deviceAliases.value = aliases || {}
  })

  socket.on(SOCKET_EVENTS.DEVICE_ALIAS_UPDATE, ({ deviceId, alias }) => {
    if (!deviceId) return
    if (alias) {
      deviceAliases.value[deviceId] = alias
    } else {
      delete deviceAliases.value[deviceId]
    }
  })

  socket.on(SOCKET_EVENTS.DEVICE_ALIASES_UPDATE, (aliases) => {
    deviceAliases.value = aliases || {}
  })

  // 清理
  onUnmounted(() => {
    socket.disconnect()
  })

  return {
    socket,
    connected,
    logs,
    deviceAliases
  }
}

export default useSocket

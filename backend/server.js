import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: '*' }
})

// 内存存储（最多1000条）
let logs = []
const MAX_LOGS = 1000

// 设备别名存储
let deviceAliases = {} // { deviceId: alias }

// 持久化配置
const LOG_FILE_PATH = path.join(__dirname, 'logs-data.json')
const DEVICE_ALIASES_FILE = path.join(__dirname, 'device-aliases.json')
const WRITE_DELAY = 5 * 60 * 1000 // 5分钟
let writeTimer = null
let deviceAliasTimer = null
let hasChanges = false
let hasDeviceChanges = false

// 从文件加载日志
function loadLogsFromFile() {
  try {
    if (fs.existsSync(LOG_FILE_PATH)) {
      const data = fs.readFileSync(LOG_FILE_PATH, 'utf-8')
      logs = JSON.parse(data)
      console.log(`📂 从文件加载了 ${logs.length} 条日志`)
    }
  } catch (error) {
    console.error('❌ 加载日志文件失败:', error.message)
  }
}

// 从文件加载设备别名
function loadDeviceAliasesFromFile() {
  try {
    if (fs.existsSync(DEVICE_ALIASES_FILE)) {
      const data = fs.readFileSync(DEVICE_ALIASES_FILE, 'utf-8')
      deviceAliases = JSON.parse(data)
      console.log(`📱 从文件加载了 ${Object.keys(deviceAliases).length} 个设备别名`)
    }
  } catch (error) {
    console.error('❌ 加载设备别名文件失败:', error.message)
  }
}

// 延迟写入日志到文件（防抖）
function scheduleWriteLogs() {
  hasChanges = true
  
  // 清除之前的定时器
  if (writeTimer) {
    clearTimeout(writeTimer)
  }
  
  // 设置新的定时器：5分钟后写入
  writeTimer = setTimeout(() => {
    writeLogsToFile()
  }, WRITE_DELAY)
  
  console.log(`⏰ 已安排日志写入任务，将在 ${WRITE_DELAY / 1000} 秒后执行`)
}

// 延迟写入设备别名到文件（防抖）
function scheduleWriteDeviceAliases() {
  hasDeviceChanges = true
  
  // 清除之前的定时器
  if (deviceAliasTimer) {
    clearTimeout(deviceAliasTimer)
  }
  
  // 设置新的定时器：5分钟后写入
  deviceAliasTimer = setTimeout(() => {
    writeDeviceAliasesToFile()
  }, WRITE_DELAY)
  
  console.log(`⏰ 已安排设备别名写入任务，将在 ${WRITE_DELAY / 1000} 秒后执行`)
}

// 立即写入日志到文件
function writeLogsToFile() {
  if (!hasChanges) {
    console.log('📝 日志没有变化，跳过写入')
    return
  }
  
  try {
    const data = JSON.stringify(logs, null, 2)
    fs.writeFileSync(LOG_FILE_PATH, data, 'utf-8')
    hasChanges = false
    console.log(`💾 成功写入 ${logs.length} 条日志到文件`)
  } catch (error) {
    console.error('❌ 写入日志文件失败:', error.message)
  }
}

// 立即写入设备别名到文件
function writeDeviceAliasesToFile() {
  if (!hasDeviceChanges) {
    console.log('📝 设备别名没有变化，跳过写入')
    return
  }
  
  try {
    const data = JSON.stringify(deviceAliases, null, 2)
    fs.writeFileSync(DEVICE_ALIASES_FILE, data, 'utf-8')
    hasDeviceChanges = false
    console.log(`💾 成功写入 ${Object.keys(deviceAliases).length} 个设备别名到文件`)
  } catch (error) {
    console.error('❌ 写入设备别名文件失败:', error.message)
  }
}

// 优雅关闭：确保写入所有数据
function gracefulShutdown(signal) {
  console.log(`\n🛑 收到 ${signal} 信号，正在保存数据...`)
  
  if (hasChanges) {
    writeLogsToFile()
  }
  
  if (hasDeviceChanges) {
    writeDeviceAliasesToFile()
  }
  
  console.log('👋 服务器已关闭')
  process.exit(0)
}

// 监听退出信号
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))

// 启动时加载日志
loadLogsFromFile()
loadDeviceAliasesFromFile()

// 日志模型
class Log {
  constructor(data) {
    this.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    this.deviceId = data.deviceId || 'unknown'
    this.level = data.level || 'INFO'
    this.message = data.message || ''
    this.timestamp = new Date().toISOString()
  }
}

// 中间件
app.use(cors())
app.use(express.json())

// 接收日志
app.post('/api/logs', (req, res) => {
  try {
    const log = new Log(req.body)
    logs.push(log)
    
    // 限制数量
    if (logs.length > MAX_LOGS) {
      logs = logs.slice(-MAX_LOGS)
    }
    
    // 实时推送
    io.emit('log:new', log)
    
    // 安排延迟写入
    scheduleWriteLogs()
    
    console.log(`📝 收到日志: [${log.level}] ${log.deviceId} - ${log.message}`)
    res.json({ success: true, data: log })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

// 查询日志
app.get('/api/logs', (req, res) => {
  const { level, deviceId, keyword, limit = 100 } = req.query
  let filtered = [...logs]
  
  if (level) {
    filtered = filtered.filter(l => l.level === level)
  }
  if (deviceId) {
    filtered = filtered.filter(l => l.deviceId.includes(deviceId))
  }
  if (keyword) {
    filtered = filtered.filter(l => 
      l.message.toLowerCase().includes(keyword.toLowerCase())
    )
  }
  
  const result = filtered.slice(-parseInt(limit))
  res.json({ success: true, data: result, total: filtered.length })
})

// 获取设备列表
app.get('/api/devices', (req, res) => {
  const devices = [...new Set(logs.map(l => l.deviceId))]
  const deviceList = devices.map(id => ({
    deviceId: id,
    alias: deviceAliases[id] || null
  }))
  res.json({ success: true, data: deviceList })
})

// 获取所有设备别名
app.get('/api/devices/aliases', (req, res) => {
  res.json({ success: true, data: deviceAliases })
})

// 设置设备别名
app.post('/api/devices/alias', (req, res) => {
  try {
    const { deviceId, alias } = req.body
    
    if (!deviceId) {
      return res.status(400).json({ success: false, error: '设备ID不能为空' })
    }
    
    if (alias && alias.trim()) {
      deviceAliases[deviceId] = alias.trim()
      console.log(`📱 设置设备别名: ${deviceId} -> ${alias}`)
    } else {
      // 删除别名
      delete deviceAliases[deviceId]
      console.log(`📱 删除设备别名: ${deviceId}`)
    }
    
    // 安排延迟写入
    scheduleWriteDeviceAliases()
    
    // 通知所有客户端更新设备别名
    io.emit('device:alias:update', { deviceId, alias: deviceAliases[deviceId] || null })
    
    res.json({ success: true, data: { deviceId, alias: deviceAliases[deviceId] || null } })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

// 批量设置设备别名
app.post('/api/devices/aliases/batch', (req, res) => {
  try {
    const { aliases } = req.body
    
    if (!aliases || typeof aliases !== 'object') {
      return res.status(400).json({ success: false, error: '无效的别名数据' })
    }
    
    Object.assign(deviceAliases, aliases)
    scheduleWriteDeviceAliases()
    
    io.emit('device:aliases:update', deviceAliases)
    
    res.json({ success: true, data: deviceAliases })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

// 删除设备别名
app.delete('/api/devices/alias/:deviceId', (req, res) => {
  try {
    const { deviceId } = req.params
    
    if (deviceAliases[deviceId]) {
      delete deviceAliases[deviceId]
      scheduleWriteDeviceAliases()
      io.emit('device:alias:update', { deviceId, alias: null })
      console.log(`📱 删除设备别名: ${deviceId}`)
    }
    
    res.json({ success: true })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

// 清空日志
app.delete('/api/logs', (req, res) => {
  logs = []
  io.emit('log:clear')
  
  // 立即写入（清空操作）
  writeLogsToFile()
  
  res.json({ success: true })
})

// 手动保存日志
app.post('/api/logs/save', (req, res) => {
  writeLogsToFile()
  res.json({ success: true, message: '日志已保存到文件' })
})

// 获取保存状态
app.get('/api/logs/status', (req, res) => {
  res.json({ 
    success: true, 
    hasChanges,
    logsCount: logs.length,
    filePath: LOG_FILE_PATH
  })
})

// WebSocket 连接
io.on('connection', (socket) => {
  console.log('🔗 客户端连接:', socket.id)
  
  // 发送最近的日志
  socket.emit('log:history', logs.slice(-100))
  
  // 发送设备别名
  socket.emit('device:aliases', deviceAliases)
  
  socket.on('disconnect', () => {
    console.log('❌ 客户端断开:', socket.id)
  })
})

// 启动服务器
const PORT = 3000
httpServer.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`)
  console.log(`📡 WebSocket 服务已启动`)
  
  // 模拟日志（测试用）
  setInterval(() => {
    const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR']
    const devices = ['device-001', 'device-002', 'device-003']
    const messages = [
      '系统启动成功',
      '数据同步完成',
      '内存使用率: 75%',
      '连接超时',
      '数据库查询完成',
      '用户登录成功'
    ]
    
    const log = new Log({
      deviceId: devices[Math.floor(Math.random() * devices.length)],
      level: levels[Math.floor(Math.random() * levels.length)],
      message: messages[Math.floor(Math.random() * messages.length)]
    })
    
    logs.push(log)
    if (logs.length > MAX_LOGS) logs = logs.slice(-MAX_LOGS)
    io.emit('log:new', log)
    
    // 安排延迟写入
    scheduleWriteLogs()
  }, 3000) // 每3秒模拟一条日志
})

/**
 * 日志相关路由
 */

import express from 'express'

// 创建日志接收处理函数
function createLogReceiveHandler(logService, persistenceService, io, logPrefix = '') {
  return (req, res) => {
    try {
      const body = req.body
      
      // 检查是否为数组
      if (Array.isArray(body)) {
        // 批量添加日志
        const logs = body.map(logData => logService.addLog(logData))
        
        // 批量实时推送
        logs.forEach(log => {
          io.emit('log:new', log)
        })
        
        // 安排延迟写入
        persistenceService.scheduleWriteLogs(logService.getAllLogs())
        
        console.log(`📝 批量收到 ${logs.length} 条日志${logPrefix}`)
        res.json({ success: true, data: logs, count: logs.length })
      } else {
        // 单条添加日志
        const log = logService.addLog(body)
        
        // 实时推送
        io.emit('log:new', log)
        
        // 安排延迟写入
        persistenceService.scheduleWriteLogs(logService.getAllLogs())
        
        console.log(`📝 收到日志${logPrefix}: [${log.level}] ${log.deviceId} - ${log.message}`)
        res.json({ success: true, data: log })
      }
    } catch (error) {
      res.status(400).json({ success: false, error: error.message })
    }
  }
}

export function createLogRoutes(logService, persistenceService, io) {
  const router = express.Router()

  /**
   * 接收日志 (支持单条或数组批量)
   */
  router.post('/', createLogReceiveHandler(logService, persistenceService, io))

  /**
   * 查询日志
   */
  router.get('/', (req, res) => {
    try {
      const result = logService.queryLogs(req.query)
      res.json({ success: true, ...result })
    } catch (error) {
      res.status(500).json({ success: false, error: error.message })
    }
  })

  /**
   * 清空日志
   */
  router.delete('/', (req, res) => {
    try {
      logService.clearLogs()
      console.log('🗑️  清空内存中的日志')
      
      // 立即写入空数组到文件
      persistenceService.writeLogs([])
      
      // 通知所有客户端
      io.emit('log:clear')
      
      console.log('✅ 日志已清空（内存和文件）')
      res.json({ success: true, message: '日志已清空' })
    } catch (error) {
      console.error('❌ 清空日志失败:', error)
      res.status(500).json({ success: false, error: error.message })
    }
  })

  /**
   * 手动保存日志
   */
  router.post('/save', (req, res) => {
    try {
      persistenceService.writeLogs(logService.getAllLogs())
      res.json({ success: true, message: '日志已保存到文件' })
    } catch (error) {
      res.status(500).json({ success: false, error: error.message })
    }
  })

  /**
   * 获取保存状态
   */
  router.get('/status', (req, res) => {
    try {
      const status = persistenceService.getStatus()
      res.json({ 
        success: true, 
        ...status,
        logsCount: logService.getLogsCount()
      })
    } catch (error) {
      res.status(500).json({ success: false, error: error.message })
    }
  })

  return router
}

export { createLogReceiveHandler }
export default createLogRoutes

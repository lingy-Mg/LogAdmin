/**
 * 日志相关路由
 */

import express from 'express'

export function createLogRoutes(logService, persistenceService, io) {
  const router = express.Router()

  /**
   * 接收日志
   */
  router.post('/', (req, res) => {
    try {
      const log = logService.addLog(req.body)
      
      // 实时推送
      io.emit('log:new', log)
      
      // 安排延迟写入
      persistenceService.scheduleWriteLogs(logService.getAllLogs())
      
      console.log(`📝 收到日志: [${log.level}] ${log.deviceId} - ${log.message}`)
      res.json({ success: true, data: log })
    } catch (error) {
      res.status(400).json({ success: false, error: error.message })
    }
  })

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
      io.emit('log:clear')
      
      // 立即写入（清空操作）
      persistenceService.writeLogs([])
      
      res.json({ success: true })
    } catch (error) {
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

export default createLogRoutes

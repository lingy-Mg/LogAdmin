/**
 * 设备相关路由
 */

import express from 'express'

export function createDeviceRoutes(logService, deviceService, persistenceService, io) {
  const router = express.Router()

  /**
   * 获取设备列表
   */
  router.get('/', (req, res) => {
    try {
      const devices = logService.getDevices()
      const deviceList = deviceService.getDeviceList(devices)
      res.json({ success: true, data: deviceList })
    } catch (error) {
      res.status(500).json({ success: false, error: error.message })
    }
  })

  /**
   * 获取所有设备别名
   */
  router.get('/aliases', (req, res) => {
    try {
      const aliases = deviceService.getAllAliases()
      res.json({ success: true, data: aliases })
    } catch (error) {
      res.status(500).json({ success: false, error: error.message })
    }
  })

  /**
   * 设置设备别名
   */
  router.post('/alias', (req, res) => {
    try {
      const { deviceId, alias } = req.body
      const result = deviceService.setAlias(deviceId, alias)
      
      // 安排延迟写入
      persistenceService.scheduleWriteDeviceAliases(deviceService.getAllAliases())
      
      // 通知所有客户端更新设备别名
      io.emit('device:alias:update', result)
      
      console.log(`📱 ${alias ? '设置' : '删除'}设备别名: ${deviceId}${alias ? ' -> ' + alias : ''}`)
      
      res.json({ success: true, data: result })
    } catch (error) {
      res.status(400).json({ success: false, error: error.message })
    }
  })

  /**
   * 批量设置设备别名
   */
  router.post('/aliases/batch', (req, res) => {
    try {
      const { aliases } = req.body
      const result = deviceService.setAliasesBatch(aliases)
      
      persistenceService.scheduleWriteDeviceAliases(result)
      io.emit('device:aliases:update', result)
      
      res.json({ success: true, data: result })
    } catch (error) {
      res.status(400).json({ success: false, error: error.message })
    }
  })

  /**
   * 删除设备别名
   */
  router.delete('/alias/:deviceId', (req, res) => {
    try {
      const { deviceId } = req.params
      const existed = deviceService.deleteAlias(deviceId)
      
      if (existed) {
        persistenceService.scheduleWriteDeviceAliases(deviceService.getAllAliases())
        io.emit('device:alias:update', { deviceId, alias: null })
        console.log(`📱 删除设备别名: ${deviceId}`)
      }
      
      res.json({ success: true })
    } catch (error) {
      res.status(400).json({ success: false, error: error.message })
    }
  })

  return router
}

export default createDeviceRoutes

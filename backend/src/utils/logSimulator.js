/**
 * 日志模拟器（仅用于测试）
 */

import { config } from '../config/index.js'

export class LogSimulator {
  constructor(logService, persistenceService, io) {
    this.logService = logService
    this.persistenceService = persistenceService
    this.io = io
    this.interval = null
    
    this.levels = ['DEBUG', 'INFO', 'WARN', 'ERROR']
    this.devices = ['device-001', 'device-002', 'device-003']
    this.messages = [
      '系统启动成功',
      '数据同步完成',
      '内存使用率: 75%',
      '连接超时',
      '数据库查询完成',
      '用户登录成功',
      '文件上传完成',
      '缓存更新',
      '定时任务执行',
      '网络请求成功'
    ]
  }

  /**
   * 生成随机日志
   */
  generateRandomLog() {
    return {
      deviceId: this.devices[Math.floor(Math.random() * this.devices.length)],
      level: this.levels[Math.floor(Math.random() * this.levels.length)],
      message: this.messages[Math.floor(Math.random() * this.messages.length)]
    }
  }

  /**
   * 启动模拟器
   */
  start() {
    console.log('🎭 日志模拟器已启动')
    
    this.interval = setInterval(() => {
      const logData = this.generateRandomLog()
      const log = this.logService.addLog(logData)
      
      // 实时推送
      this.io.emit('log:new', log)
      
      // 安排延迟写入
      this.persistenceService.scheduleWriteLogs(this.logService.getAllLogs())
    }, config.logs.simulateInterval)
  }

  /**
   * 停止模拟器
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
      console.log('🛑 日志模拟器已停止')
    }
  }
}

export default LogSimulator

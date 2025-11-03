/**
 * 日志服务
 * 负责日志的存储、查询和管理
 */

import { Log } from '../models/Log.js'
import { config } from '../config/index.js'

export class LogService {
  constructor() {
    this.logs = []
    this.maxLogs = config.logs.maxLogs
  }

  /**
   * 添加日志
   */
  addLog(data) {
    Log.validate(data)
    const log = new Log(data)
    
    this.logs.push(log)
    
    // 限制数量
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }
    
    return log
  }

  /**
   * 查询日志
   */
  queryLogs(filters = {}) {
    const { level, deviceId, keyword, limit = 100 } = filters
    let filtered = [...this.logs]
    
    if (level) {
      filtered = filtered.filter(l => l.level === level)
    }
    
    if (deviceId) {
      filtered = filtered.filter(l => l.deviceId.includes(deviceId))
    }
    
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase()
      filtered = filtered.filter(l => 
        l.message.toLowerCase().includes(lowerKeyword)
      )
    }
    
    const result = filtered.slice(-parseInt(limit))
    
    return {
      data: result,
      total: filtered.length
    }
  }

  /**
   * 获取所有日志
   */
  getAllLogs() {
    return this.logs
  }

  /**
   * 获取最近的日志
   */
  getRecentLogs(count = 100) {
    return this.logs.slice(-count)
  }

  /**
   * 清空日志
   */
  clearLogs() {
    this.logs = []
  }

  /**
   * 设置日志数据（用于从文件加载）
   */
  setLogs(logs) {
    this.logs = logs
  }

  /**
   * 获取日志数量
   */
  getLogsCount() {
    return this.logs.length
  }

  /**
   * 获取设备列表
   */
  getDevices() {
    return [...new Set(this.logs.map(l => l.deviceId))]
  }
}

export default LogService

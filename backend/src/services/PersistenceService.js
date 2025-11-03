/**
 * 持久化服务
 * 负责数据的文件读写操作
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { config } from '../config/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export class PersistenceService {
  constructor() {
    this.logFilePath = path.join(__dirname, '../../', config.paths.logFile)
    this.deviceAliasesFilePath = path.join(__dirname, '../../', config.paths.deviceAliasesFile)
    this.writeDelay = config.logs.writeDelay
    
    this.writeTimer = null
    this.deviceAliasTimer = null
    this.hasChanges = false
    this.hasDeviceChanges = false
  }

  /**
   * 从文件加载日志
   */
  loadLogs() {
    try {
      if (fs.existsSync(this.logFilePath)) {
        const data = fs.readFileSync(this.logFilePath, 'utf-8')
        const logs = JSON.parse(data)
        console.log(`📂 从文件加载了 ${logs.length} 条日志`)
        return logs
      }
      return []
    } catch (error) {
      console.error('❌ 加载日志文件失败:', error.message)
      return []
    }
  }

  /**
   * 从文件加载设备别名
   */
  loadDeviceAliases() {
    try {
      if (fs.existsSync(this.deviceAliasesFilePath)) {
        const data = fs.readFileSync(this.deviceAliasesFilePath, 'utf-8')
        const aliases = JSON.parse(data)
        console.log(`📱 从文件加载了 ${Object.keys(aliases).length} 个设备别名`)
        return aliases
      }
      return {}
    } catch (error) {
      console.error('❌ 加载设备别名文件失败:', error.message)
      return {}
    }
  }

  /**
   * 延迟写入日志到文件（防抖）
   */
  scheduleWriteLogs(logs) {
    this.hasChanges = true
    this.logsToWrite = logs
    
    // 清除之前的定时器
    if (this.writeTimer) {
      clearTimeout(this.writeTimer)
    }
    
    // 设置新的定时器
    this.writeTimer = setTimeout(() => {
      this.writeLogs(this.logsToWrite)
    }, this.writeDelay)
    
    // console.log(`⏰ 已安排日志写入任务，将在 ${this.writeDelay / 1000} 秒后执行`)
  }

  /**
   * 延迟写入设备别名到文件（防抖）
   */
  scheduleWriteDeviceAliases(aliases) {
    this.hasDeviceChanges = true
    this.aliasesToWrite = aliases
    
    // 清除之前的定时器
    if (this.deviceAliasTimer) {
      clearTimeout(this.deviceAliasTimer)
    }
    
    // 设置新的定时器
    this.deviceAliasTimer = setTimeout(() => {
      this.writeDeviceAliases(this.aliasesToWrite)
    }, this.writeDelay)
    
    console.log(`⏰ 已安排设备别名写入任务，将在 ${this.writeDelay / 1000} 秒后执行`)
  }

  /**
   * 立即写入日志到文件
   */
  writeLogs(logs) {
    if (!this.hasChanges && !logs) {
      console.log('📝 日志没有变化，跳过写入')
      return
    }
    
    try {
      const data = JSON.stringify(logs || this.logsToWrite, null, 2)
      fs.writeFileSync(this.logFilePath, data, 'utf-8')
      this.hasChanges = false
      console.log(`💾 成功写入 ${(logs || this.logsToWrite).length} 条日志到文件`)
    } catch (error) {
      console.error('❌ 写入日志文件失败:', error.message)
    }
  }

  /**
   * 立即写入设备别名到文件
   */
  writeDeviceAliases(aliases) {
    if (!this.hasDeviceChanges && !aliases) {
      console.log('📝 设备别名没有变化，跳过写入')
      return
    }
    
    try {
      const data = JSON.stringify(aliases || this.aliasesToWrite, null, 2)
      fs.writeFileSync(this.deviceAliasesFilePath, data, 'utf-8')
      this.hasDeviceChanges = false
      console.log(`💾 成功写入 ${Object.keys(aliases || this.aliasesToWrite).length} 个设备别名到文件`)
    } catch (error) {
      console.error('❌ 写入设备别名文件失败:', error.message)
    }
  }

  /**
   * 获取保存状态
   */
  getStatus() {
    return {
      hasChanges: this.hasChanges,
      filePath: this.logFilePath
    }
  }

  /**
   * 清理定时器
   */
  cleanup() {
    if (this.writeTimer) {
      clearTimeout(this.writeTimer)
    }
    if (this.deviceAliasTimer) {
      clearTimeout(this.deviceAliasTimer)
    }
  }
}

export default PersistenceService

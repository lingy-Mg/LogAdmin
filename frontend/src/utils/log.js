/**
 * 日志处理工具函数
 */

import { LOG_LEVEL_COLORS } from '@/constants/log'

/**
 * 获取日志级别对应的颜色
 */
export function getLevelColor(level) {
  return LOG_LEVEL_COLORS[level?.toUpperCase()] || LOG_LEVEL_COLORS.INFO
}

/**
 * 过滤日志
 */
export function filterLogs(logs, filters) {
  let result = [...logs]

  // 设备筛选
  if (filters.deviceId) {
    const searchTerm = filters.deviceId.toLowerCase()
    result = result.filter(log => {
      const id = (log.deviceId || '').toLowerCase()
      return id.includes(searchTerm)
    })
  }

  // 级别筛选
  if (filters.level) {
    result = result.filter(log => log.level?.toUpperCase() === filters.level.toUpperCase())
  }

  // 关键词筛选
  if (filters.keyword) {
    const kw = filters.keyword.toLowerCase()
    result = result.filter(log => {
      const message = log.message || log.msg || ''
      return message.toLowerCase().includes(kw)
    })
  }

  return result
}

/**
 * 统计日志级别
 */
export function calculateLevelStats(logs) {
  const stats = { DEBUG: 0, INFO: 0, WARN: 0, WARNING: 0, ERROR: 0, FATAL: 0 }
  
  logs.forEach(log => {
    const level = log.level?.toUpperCase()
    if (stats.hasOwnProperty(level)) {
      stats[level]++
    }
  })
  
  // 合并 WARN 和 WARNING
  stats.WARN += stats.WARNING
  
  return stats
}

/**
 * 获取设备列表
 */
export function getDeviceList(logs) {
  const deviceIds = [...new Set(logs.map(log => log.deviceId).filter(Boolean))]
  return deviceIds
}

export default {
  getLevelColor,
  filterLogs,
  calculateLevelStats,
  getDeviceList
}

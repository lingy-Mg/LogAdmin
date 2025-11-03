/**
 * 格式化工具函数
 */

import dayjs from 'dayjs'

/**
 * 格式化时间（简短版）
 */
export function formatTime(timestamp) {
  if (!timestamp) return 'N/A'
  return dayjs(timestamp).format('HH:mm:ss.SSS')
}

/**
 * 格式化时间（完整版）
 */
export function formatFullTime(timestamp) {
  if (!timestamp) return 'N/A'
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss.SSS')
}

/**
 * 格式化值（处理对象和数组）
 */
export function formatValue(value) {
  if (value === null || value === undefined) return 'N/A'
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return String(value)
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

export default {
  formatTime,
  formatFullTime,
  formatValue,
  formatFileSize
}

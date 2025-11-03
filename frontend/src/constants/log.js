/**
 * 日志相关常量
 */

// 日志级别
export const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  FATAL: 'FATAL'
}

// 日志级别颜色
export const LOG_LEVEL_COLORS = {
  DEBUG: '#9aa0a6',
  INFO: '#4EC9B0',
  WARN: '#FFA500',
  WARNING: '#FFA500',
  ERROR: '#F44747',
  FATAL: '#FF0000'
}

// 日志级别选项（用于下拉框）
export const LOG_LEVEL_OPTIONS = [
  { label: 'DEBUG', value: 'DEBUG' },
  { label: 'INFO', value: 'INFO' },
  { label: 'WARN', value: 'WARN' },
  { label: 'ERROR', value: 'ERROR' }
]

// Socket 事件名称
export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  LOG_HISTORY: 'log:history',
  LOG_NEW: 'log:new',
  LOG_CLEAR: 'log:clear',
  DEVICE_ALIASES: 'device:aliases',
  DEVICE_ALIAS_UPDATE: 'device:alias:update',
  DEVICE_ALIASES_UPDATE: 'device:aliases:update'
}

export default {
  LOG_LEVELS,
  LOG_LEVEL_COLORS,
  LOG_LEVEL_OPTIONS,
  SOCKET_EVENTS
}

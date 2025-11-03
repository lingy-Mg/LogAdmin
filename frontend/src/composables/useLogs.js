/**
 * 日志管理逻辑
 * 处理日志过滤、统计、设备列表等
 */

import { ref, computed } from 'vue'
import { filterLogs, calculateLevelStats, getDeviceList } from '@/utils/log'

export function useLogs(logs, deviceAliases) {
  // 过滤条件
  const filters = ref({
    deviceId: '',
    level: '',
    keyword: ''
  })

  // 选中的日志
  const selectedLog = ref(null)

  // 过滤后的日志列表
  const filteredLogs = computed(() => {
    let result = filterLogs(logs.value, filters.value)
    
    // 如果有设备别名过滤，也要匹配别名
    if (filters.value.deviceId) {
      const searchTerm = filters.value.deviceId.toLowerCase()
      result = result.filter(log => {
        const id = (log.deviceId || '').toLowerCase()
        const alias = (deviceAliases.value[log.deviceId] || '').toLowerCase()
        return id.includes(searchTerm) || alias.includes(searchTerm)
      })
    }
    
    return result
  })

  // 日志级别统计
  const levelStats = computed(() => {
    return calculateLevelStats(logs.value)
  })

  // 设备列表
  const deviceList = computed(() => {
    const deviceIds = getDeviceList(logs.value)
    return deviceIds.map(id => ({
      deviceId: id,
      alias: deviceAliases.value[id] || ''
    }))
  })

  // 重置过滤条件
  function resetFilters() {
    filters.value = {
      deviceId: '',
      level: '',
      keyword: ''
    }
  }

  // 选中日志
  function selectLog(log) {
    selectedLog.value = log
  }

  // 取消选中
  function unselectLog() {
    selectedLog.value = null
  }

  return {
    filters,
    selectedLog,
    filteredLogs,
    levelStats,
    deviceList,
    resetFilters,
    selectLog,
    unselectLog
  }
}

export default useLogs

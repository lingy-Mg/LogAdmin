/**
 * API 请求工具
 * 封装与后端的 HTTP 通信
 */

import { ElMessage } from 'element-plus'
import { config } from '@/config'

/**
 * 清空日志
 */
export async function clearLogsAPI() {
  try {
    const response = await fetch(`${config.api.baseURL}/api/logs`, {
      method: 'DELETE'
    })
    const result = await response.json()
    if (!result.success) {
      ElMessage.error('清空失败: ' + (result.error || 'unknown'))
    }
    return result
  } catch (error) {
    ElMessage.error('清空失败: ' + error.message)
    throw error
  }
}

/**
 * 保存设备别名（立即写入文件）
 */
export async function saveDeviceAliasAPI(deviceId, alias) {
  try {
    const response = await fetch(`${config.api.baseURL}/api/devices/alias`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, alias })
    })
    const result = await response.json()
    
    if (result.success) {
      ElMessage.success('设备别名已保存')
    } else {
      ElMessage.error('保存失败: ' + (result.error || 'unknown'))
    }
    
    return result
  } catch (error) {
    ElMessage.error('保存失败: ' + error.message)
    throw error
  }
}

/**
 * 查询日志
 */
export async function queryLogsAPI(filters) {
  try {
    const params = new URLSearchParams()
    if (filters.level) params.append('level', filters.level)
    if (filters.deviceId) params.append('deviceId', filters.deviceId)
    if (filters.keyword) params.append('keyword', filters.keyword)
    
    const response = await fetch(`${config.api.baseURL}/api/logs?${params}`)
    const result = await response.json()
    
    if (!result.success) {
      ElMessage.error('查询失败: ' + (result.error || 'unknown'))
    }
    
    return result
  } catch (error) {
    ElMessage.error('查询失败: ' + error.message)
    throw error
  }
}

export default {
  clearLogsAPI,
  saveDeviceAliasAPI,
  queryLogsAPI
}

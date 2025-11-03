/**
 * 设备服务
 * 负责设备别名的管理
 */

export class DeviceService {
  constructor() {
    this.deviceAliases = {}
  }

  /**
   * 设置设备别名
   */
  setAlias(deviceId, alias) {
    if (!deviceId) {
      throw new Error('设备ID不能为空')
    }
    
    if (alias && alias.trim()) {
      this.deviceAliases[deviceId] = alias.trim()
      return { deviceId, alias: alias.trim() }
    } else {
      // 删除别名
      delete this.deviceAliases[deviceId]
      return { deviceId, alias: null }
    }
  }

  /**
   * 获取设备别名
   */
  getAlias(deviceId) {
    return this.deviceAliases[deviceId] || null
  }

  /**
   * 获取所有设备别名
   */
  getAllAliases() {
    return this.deviceAliases
  }

  /**
   * 批量设置设备别名
   */
  setAliasesBatch(aliases) {
    if (!aliases || typeof aliases !== 'object') {
      throw new Error('无效的别名数据')
    }
    
    Object.assign(this.deviceAliases, aliases)
    return this.deviceAliases
  }

  /**
   * 删除设备别名
   */
  deleteAlias(deviceId) {
    const exists = !!this.deviceAliases[deviceId]
    delete this.deviceAliases[deviceId]
    return exists
  }

  /**
   * 设置设备别名数据（用于从文件加载）
   */
  setAliases(aliases) {
    this.deviceAliases = aliases
  }

  /**
   * 获取设备列表（带别名）
   */
  getDeviceList(deviceIds) {
    return deviceIds.map(id => ({
      deviceId: id,
      alias: this.getAlias(id)
    }))
  }

  /**
   * 获取设备数量
   */
  getDevicesCount() {
    return Object.keys(this.deviceAliases).length
  }
}

export default DeviceService

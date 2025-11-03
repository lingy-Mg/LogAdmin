/**
 * 日志模型
 * 定义日志的数据结构
 * 支持标准格式和 Unity 格式
 */

export class Log {
  constructor(data) {
    // 兼容 Unity 格式和标准格式
    this.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // 时间戳：优先使用 ts，否则使用 timestamp，最后用当前时间
    this.timestamp = data.ts || data.timestamp || new Date().toISOString()
    if (typeof this.timestamp === 'number') {
      this.timestamp = new Date(this.timestamp).toISOString()
    }
    
    // 设备ID：优先从 extra.device_id 获取，否则使用 deviceId
    this.deviceId = data.extra?.device_id || data.deviceId || 'unknown'
    
    // 日志级别：统一转大写
    const level = data.level || 'INFO'
    this.level = level.toUpperCase()
    
    // 消息内容
    this.message = data.msg || data.message || ''
    
    // Unity 特有字段
    if (data.app) {
      this.app = data.app
      this.platform = data.platform
      this.path = data.path
      this.source_type = data.source_type
      
      // 保存 extra 字段
      if (data.extra) {
        this.extra = { ...data.extra }
      }
    }
  }

  /**
   * 验证日志级别
   */
  static isValidLevel(level) {
    const validLevels = ['DEBUG', 'INFO', 'WARN', 'WARNING', 'ERROR', 'FATAL']
    return validLevels.includes(level.toUpperCase())
  }

  /**
   * 验证日志数据
   */
  static validate(data) {
    if (!data) {
      throw new Error('日志数据不能为空')
    }
    
    const level = data.level || 'INFO'
    if (!Log.isValidLevel(level)) {
      throw new Error('无效的日志级别')
    }
    
    const message = data.msg || data.message
    if (!message || typeof message !== 'string') {
      throw new Error('日志消息必须是字符串')
    }
    
    return true
  }
}

export default Log

/**
 * 优雅关闭工具
 * 确保在关闭前保存所有数据
 */

export function setupGracefulShutdown(persistenceService, logService, deviceService) {
  const gracefulShutdown = (signal) => {
    console.log(`\n🛑 收到 ${signal} 信号，正在保存数据...`)
    
    // 清理持久化服务的定时器
    persistenceService.cleanup()
    
    // 保存日志
    const status = persistenceService.getStatus()
    if (status.hasChanges) {
      persistenceService.writeLogs(logService.getAllLogs())
    }
    
    // 保存设备别名
    persistenceService.writeDeviceAliases(deviceService.getAllAliases())
    
    console.log('👋 服务器已关闭')
    process.exit(0)
  }

  // 监听退出信号
  process.on('SIGINT', () => gracefulShutdown('SIGINT'))
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
}

export default setupGracefulShutdown

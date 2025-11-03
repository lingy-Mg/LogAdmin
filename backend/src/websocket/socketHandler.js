/**
 * WebSocket 连接处理
 */

export function setupSocketHandlers(io, logService, deviceService) {
  io.on('connection', (socket) => {
    console.log('🔗 客户端连接:', socket.id)
    
    // 发送最近的日志
    const recentLogs = logService.getRecentLogs(100)
    socket.emit('log:history', recentLogs)
    
    // 发送设备别名
    const aliases = deviceService.getAllAliases()
    socket.emit('device:aliases', aliases)
    
    socket.on('disconnect', () => {
      console.log('❌ 客户端断开:', socket.id)
    })
  })
}

export default setupSocketHandlers

# 任务 06: WebSocket 实时日志推送

## 目标
实现基于 Socket.IO 的实时日志流推送系统，支持订阅、过滤、限流等功能。

## 执行步骤

### 1. 安装依赖
```bash
cd packages/backend
pnpm add socket.io
pnpm add -D @types/socket.io
```

### 2. 创建 WebSocket 服务

#### 2.1 WebSocket 服务器 (`src/websocket/server.ts`)
实现：
```typescript
import { Server as HttpServer } from 'http'
import { Server, Socket } from 'socket.io'
import { logger } from '../utils/logger'
import { config } from '../config'

export class WebSocketServer {
  private io: Server
  private connections: Map<string, Socket> = new Map()

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: config.cors.origin,
        credentials: true
      },
      maxHttpBufferSize: 1e6, // 1MB
      pingTimeout: 60000,
      pingInterval: 25000
    })

    this.setupMiddleware()
    this.setupEventHandlers()
  }

  /**
   * 设置中间件
   */
  private setupMiddleware(): void {
    // 认证中间件
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token
        // 验证 token
        if (!token) {
          throw new Error('Authentication required')
        }
        // TODO: 验证 JWT token
        next()
      } catch (error) {
        next(new Error('Authentication failed'))
      }
    })

    // 连接数限制
    this.io.use((socket, next) => {
      if (this.connections.size >= config.websocket.maxConnections) {
        next(new Error('Connection limit reached'))
      } else {
        next()
      }
    })
  }

  /**
   * 设置事件处理
   */
  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`)
      this.connections.set(socket.id, socket)

      // 处理订阅
      socket.on('log:subscribe', (subscription) => {
        this.handleSubscribe(socket, subscription)
      })

      // 处理取消订阅
      socket.on('log:unsubscribe', () => {
        this.handleUnsubscribe(socket)
      })

      // 断开连接
      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`)
        this.connections.delete(socket.id)
      })

      // 错误处理
      socket.on('error', (error) => {
        logger.error(`Socket error for ${socket.id}:`, error)
      })
    })
  }

  /**
   * 处理订阅
   */
  private handleSubscribe(socket: Socket, subscription: any): void {
    logger.info(`Subscription from ${socket.id}:`, subscription)
    
    // 存储订阅信息到 socket
    socket.data.subscription = subscription
    
    // 加入房间
    if (subscription.deviceIds) {
      subscription.deviceIds.forEach((deviceId: string) => {
        socket.join(`device:${deviceId}`)
      })
    }
    
    if (subscription.levels) {
      subscription.levels.forEach((level: string) => {
        socket.join(`level:${level}`)
      })
    }

    socket.emit('log:subscribed', { success: true })
  }

  /**
   * 处理取消订阅
   */
  private handleUnsubscribe(socket: Socket): void {
    logger.info(`Unsubscribe from ${socket.id}`)
    socket.rooms.forEach(room => {
      if (room !== socket.id) {
        socket.leave(room)
      }
    })
    delete socket.data.subscription
    socket.emit('log:unsubscribed', { success: true })
  }

  /**
   * 广播新日志
   */
  broadcastLog(log: LogEntry): void {
    // 广播到所有连接
    this.io.emit('log:new', log)
    
    // 广播到设备房间
    this.io.to(`device:${log.deviceId}`).emit('log:new', log)
    
    // 广播到级别房间
    this.io.to(`level:${log.level}`).emit('log:new', log)
  }

  /**
   * 广播设备状态变化
   */
  broadcastDeviceStatus(deviceId: string, status: string): void {
    this.io.emit('device:status', { deviceId, status })
  }

  /**
   * 广播系统统计
   */
  broadcastStats(stats: any): void {
    this.io.emit('system:stats', stats)
  }

  /**
   * 获取连接数
   */
  getConnectionCount(): number {
    return this.connections.size
  }

  /**
   * 关闭服务器
   */
  close(): void {
    this.io.close()
  }
}
```

### 3. 创建实时日志流服务

#### 3.1 日志流服务 (`src/services/realtime.service.ts`)
实现：
```typescript
import { LogEntry } from '@logadmin/shared'
import { WebSocketServer } from '../websocket/server'
import { RedisClient } from '../database/redis'
import { logger } from '../utils/logger'

export class RealtimeService {
  private buffer: LogEntry[] = []
  private pushTimer: NodeJS.Timeout | null = null
  private readonly BATCH_SIZE = 50
  private readonly PUSH_INTERVAL = 100 // ms

  constructor(
    private wsServer: WebSocketServer,
    private redis: RedisClient
  ) {
    this.startPushTimer()
    this.subscribeToRedis()
  }

  /**
   * 添加日志到推送缓冲区
   */
  async pushLog(log: LogEntry): Promise<void> {
    this.buffer.push(log)

    if (this.buffer.length >= this.BATCH_SIZE) {
      await this.flush()
    }
  }

  /**
   * 启动定时推送
   */
  private startPushTimer(): void {
    this.pushTimer = setInterval(() => {
      if (this.buffer.length > 0) {
        this.flush()
      }
    }, this.PUSH_INTERVAL)
  }

  /**
   * 刷新缓冲区
   */
  private async flush(): Promise<void> {
    if (this.buffer.length === 0) return

    const logsToSend = [...this.buffer]
    this.buffer = []

    try {
      // 批量推送
      logsToSend.forEach(log => {
        this.wsServer.broadcastLog(log)
      })

      logger.debug(`Pushed ${logsToSend.length} logs to clients`)
    } catch (error) {
      logger.error('Failed to push logs:', error)
      // 失败的日志放回缓冲区
      this.buffer.unshift(...logsToSend)
    }
  }

  /**
   * 订阅 Redis 日志频道
   */
  private subscribeToRedis(): void {
    this.redis.subscribe('log:new', (log: LogEntry) => {
      this.pushLog(log)
    })

    this.redis.subscribe('device:status', (data: any) => {
      this.wsServer.broadcastDeviceStatus(data.deviceId, data.status)
    })
  }

  /**
   * 停止服务
   */
  stop(): void {
    if (this.pushTimer) {
      clearInterval(this.pushTimer)
    }
    this.flush()
  }
}
```

### 4. 集成到日志接收流程

修改 `src/services/log.service.ts`，在接收日志时发布到 Redis：
```typescript
export class LogService {
  async receiveLog(log: LogEntry): Promise<void> {
    try {
      // 1. 保存到数据库
      await LogModel.create(log)

      // 2. 写入文件
      await this.fileService.writeLog(log)

      // 3. 发布到 Redis（触发实时推送）
      await this.redis.publish('log:new', log)

      // 4. 更新统计
      await this.updateStats(log)

      logger.debug(`Log received: ${log.id}`)
    } catch (error) {
      logger.error('Failed to receive log:', error)
      throw error
    }
  }
}
```

### 5. 实现订阅过滤器

#### 5.1 订阅过滤器 (`src/websocket/filters.ts`)
```typescript
import { LogEntry, LogSubscription } from '@logadmin/shared'

export class SubscriptionFilter {
  /**
   * 检查日志是否匹配订阅条件
   */
  static matches(log: LogEntry, subscription: LogSubscription): boolean {
    // 检查设备 ID
    if (subscription.deviceIds && subscription.deviceIds.length > 0) {
      if (!subscription.deviceIds.includes(log.deviceId)) {
        return false
      }
    }

    // 检查日志级别
    if (subscription.levels && subscription.levels.length > 0) {
      if (!subscription.levels.includes(log.level)) {
        return false
      }
    }

    // 检查标签
    if (subscription.tags && subscription.tags.length > 0) {
      if (!log.tags || !subscription.tags.some(tag => log.tags!.includes(tag))) {
        return false
      }
    }

    // 检查关键词
    if (subscription.keywords && subscription.keywords.length > 0) {
      const message = log.message.toLowerCase()
      if (!subscription.keywords.some(keyword => message.includes(keyword.toLowerCase()))) {
        return false
      }
    }

    return true
  }

  /**
   * 过滤日志列表
   */
  static filter(logs: LogEntry[], subscription: LogSubscription): LogEntry[] {
    return logs.filter(log => this.matches(log, subscription))
  }
}
```

### 6. 实现限流和性能优化

#### 6.1 限流器 (`src/websocket/rateLimiter.ts`)
```typescript
export class RateLimiter {
  private limits: Map<string, { count: number; resetTime: number }> = new Map()

  /**
   * 检查是否超过限流
   */
  checkLimit(socketId: string, maxPerSecond: number = 100): boolean {
    const now = Date.now()
    const limit = this.limits.get(socketId)

    if (!limit || now > limit.resetTime) {
      this.limits.set(socketId, {
        count: 1,
        resetTime: now + 1000
      })
      return true
    }

    if (limit.count >= maxPerSecond) {
      return false
    }

    limit.count++
    return true
  }

  /**
   * 清理过期限流记录
   */
  cleanup(): void {
    const now = Date.now()
    for (const [socketId, limit] of this.limits.entries()) {
      if (now > limit.resetTime) {
        this.limits.delete(socketId)
      }
    }
  }
}
```

### 7. 实现连接管理

#### 7.1 连接管理器 (`src/websocket/connectionManager.ts`)
```typescript
export class ConnectionManager {
  private connections: Map<string, ConnectionInfo> = new Map()

  /**
   * 添加连接
   */
  addConnection(socket: Socket): void {
    this.connections.set(socket.id, {
      id: socket.id,
      connectedAt: new Date(),
      userId: socket.data.userId,
      ip: socket.handshake.address,
      subscription: null,
      messageCount: 0
    })
  }

  /**
   * 移除连接
   */
  removeConnection(socketId: string): void {
    this.connections.delete(socketId)
  }

  /**
   * 获取连接信息
   */
  getConnection(socketId: string): ConnectionInfo | undefined {
    return this.connections.get(socketId)
  }

  /**
   * 获取所有连接
   */
  getAllConnections(): ConnectionInfo[] {
    return Array.from(this.connections.values())
  }

  /**
   * 获取连接统计
   */
  getStats(): any {
    return {
      total: this.connections.size,
      byUser: this.groupByUser(),
      averageUptime: this.calculateAverageUptime()
    }
  }

  private groupByUser(): Record<string, number> {
    const grouped: Record<string, number> = {}
    for (const conn of this.connections.values()) {
      grouped[conn.userId] = (grouped[conn.userId] || 0) + 1
    }
    return grouped
  }

  private calculateAverageUptime(): number {
    if (this.connections.size === 0) return 0
    
    const now = Date.now()
    const totalUptime = Array.from(this.connections.values())
      .reduce((sum, conn) => sum + (now - conn.connectedAt.getTime()), 0)
    
    return totalUptime / this.connections.size
  }
}
```

### 8. 创建 WebSocket API

#### 8.1 WebSocket 路由 (`src/routes/websocket.routes.ts`)
```typescript
router.get('/ws/connections', wsController.getConnections)
router.get('/ws/stats', wsController.getStats)
router.post('/ws/broadcast', wsController.broadcast)
router.delete('/ws/connections/:id', wsController.disconnectClient)
```

### 9. 集成到主应用

修改 `src/server.ts`：
```typescript
import { createServer } from 'http'
import { WebSocketServer } from './websocket/server'
import { RealtimeService } from './services/realtime.service'

// 创建 HTTP 服务器
const httpServer = createServer(app)

// 创建 WebSocket 服务器
const wsServer = new WebSocketServer(httpServer)

// 创建实时日志服务
const realtimeService = new RealtimeService(wsServer, redisClient)

// 启动服务器
httpServer.listen(config.port, () => {
  logger.info(`Server listening on port ${config.port}`)
  logger.info(`WebSocket server ready`)
})

// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  
  realtimeService.stop()
  wsServer.close()
  httpServer.close(() => {
    logger.info('Server closed')
    process.exit(0)
  })
})
```

### 10. 添加健康检查和监控

#### 10.1 WebSocket 健康检查
```typescript
router.get('/api/ws/health', (req, res) => {
  const stats = {
    connections: wsServer.getConnectionCount(),
    maxConnections: config.websocket.maxConnections,
    healthy: wsServer.getConnectionCount() < config.websocket.maxConnections * 0.9
  }
  
  res.json({
    success: true,
    data: stats
  })
})
```

## 核心事件定义

### 客户端 -> 服务器
- `log:subscribe` - 订阅日志流
- `log:unsubscribe` - 取消订阅
- `log:pause` - 暂停推送
- `log:resume` - 恢复推送

### 服务器 -> 客户端
- `log:new` - 新日志推送
- `log:batch` - 批量日志推送
- `log:subscribed` - 订阅成功
- `log:unsubscribed` - 取消订阅成功
- `device:online` - 设备上线
- `device:offline` - 设备下线
- `device:status` - 设备状态变化
- `system:stats` - 系统统计
- `error` - 错误信息

## 验收标准
- [ ] WebSocket 服务器正常启动
- [ ] 客户端可以成功连接
- [ ] 订阅功能正常工作
- [ ] 日志实时推送正常
- [ ] 批量推送正常工作
- [ ] 过滤功能正常
- [ ] 限流功能正常
- [ ] 连接数限制生效
- [ ] 优雅断开连接
- [ ] 性能达标（延迟 < 100ms）

## 测试方法

### 1. 使用 Socket.IO 客户端测试
创建测试脚本 `test-websocket.js`：
```javascript
const io = require('socket.io-client')

const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
})

socket.on('connect', () => {
  console.log('Connected:', socket.id)
  
  // 订阅日志流
  socket.emit('log:subscribe', {
    deviceIds: ['device-001'],
    levels: ['ERROR', 'WARN']
  })
})

socket.on('log:subscribed', (data) => {
  console.log('Subscribed:', data)
})

socket.on('log:new', (log) => {
  console.log('New log:', log)
})

socket.on('disconnect', () => {
  console.log('Disconnected')
})
```

### 2. 发送测试日志
```bash
# 发送日志触发 WebSocket 推送
curl -X POST http://localhost:8080/api/logs \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "deviceId": "device-001",
    "timestamp": "2025-01-03T10:00:00Z",
    "level": "ERROR",
    "message": "Test error log"
  }'
```

### 3. 查看 WebSocket 统计
```bash
curl http://localhost:3000/api/ws/stats
```

## 预期产出文件
```
packages/backend/src/
├── websocket/
│   ├── server.ts
│   ├── filters.ts
│   ├── rateLimiter.ts
│   └── connectionManager.ts
├── services/
│   └── realtime.service.ts
├── routes/
│   └── websocket.routes.ts
└── controllers/
    └── websocket.controller.ts
```

## 性能优化建议
1. 使用 Redis Pub/Sub 支持多实例部署
2. 批量推送减少网络开销
3. 限流防止客户端过载
4. 连接池管理
5. 心跳检测保持连接活性
6. 压缩大消息
7. 使用 Room 机制减少不必要的推送

## 下一步
完成后继续执行 `07-前端项目搭建.md`

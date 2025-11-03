# 任务 04: HTTP 接收器实现

## 目标
实现 HTTP 日志接收器，包括 API 路由、验证、批量处理、消息队列缓冲等功能。

## 执行步骤

### 1. 创建接收器基础架构

#### 1.1 接收器基类 (`src/receivers/base/BaseReceiver.ts`)
实现：
- IReceiver 接口实现
- 生命周期管理（initialize, start, stop）
- 状态管理
- 配置管理
- 抽象方法定义

#### 1.2 接收器管理器 (`src/receivers/manager.ts`)
实现：
- 接收器注册
- 接收器启动/停止
- 接收器状态查询
- 配置更新
- 插件加载

#### 1.3 接收器类型定义 (`src/receivers/types.ts`)
定义：
- 接收器配置类型
- 接收器状态类型
- 接收器统计类型

### 2. 实现 HTTP 接收器插件

#### 2.1 初始化 HTTP 接收器包
```bash
cd packages/receivers/http
pnpm init
pnpm add express zod
pnpm add -D typescript @types/express @types/node
pnpm add @logadmin/shared@workspace:*
```

#### 2.2 HTTP 接收器主类 (`packages/receivers/http/src/index.ts`)
实现：
- 继承 BaseReceiver
- Express 应用初始化
- 路由注册
- 中间件配置
- 端口监听

#### 2.3 路由处理 (`packages/receivers/http/src/routes.ts`)
实现路由：
- `POST /api/logs` - 接收单条日志
- `POST /api/logs/batch` - 批量接收日志
- `GET /api/health` - 健康检查
- `GET /api/stats` - 接收器统计

#### 2.4 请求验证器 (`packages/receivers/http/src/validator.ts`)
使用 Zod 验证：
- 单条日志验证
- 批量日志验证
- API Key 验证
- 请求大小限制

#### 2.5 日志处理器 (`packages/receivers/http/src/handler.ts`)
实现：
- 日志标准化
- 设备信息验证
- 时间戳处理
- 元数据提取
- 错误处理

### 3. 实现日志服务层

#### 3.1 日志服务 (`src/services/log.service.ts`)
实现方法：
- `receiveLog(log: LogEntry): Promise<void>` - 接收单条日志
- `receiveBatchLogs(logs: LogEntry[]): Promise<void>` - 批量接收
- `bufferLog(log: LogEntry): void` - 缓冲日志
- `flushBuffer(): Promise<void>` - 刷新缓冲区
- `queryLogs(params: LogQueryParams): Promise<PaginatedResponse<LogEntry>>` - 查询日志
- `getLogById(id: string): Promise<LogEntry | null>` - 获取单条日志

#### 3.2 设备服务 (`src/services/device.service.ts`)
实现方法：
- `registerDevice(device: Device): Promise<Device>` - 注册设备
- `verifyDevice(deviceId: string, apiKey: string): Promise<boolean>` - 验证设备
- `updateDeviceStatus(deviceId: string, status: DeviceStatus): Promise<void>` - 更新状态
- `getDeviceInfo(deviceId: string): Promise<Device | null>` - 获取设备信息
- `listDevices(): Promise<Device[]>` - 列出所有设备
- `updateLastActive(deviceId: string): Promise<void>` - 更新活跃时间

### 4. 实现消息队列缓冲

#### 4.1 队列管理器 (`src/queue/QueueManager.ts`)
使用 Redis List/Stream 实现：
- 日志入队
- 批量出队
- 队列长度监控
- 队列持久化

#### 4.2 批量处理器 (`src/queue/BatchProcessor.ts`)
实现：
- 定时批量写入（每秒或每 100 条）
- 批量写入数据库
- 批量写入文件
- 失败重试
- 性能统计

### 5. 实现文件写入

#### 5.1 文件写入服务 (`src/services/file.service.ts`)
实现：
- 按设备分离文件
- 按日期组织目录
- 文件大小检查
- 自动切割（超过 1MB）
- 文件命名规范
- 写入缓冲

#### 5.2 文件切割器 (`src/services/fileSplitter.ts`)
实现：
- 监控文件大小
- 触发切割
- 生成序列号
- 原子性操作

### 6. 创建 API 路由

#### 6.1 日志路由 (`src/routes/log.routes.ts`)
路由定义：
- `POST /api/logs/receive` - 接收日志（内部调用）
- `GET /api/logs` - 查询日志
- `GET /api/logs/:id` - 获取单条日志
- `POST /api/logs/export` - 导出日志
- `GET /api/logs/stats` - 日志统计

#### 6.2 设备路由 (`src/routes/device.routes.ts`)
路由定义：
- `POST /api/devices` - 注册设备
- `GET /api/devices` - 列出设备
- `GET /api/devices/:id` - 获取设备信息
- `PUT /api/devices/:id` - 更新设备信息
- `DELETE /api/devices/:id` - 删除设备
- `GET /api/devices/:id/logs` - 获取设备日志

#### 6.3 接收器路由 (`src/routes/receiver.routes.ts`)
路由定义：
- `GET /api/receivers` - 列出接收器
- `GET /api/receivers/:type` - 获取接收器信息
- `POST /api/receivers/:type/start` - 启动接收器
- `POST /api/receivers/:type/stop` - 停止接收器
- `PUT /api/receivers/:type/config` - 更新配置

### 7. 实现控制器

#### 7.1 日志控制器 (`src/controllers/log.controller.ts`)
实现：
- 请求参数提取
- 调用服务层
- 响应格式化
- 错误处理

#### 7.2 设备控制器 (`src/controllers/device.controller.ts`)
实现设备管理的所有控制器方法。

#### 7.3 接收器控制器 (`src/controllers/receiver.controller.ts`)
实现接收器管理的所有控制器方法。

### 8. 数据验证器

#### 8.1 日志验证 (`src/validators/log.validator.ts`)
使用 Zod 定义 Schema：
```typescript
const logEntrySchema = z.object({
  deviceId: z.string().min(1).max(100),
  timestamp: z.coerce.date(),
  level: z.nativeEnum(LogLevel),
  message: z.string().min(1).max(10000),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
  source: z.string().optional(),
  traceId: z.string().optional()
})

const batchLogsSchema = z.object({
  logs: z.array(logEntrySchema).min(1).max(1000)
})
```

#### 8.2 设备验证 (`src/validators/device.validator.ts`)
定义设备注册、更新的验证 Schema。

### 9. 整合到 Express 应用

在 `src/app.ts` 中：
```typescript
import { receiverManager } from './receivers/manager'
import logRoutes from './routes/log.routes'
import deviceRoutes from './routes/device.routes'
import receiverRoutes from './routes/receiver.routes'

// 注册路由
app.use('/api/logs', logRoutes)
app.use('/api/devices', deviceRoutes)
app.use('/api/receivers', receiverRoutes)

// 初始化接收器
await receiverManager.initialize()
await receiverManager.startAll()
```

## 核心代码示例

### HTTP 接收器实现
```typescript
import { BaseReceiver } from '../../base/BaseReceiver'
import { LogEntry, ReceiverType } from '@logadmin/shared'
import express, { Express } from 'express'

export class HttpReceiver extends BaseReceiver {
  private app: Express
  private server: any

  constructor(config: any) {
    super('HTTP Receiver', '1.0.0', ReceiverType.HTTP, config)
  }

  async initialize(config: any): Promise<void> {
    this.app = express()
    this.app.use(express.json({ limit: config.maxBodySize }))
    
    // 注册路由
    this.app.post('/api/logs', this.handleLog.bind(this))
    this.app.post('/api/logs/batch', this.handleBatchLogs.bind(this))
  }

  async start(): Promise<void> {
    const port = this.config.port
    this.server = this.app.listen(port, () => {
      console.log(`HTTP Receiver listening on port ${port}`)
    })
  }

  async stop(): Promise<void> {
    if (this.server) {
      this.server.close()
    }
  }

  private async handleLog(req: any, res: any): Promise<void> {
    try {
      // 验证 API Key
      const apiKey = req.headers['x-api-key']
      const deviceId = req.body.deviceId
      
      // 验证设备
      const isValid = await this.deviceService.verifyDevice(deviceId, apiKey)
      if (!isValid) {
        return res.status(401).json({ success: false, message: 'Unauthorized' })
      }

      // 接收日志
      const log = await this.receive(req.body)
      await this.logService.receiveLog(log[0])

      res.json({ success: true, message: 'Log received' })
    } catch (error) {
      res.status(400).json({ success: false, message: error.message })
    }
  }

  async receive(data: any): Promise<LogEntry[]> {
    // 标准化日志格式
    const log: LogEntry = {
      id: this.generateId(),
      deviceId: data.deviceId,
      timestamp: new Date(data.timestamp),
      level: data.level,
      message: data.message,
      tags: data.tags,
      metadata: data.metadata,
      receivedAt: new Date()
    }
    return [log]
  }

  validate(data: any): boolean {
    // 使用 Zod 验证
    return true
  }
}
```

### 批量处理器
```typescript
export class BatchProcessor {
  private buffer: LogEntry[] = []
  private timer: NodeJS.Timeout | null = null
  private readonly BATCH_SIZE = 100
  private readonly BATCH_INTERVAL = 1000 // 1秒

  constructor(
    private logService: LogService,
    private fileService: FileService
  ) {
    this.startBatchTimer()
  }

  async addLog(log: LogEntry): Promise<void> {
    this.buffer.push(log)
    
    if (this.buffer.length >= this.BATCH_SIZE) {
      await this.flush()
    }
  }

  private startBatchTimer(): void {
    this.timer = setInterval(() => {
      if (this.buffer.length > 0) {
        this.flush()
      }
    }, this.BATCH_INTERVAL)
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) return

    const logsToProcess = [...this.buffer]
    this.buffer = []

    try {
      // 写入数据库
      await this.logService.saveBatch(logsToProcess)
      
      // 写入文件
      await this.fileService.writeBatch(logsToProcess)
      
      logger.info(`Flushed ${logsToProcess.length} logs`)
    } catch (error) {
      logger.error('Batch flush error:', error)
      // 失败的日志放回缓冲区
      this.buffer.unshift(...logsToProcess)
    }
  }
}
```

### 日志查询服务
```typescript
export class LogService {
  async queryLogs(params: LogQueryParams): Promise<PaginatedResponse<LogEntry>> {
    const query: any = {}
    
    if (params.deviceIds?.length) {
      query.deviceId = { $in: params.deviceIds }
    }
    
    if (params.levels?.length) {
      query.level = { $in: params.levels }
    }
    
    if (params.startTime || params.endTime) {
      query.timestamp = {}
      if (params.startTime) query.timestamp.$gte = params.startTime
      if (params.endTime) query.timestamp.$lte = params.endTime
    }
    
    if (params.keyword) {
      query.message = { $regex: params.keyword, $options: 'i' }
    }

    const page = params.page || 1
    const pageSize = params.pageSize || 50
    const skip = (page - 1) * pageSize

    const [logs, total] = await Promise.all([
      LogModel.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      LogModel.countDocuments(query)
    ])

    return {
      success: true,
      data: logs,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      },
      timestamp: Date.now()
    }
  }
}
```

## 验收标准
- [ ] HTTP 接收器可以正常启动
- [ ] 可以接收单条日志（POST /api/logs）
- [ ] 可以批量接收日志（POST /api/logs/batch）
- [ ] API Key 认证正常工作
- [ ] 日志正确写入数据库
- [ ] 日志正确写入文件
- [ ] 批量处理正常工作
- [ ] 文件切割功能正常
- [ ] 查询 API 返回正确结果
- [ ] 性能达标（>1000 req/s）

## 测试方法

### 1. 注册设备
```bash
curl -X POST http://localhost:3000/api/devices \
  -H "Content-Type: application/json" \
  -d '{
    "id": "device-001",
    "name": "Test Device",
    "type": "server"
  }'
```

### 2. 发送日志
```bash
curl -X POST http://localhost:8080/api/logs \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "deviceId": "device-001",
    "timestamp": "2025-01-03T10:00:00Z",
    "level": "INFO",
    "message": "Test log message"
  }'
```

### 3. 批量发送
```bash
curl -X POST http://localhost:8080/api/logs/batch \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "logs": [
      {
        "deviceId": "device-001",
        "timestamp": "2025-01-03T10:00:00Z",
        "level": "INFO",
        "message": "Log 1"
      },
      {
        "deviceId": "device-001",
        "timestamp": "2025-01-03T10:00:01Z",
        "level": "ERROR",
        "message": "Log 2"
      }
    ]
  }'
```

### 4. 查询日志
```bash
curl "http://localhost:3000/api/logs?deviceId=device-001&level=ERROR&page=1&pageSize=20"
```

## 预期产出文件
```
packages/backend/src/
├── receivers/
│   ├── base/
│   │   └── BaseReceiver.ts
│   ├── manager.ts
│   └── types.ts
├── services/
│   ├── log.service.ts
│   ├── device.service.ts
│   ├── file.service.ts
│   └── fileSplitter.ts
├── queue/
│   ├── QueueManager.ts
│   └── BatchProcessor.ts
├── controllers/
│   ├── log.controller.ts
│   ├── device.controller.ts
│   └── receiver.controller.ts
├── routes/
│   ├── log.routes.ts
│   ├── device.routes.ts
│   └── receiver.routes.ts
└── validators/
    ├── log.validator.ts
    └── device.validator.ts

packages/receivers/http/src/
├── index.ts
├── routes.ts
├── handler.ts
└── validator.ts
```

## 下一步
完成后继续执行 `05-日志归档系统.md`

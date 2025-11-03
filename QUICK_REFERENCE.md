# LogAdmin 快速参考指南

## 📋 目录快速索引

| 路径 | 说明 | 关键文件 |
|------|------|----------|
| `backend/src/config/` | 配置 | `index.js` - 所有配置参数 |
| `backend/src/models/` | 模型 | `Log.js` - 日志数据结构 |
| `backend/src/services/` | 服务 | `LogService.js`, `DeviceService.js`, `PersistenceService.js` |
| `backend/src/routes/` | 路由 | `logRoutes.js`, `deviceRoutes.js` |
| `backend/src/websocket/` | WebSocket | `socketHandler.js` |
| `backend/src/utils/` | 工具 | `logSimulator.js`, `gracefulShutdown.js` |

## 🔍 查找文件速查

### 需要修改配置？
👉 `backend/src/config/index.js`

### 需要修改日志结构？
👉 `backend/src/models/Log.js`

### 需要修改日志业务逻辑？
👉 `backend/src/services/LogService.js`

### 需要修改设备别名逻辑？
👉 `backend/src/services/DeviceService.js`

### 需要修改持久化策略？
👉 `backend/src/services/PersistenceService.js`

### 需要添加新的日志 API？
👉 `backend/src/routes/logRoutes.js`

### 需要添加新的设备 API？
👉 `backend/src/routes/deviceRoutes.js`

### 需要修改 WebSocket 事件？
👉 `backend/src/websocket/socketHandler.js`

### 需要修改启动流程？
👉 `backend/src/index.js`

### 需要修改 Express 中间件？
👉 `backend/src/app.js`

## 🎯 常见任务

### 1. 修改服务器端口
```javascript
// backend/src/config/index.js
export const config = {
  server: {
    port: 3000  // 👈 修改这里
  }
}
```

### 2. 修改日志数量限制
```javascript
// backend/src/config/index.js
export const config = {
  logs: {
    maxLogs: 1000  // 👈 修改这里
  }
}
```

### 3. 修改持久化延迟时间
```javascript
// backend/src/config/index.js
export const config = {
  logs: {
    writeDelay: 5 * 60 * 1000  // 👈 修改这里（毫秒）
  }
}
```

### 4. 添加新的日志级别
```javascript
// backend/src/models/Log.js
static isValidLevel(level) {
  const validLevels = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL']  // 👈 添加 CRITICAL
  return validLevels.includes(level)
}
```

### 5. 添加新的 API 端点
```javascript
// backend/src/routes/logRoutes.js
router.get('/export', (req, res) => {
  // 新的导出接口
})
```

### 6. 添加新的 WebSocket 事件
```javascript
// backend/src/websocket/socketHandler.js
socket.on('custom-event', (data) => {
  // 处理自定义事件
})
```

### 7. 禁用日志模拟器
```javascript
// backend/src/config/index.js
export const config = {
  server: {
    env: 'production'  // 👈 设置为 production
  }
}
```
或者
```javascript
// backend/src/index.js
// 注释掉这几行
// if (config.server.env === 'development') {
//   logSimulator = new LogSimulator(logService, persistenceService, io)
//   logSimulator.start()
// }
```

## 📡 API 快速参考

### 日志相关
```bash
# 接收日志
POST /api/logs
Body: { "deviceId": "xxx", "level": "INFO", "message": "xxx" }

# 查询日志
GET /api/logs?level=INFO&deviceId=xxx&keyword=xxx&limit=100

# 清空日志
DELETE /api/logs

# 手动保存
POST /api/logs/save

# 获取状态
GET /api/logs/status
```

### 设备相关
```bash
# 获取设备列表
GET /api/devices

# 获取所有别名
GET /api/devices/aliases

# 设置别名
POST /api/devices/alias
Body: { "deviceId": "xxx", "alias": "xxx" }

# 批量设置
POST /api/devices/aliases/batch
Body: { "aliases": { "device1": "alias1", "device2": "alias2" } }

# 删除别名
DELETE /api/devices/alias/:deviceId
```

## 🔌 WebSocket 事件

### 服务器 → 客户端
```javascript
socket.on('log:new', (log) => {})           // 新日志
socket.on('log:history', (logs) => {})      // 历史日志
socket.on('log:clear', () => {})            // 清空通知
socket.on('device:alias:update', (data) => {})   // 单个别名更新
socket.on('device:aliases:update', (aliases) => {}) // 批量更新
socket.on('device:aliases', (aliases) => {}) // 所有别名
```

## 🗂️ 数据文件

### logs-data.json
```json
[
  {
    "id": "1234567890-abc123",
    "deviceId": "device-001",
    "level": "INFO",
    "message": "系统启动",
    "timestamp": "2023-11-03T12:00:00.000Z"
  }
]
```

### device-aliases.json
```json
{
  "device-001": "服务器1",
  "device-002": "传感器A",
  "device-003": "网关设备"
}
```

## 🧪 测试

### 测试日志接收
```bash
curl -X POST http://localhost:3000/api/logs \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"test-device","level":"INFO","message":"测试消息"}'
```

### 测试日志查询
```bash
curl http://localhost:3000/api/logs?limit=10
```

### 测试设备别名
```bash
curl -X POST http://localhost:3000/api/devices/alias \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"test-device","alias":"测试设备"}'
```

## 🐛 调试技巧

### 1. 查看控制台日志
服务器会输出详细的操作日志，包括：
- 📝 收到日志
- 📱 设置设备别名
- ⏰ 安排写入任务
- 💾 成功写入文件
- 🔗 客户端连接
- ❌ 客户端断开

### 2. 检查文件是否生成
```bash
ls backend/logs-data.json
ls backend/device-aliases.json
```

### 3. 查看进程状态
```powershell
# Windows
netstat -ano | findstr :3000
Get-Process -Name node
```

### 4. 强制保存数据
```bash
curl -X POST http://localhost:3000/api/logs/save
```

### 5. 查看服务状态
```bash
curl http://localhost:3000/health
```

## 📦 依赖关系

```
index.js (入口)
  ├── app.js (Express配置)
  ├── config/index.js (配置)
  ├── services/
  │   ├── LogService
  │   ├── DeviceService
  │   └── PersistenceService
  ├── routes/
  │   ├── logRoutes (依赖 LogService, PersistenceService)
  │   └── deviceRoutes (依赖 DeviceService, PersistenceService)
  ├── websocket/socketHandler
  └── utils/
      ├── LogSimulator
      └── gracefulShutdown
```

## ⚡ 性能优化点

1. **延迟写入** - 5分钟内的修改会合并成一次写入
2. **内存限制** - 最多保存1000条日志，自动删除旧数据
3. **WebSocket** - 实时推送，避免轮询
4. **事件驱动** - 非阻塞 I/O

## 🔒 安全建议

1. 生产环境建议：
   - 禁用日志模拟器
   - 配置 CORS 白名单
   - 添加认证中间件
   - 限制请求频率

2. 数据保护：
   - 定期备份 JSON 文件
   - 设置文件权限
   - 考虑加密敏感信息

## 📚 扩展阅读

- [完整项目结构](PROJECT_STRUCTURE.md)
- [架构设计文档](ARCHITECTURE.md)
- [后端详细说明](backend/README.md)
- [部署指南](DEPLOYMENT.md)
- [使用说明](USAGE.md)

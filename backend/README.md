# LogAdmin 后端服务

## 项目结构

```
backend/
├── src/                      # 源代码目录
│   ├── config/              # 配置文件
│   │   └── index.js         # 应用配置（端口、路径、延迟等）
│   ├── models/              # 数据模型
│   │   └── Log.js           # 日志模型定义
│   ├── services/            # 业务逻辑服务
│   │   ├── LogService.js    # 日志管理服务
│   │   ├── DeviceService.js # 设备管理服务
│   │   └── PersistenceService.js # 持久化服务
│   ├── routes/              # 路由模块
│   │   ├── logRoutes.js     # 日志相关路由
│   │   └── deviceRoutes.js  # 设备相关路由
│   ├── websocket/           # WebSocket 模块
│   │   └── socketHandler.js # Socket 连接处理
│   ├── utils/               # 工具函数
│   │   ├── logSimulator.js  # 日志模拟器（测试用）
│   │   └── gracefulShutdown.js # 优雅关闭
│   ├── app.js               # Express 应用配置
│   └── index.js             # 应用入口文件
├── public/                   # 前端打包文件
├── logs-data.json           # 日志持久化文件
├── device-aliases.json      # 设备别名持久化文件
├── server.js                # 旧版本服务器（保留）
└── package.json             # 项目配置

```

## 模块说明

### 1. 配置模块 (`config/`)
- **index.js**: 统一管理所有配置参数
  - 服务器端口和环境
  - 日志数量限制和写入延迟
  - 文件路径配置
  - CORS 和 WebSocket 配置

### 2. 数据模型 (`models/`)
- **Log.js**: 日志数据模型
  - 定义日志的数据结构
  - 提供数据验证方法
  - 自动生成 ID 和时间戳

### 3. 业务服务 (`services/`)
- **LogService.js**: 日志管理服务
  - 添加、查询、删除日志
  - 维护内存中的日志列表
  - 提供日志过滤和限制功能

- **DeviceService.js**: 设备管理服务
  - 管理设备别名
  - 提供批量操作接口
  - 维护设备列表

- **PersistenceService.js**: 持久化服务
  - 文件读写操作
  - 延迟写入（防抖）机制
  - 优雅关闭时保存数据

### 4. 路由模块 (`routes/`)
- **logRoutes.js**: 日志相关 API
  - `POST /api/logs` - 接收日志
  - `GET /api/logs` - 查询日志
  - `DELETE /api/logs` - 清空日志
  - `POST /api/logs/save` - 手动保存
  - `GET /api/logs/status` - 获取状态

- **deviceRoutes.js**: 设备相关 API
  - `GET /api/devices` - 获取设备列表
  - `GET /api/devices/aliases` - 获取所有别名
  - `POST /api/devices/alias` - 设置别名
  - `POST /api/devices/aliases/batch` - 批量设置
  - `DELETE /api/devices/alias/:deviceId` - 删除别名

### 5. WebSocket 模块 (`websocket/`)
- **socketHandler.js**: WebSocket 连接处理
  - 客户端连接管理
  - 实时日志推送
  - 设备别名同步

### 6. 工具模块 (`utils/`)
- **logSimulator.js**: 日志模拟器
  - 开发环境自动生成测试日志
  - 可配置生成频率和内容

- **gracefulShutdown.js**: 优雅关闭
  - 监听退出信号
  - 保存未写入的数据
  - 清理资源

### 7. 应用入口 (`app.js` & `index.js`)
- **app.js**: Express 应用配置
  - 中间件设置
  - 静态文件服务
  - 健康检查接口

- **index.js**: 应用启动入口
  - 初始化所有服务
  - 组装路由和中间件
  - 启动 HTTP 和 WebSocket 服务器

## 运行方式

### 使用新架构（推荐）
```bash
# 开发模式（带热重载）
npm run dev

# 生产模式
npm start
```

### 使用旧版本（保留）
```bash
# 开发模式
npm run dev:old

# 生产模式
npm run start:old
```

## 数据持久化

- **日志数据**: `logs-data.json`
- **设备别名**: `device-aliases.json`
- **写入策略**: 延迟5分钟写入（防抖），优雅关闭时立即保存

## 环境变量

```bash
PORT=3000              # 服务器端口
NODE_ENV=development   # 运行环境 (development/production)
```

## API 文档

详见各路由模块的注释，或访问 `/health` 查看服务状态。

## 特性

✅ 模块化架构，职责清晰  
✅ 服务层分离，易于测试  
✅ 配置集中管理  
✅ 优雅关闭，数据安全  
✅ 延迟写入，性能优化  
✅ WebSocket 实时推送  
✅ 开发环境日志模拟  

## 升级说明

新架构完全兼容旧版 API，可以无缝迁移。旧版 `server.js` 保留，可通过 `npm run start:old` 运行。

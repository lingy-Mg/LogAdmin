# LogAdmin 项目架构说明

## 项目概述

LogAdmin 是一个分布式日志管理系统，支持多设备日志收集、实时展示和持久化存储。

## 技术栈

### 后端
- **Node.js** + **Express**: HTTP 服务器
- **Socket.IO**: WebSocket 实时通信
- **ES Module**: 现代化模块系统

### 前端
- **Vue 3**: UI 框架
- **Vite**: 构建工具

## 架构设计

### 1. 分层架构

```
┌─────────────────────────────────────────┐
│           Frontend (Vue 3)              │
│  - 日志展示界面                          │
│  - 实时更新                              │
│  - 设备管理                              │
└─────────────┬───────────────────────────┘
              │ HTTP + WebSocket
┌─────────────▼───────────────────────────┐
│         HTTP Server (Express)           │
│  - RESTful API                          │
│  - 静态文件服务                          │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│           Routes Layer                  │
│  - logRoutes.js                         │
│  - deviceRoutes.js                      │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│         Services Layer                  │
│  - LogService (日志管理)                │
│  - DeviceService (设备管理)             │
│  - PersistenceService (持久化)          │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│          Models Layer                   │
│  - Log (日志模型)                        │
└─────────────────────────────────────────┘
```

### 2. 模块职责

#### Config Layer (配置层)
- 统一管理所有配置参数
- 避免硬编码
- 便于环境切换

#### Models Layer (模型层)
- 定义数据结构
- 数据验证
- 业务规则

#### Services Layer (服务层)
- 核心业务逻辑
- 数据操作
- 状态管理

**LogService**: 
- 维护内存日志列表
- 日志增删查改
- 日志过滤和限制

**DeviceService**:
- 设备别名管理
- 设备列表维护
- 批量操作

**PersistenceService**:
- 文件读写
- 延迟写入（防抖）
- 数据持久化

#### Routes Layer (路由层)
- HTTP 接口定义
- 请求处理
- 响应格式化

#### WebSocket Layer (实时通信层)
- 客户端连接管理
- 实时数据推送
- 双向通信

#### Utils Layer (工具层)
- 辅助功能
- 公共方法
- 测试工具

### 3. 数据流

#### 日志接收流程
```
外部设备 → POST /api/logs → logRoutes 
  → LogService.addLog() 
  → WebSocket 推送 
  → PersistenceService.scheduleWrite()
```

#### 日志查询流程
```
前端 → GET /api/logs?filters → logRoutes 
  → LogService.queryLogs() 
  → 返回过滤后的日志
```

#### 设备别名流程
```
前端 → POST /api/devices/alias → deviceRoutes 
  → DeviceService.setAlias() 
  → WebSocket 通知所有客户端 
  → PersistenceService.scheduleWrite()
```

### 4. 持久化策略

#### 延迟写入（防抖）
- 每次数据变更不立即写文件
- 设置5分钟延迟
- 如有新变更，重置定时器
- 减少磁盘 I/O，提升性能

#### 优雅关闭
- 监听 SIGINT/SIGTERM 信号
- 立即写入所有未保存数据
- 清理资源和定时器
- 确保数据不丢失

### 5. WebSocket 实时通信

#### 事件类型
- `log:new` - 新日志推送
- `log:history` - 历史日志
- `log:clear` - 清空日志
- `device:alias:update` - 单个别名更新
- `device:aliases:update` - 批量别名更新
- `device:aliases` - 所有别名

## 目录结构

```
LogAdmin/
├── backend/                 # 后端服务
│   ├── src/                 # 源代码
│   │   ├── config/         # 配置
│   │   ├── models/         # 模型
│   │   ├── services/       # 服务
│   │   ├── routes/         # 路由
│   │   ├── websocket/      # WebSocket
│   │   ├── utils/          # 工具
│   │   ├── app.js          # Express 应用
│   │   └── index.js        # 入口文件
│   ├── public/             # 前端构建产物
│   ├── server.js           # 旧版服务器（保留）
│   └── package.json
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── App.vue         # 主组件
│   │   └── main.js         # 入口文件
│   ├── index.html
│   └── package.json
├── scripts/                # 构建脚本
├── prompts/                # 开发提示词
└── README.md
```

## 设计原则

### 1. 单一职责原则 (SRP)
每个模块只负责一个功能领域

### 2. 依赖注入 (DI)
通过参数传递依赖，便于测试和替换

### 3. 关注点分离 (SoC)
路由、业务逻辑、数据持久化分离

### 4. 开闭原则 (OCP)
对扩展开放，对修改关闭

### 5. 接口隔离 (ISP)
提供清晰的接口，避免冗余

## 优势

1. **可维护性**: 模块化设计，易于定位和修改
2. **可测试性**: 服务层独立，便于单元测试
3. **可扩展性**: 新增功能只需添加新模块
4. **可读性**: 结构清晰，代码组织合理
5. **性能**: 延迟写入，减少 I/O 操作
6. **可靠性**: 优雅关闭，数据不丢失

## 后续优化方向

- [ ] 添加日志级别过滤
- [ ] 支持日志导出（CSV/JSON）
- [ ] 添加用户认证和授权
- [ ] 支持日志归档和自动清理
- [ ] 添加日志统计和分析
- [ ] 支持多种持久化方式（数据库）
- [ ] 添加性能监控和告警
- [ ] 单元测试和集成测试

<div align="center">

# 📝 LogAdmin

<p align="center">
  <strong>现代化的实时日志管理平台</strong>
</p>

<p align="center">
  优雅 · 高效 · 实时 · 开箱即用
</p>

<p align="center">
  <a href="#✨-核心特性">特性</a> •
  <a href="#🚀-快速开始">快速开始</a> •
  <a href="#📖-文档">文档</a> •
  <a href="#🎯-使用场景">使用场景</a> •
  <a href="#🤝-参与贡献">贡献</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.x-brightgreen" alt="Vue 3">
  <img src="https://img.shields.io/badge/Node.js-18+-green" alt="Node.js">
  <img src="https://img.shields.io/badge/License-MIT-blue" alt="License">
  <img src="https://img.shields.io/badge/PRs-welcome-orange" alt="PRs Welcome">
</p>

</div>

---

## 🎬 项目简介

**LogAdmin** 是一个基于 Vue 3 + Node.js 构建的**现代化实时日志管理系统**，专为开发者和运维人员打造。

🎯 **解决什么问题？**
- ❌ 传统日志查看繁琐，需要 SSH 登录服务器
- ❌ 多设备日志分散，难以统一管理
- ❌ 日志实时性差，无法及时发现问题
- ❌ 缺少可视化界面，体验不佳

✅ **LogAdmin 的解决方案**
- ⚡ **WebSocket 实时推送** - 毫秒级日志更新，零延迟
- 🎨 **精美终端界面** - 深色主题，专业开发者体验
- 🔍 **智能搜索过滤** - 多维度筛选，快速定位问题
- � **设备统一管理** - 多设备日志集中展示
- 💾 **智能持久化** - 防抖写入，性能优化

## ✨ 核心特性

### � 实时性能

- **WebSocket 长连接** - 日志推送延迟 < 10ms
- **自动滚动模式** - 新日志自动定位，支持一键暂停
- **批量日志支持** - 单条/数组批量接收，高并发场景友好

### 🎨 用户体验

- **🌙 深色终端主题** - 专业开发者风格界面
- **🎯 智能高亮** - 关键词黄色高亮，一眼定位
- **⚡ 快捷键支持** - ESC 快速清空，效率翻倍
- **📊 实时统计面板** - INFO/WARN/ERROR 数量实时更新
- **💡 智能展开** - 长日志自动折叠，点击展开

### 🔧 开发友好

- **📡 RESTful API** - 标准化接口设计
- **� 多种接入方式** - HTTP/WebSocket 双通道
- **📦 开箱即用** - 零配置启动，5分钟上手
- **🛠️ 完整文档** - 架构设计 + API 参考 + 使用教程

### 🏗️ 架构设计

- **🧩 模块化架构** - 清晰的分层设计，易扩展
- **💾 智能持久化** - 5分钟防抖写入，避免频繁 IO
- **🔄 优雅关闭** - 进程退出时自动保存数据
- **🎯 错误处理** - 完善的异常捕获机制

## 🛠️ 技术栈

<table>
  <tr>
    <th>前端</th>
    <th>后端</th>
    <th>工具链</th>
  </tr>
  <tr>
    <td>
      • Vue 3 (Composition API)<br>
      • Vite 5<br>
      • Element Plus<br>
      • Socket.IO Client<br>
      • Day.js
    </td>
    <td>
      • Node.js 18+<br>
      • Express 4<br>
      • Socket.IO 4<br>
      • ES Modules<br>
      • File System
    </td>
    <td>
      • pnpm (包管理)<br>
      • ESLint (代码检查)<br>
      • Git (版本控制)<br>
      • 自动化部署脚本
    </td>
  </tr>
</table>

## 🚀 快速开始

### 📋 前置要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0 (或 npm >= 9.0.0)

### ⚡ 一键启动

```bash
# 克隆项目
git clone https://github.com/lingy-Mg/LogAdmin.git
cd LogAdmin

# 安装依赖
pnpm install:all

# 启动后端 (端口 3000)
pnpm dev:backend

# 启动前端 (端口 5173)
pnpm dev:frontend
```

### 🌐 访问应用

打开浏览器访问：**http://localhost:5173**

### 📤 发送测试日志

```bash
# 单条日志
curl -X POST http://localhost:3000/api/logs \
  -H "Content-Type: application/json" \
  -d '{
    "level": "info",
    "message": "应用启动成功 🚀",
    "deviceId": "server-01"
  }'

# 批量日志
curl -X POST http://localhost:3000/api/logs \
  -H "Content-Type: application/json" \
  -d '[
    {"level": "info", "message": "用户登录", "deviceId": "app-01"},
    {"level": "warn", "message": "内存使用率 85%", "deviceId": "app-01"},
    {"level": "error", "message": "连接超时", "deviceId": "app-02"}
  ]'
```

## 🎯 使用场景

<table>
  <tr>
    <td align="center" width="25%">
      <h3>🖥️ 后端开发</h3>
      <p>实时监控服务日志<br>快速定位系统异常</p>
    </td>
    <td align="center" width="25%">
      <h3>📱 移动应用</h3>
      <p>收集设备崩溃日志<br>追踪用户行为轨迹</p>
    </td>
    <td align="center" width="25%">
      <h3>🎮 游戏开发</h3>
      <p>Unity/Unreal 日志<br>实时调试游戏逻辑</p>
    </td>
    <td align="center" width="25%">
      <h3>🔬 IoT 设备</h3>
      <p>多设备集中管理<br>状态监控和告警</p>
    </td>
  </tr>
</table>

## 📖 文档

### 📚 完整文档

| 文档 | 描述 |
|------|------|
| 📖 [架构设计](ARCHITECTURE.md) | 系统架构和设计原则 |
| 📁 [项目结构](PROJECT_STRUCTURE.md) | 目录结构和模块说明 |
| ⚡ [快速参考](QUICK_REFERENCE.md) | API 速查和常见任务 |
| 🔧 [后端开发](backend/README.md) | 后端模块详细文档 |
| 🎨 [前端开发](frontend/ARCHITECTURE.md) | 前端架构和组件 |

### � API 接口

#### 日志管理

```javascript
POST   /api/logs          // 接收日志 (支持单条/数组)
GET    /api/logs          // 查询日志列表
DELETE /api/logs          // 清空所有日志
POST   /api/logs/save     // 手动保存日志
GET    /api/logs/status   // 获取保存状态
```

#### 设备管理

```javascript
GET    /api/devices                    // 获取设备列表
GET    /api/devices/aliases            // 获取设备别名
POST   /api/devices/alias              // 设置设备别名
POST   /api/devices/aliases/batch      // 批量设置别名
DELETE /api/devices/alias/:deviceId    // 删除设备别名
```

### � 日志格式

```typescript
interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';  // 日志级别
  message: string;                              // 日志内容 (支持换行符)
  deviceId: string;                             // 设备标识
  timestamp?: string;                           // 时间戳 (可选,服务器会自动添加)
  extra?: Record<string, any>;                  // 扩展字段 (可选)
}
```

## 🎨 界面预览

### 主界面

- 🎨 **深色终端主题** - 专业开发者体验
- 📊 **实时统计面板** - 各级别日志数量
- 🔍 **多维度筛选** - 设备/级别/关键词
- ⚡ **自动滚动模式** - 实时跟踪最新日志

### 日志详情

- 📋 **完整信息展示** - 时间/级别/设备/内容
- 🔤 **换行符支持** - 多行日志完美显示
- 📦 **扩展字段** - 自定义字段展示
- 📄 **JSON 原始数据** - 开发调试友好

### 设备管理

- 📱 **设备列表** - 自动发现所有设备
- ✏️ **别名管理** - 为设备设置友好名称
- 💾 **即时保存** - 修改后立即持久化

## ⚙️ 配置说明

### 环境变量

```bash
# 后端配置
PORT=3000                    # 服务端口
NODE_ENV=production          # 运行环境

# 前端配置 (可选)
VITE_API_URL=http://localhost:3000    # 后端地址
VITE_WS_URL=http://localhost:3000     # WebSocket 地址
```

### 自定义配置

```javascript
// backend/src/config/index.js
export const config = {
  server: {
    port: 3000,
    env: process.env.NODE_ENV || 'development'
  },
  logs: {
    maxLogs: 1000,              // 最大日志条数
    writeDelay: 5 * 60 * 1000   // 持久化延迟 (5分钟)
  }
}
```

## � 最佳实践

### 1️⃣ 日志级别使用建议

- **DEBUG** 🔵 - 详细调试信息，生产环境可关闭
- **INFO** 🟢 - 正常运行信息，如启动/停止/配置加载
- **WARN** 🟠 - 警告信息，需要关注但不影响运行
- **ERROR** 🔴 - 错误信息，需要立即处理

### 2️⃣ 设备命名规范

```javascript
// 推荐格式: 类型-环境-编号
deviceId: "server-prod-01"    // 生产服务器1
deviceId: "app-dev-ios"       // iOS 开发应用
deviceId: "iot-sensor-001"    // IoT 传感器001
```

### 3️⃣ 批量日志优化

```javascript
// ✅ 推荐: 批量发送
const logs = collectLogs();  // 收集100条日志
await sendBatch(logs);       // 一次性发送

// ❌ 避免: 频繁单条发送
for (const log of logs) {
  await sendSingle(log);     // 100次请求
}
```

## 🚢 生产部署

### Docker 部署

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install --production
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

```bash
# 构建镜像
docker build -t logadmin .

# 运行容器
docker run -d -p 3000:3000 \
  -v $(pwd)/logs-data.json:/app/backend/logs-data.json \
  -v $(pwd)/device-aliases.json:/app/backend/device-aliases.json \
  logadmin
```

### 自动化部署

```bash
# 构建前端
pnpm build

# 部署到服务器
pnpm deploy
```

## 🤝 参与贡献

欢迎所有形式的贡献！

### 贡献方式

- � [报告 Bug](https://github.com/lingy-Mg/LogAdmin/issues/new?template=bug_report.md)
- 💡 [提出新特性](https://github.com/lingy-Mg/LogAdmin/issues/new?template=feature_request.md)
- 📖 改进文档
- � 提交 Pull Request

### 开发指南

```bash
# Fork 项目
git clone https://github.com/YOUR_USERNAME/LogAdmin.git

# 创建分支
git checkout -b feature/amazing-feature

# 提交更改
git commit -m 'Add: 新增某某功能'

# 推送到分支
git push origin feature/amazing-feature

# 创建 Pull Request
```

### 代码规范

- 遵循 ESLint 规则
- 保持代码风格一致
- 添加必要的注释
- 编写单元测试

## 📊 项目统计

- ⭐ **Star 支持** - 如果觉得有用，请给个 Star！
- 🍴 **Fork 改进** - 欢迎 Fork 并提交改进
- 📝 **Issue 反馈** - 发现问题请及时反馈

## 📄 开源协议

本项目采用 [MIT](LICENSE) 协议开源。

```
MIT License

Copyright (c) 2025 LogAdmin Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files...
```

## 🙏 致谢

感谢以下开源项目：

- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Element Plus](https://element-plus.org/) - Vue 3 组件库
- [Socket.IO](https://socket.io/) - 实时通信引擎
- [Express](https://expressjs.com/) - Node.js Web 框架

## � 联系方式

- 📧 Email: [在此添加邮箱]
- 💬 Issue: [提交问题](https://github.com/lingy-Mg/LogAdmin/issues)
- 🌟 Star: [给个 Star](https://github.com/lingy-Mg/LogAdmin)

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请点个 Star 支持一下！⭐**

Made with ❤️ by [LogAdmin Contributors](https://github.com/lingy-Mg/LogAdmin/graphs/contributors)

</div>

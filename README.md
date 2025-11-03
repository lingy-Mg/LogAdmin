# LogAdmin - 实时日志管理系统

一个基于 Vue 3 + Node.js 的实时日志管理系统，支持 WebSocket 实时推送、设备管理、日志过滤等功能。

## ✨ 核心特性

- 🔄 **实时日志推送** - 通过 WebSocket 实现零延迟的日志流
- 🎨 **精美界面** - 深色主题，终端风格显示
- 🏷️ **设备管理** - 支持为设备设置别名，方便识别
- 🔍 **强大过滤** - 按设备、级别、关键词过滤日志
- 💾 **智能持久化** - 5分钟防抖写入，避免频繁IO
- 📊 **实时统计** - 各级别日志数量统计
- 🎯 **关键词高亮** - 搜索词黄色高亮显示

## 🛠️ 技术栈

### 前端
- Vue 3 (Composition API)
- Vite
- Element Plus
- Socket.IO Client
- Day.js

### 后端
- Node.js
- Express
- Socket.IO
- 文件系统持久化

## 📦 项目结构

```
LogAdmin/
├── backend/                      # 后端服务（已模块化重构 ✨）
│   ├── src/                      # 源代码目录
│   │   ├── config/              # 配置模块
│   │   ├── models/              # 数据模型
│   │   ├── services/            # 业务服务层
│   │   ├── routes/              # 路由模块
│   │   ├── websocket/           # WebSocket 模块
│   │   ├── utils/               # 工具函数
│   │   ├── app.js               # Express 应用配置
│   │   └── index.js             # 应用入口
│   ├── server.js                # 旧版服务器（保留）
│   ├── public/                  # 前端构建产物
│   ├── package.json
│   ├── logs-data.json           # 日志数据（运行时生成）
│   └── device-aliases.json      # 设备别名（运行时生成）
├── frontend/                     # 前端应用
│   ├── src/
│   │   ├── App.vue              # 主应用组件
│   │   └── main.js              # 入口文件
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── scripts/                      # 构建脚本
├── prompts/                      # 开发提示词
├── ARCHITECTURE.md               # 架构设计文档 📚
├── PROJECT_STRUCTURE.md          # 项目结构详解 📚
├── QUICK_REFERENCE.md            # 快速参考指南 📚
└── README.md
```

> 💡 **新架构说明**: 后端代码已完成模块化重构，采用分层架构设计。详见 [架构文档](ARCHITECTURE.md)

## 🚀 快速开始

### 1. 安装依赖

**后端：**
```bash
cd backend
npm install
```

**前端：**
```bash
cd frontend
npm install
```

### 2. 启动服务

**后端（端口 3000）：**
```bash
cd backend
npm start
```

**前端（端口 5173）：**
```bash
cd frontend
npm run dev
```

### 3. 访问应用

打开浏览器访问：http://localhost:5173

## 📝 API 接口

### 日志管理

- `POST /api/logs` - 接收新日志
- `GET /api/logs` - 查询日志列表
- `DELETE /api/logs` - 清空所有日志
- `POST /api/logs/save` - 手动保存日志到文件
- `GET /api/logs/status` - 获取保存状态

### 设备管理

- `GET /api/devices` - 获取设备列表
- `GET /api/devices/aliases` - 获取所有设备别名
- `POST /api/devices/alias` - 设置设备别名
- `POST /api/devices/aliases/batch` - 批量设置设备别名
- `DELETE /api/devices/alias/:deviceId` - 删除设备别名

## 📤 发送日志示例

### cURL
```bash
curl -X POST http://localhost:3000/api/logs \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "device-001",
    "level": "INFO",
    "message": "系统启动成功"
  }'
```

### PowerShell
```powershell
$body = @{
    deviceId = "device-001"
    level = "ERROR"
    message = "连接超时"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/logs" -Method POST -Body $body -ContentType "application/json"
```

### JavaScript
```javascript
fetch('http://localhost:3000/api/logs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    deviceId: 'device-001',
    level: 'WARN',
    message: '内存使用率: 85%'
  })
})
```

## 🎨 日志级别

系统支持以下日志级别，每个级别有不同的颜色标识：

- **DEBUG** 🔵 - 灰色 (#888888)
- **INFO** 🟢 - 青绿色 (#4EC9B0)
- **WARN** 🟠 - 橙色 (#FFA500)
- **ERROR** 🔴 - 红色 (#F44747)

## 💾 数据持久化

- **延迟写入机制**：数据变动后5分钟才写入硬盘
- **防抖处理**：5分钟内多次变动只写入一次
- **优雅关闭**：服务器关闭时自动保存所有数据
- **自动加载**：启动时自动加载历史数据

## 🔧 配置

### 修改延迟写入时间

在 `backend/server.js` 中修改：
```javascript
const WRITE_DELAY = 5 * 60 * 1000 // 5分钟（毫秒）
```

### 修改日志保留数量

在 `backend/src/config/index.js` 中修改：
```javascript
export const config = {
  logs: {
    maxLogs: 1000 // 最多保留1000条
  }
}
```

## 📚 文档导航

- 📖 **[架构设计文档](ARCHITECTURE.md)** - 了解系统架构和设计原则
- 📁 **[项目结构详解](PROJECT_STRUCTURE.md)** - 完整的目录结构和模块说明
- ⚡ **[快速参考指南](QUICK_REFERENCE.md)** - 常见任务和 API 速查
- 🔧 **[后端开发文档](backend/README.md)** - 后端模块详细说明
- 📦 **[部署指南](DEPLOYMENT.md)** - 生产环境部署步骤
- 📝 **[使用说明](USAGE.md)** - 功能使用教程

## 📱 设备管理

1. 点击顶部的 **📱 设备管理** 按钮
2. 在弹出的对话框中为设备设置别名
3. 输入别名后点击**保存**或按回车键
4. 日志中的设备ID会自动显示为别名

## 🔍 日志过滤

- **设备过滤**：支持按设备ID或别名搜索（可输入可下拉）
- **级别过滤**：选择特定日志级别
- **关键词搜索**：在消息中搜索关键词，自动高亮

## ⚡ 特色功能

- **自动滚动**：新日志自动滚动到底部，可暂停
- **实时统计**：顶部显示各级别日志数量
- **WebSocket连接状态**：实时显示连接状态
- **自动模拟日志**：开发模式下每3秒生成测试日志

## 📄 许可证

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题或建议，请提交 Issue。

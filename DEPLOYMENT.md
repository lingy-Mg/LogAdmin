# LogAdmin 打包和部署指南

## 📦 打包流程

### 方式一：使用一键脚本（推荐）

**Windows:**
```bash
# 双击运行
build.bat

# 或在命令行运行
.\build.bat
```

### 方式二：手动打包

```bash
# 1. 清理旧文件
npm run clean

# 2. 构建前端
npm run build:frontend

# 3. 复制到后端
npm run copy:dist
```

### 方式三：使用npm命令

```bash
# 一键完成所有步骤
npm run build
```

## 🚀 启动应用

### 开发模式

需要分别启动后端和前端：

```bash
# 终端1 - 后端 (端口 3000)
npm run dev:backend

# 终端2 - 前端 (端口 5173)
npm run dev:frontend
```

访问：http://localhost:5173

### 生产模式

打包后只需要启动后端：

**使用脚本:**
```bash
.\start.bat
```

**或手动启动:**
```bash
cd backend
npm start
```

访问：http://localhost:3000

## 📁 目录结构

```
LogAdmin/
├── backend/
│   ├── public/              # 前端构建产物（自动生成）
│   │   ├── index.html
│   │   └── assets/
│   ├── server.js
│   ├── logs-data.json       # 日志数据（运行时生成）
│   └── device-aliases.json  # 设备别名（运行时生成）
├── frontend/
│   ├── dist/                # 前端构建产物（自动生成）
│   └── src/
├── scripts/
│   ├── copy-dist.js         # 复制构建文件脚本
│   └── clean.js             # 清理脚本
├── build.bat                # 一键打包脚本
└── start.bat                # 快速启动脚本
```

## 🔧 打包步骤详解

### 1. 清理（Clean）
删除旧的构建文件：
- `frontend/dist/`
- `backend/public/`

### 2. 构建前端（Build Frontend）
运行 `vite build` 命令，生成优化后的前端文件到 `frontend/dist/`

### 3. 复制文件（Copy Dist）
将 `frontend/dist/` 的所有文件复制到 `backend/public/`

### 4. 启动服务（Start）
启动后端服务器，自动服务静态文件

## 🌐 生产环境配置

### API地址配置

生产模式下，前端会自动使用相对路径访问后端API：
- WebSocket: `http://localhost:3000`
- API: `http://localhost:3000/api/*`

如果需要修改，编辑 `frontend/src/App.vue`:

```javascript
// 开发环境
const socket = io('http://localhost:3000')

// 生产环境
const socket = io() // 使用当前域名
```

### 端口配置

修改 `backend/server.js`:

```javascript
const PORT = process.env.PORT || 3000
```

然后可以通过环境变量设置：
```bash
set PORT=8080
npm start
```

## 📤 部署到服务器

### 1. 本地打包
```bash
npm run build
```

### 2. 上传文件
只需要上传 `backend/` 目录到服务器：
```
backend/
├── public/          # 包含前端文件
├── server.js
├── package.json
└── node_modules/    # 需要在服务器上运行 npm install
```

### 3. 服务器上安装依赖
```bash
cd backend
npm install
```

### 4. 启动服务
```bash
npm start
```

或使用 PM2：
```bash
npm install -g pm2
pm2 start server.js --name logadmin
pm2 save
pm2 startup
```

## 🔒 生产环境建议

### 1. 关闭模拟日志

编辑 `backend/server.js`，注释掉模拟日志部分：

```javascript
// 注释这部分代码
/*
setInterval(() => {
  // ... 模拟日志生成
}, 3000)
*/
```

### 2. 配置环境变量

创建 `.env` 文件：
```env
NODE_ENV=production
PORT=3000
MAX_LOGS=10000
WRITE_DELAY=300000
```

### 3. 使用进程管理器

使用 PM2 或其他进程管理工具：
```bash
pm2 start server.js -i max --name logadmin
```

### 4. 配置反向代理

使用 Nginx 配置反向代理：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
}
```

## 🧪 验证部署

访问 `http://your-server:3000` 应该能看到：
- ✅ 前端界面正常加载
- ✅ WebSocket 连接成功
- ✅ 可以查看日志
- ✅ 设备管理功能正常

访问 `http://your-server:3000/health` 检查服务状态：
```json
{
  "status": "ok",
  "uptime": 1234.56,
  "logsCount": 100,
  "devicesCount": 5
}
```

## 📊 性能优化

### 1. 启用Gzip压缩

安装依赖：
```bash
npm install compression
```

修改 `server.js`:
```javascript
const compression = require('compression')
app.use(compression())
```

### 2. 设置缓存策略

```javascript
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',
  etag: true
}))
```

### 3. 日志文件轮转

避免 `logs-data.json` 文件过大，定期归档旧日志。

## 🔍 故障排查

### 前端页面空白
- 检查 `backend/public/index.html` 是否存在
- 检查浏览器控制台错误
- 确认API路径是否正确

### WebSocket连接失败
- 检查后端服务是否启动
- 检查防火墙是否允许端口
- 查看浏览器控制台WebSocket错误

### 日志不显示
- 检查 `/api/logs` 接口是否返回数据
- 查看后端控制台日志
- 确认WebSocket连接状态

## 📝 更新部署

```bash
# 1. 拉取最新代码
git pull

# 2. 重新安装依赖（如有package.json变化）
npm run install:all

# 3. 重新打包
npm run build

# 4. 重启服务
pm2 restart logadmin
# 或
npm start
```

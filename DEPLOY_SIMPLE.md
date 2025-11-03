# 🚀 简单部署指南（无需 PM2）

## 什么是 PM2？

PM2 是一个 Node.js 进程管理器，可以：
- 保持应用持续运行
- 自动重启崩溃的应用
- 提供日志管理
- 支持集群模式

**本项目采用更简单的方式**，直接使用 `nohup` 命令在后台运行 Node.js，无需安装 PM2。

## 📋 快速开始

### 1️⃣ 检查部署环境
```bash
npm run deploy:check
```

### 2️⃣ 执行部署
```bash
npm run deploy
```
或双击 `deploy.bat`

### 3️⃣ 访问应用
```
http://aliyun.18638642193.cn
```

## 🎮 服务器管理命令

### 查看应用状态
```bash
npm run server status
```

### 查看日志
```bash
# 查看最近日志
npm run server logs

# 实时查看日志（按 Ctrl+C 退出）
npm run server logs:live
```

### 启动/停止/重启应用
```bash
# 启动
npm run server start

# 停止
npm run server stop

# 重启
npm run server restart
```

### 直接连接到服务器
```bash
npm run server ssh
```

## 📁 服务器文件结构

部署后的目录结构：
```
/root/www/admin_log/
├── backend/
│   ├── src/
│   ├── package.json
│   └── node_modules/
├── server.log          # 应用日志文件
└── package.json
```

## 🔍 常见操作

### 查看应用是否运行
```bash
npm run server status
```

### 查看错误日志
```bash
npm run server logs
```

### 手动操作（SSH 到服务器）
```bash
# 连接到服务器
npm run server ssh

# 然后在服务器上：
cd /root/www/admin_log

# 查看日志
tail -f server.log

# 查看进程
ps aux | grep node

# 停止应用
pkill -f "node.*src/index.js"

# 启动应用
cd backend
nohup node src/index.js > ../server.log 2>&1 &
```

## 🔄 更新部署

每次更新代码后，重新部署：
```bash
npm run deploy
```

部署脚本会自动：
1. 构建前端
2. 打包文件
3. 上传到服务器
4. 停止旧进程
5. 安装依赖
6. 启动新进程

## ⚠️ 注意事项

### 应用会在以下情况停止：
- ❌ 代码崩溃
- ❌ 服务器重启
- ❌ 手动停止

### 如何让应用自动重启？

#### 方法 1: 使用 systemd（推荐）
创建系统服务，开机自启：

```bash
# 在服务器上创建服务文件
sudo nano /etc/systemd/system/logadmin.service
```

内容：
```ini
[Unit]
Description=LogAdmin Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/www/admin_log/backend
ExecStart=/usr/bin/node src/index.js
Restart=always
RestartSec=10
StandardOutput=append:/root/www/admin_log/server.log
StandardError=append:/root/www/admin_log/server.log

[Install]
WantedBy=multi-user.target
```

启用服务：
```bash
sudo systemctl daemon-reload
sudo systemctl enable logadmin
sudo systemctl start logadmin
```

管理命令：
```bash
# 查看状态
sudo systemctl status logadmin

# 启动
sudo systemctl start logadmin

# 停止
sudo systemctl stop logadmin

# 重启
sudo systemctl restart logadmin

# 查看日志
sudo journalctl -u logadmin -f
```

#### 方法 2: 使用 crontab 定时检查
```bash
# 编辑定时任务
crontab -e

# 添加以下行（每分钟检查一次）
* * * * * pgrep -f "node.*src/index.js" > /dev/null || (cd /root/www/admin_log/backend && nohup node src/index.js > ../server.log 2>&1 &)
```

#### 方法 3: 安装 PM2（最简单）
```bash
# 安装 PM2
npm install -g pm2

# 启动应用
cd /root/www/admin_log/backend
pm2 start src/index.js --name logadmin

# 设置开机自启
pm2 startup
pm2 save

# 管理命令
pm2 status
pm2 logs logadmin
pm2 restart logadmin
```

## 🆚 对比：简单模式 vs PM2

### 简单模式（当前）
✅ 优点：
- 无需额外安装
- 配置简单
- 适合小型应用

❌ 缺点：
- 崩溃后不会自动重启
- 服务器重启后需要手动启动
- 日志管理较简单

### PM2 模式
✅ 优点：
- 自动重启崩溃的应用
- 开机自动启动
- 强大的日志管理
- 支持多进程集群
- 实时监控

❌ 缺点：
- 需要额外安装
- 学习成本稍高

## 💡 建议

- **开发/测试环境**：使用简单模式即可
- **生产环境**：建议使用 systemd 或 PM2

## 📞 获取帮助

查看所有可用命令：
```bash
npm run server
```

查看部署详细文档：
```bash
# 查看 DEPLOY.md
```

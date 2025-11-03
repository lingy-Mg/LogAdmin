# 🐳 Docker 容器部署指南

## 📋 部署方式

本项目使用 **Docker 容器** 运行应用，部署时会：
1. 构建前端代码
2. 打包并上传到服务器
3. 更新容器内的文件
4. 重启 Docker 容器

## 🚀 快速开始

### 1️⃣ 检查部署环境
```bash
npm run deploy:check
```

### 2️⃣ 执行部署
```bash
npm run deploy
```
或双击 `deploy.bat`

部署完成后，容器 `admin_log` 会自动重启。

### 3️⃣ 访问应用
```
http://aliyun.18638642193.cn
```

## 🎮 Docker 容器管理命令

### 查看容器状态
```bash
npm run server status
```
显示容器运行状态、启动时间、端口映射等信息。

### 查看容器日志
```bash
# 查看最近 50 行日志
npm run server logs

# 实时查看日志（按 Ctrl+C 退出）
npm run server logs:live
```

### 启动/停止/重启容器
```bash
# 启动容器
npm run server start

# 停止容器
npm run server stop

# 重启容器
npm run server restart
```

### 进入容器终端
```bash
npm run server exec
```
进入容器后可以执行：
```bash
# 查看文件
ls -la

# 查看进程
ps aux

# 退出容器
exit
```

### 连接到服务器
```bash
npm run server ssh
```

## 📁 文件结构

### 本地项目结构
```
LogAdmin/
├── backend/           # 后端代码
├── frontend/          # 前端代码
├── scripts/
│   ├── deploy-simple.js   # 部署脚本
│   └── server.js          # 容器管理脚本
├── deploy.config.json     # 部署配置
└── deploy.bat            # Windows 快捷部署
```

### 服务器文件结构
```
/root/www/admin_log/
├── backend/
│   ├── src/              # 后端源码
│   ├── public/           # 前端构建文件
│   ├── package.json
│   └── node_modules/
└── package.json
```

### Docker 容器内部
容器会挂载 `/root/www/admin_log/backend` 目录，所以：
- 部署新代码会更新容器内的文件
- 重启容器后新代码生效

## ⚙️ 配置说明

`deploy.config.json` 配置文件：
```json
{
  "host": "aliyun.18638642193.cn",
  "user": "root",
  "port": 22,
  "keyPath": "~/.ssh/id_rsa/id_ed25519_1panel",
  "remotePath": "/root/www/admin_log",
  "dockerContainer": "admin_log"
}
```

配置项说明：
- `host` - 服务器地址
- `user` - SSH 用户名
- `port` - SSH 端口
- `keyPath` - SSH 私钥路径
- `remotePath` - 服务器上的代码目录
- `dockerContainer` - Docker 容器名称

## 🔍 常见操作

### 1. 部署新版本
```bash
npm run deploy
```

### 2. 查看容器是否运行
```bash
npm run server status
```

### 3. 查看应用日志
```bash
npm run server logs
```

### 4. 应用出错，重启容器
```bash
npm run server restart
```

### 5. 进入容器调试
```bash
npm run server exec
```

### 6. 手动操作（SSH 到服务器）
```bash
# 连接服务器
npm run server ssh

# 在服务器上操作 Docker
docker ps -a                          # 查看所有容器
docker logs admin_log                 # 查看容器日志
docker logs -f admin_log              # 实时查看日志
docker restart admin_log              # 重启容器
docker exec -it admin_log /bin/sh     # 进入容器
docker inspect admin_log              # 查看容器详情
```

## 🐳 Docker 常用命令参考

### 查看容器
```bash
# 查看运行中的容器
docker ps

# 查看所有容器（包括停止的）
docker ps -a

# 查看容器详情
docker inspect admin_log
```

### 管理容器
```bash
# 启动容器
docker start admin_log

# 停止容器
docker stop admin_log

# 重启容器
docker restart admin_log

# 删除容器（需要先停止）
docker stop admin_log
docker rm admin_log
```

### 查看日志
```bash
# 查看最近日志
docker logs admin_log

# 查看最近 100 行
docker logs --tail 100 admin_log

# 实时查看日志
docker logs -f admin_log

# 查看带时间戳的日志
docker logs -t admin_log
```

### 进入容器
```bash
# 使用 sh
docker exec -it admin_log /bin/sh

# 使用 bash（如果容器有 bash）
docker exec -it admin_log /bin/bash

# 执行单个命令
docker exec admin_log ls -la
docker exec admin_log ps aux
```

### 查看资源使用
```bash
# 查看容器资源使用情况
docker stats admin_log

# 查看容器占用的磁盘空间
docker system df
```

## 🔄 部署流程详解

1. **构建前端** - 将 Vue 项目编译为静态文件
2. **打包文件** - 将后端代码和前端构建文件打包为 tar.gz
3. **上传服务器** - 通过 SSH 上传到服务器指定目录
4. **解压文件** - 在服务器上解压覆盖旧文件
5. **安装依赖** - 运行 `npm install --production`
6. **重启容器** - 执行 `docker restart admin_log`
7. **等待启动** - 等待容器完全启动（约 3 秒）

## ⚠️ 注意事项

### Docker 容器的优势
✅ 自动重启 - 容器崩溃会自动重启
✅ 资源隔离 - 独立的运行环境
✅ 易于管理 - 统一的管理方式
✅ 快速部署 - 一键重启更新

### 部署注意事项
- ⚠️ 部署时会重启容器，会导致短暂的服务中断（约 3-5 秒）
- ⚠️ 确保容器配置了重启策略（如 `restart: always`）
- ⚠️ 确保容器挂载了正确的目录
- ⚠️ 建议在低峰期部署

### 容器配置建议
容器应该配置重启策略，确保服务器重启后自动启动：
```yaml
# docker-compose.yml 示例
version: '3'
services:
  admin_log:
    container_name: admin_log
    image: node:18-alpine
    restart: always
    volumes:
      - /root/www/admin_log/backend:/app
    working_dir: /app
    command: node src/index.js
    ports:
      - "3000:3000"
```

## 🆘 故障排查

### 容器无法启动
```bash
# 查看容器日志
npm run server logs

# 进入容器检查
npm run server exec
```

### 代码更新后没有生效
```bash
# 确认文件已更新（SSH 到服务器）
ssh root@aliyun.18638642193.cn
ls -la /root/www/admin_log/backend/

# 强制重启容器
npm run server restart
```

### 无法连接到容器
```bash
# 检查容器状态
npm run server status

# 如果容器停止，启动它
npm run server start
```

## 📞 获取帮助

查看所有可用命令：
```bash
npm run server
```

查看部署环境：
```bash
npm run deploy:check
```

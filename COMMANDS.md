# 🎯 快速命令参考

## 🚀 一键部署
```bash
npm run deploy
```
或双击 `deploy.bat`

## 📝 常用命令

### 部署
```bash
npm run deploy              # 全自动部署（推荐）
npm run deploy:simple       # 快速部署
npm run deploy:check        # 检查环境
```

### 服务器管理
```bash
npm run server status       # 查看状态
npm run server logs         # 查看日志
npm run server logs:live    # 实时日志
npm run server restart      # 重启容器
npm run server exec         # 进入容器
npm run server ssh          # 连接服务器
```

### 本地开发
```bash
npm run install:all         # 安装所有依赖
npm run dev:frontend        # 启动前端开发
npm run dev:backend         # 启动后端开发
npm run build               # 只构建前端
npm run clean               # 清理构建文件
```

## 🔗 快速链接

- 📖 全自动部署文档: [DEPLOY_AUTO.md](./DEPLOY_AUTO.md)
- 🐳 Docker 部署文档: [DEPLOY_DOCKER.md](./DEPLOY_DOCKER.md)
- ⚙️ 配置文件: `deploy.config.json`

## 📊 部署流程

1. 清理旧构建 → 2. 检查依赖 → 3. 构建前端 → 4. 复制文件 → 5. 检查SSH → 
6. 创建部署包 → 7. 上传服务器 → 8. 服务器部署 → 9. 重启容器 → 10. 验证部署

## ⚡ 快速故障排查

```bash
# 查看容器状态
npm run server status

# 查看错误日志
npm run server logs

# 重启容器
npm run server restart

# 进入容器调试
npm run server exec
```

## 🌐 访问地址
http://aliyun.18638642193.cn

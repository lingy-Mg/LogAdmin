# 🚀 快速部署指南

## 第一步：配置 SSH 密钥

如果还没有 SSH 密钥，生成一个：

```bash
ssh-keygen -t rsa -b 4096
```

将公钥添加到服务器：

```bash
# 查看公钥
cat ~/.ssh/id_rsa.pub

# 登录服务器并添加公钥
ssh root@aliyun.18638642193.cn
mkdir -p ~/.ssh
nano ~/.ssh/authorized_keys
# 粘贴公钥内容，保存退出

# 设置权限
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

测试 SSH 连接：

```bash
ssh root@aliyun.18638642193.cn
```

## 第二步：配置部署参数

复制并编辑配置文件：

```bash
cp deploy.config.json.example deploy.config.json
```

编辑 `deploy.config.json`：

```json
{
  "host": "aliyun.18638642193.cn",
  "user": "root",
  "port": 22,
  "keyPath": "~/.ssh/id_rsa",
  "remotePath": "/var/www/logadmin",
  "pm2Name": "logadmin"
}
```

## 第三步：检查部署环境

```bash
npm run deploy:check
```

确保所有检查都通过 ✅

## 第四步：执行部署

### Windows 用户
双击运行 `deploy.bat`

### 或使用命令行
```bash
npm run deploy
```

## 部署完成！

访问: http://aliyun.18638642193.cn

## 常用命令

```bash
# 检查部署环境
npm run deploy:check

# 执行部署
npm run deploy

# 清理构建
npm run clean

# 只构建前端
npm run build
```

## 服务器端管理

```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs logadmin

# 重启应用
pm2 restart logadmin
```

## 需要帮助？

查看详细文档: [DEPLOY.md](./DEPLOY.md)

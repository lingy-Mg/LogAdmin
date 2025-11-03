# 日志持久化功能说明

## ✨ 新增功能

### 1. 自动延迟写入（防抖机制）
- **触发条件**：每次有新日志添加或修改时
- **延迟时间**：5分钟
- **工作原理**：
  - 当数据变动时，启动一个5分钟的定时器
  - 如果在5分钟内再次有数据变动，重置定时器
  - 5分钟内没有新变动，自动写入到硬盘
  - **避免频繁IO操作**

### 2. 数据文件
- **文件位置**：`backend/logs-data.json`
- **格式**：JSON格式，包含所有日志数据
- **自动加载**：服务器启动时自动从文件加载历史日志

### 3. 优雅关闭
- 服务器关闭时（Ctrl+C），自动保存所有未写入的数据
- 监听 `SIGINT` 和 `SIGTERM` 信号

### 4. 新增API端点

#### POST /api/logs/save
手动触发保存，立即将所有日志写入文件
```bash
curl -X POST http://localhost:3000/api/logs/save
```

响应：
```json
{
  "success": true,
  "message": "日志已保存到文件"
}
```

#### GET /api/logs/status
查看当前保存状态
```bash
curl http://localhost:3000/api/logs/status
```

响应：
```json
{
  "success": true,
  "hasChanges": true,
  "logsCount": 123,
  "filePath": "C:\\Users\\q3499\\Desktop\\LogAdmin\\backend\\logs-data.json"
}
```

## 🔄 工作流程

```
新日志添加
    ↓
安排延迟写入（5分钟）
    ↓
继续接收新日志
    ↓
重置定时器（5分钟重新开始）
    ↓
5分钟内无新日志
    ↓
自动写入到 logs-data.json
```

## 📊 优势

1. **减少IO次数**：5分钟内的多次变动只写入1次
2. **提升性能**：避免每条日志都写文件
3. **数据安全**：
   - 优雅关闭时强制保存
   - 可手动触发保存
4. **持久化存储**：服务器重启后数据不丢失

## 🚀 使用示例

### 测试延迟写入
1. 启动服务器
2. 观察控制台输出：`⏰ 已安排写入任务，将在 300 秒后执行`
3. 继续发送日志，定时器会重置
4. 等待5分钟，看到：`💾 成功写入 X 条日志到文件`

### 手动保存
```powershell
# PowerShell
Invoke-RestMethod -Uri "http://localhost:3000/api/logs/save" -Method POST
```

### 查看状态
```powershell
# PowerShell
Invoke-RestMethod -Uri "http://localhost:3000/api/logs/status"
```

## ⚙️ 配置

可在 `server.js` 中修改延迟时间：
```javascript
const WRITE_DELAY = 5 * 60 * 1000 // 5分钟（毫秒）
```

例如改为1分钟：
```javascript
const WRITE_DELAY = 1 * 60 * 1000 // 1分钟
```

## 📝 注意事项

1. **首次启动**：如果 `logs-data.json` 不存在，会自动创建
2. **数据恢复**：重启服务器会自动加载 `logs-data.json` 中的历史数据
3. **清空日志**：调用 `DELETE /api/logs` 会立即清空文件（不延迟）
4. **文件大小**：最多保留1000条日志，自动清理旧数据

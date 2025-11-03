# 前端项目架构文档

## 📁 项目结构

```
frontend/src/
├── components/              # UI 组件
│   ├── HeaderBar.vue       # 顶部菜单栏（品牌、统计、连接状态）
│   ├── FiltersBar.vue      # 筛选条（设备、级别、关键词）
│   ├── LogList.vue         # 日志列表（点击选中、滚动）
│   ├── LogDetail.vue       # 日志详情面板（右侧滑出）
│   └── DeviceManager.vue   # 设备管理对话框
│
├── composables/            # 组合式函数（逻辑复用）
│   ├── useSocket.js        # Socket.IO 连接管理
│   └── useLogs.js          # 日志过滤、统计、设备列表
│
├── utils/                  # 工具函数
│   ├── api.js              # HTTP API 请求
│   ├── format.js           # 格式化工具（时间、值、文件大小）
│   ├── string.js           # 字符串处理（转义、高亮、截断）
│   └── log.js              # 日志工具（颜色、过滤、统计）
│
├── config/                 # 配置
│   └── index.js            # 应用配置（API、WebSocket、UI）
│
├── constants/              # 常量
│   └── log.js              # 日志常量（级别、颜色、事件名）
│
├── App.vue                 # 主应用（容器组件）
└── main.js                 # 应用入口

备份文件:
├── App-Old.vue             # 原始 App.vue（已备份）
└── App-New.vue             # 新架构 App.vue（模板）
```

## 🎯 架构特点

### 1. **组件化设计**
- 每个组件职责单一，便于维护和测试
- 使用 Props 和 Emits 进行父子组件通信
- 组件样式使用 scoped，避免污染全局

### 2. **逻辑复用（Composables）**
- `useSocket.js` - 封装 WebSocket 连接和事件处理
- `useLogs.js` - 封装日志过滤、统计等业务逻辑
- 符合 Vue 3 Composition API 最佳实践

### 3. **工具函数模块化**
- `utils/format.js` - 时间、值格式化
- `utils/string.js` - 字符串处理（转义、高亮）
- `utils/log.js` - 日志相关工具
- `utils/api.js` - HTTP API 封装

### 4. **配置集中管理**
- `config/index.js` - API、WebSocket、UI 配置
- `constants/log.js` - 日志级别、颜色等常量
- 便于环境切换和参数调整

### 5. **路径别名**
- 使用 `@` 别名指向 `src` 目录
- 简化导入路径，如 `@/components/HeaderBar.vue`

## 📦 组件说明

### HeaderBar.vue
**职责**: 顶部菜单栏
- 显示品牌 Logo
- 显示日志统计（总数、各级别数量）
- 显示连接状态
- 提供操作按钮（清空、自动滚动开关）

**Props**:
- `connected` - 连接状态
- `autoScroll` - 自动滚动状态
- `totalCount` - 日志总数
- `levelStats` - 各级别统计

**Events**:
- `scroll-to-bottom` - 滚动到底部
- `show-device-manager` - 显示设备管理
- `toggle-auto-scroll` - 切换自动滚动
- `clear-logs` - 清空日志
- `update:autoScroll` - 更新自动滚动状态

### FiltersBar.vue
**职责**: 筛选条
- 设备筛选（下拉框）
- 级别筛选（下拉框）
- 关键词搜索（输入框）
- 重置按钮

**Props**:
- `filters` - 过滤条件对象
- `deviceList` - 设备列表

**Events**:
- `update:deviceId` - 更新设备筛选
- `update:level` - 更新级别筛选
- `update:keyword` - 更新关键词
- `reset` - 重置筛选

### LogList.vue
**职责**: 日志列表
- 渲染日志列表
- 高亮选中项
- 关键词高亮
- 滚动到底部（通过 expose 暴露方法）

**Props**:
- `logs` - 日志数组
- `selectedLog` - 选中的日志
- `deviceAliases` - 设备别名映射
- `keyword` - 搜索关键词
- `hasDetail` - 是否显示详情面板

**Events**:
- `select` - 选中日志

**Exposed Methods**:
- `scrollToBottom()` - 滚动到底部

### LogDetail.vue
**职责**: 日志详情面板
- 显示日志完整信息
- 基本信息（时间、级别、设备）
- 消息内容
- Unity 特有字段（app、platform、extra）
- 原始 JSON 数据

**Props**:
- `log` - 日志对象
- `deviceAliases` - 设备别名映射

**Events**:
- `close` - 关闭详情面板

### DeviceManager.vue
**职责**: 设备管理对话框
- 显示设备列表
- 编辑设备别名
- 保存别名

**Props**:
- `visible` - 对话框可见性
- `devices` - 设备列表

**Events**:
- `update:visible` - 更新可见性
- `save-alias` - 保存别名

## 🔧 Composables 说明

### useSocket.js
**职责**: WebSocket 连接管理

**返回值**:
- `socket` - Socket.IO 实例
- `connected` - 连接状态
- `logs` - 日志数组
- `deviceAliases` - 设备别名映射

**功能**:
- 自动连接 WebSocket
- 监听连接/断开事件
- 监听日志事件（history、new、clear）
- 监听设备别名事件
- 自动清理（onUnmounted）

### useLogs.js
**职责**: 日志管理逻辑

**参数**:
- `logs` - 日志数组（ref）
- `deviceAliases` - 设备别名（ref）

**返回值**:
- `filters` - 过滤条件
- `selectedLog` - 选中的日志
- `filteredLogs` - 过滤后的日志
- `levelStats` - 级别统计
- `deviceList` - 设备列表
- `resetFilters()` - 重置过滤
- `selectLog()` - 选中日志
- `unselectLog()` - 取消选中

## 🛠️ 工具函数说明

### utils/format.js
- `formatTime(timestamp)` - 格式化时间（HH:mm:ss.SSS）
- `formatFullTime(timestamp)` - 格式化完整时间
- `formatValue(value)` - 格式化值（处理对象）
- `formatFileSize(bytes)` - 格式化文件大小

### utils/string.js
- `escapeRegExp(str)` - 转义正则特殊字符
- `escapeHtml(str)` - 转义 HTML 特殊字符
- `highlightKeyword(text, keyword)` - 高亮关键词
- `truncate(str, maxLength)` - 截断字符串

### utils/log.js
- `getLevelColor(level)` - 获取级别颜色
- `filterLogs(logs, filters)` - 过滤日志
- `calculateLevelStats(logs)` - 统计级别
- `getDeviceList(logs)` - 获取设备列表

### utils/api.js
- `clearLogsAPI()` - 清空日志
- `saveDeviceAliasAPI(deviceId, alias)` - 保存设备别名
- `queryLogsAPI(filters)` - 查询日志

## 📝 使用示例

### 在 App.vue 中使用

```vue
<script setup>
import { useSocket } from '@/composables/useSocket'
import { useLogs } from '@/composables/useLogs'

// Socket 连接
const { connected, logs, deviceAliases } = useSocket()

// 日志管理
const {
  filters,
  selectedLog,
  filteredLogs,
  levelStats,
  deviceList,
  resetFilters,
  selectLog,
  unselectLog
} = useLogs(logs, deviceAliases)
</script>
```

### 在组件中使用工具函数

```vue
<script setup>
import { formatTime } from '@/utils/format'
import { getLevelColor } from '@/utils/log'
import { highlightKeyword } from '@/utils/string'

// 直接使用
const formattedTime = formatTime(log.timestamp)
const color = getLevelColor(log.level)
const highlighted = highlightKeyword(log.message, keyword)
</script>
```

## 🎨 样式约定

1. **组件样式使用 scoped**
   ```vue
   <style scoped>
   .component-class { }
   </style>
   ```

2. **颜色变量复用**
   - 主色: `#4f46e5`（紫色）
   - 成功: `#22c55e`（绿色）
   - 警告: `#f59e0b`（橙色）
   - 错误: `#f44747`（红色）

3. **间距规范**
   - 小间距: `8px`
   - 中间距: `16px`
   - 大间距: `24px`

## 🚀 开发流程

### 添加新组件
1. 在 `components/` 创建新组件文件
2. 定义 Props 和 Emits
3. 实现组件逻辑和样式
4. 在 App.vue 中引入和使用

### 添加新功能
1. 在 `composables/` 创建新的组合式函数
2. 封装业务逻辑
3. 导出响应式数据和方法
4. 在组件中使用

### 添加工具函数
1. 在 `utils/` 对应文件中添加函数
2. 导出函数
3. 在需要的地方导入使用

## ✅ 优势总结

1. **可维护性** - 组件和逻辑分离，易于定位和修改
2. **可测试性** - 每个模块独立，便于单元测试
3. **可复用性** - Composables 和工具函数可在多处使用
4. **可扩展性** - 新增功能只需添加新组件或函数
5. **可读性** - 代码组织清晰，职责明确
6. **性能优化** - 按需导入，减少打包体积

## 📚 相关文档

- [Vue 3 组合式 API](https://cn.vuejs.org/guide/extras/composition-api-faq.html)
- [Element Plus 组件库](https://element-plus.org/)
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)
- [Vite 配置](https://vitejs.dev/config/)

## 🔄 迁移说明

从旧版 App.vue 迁移到新架构：

1. ✅ 所有功能保持不变
2. ✅ UI 样式完全一致
3. ✅ 交互行为相同
4. ✅ 新增模块化架构
5. ✅ 便于后续维护和扩展

**备份文件**: `src/App-Old.vue`（原始版本已保留）

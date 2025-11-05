/**
 * 应用配置
 */

// 获取后端 URL (生产环境使用当前域名,开发环境使用 localhost)
const getBackendURL = () => {
  // 如果有环境变量配置,优先使用
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, ''); // 移除末尾斜杠
  }

  const { protocol, hostname, port } = window.location;
  // 如果有端口号就使用,否则使用协议默认端口
  const portStr = port ? `:${port}` : "";
  return `${protocol}//${hostname}${portStr}`;
};

export const config = {
  // API 配置
  api: {
    baseURL: getBackendURL(),
    timeout: 10000,
  },

  // WebSocket 配置
  websocket: {
    url: import.meta.env.VITE_WS_URL || getBackendURL(),
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  },

  // 日志配置
  log: {
    maxLogs: 1000, // 前端最多保存的日志数
    autoScroll: true, // 默认自动滚动
    defaultLimit: 100, // 默认查询条数
  },

  // UI 配置
  ui: {
    detailPanelWidth: 480, // 详情面板宽度
    theme: "dark", // 主题
  },
};

export default config;

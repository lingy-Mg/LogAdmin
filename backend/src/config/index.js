/**
 * 配置文件
 * 统一管理应用的配置参数
 */

export const config = {
  // 服务器配置
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || "development",
  },

  // 日志配置
  logs: {
    maxLogs: 1000, // 内存中最多保存的日志条数
    writeDelay: 3 * 1000, // 写入文件的延迟时间（5分钟）
    simulateInterval: 3000, // 模拟日志生成间隔（毫秒）
  },

  // 文件路径配置
  paths: {
    logFile: "logs-data.json",
    deviceAliasesFile: "device-aliases.json",
    publicDir: "public",
  },

  // CORS 配置
  cors: {
    origin: "*",
  },

  // WebSocket 配置
  websocket: {
    cors: {
      origin: "*",
    },
  },
};

export default config;

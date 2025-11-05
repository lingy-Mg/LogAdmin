/**
 * 应用入口文件
 * 整合所有模块，启动服务器
 */

import { createServer } from "http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { config } from "./config/index.js";
import { LogService } from "./services/LogService.js";
import { DeviceService } from "./services/DeviceService.js";
import { PersistenceService } from "./services/PersistenceService.js";
import { createLogRoutes, createLogReceiveHandler } from "./routes/logRoutes.js";
import { createDeviceRoutes } from "./routes/deviceRoutes.js";
import { setupSocketHandlers } from "./websocket/socketHandler.js";
import { setupGracefulShutdown } from "./utils/gracefulShutdown.js";

// 创建 Express 应用
const app = createApp();

// 创建 HTTP 服务器
const httpServer = createServer(app);

// 创建 WebSocket 服务器
const io = new Server(httpServer, {
  cors: config.websocket.cors,
});

// 初始化服务
const logService = new LogService();
const deviceService = new DeviceService();
const persistenceService = new PersistenceService();

// 加载持久化数据
const savedLogs = persistenceService.loadLogs();
logService.setLogs(savedLogs);

const savedAliases = persistenceService.loadDeviceAliases();
deviceService.setAliases(savedAliases);

// 设置路由
app.use("/api/logs", createLogRoutes(logService, persistenceService, io));
app.use("/api/devices", createDeviceRoutes(logService, deviceService, persistenceService, io));

// 特殊路由: 根路径的 POST 请求转发到日志接收 (支持单条或数组批量)
app.post("/", createLogReceiveHandler(logService, persistenceService, io, "(根路径)"));

// 扩展健康检查，添加服务状态
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    logsCount: logService.getLogsCount(),
    devicesCount: deviceService.getDevicesCount(),
    timestamp: new Date().toISOString(),
  });
});

// 设置 WebSocket 处理器
setupSocketHandlers(io, logService, deviceService);

// 设置优雅关闭
setupGracefulShutdown(persistenceService, logService, deviceService);

// 启动服务器
const PORT = config.server.port;
httpServer.listen(PORT, () => {
  console.log("\n" + "=".repeat(50));
  console.log("🚀 LogAdmin 服务器启动成功!");
  console.log("=".repeat(50));
  console.log(`📡 HTTP 服务: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket 服务已启动`);
  console.log(`📊 已加载日志: ${logService.getLogsCount()} 条`);
  console.log(`📱 已加载设备: ${deviceService.getDevicesCount()} 个`);
  console.log(`🌐 访问应用: http://localhost:${PORT}`);
  console.log(`🔧 运行环境: ${config.server.env}`);
  console.log("=".repeat(50) + "\n");
});

export { app, httpServer, io };

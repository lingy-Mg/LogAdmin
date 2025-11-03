/**
 * Express 应用配置
 */

import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { config } from './config/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export function createApp() {
  const app = express()

  // 中间件
  app.use(cors(config.cors))
  app.use(express.json())

  // 静态文件服务（前端打包后的文件）
  const publicPath = path.join(__dirname, '../', config.paths.publicDir)
  app.use(express.static(publicPath))

  // 健康检查
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    })
  })

  return app
}

export default createApp

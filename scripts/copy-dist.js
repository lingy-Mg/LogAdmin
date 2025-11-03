const fs = require('fs')
const path = require('path')

console.log('📦 开始复制前端构建文件到后端...')

const frontendDistPath = path.join(__dirname, '../frontend/dist')
const backendPublicPath = path.join(__dirname, '../backend/public')

// 检查前端构建文件是否存在
if (!fs.existsSync(frontendDistPath)) {
  console.error('❌ 错误: 前端构建文件不存在，请先运行 npm run build:frontend')
  process.exit(1)
}

// 删除旧的 public 目录
if (fs.existsSync(backendPublicPath)) {
  console.log('🗑️  删除旧的 public 目录...')
  fs.rmSync(backendPublicPath, { recursive: true, force: true })
}

// 创建 public 目录
fs.mkdirSync(backendPublicPath, { recursive: true })

// 复制文件
function copyDir(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true })
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true })
      copyDir(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

console.log('📋 复制文件中...')
copyDir(frontendDistPath, backendPublicPath)

console.log('✅ 复制完成！')
console.log(`📁 目标目录: ${backendPublicPath}`)

// 统计文件
function countFiles(dir) {
  let count = 0
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  
  for (const entry of entries) {
    if (entry.isDirectory()) {
      count += countFiles(path.join(dir, entry.name))
    } else {
      count++
    }
  }
  
  return count
}

const fileCount = countFiles(backendPublicPath)
console.log(`📊 共复制 ${fileCount} 个文件`)
console.log('🚀 现在可以运行 npm start 启动完整应用')

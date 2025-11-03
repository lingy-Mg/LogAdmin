const fs = require('fs')
const path = require('path')

console.log('🧹 开始清理构建文件...')

const pathsToClean = [
  path.join(__dirname, '../frontend/dist'),
  path.join(__dirname, '../backend/public')
]

let cleaned = 0

for (const dirPath of pathsToClean) {
  if (fs.existsSync(dirPath)) {
    console.log(`🗑️  删除: ${dirPath}`)
    fs.rmSync(dirPath, { recursive: true, force: true })
    cleaned++
  }
}

if (cleaned > 0) {
  console.log(`✅ 清理完成！删除了 ${cleaned} 个目录`)
} else {
  console.log('ℹ️  没有需要清理的文件')
}

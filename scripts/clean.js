const fs = require("fs");
const path = require("path");

console.log("🧹 开始清理构建文件...");

const pathsToClean = [path.join(__dirname, "../frontend/dist"), path.join(__dirname, "../backend/public")];

let cleaned = 0;

for (const dirPath of pathsToClean) {
  if (fs.existsSync(dirPath)) {
    console.log(`🗑️  删除: ${dirPath}`);
    fs.rmSync(dirPath, { recursive: true, force: true });
    cleaned++;
  }
}

if (cleaned > 0) {
  console.log(`✅ 清理完成！删除了 ${cleaned} 个目录`);
} else {
  console.log("ℹ️  没有需要清理的文件");
}

// 删除 logadmin-deploy.tar.gz
const deployArchivePath = path.join(__dirname, "../logadmin-deploy.tar.gz");
if (fs.existsSync(deployArchivePath)) {
  console.log(`🗑️  删除部署包: ${deployArchivePath}`);
  fs.rmSync(deployArchivePath);
  console.log("✅ 部署包删除完成！");
}

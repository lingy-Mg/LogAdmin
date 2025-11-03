const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// 读取配置文件
const configPath = path.join(__dirname, '../deploy.config.json');
if (!fs.existsSync(configPath)) {
  console.error('❌ 配置文件不存在: deploy.config.json');
  console.log('请复制 deploy.config.json.example 并修改配置');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// 处理 ~ 路径
if (config.keyPath.startsWith('~')) {
  config.keyPath = path.join(os.homedir(), config.keyPath.slice(1));
}

console.log('🚀 开始部署流程...');
console.log(`📍 目标服务器: ${config.user}@${config.host}`);
console.log(`📂 部署路径: ${config.remotePath}\n`);

// 1. 清理旧的构建
console.log('📦 步骤 1/5: 清理旧的构建文件...');
try {
  execSync('npm run clean', { stdio: 'inherit' });
  console.log('✅ 清理完成\n');
} catch (error) {
  console.error('❌ 清理失败:', error.message);
  process.exit(1);
}

// 2. 构建前端
console.log('🔨 步骤 2/5: 构建前端项目...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ 前端构建完成\n');
} catch (error) {
  console.error('❌ 构建失败:', error.message);
  process.exit(1);
}

// 3. 检查 SSH 密钥
console.log('🔑 步骤 3/5: 检查 SSH 密钥...');
if (!fs.existsSync(config.keyPath)) {
  console.error(`❌ SSH 密钥不存在: ${config.keyPath}`);
  console.log('提示: 请确保你的 SSH 密钥位于正确的位置');
  process.exit(1);
}
console.log('✅ SSH 密钥检查通过\n');

// 4. 创建部署包
console.log('📦 步骤 4/5: 创建部署包...');
const deployDir = path.join(__dirname, '../deploy');
const deployPackage = path.join(__dirname, '../logadmin-deploy.tar.gz');

try {
  // 清理旧的部署文件
  if (fs.existsSync(deployPackage)) {
    fs.unlinkSync(deployPackage);
  }

  // 使用 tar 命令打包（Windows 10+ 自带 tar 命令）
  console.log('  - 打包后端文件...');
  const filesToPack = [
    'backend/src',
    'backend/package.json',
    'backend/package-lock.json',
    'backend/public',
    'backend/README.md',
    'package.json'
  ].join(' ');

  execSync(`tar -czf "${deployPackage}" ${filesToPack}`, {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });

  console.log('✅ 部署包创建完成\n');
} catch (error) {
  console.error('❌ 创建部署包失败:', error.message);
  process.exit(1);
}

// 5. 上传并部署
console.log('🚢 步骤 5/5: 上传并部署到服务器...');
try {
  const sshOptions = `-i "${config.keyPath}" -p ${config.port} -o StrictHostKeyChecking=no`;
  const sshTarget = `${config.user}@${config.host}`;

  // 创建远程目录
  console.log('  - 创建远程目录...');
  execSync(`ssh ${sshOptions} ${sshTarget} "mkdir -p ${config.remotePath}"`, {
    stdio: 'inherit'
  });

  // 上传部署包
  console.log('  - 上传部署包...');
  execSync(`scp ${sshOptions} "${deployPackage}" ${sshTarget}:${config.remotePath}/`, {
    stdio: 'inherit'
  });

  // 在远程服务器上解压并部署
  console.log('  - 解压并部署...');
  const deployCommands = [
    `cd ${config.remotePath}`,
    'tar -xzf logadmin-deploy.tar.gz',
    'rm logadmin-deploy.tar.gz',
    'cd backend',
    'npm install --production',
    `pm2 restart ${config.pm2Name} || pm2 start src/index.js --name ${config.pm2Name}`
  ].join(' && ');

  execSync(`ssh ${sshOptions} ${sshTarget} "${deployCommands}"`, {
    stdio: 'inherit'
  });

  // 清理本地部署包
  fs.unlinkSync(deployPackage);

  console.log('\n✅ 部署完成！');
  console.log(`\n🌐 访问地址: http://${config.host}\n`);
} catch (error) {
  console.error('❌ 部署失败:', error.message);
  process.exit(1);
}

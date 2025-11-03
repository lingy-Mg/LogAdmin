const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🔍 检查部署环境...\n');

let allGood = true;

// 1. 检查配置文件
console.log('1️⃣ 检查配置文件...');
const configPath = path.join(__dirname, '../deploy.config.json');
if (fs.existsSync(configPath)) {
  console.log('   ✅ deploy.config.json 存在');
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    console.log(`   📍 目标服务器: ${config.user}@${config.host}`);
    console.log(`   📂 部署路径: ${config.remotePath}`);
    
    // 检查 SSH 密钥路径
    let keyPath = config.keyPath;
    if (keyPath.startsWith('~')) {
      keyPath = path.join(os.homedir(), keyPath.slice(1));
    }
    
    if (fs.existsSync(keyPath)) {
      console.log(`   ✅ SSH 密钥存在: ${keyPath}`);
    } else {
      console.log(`   ❌ SSH 密钥不存在: ${keyPath}`);
      allGood = false;
    }
  } catch (e) {
    console.log('   ❌ 配置文件格式错误:', e.message);
    allGood = false;
  }
} else {
  console.log('   ❌ deploy.config.json 不存在');
  console.log('   💡 请复制 deploy.config.json.example 并修改配置');
  allGood = false;
}

// 2. 检查前端构建
console.log('\n2️⃣ 检查前端项目...');
const frontendPath = path.join(__dirname, '../frontend');
if (fs.existsSync(path.join(frontendPath, 'package.json'))) {
  console.log('   ✅ 前端项目存在');
  if (fs.existsSync(path.join(frontendPath, 'node_modules'))) {
    console.log('   ✅ 前端依赖已安装');
  } else {
    console.log('   ⚠️  前端依赖未安装，请运行: npm install --prefix frontend');
  }
} else {
  console.log('   ❌ 前端项目不存在');
  allGood = false;
}

// 3. 检查后端项目
console.log('\n3️⃣ 检查后端项目...');
const backendPath = path.join(__dirname, '../backend');
if (fs.existsSync(path.join(backendPath, 'package.json'))) {
  console.log('   ✅ 后端项目存在');
  if (fs.existsSync(path.join(backendPath, 'node_modules'))) {
    console.log('   ✅ 后端依赖已安装');
  } else {
    console.log('   ⚠️  后端依赖未安装，请运行: npm install --prefix backend');
  }
} else {
  console.log('   ❌ 后端项目不存在');
  allGood = false;
}

// 4. 检查 Node.js 版本
console.log('\n4️⃣ 检查 Node.js 版本...');
const nodeVersion = process.version;
console.log(`   ℹ️  Node.js 版本: ${nodeVersion}`);
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion >= 14) {
  console.log('   ✅ Node.js 版本符合要求 (>= 14)');
} else {
  console.log('   ⚠️  建议升级 Node.js 到 14 以上版本');
}

// 5. 检查 SSH 命令
console.log('\n5️⃣ 检查 SSH 工具...');
try {
  const { execSync } = require('child_process');
  execSync('ssh -V', { stdio: 'ignore' });
  console.log('   ✅ SSH 命令可用');
} catch (e) {
  console.log('   ❌ SSH 命令不可用');
  console.log('   💡 Windows 用户请确保已启用 OpenSSH 客户端');
  allGood = false;
}

// 总结
console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('✅ 所有检查通过！可以开始部署');
  console.log('\n运行以下命令开始部署:');
  console.log('   npm run deploy');
  console.log('   或');
  console.log('   .\\deploy.bat');
} else {
  console.log('❌ 存在问题，请先解决上述问题后再部署');
}
console.log('='.repeat(50) + '\n');

process.exit(allGood ? 0 : 1);

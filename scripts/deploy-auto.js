const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const readline = require('readline');

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

// 创建readline接口用于用户确认
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.clear();
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║      🚀 LogAdmin 全自动部署系统              ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  console.log('📋 部署信息：');
  console.log(`   服务器: ${config.user}@${config.host}`);
  console.log(`   路径: ${config.remotePath}`);
  console.log(`   容器: ${config.dockerContainer}\n`);

  // 询问是否继续
  const answer = await question('❓ 确认开始自动部署? (y/N): ');
  if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
    console.log('❌ 部署已取消');
    rl.close();
    process.exit(0);
  }

  console.log('\n' + '='.repeat(50));
  console.log('开始全自动部署流程...');
  console.log('='.repeat(50) + '\n');

  try {
    // 步骤 1: 清理
    await step1Clean();
    
    // 步骤 2: 安装依赖
    await step2InstallDeps();
    
    // 步骤 3: 构建前端
    await step3BuildFrontend();
    
    // 步骤 4: 复制构建文件
    await step4CopyDist();
    
    // 步骤 5: 检查SSH
    await step5CheckSSH();
    
    // 步骤 6: 创建部署包
    await step6CreatePackage();
    
    // 步骤 7: 上传到服务器
    await step7Upload();
    
    // 步骤 8: 部署到服务器
    await step8Deploy();
    
    // 步骤 9: 重启容器
    await step9RestartContainer();
    
    // 步骤 10: 验证部署
    await step10Verify();
    
    // 完成
    printSuccess();
    
  } catch (error) {
    console.error('\n❌ 部署失败:', error.message);
    rl.close();
    process.exit(1);
  }

  rl.close();
}

// 步骤 1: 清理旧构建
async function step1Clean() {
  console.log('📦 [1/10] 清理旧的构建文件...');
  try {
    execSync('npm run clean', { stdio: 'inherit' });
    console.log('   ✅ 清理完成\n');
  } catch (error) {
    throw new Error('清理失败: ' + error.message);
  }
}

// 步骤 2: 安装依赖
async function step2InstallDeps() {
  console.log('📚 [2/10] 检查并安装依赖...');
  
  // 检测使用哪个包管理器
  const usesPnpm = fs.existsSync(path.join(__dirname, '../pnpm-lock.yaml'));
  const pkgManager = usesPnpm ? 'pnpm' : 'npm';
  
  console.log(`   使用包管理器: ${pkgManager}`);
  
  // 检查后端依赖
  const backendNodeModules = path.join(__dirname, '../backend/node_modules');
  if (!fs.existsSync(backendNodeModules)) {
    console.log('   安装后端依赖...');
    const installCmd = usesPnpm 
      ? 'pnpm install --filter backend' 
      : 'npm install --prefix backend';
    execSync(installCmd, { stdio: 'inherit' });
  } else {
    console.log('   ✓ 后端依赖已安装');
  }
  
  // 检查前端依赖
  const frontendNodeModules = path.join(__dirname, '../frontend/node_modules');
  if (!fs.existsSync(frontendNodeModules)) {
    console.log('   安装前端依赖...');
    const installCmd = usesPnpm 
      ? 'pnpm install --filter frontend' 
      : 'npm install --prefix frontend';
    execSync(installCmd, { stdio: 'inherit' });
  } else {
    console.log('   ✓ 前端依赖已安装');
  }
  
  console.log('   ✅ 依赖检查完成\n');
}

// 步骤 3: 构建前端
async function step3BuildFrontend() {
  console.log('🔨 [3/10] 构建前端项目...');
  try {
    execSync('npm run build:frontend', { stdio: 'inherit' });
    console.log('   ✅ 前端构建完成\n');
  } catch (error) {
    throw new Error('前端构建失败: ' + error.message);
  }
}

// 步骤 4: 复制构建文件
async function step4CopyDist() {
  console.log('📋 [4/10] 复制构建文件到后端...');
  try {
    execSync('npm run copy:dist', { stdio: 'inherit' });
    console.log('   ✅ 文件复制完成\n');
  } catch (error) {
    throw new Error('文件复制失败: ' + error.message);
  }
}

// 步骤 5: 检查SSH
async function step5CheckSSH() {
  console.log('🔑 [5/10] 检查 SSH 密钥...');
  if (!fs.existsSync(config.keyPath)) {
    throw new Error(`SSH 密钥不存在: ${config.keyPath}`);
  }
  console.log('   ✅ SSH 密钥检查通过\n');
}

// 步骤 6: 创建部署包
async function step6CreatePackage() {
  console.log('📦 [6/10] 创建部署包...');
  const deployPackage = path.join(__dirname, '../logadmin-deploy.tar.gz');
  
  try {
    // 清理旧的部署文件
    if (fs.existsSync(deployPackage)) {
      fs.unlinkSync(deployPackage);
    }

    // 使用 tar 命令打包
    const filesToPack = [
      'backend/src',
      'backend/package.json',
      'backend/package-lock.json',
      'backend/public',
      'package.json'
    ].join(' ');

    execSync(`tar -czf "${deployPackage}" ${filesToPack}`, {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe'
    });

    const stats = fs.statSync(deployPackage);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`   ✅ 部署包创建完成 (${sizeMB} MB)\n`);
  } catch (error) {
    throw new Error('创建部署包失败: ' + error.message);
  }
}

// 步骤 7: 上传到服务器
async function step7Upload() {
  console.log('🚢 [7/10] 上传到服务器...');
  const sshOptions = `-i "${config.keyPath}" -p ${config.port} -o StrictHostKeyChecking=no`;
  const sshTarget = `${config.user}@${config.host}`;
  const deployPackage = path.join(__dirname, '../logadmin-deploy.tar.gz');
  
  try {
    // 创建远程目录
    console.log('   创建远程目录...');
    execSync(`ssh ${sshOptions} ${sshTarget} "mkdir -p ${config.remotePath}"`, {
      stdio: 'pipe'
    });

    // 上传部署包
    console.log('   上传部署包...');
    execSync(`scp ${sshOptions} "${deployPackage}" ${sshTarget}:${config.remotePath}/`, {
      stdio: 'inherit'
    });
    
    console.log('   ✅ 上传完成\n');
  } catch (error) {
    throw new Error('上传失败: ' + error.message);
  }
}

// 步骤 8: 部署到服务器
async function step8Deploy() {
  console.log('⚙️  [8/10] 在服务器上部署...');
  const sshOptions = `-i "${config.keyPath}" -p ${config.port} -o StrictHostKeyChecking=no`;
  const sshTarget = `${config.user}@${config.host}`;
  
  try {
    const deployCommands = [
      `cd ${config.remotePath}`,
      'echo "解压文件..."',
      'tar -xzf logadmin-deploy.tar.gz',
      'rm logadmin-deploy.tar.gz',
      'cd backend',
      'echo "安装依赖..."',
      'npm install --production --quiet',
      'echo "部署完成"'
    ].join(' && ');

    execSync(`ssh ${sshOptions} ${sshTarget} "${deployCommands}"`, {
      stdio: 'inherit'
    });
    
    console.log('   ✅ 服务器部署完成\n');
  } catch (error) {
    throw new Error('服务器部署失败: ' + error.message);
  }
}

// 步骤 9: 重启容器
async function step9RestartContainer() {
  console.log('🐳 [9/10] 重启 Docker 容器...');
  const sshOptions = `-i "${config.keyPath}" -p ${config.port} -o StrictHostKeyChecking=no`;
  const sshTarget = `${config.user}@${config.host}`;
  
  try {
    execSync(`ssh ${sshOptions} ${sshTarget} "docker restart ${config.dockerContainer}"`, {
      stdio: 'pipe'
    });
    
    console.log('   容器重启中，等待启动...');
    // 等待容器启动
    await sleep(3000);
    
    console.log('   ✅ 容器重启完成\n');
  } catch (error) {
    throw new Error('容器重启失败: ' + error.message);
  }
}

// 步骤 10: 验证部署
async function step10Verify() {
  console.log('✓  [10/10] 验证部署...');
  const sshOptions = `-i "${config.keyPath}" -p ${config.port} -o StrictHostKeyChecking=no`;
  const sshTarget = `${config.user}@${config.host}`;
  
  try {
    // 检查容器状态
    const result = execSync(`ssh ${sshOptions} ${sshTarget} "docker ps --filter name=${config.dockerContainer} --format '{{.Status}}'"`, {
      encoding: 'utf-8'
    }).trim();
    
    if (result.includes('Up')) {
      console.log(`   ✅ 容器运行正常: ${result}\n`);
    } else {
      console.log(`   ⚠️  容器状态: ${result}\n`);
    }
    
    // 清理本地部署包
    const deployPackage = path.join(__dirname, '../logadmin-deploy.tar.gz');
    if (fs.existsSync(deployPackage)) {
      fs.unlinkSync(deployPackage);
    }
    
  } catch (error) {
    console.log('   ⚠️  无法验证容器状态\n');
  }
}

// 打印成功信息
function printSuccess() {
  console.log('='.repeat(50));
  console.log('✨ 部署成功！\n');
  console.log('📊 部署信息:');
  console.log(`   🌐 访问地址: http://${config.host}`);
  console.log(`   🐳 容器名称: ${config.dockerContainer}`);
  console.log(`   📂 部署路径: ${config.remotePath}\n`);
  console.log('📝 后续操作:');
  console.log('   查看容器状态: npm run server status');
  console.log('   查看容器日志: npm run server logs');
  console.log('   实时查看日志: npm run server logs:live');
  console.log('='.repeat(50) + '\n');
}

// 睡眠函数
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 运行主函数
main().catch(error => {
  console.error('部署出错:', error);
  process.exit(1);
});

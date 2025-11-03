const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// 读取配置
const configPath = path.join(__dirname, '../deploy.config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

if (config.keyPath.startsWith('~')) {
  config.keyPath = path.join(os.homedir(), config.keyPath.slice(1));
}

const sshOptions = `-i "${config.keyPath}" -p ${config.port}`;
const sshTarget = `${config.user}@${config.host}`;
const dockerContainer = config.dockerContainer;

// 获取命令行参数
const action = process.argv[2];

console.log(`📡 连接到: ${config.user}@${config.host}`);
console.log(`🐳 Docker 容器: ${dockerContainer}\n`);

switch (action) {
  case 'status':
    console.log('📊 检查容器状态...\n');
    try {
      execSync(`ssh ${sshOptions} ${sshTarget} "docker ps -a --filter name=${dockerContainer} --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"`, {
        stdio: 'inherit'
      });
    } catch (e) {
      console.error('❌ 无法获取容器状态');
    }
    break;

  case 'logs':
    console.log('📋 查看容器日志（最近 50 行）...\n');
    try {
      execSync(`ssh ${sshOptions} ${sshTarget} "docker logs --tail 50 ${dockerContainer}"`, {
        stdio: 'inherit'
      });
    } catch (e) {
      console.error('❌ 无法读取日志');
    }
    break;

  case 'logs:live':
    console.log('📋 实时查看容器日志（按 Ctrl+C 退出）...\n');
    try {
      execSync(`ssh ${sshOptions} ${sshTarget} "docker logs -f ${dockerContainer}"`, {
        stdio: 'inherit'
      });
    } catch (e) {
      console.log('已停止查看日志');
    }
    break;

  case 'stop':
    console.log('🛑 停止容器...\n');
    try {
      execSync(`ssh ${sshOptions} ${sshTarget} "docker stop ${dockerContainer}"`, {
        stdio: 'inherit'
      });
      console.log('✅ 容器已停止');
    } catch (e) {
      console.error('❌ 停止失败');
    }
    break;

  case 'start':
    console.log('🚀 启动容器...\n');
    try {
      execSync(`ssh ${sshOptions} ${sshTarget} "docker start ${dockerContainer}"`, {
        stdio: 'inherit'
      });
      console.log('✅ 容器已启动');
    } catch (e) {
      console.error('❌ 启动失败');
    }
    break;

  case 'restart':
    console.log('🔄 重启容器...\n');
    try {
      execSync(`ssh ${sshOptions} ${sshTarget} "docker restart ${dockerContainer}"`, {
        stdio: 'inherit'
      });
      console.log('✅ 容器已重启');
    } catch (e) {
      console.error('❌ 重启失败');
    }
    break;

  case 'exec':
    console.log('💻 进入容器终端...\n');
    try {
      execSync(`ssh ${sshOptions} ${sshTarget} -t "docker exec -it ${dockerContainer} /bin/sh"`, {
        stdio: 'inherit'
      });
    } catch (e) {
      console.log('已退出容器');
    }
    break;

  case 'ssh':
    console.log('🔗 连接到服务器...\n');
    try {
      execSync(`ssh ${sshOptions} ${sshTarget}`, {
        stdio: 'inherit'
      });
    } catch (e) {
      console.error('❌ 连接失败');
    }
    break;

  default:
    console.log('📖 LogAdmin Docker 容器管理工具\n');
    console.log('用法: npm run server <命令>\n');
    console.log('可用命令:');
    console.log('  status      - 查看容器状态');
    console.log('  logs        - 查看容器日志（最近 50 行）');
    console.log('  logs:live   - 实时查看容器日志');
    console.log('  start       - 启动容器');
    console.log('  stop        - 停止容器');
    console.log('  restart     - 重启容器');
    console.log('  exec        - 进入容器终端');
    console.log('  ssh         - 连接到服务器\n');
    console.log('示例:');
    console.log('  npm run server status');
    console.log('  npm run server logs');
    console.log('  npm run server restart');
    console.log('  npm run server exec\n');
}

/**
 * Unity 日志格式测试脚本
 * 用于测试 Unity 格式的日志发送
 */

const testUnityLog = async () => {
  const unityLog = {
    ts: Date.now(),
    app: "unity",
    level: "info",
    msg: "Unity 测试日志 - 玩家登录成功",
    platform: "WindowsEditor",
    path: "/",
    source_type: "unity",
    extra: {
      device_id: "WIN-PC-12345",
      session: "f3a2b1c4d5e6",
      app_ver: "1.0.0",
      unity: "2022.3.61",
      system: "Windows 11 Pro 22H2",
      model: "PC",
      player_id: "user_12345",
      scene: "MainMenu"
    }
  }

  try {
    const response = await fetch('http://localhost:3000/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(unityLog)
    })

    const result = await response.json()
    
    if (result.success) {
      console.log('✅ Unity 日志发送成功')
      console.log('日志ID:', result.data.id)
      console.log('设备ID:', result.data.deviceId)
      console.log('时间戳:', result.data.timestamp)
    } else {
      console.error('❌ 发送失败:', result.error)
    }
  } catch (error) {
    console.error('❌ 请求错误:', error.message)
  }
}

// 发送多条不同级别的日志
const testMultipleLogs = async () => {
  const logs = [
    {
      ts: Date.now(),
      app: "unity",
      level: "info",
      msg: "游戏启动成功",
      platform: "WindowsEditor",
      path: "/game",
      source_type: "unity",
      extra: {
        device_id: "WIN-PC-12345",
        session: "abc123def456",
        app_ver: "1.0.0",
        unity: "2022.3.61",
        system: "Windows 11 Pro",
        model: "Gaming PC"
      }
    },
    {
      ts: Date.now() + 1000,
      app: "unity",
      level: "warning",
      msg: "内存使用率较高: 85%",
      platform: "Android",
      path: "/performance",
      source_type: "unity",
      extra: {
        device_id: "ANDROID-DEVICE-001",
        session: "xyz789uvw012",
        app_ver: "1.0.1",
        unity: "2022.3.61",
        system: "Android 12",
        model: "Samsung Galaxy S21",
        memory_usage: "85%",
        frame_rate: 58
      }
    },
    {
      ts: Date.now() + 2000,
      app: "unity",
      level: "error",
      msg: "网络连接失败: 服务器超时",
      platform: "iOS",
      path: "/network",
      source_type: "unity",
      extra: {
        device_id: "iOS-iPhone13-789",
        session: "mno345pqr678",
        app_ver: "1.0.2",
        unity: "2022.3.61",
        system: "iOS 16.5",
        model: "iPhone 13 Pro",
        error_code: "NET_TIMEOUT",
        retry_count: 3
      }
    },
    {
      ts: Date.now() + 3000,
      app: "unity",
      level: "debug",
      msg: "资源加载完成: character_model.prefab",
      platform: "WindowsEditor",
      path: "/assets",
      source_type: "unity",
      extra: {
        device_id: "WIN-PC-12345",
        session: "abc123def456",
        app_ver: "1.0.0",
        unity: "2022.3.61",
        system: "Windows 11 Pro",
        model: "Gaming PC",
        asset_name: "character_model.prefab",
        load_time: "1.2s"
      }
    }
  ]

  console.log('🚀 开始发送多条 Unity 格式日志...\n')

  for (const log of logs) {
    try {
      const response = await fetch('http://localhost:3000/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(log)
      })

      const result = await response.json()
      
      if (result.success) {
        console.log(`✅ [${log.level.toUpperCase()}] ${log.msg}`)
        console.log(`   设备: ${log.extra.device_id} (${log.platform})`)
        console.log(`   会话: ${log.extra.session}\n`)
      } else {
        console.error(`❌ 发送失败: ${result.error}\n`)
      }
      
      // 延迟一下避免太快
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error(`❌ 请求错误: ${error.message}\n`)
    }
  }

  console.log('✨ 所有测试日志发送完成!')
}

// 运行测试
console.log('='.repeat(60))
console.log('Unity 日志格式测试')
console.log('='.repeat(60))
console.log()

testMultipleLogs()

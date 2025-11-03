<template>
  <header class="app-header">
    <div class="brand">
      <div class="logo-icon">📝</div>
      <div class="logo-text">LogAdmin</div>
    </div>

    <el-menu class="top-menu" mode="horizontal" :ellipsis="false" background-color="transparent"
      active-text-color="#fff" text-color="rgba(255,255,255,.85)">
      <el-menu-item index="1" @click="$emit('scroll-to-bottom')">实时</el-menu-item>
      <el-menu-item index="2" @click="$emit('show-device-manager')">设备</el-menu-item>
      <el-sub-menu index="3">
        <template #title>设置</template>
        <el-menu-item index="3-1" @click="$emit('toggle-auto-scroll')">
          {{ autoScroll ? '关闭自动滚动' : '开启自动滚动' }}
        </el-menu-item>
        <el-menu-item index="3-2" @click="$emit('clear-logs')">清空日志</el-menu-item>
      </el-sub-menu>
    </el-menu>

    <div class="header-right">
      <div class="stats-chips">
        <el-tag size="small" effect="dark" round>总: {{ totalCount }}</el-tag>
        <el-tag size="small" type="success" round>INFO: {{ levelStats.INFO }}</el-tag>
        <el-tag size="small" type="warning" round>WARN: {{ levelStats.WARN }}</el-tag>
        <el-tag size="small" type="danger" round>ERROR: {{ levelStats.ERROR }}</el-tag>
      </div>

      <el-divider direction="vertical" />

      <el-switch :model-value="autoScroll" @update:model-value="$emit('update:autoScroll', $event)" size="small"
        inline-prompt :active-text="'自动滚动'" :inactive-text="'手动'" />

      <el-button size="small" type="danger" plain @click="$emit('clear-logs')">🗑 清空</el-button>

      <el-tooltip :content="connected ? '已连接' : '未连接'" placement="bottom">
        <div class="connection" :class="{ connected }">
          <span class="dot"></span>
          <span class="txt">{{ connected ? '已连接' : '未连接' }}</span>
        </div>
      </el-tooltip>
    </div>
  </header>
</template>

<script setup>
defineProps({
  connected: Boolean,
  autoScroll: Boolean,
  totalCount: Number,
  levelStats: {
    type: Object,
    default: () => ({ DEBUG: 0, INFO: 0, WARN: 0, ERROR: 0 })
  }
})

defineEmits(['scroll-to-bottom', 'show-device-manager', 'toggle-auto-scroll', 'clear-logs', 'update:autoScroll'])
</script>

<style scoped>
.app-header {
  flex-shrink: 0;
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: #fff;
  box-shadow: 0 4px 18px rgba(39, 15, 106, 0.25);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-right: 12px;
}

.logo-icon {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: rgba(255, 255, 255, .15);
  backdrop-filter: blur(6px);
  font-size: 18px;
}

.logo-text {
  font-weight: 700;
  letter-spacing: .3px;
  font-size: 16px;
}

.top-menu {
  flex: 1;
  background: transparent;
  border-bottom: none;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stats-chips {
  display: flex;
  align-items: center;
  gap: 6px;
}

.connection {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, .12);
  color: #fff;
  font-size: 12px;
  user-select: none;
}

.connection .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f59e0b;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, .15) inset;
}

.connection.connected .dot {
  background: #22c55e;
}

@media (max-width: 960px) {
  .stats-chips {
    display: none;
  }
}
</style>

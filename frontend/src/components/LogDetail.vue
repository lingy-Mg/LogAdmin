<template>
  <transition name="slide-fade">
    <div v-if="log" class="log-detail-panel">
      <div class="detail-header">
        <h3>📋 日志详情</h3>
        <el-button text @click="$emit('close')" class="close-btn">
          <el-icon size="18">
            <Close />
          </el-icon>
        </el-button>
      </div>

      <div class="detail-content">
        <!-- 基本信息 -->
        <div class="detail-section">
          <h4 class="section-title">基本信息</h4>
          <div class="detail-item">
            <span class="item-label">时间戳:</span>
            <span class="item-value">{{ formatFullTime(log.timestamp || log.ts) }}</span>
          </div>
          <div class="detail-item">
            <span class="item-label">日志级别:</span>
            <span class="item-value">
              <span class="level-badge" :class="(log.level || '').toLowerCase()">
                {{ log.level }}
              </span>
            </span>
          </div>
          <div class="detail-item">
            <span class="item-label">设备ID:</span>
            <span class="item-value device-id">{{ log.deviceId }}</span>
          </div>
          <div v-if="deviceAlias" class="detail-item">
            <span class="item-label">设备别名:</span>
            <span class="item-value">{{ deviceAlias }}</span>
          </div>
        </div>

        <!-- 消息内容 -->
        <div class="detail-section">
          <h4 class="section-title">消息内容</h4>
          <div class="message-box">{{ log.message || log.msg }}</div>
        </div>

        <!-- Unity 日志特有字段 -->
        <div v-if="log.app" class="detail-section">
          <h4 class="section-title">应用信息</h4>
          <div class="detail-item">
            <span class="item-label">应用名称:</span>
            <span class="item-value">{{ log.app }}</span>
          </div>
          <div v-if="log.platform" class="detail-item">
            <span class="item-label">运行平台:</span>
            <span class="item-value">{{ log.platform }}</span>
          </div>
          <div v-if="log.path" class="detail-item">
            <span class="item-label">路径标识:</span>
            <span class="item-value">{{ log.path }}</span>
          </div>
          <div v-if="log.source_type" class="detail-item">
            <span class="item-label">来源类型:</span>
            <span class="item-value">{{ log.source_type }}</span>
          </div>
        </div>

        <!-- Extra 扩展信息 -->
        <div v-if="log.extra && Object.keys(log.extra).length > 0" class="detail-section">
          <h4 class="section-title">扩展信息</h4>
          <div v-for="(value, key) in log.extra" :key="key" class="detail-item">
            <span class="item-label">{{ key }}:</span>
            <span class="item-value">{{ formatValue(value) }}</span>
          </div>
        </div>

        <!-- 原始数据 -->
        <div class="detail-section">
          <h4 class="section-title">原始数据 (JSON)</h4>
          <pre class="json-box">{{ JSON.stringify(log, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'
import { Close } from '@element-plus/icons-vue'
import { formatFullTime, formatValue } from '@/utils/format'

const props = defineProps({
  log: {
    type: Object,
    default: null
  },
  deviceAliases: {
    type: Object,
    default: () => ({})
  }
})

defineEmits(['close'])

const deviceAlias = computed(() => {
  return props.log ? props.deviceAliases[props.log.deviceId] : null
})
</script>

<style scoped>
.log-detail-panel {
  width: 480px;
  height: 100%;
  background: #1e293b;
  border-radius: 14px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, .5);
  border: 1px solid rgba(148, 163, 184, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 10;
}

.detail-header {
  flex-shrink: 0;
  padding: 16px 20px;
  background: linear-gradient(135deg, #334155 0%, #475569 100%);
  color: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.detail-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.close-btn {
  color: #e2e8f0 !important;
  padding: 4px;
}

.close-btn:hover {
  background: rgba(226, 232, 240, 0.1) !important;
}

.detail-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #1e293b;
}

.detail-content::-webkit-scrollbar {
  width: 6px;
}

.detail-content::-webkit-scrollbar-track {
  background: #0f172a;
  border-radius: 3px;
}

.detail-content::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 3px;
}

.detail-content::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: #a78bfa;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #334155;
}

.detail-item {
  display: flex;
  padding: 8px 0;
  border-bottom: 1px solid #334155;
  align-items: flex-start;
}

.detail-item:last-child {
  border-bottom: none;
}

.item-label {
  flex-shrink: 0;
  width: 100px;
  font-size: 13px;
  color: #94a3b8;
  font-weight: 600;
}

.item-value {
  flex: 1;
  font-size: 13px;
  color: #e2e8f0;
  word-break: break-all;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.item-value.device-id {
  color: #a78bfa;
  font-weight: 600;
}

.message-box {
  padding: 12px;
  background: #0f172a;
  border-radius: 8px;
  border: 1px solid #334155;
  font-size: 13px;
  line-height: 1.6;
  color: #cbd5e1;
  word-break: break-word;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.json-box {
  padding: 12px;
  background: #0f172a;
  border-radius: 8px;
  border: 1px solid #334155;
  font-size: 12px;
  line-height: 1.5;
  color: #cbd5e1;
  overflow-x: auto;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  margin: 0;
}

.json-box::-webkit-scrollbar {
  height: 6px;
}

.json-box::-webkit-scrollbar-track {
  background: #1e293b;
  border-radius: 3px;
}

.json-box::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 3px;
}

.level-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.level-badge.debug {
  background: #1e293b;
  color: #94a3b8;
  border: 1px solid #475569;
}

.level-badge.info {
  background: #064e3b;
  color: #6ee7b7;
  border: 1px solid #059669;
}

.level-badge.warn,
.level-badge.warning {
  background: #78350f;
  color: #fcd34d;
  border: 1px solid #f59e0b;
}

.level-badge.error,
.level-badge.fatal {
  background: #7f1d1d;
  color: #fca5a5;
  border: 1px solid #dc2626;
}

.slide-fade-enter-active {
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
}

.slide-fade-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.6, 1), opacity 0.25s ease;
}

.slide-fade-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

@media (max-width: 960px) {
  .log-detail-panel {
    width: 400px;
  }
}

@media (max-width: 768px) {
  .log-detail-panel {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    max-width: 400px;
    z-index: 1000;
  }
}
</style>

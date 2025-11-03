<template>
  <div class="log-container" ref="logContainer">
    <div v-for="log in logs" :key="log.id" class="log-line" :class="{ active: isSelected(log) }"
      @click="$emit('select', log)">
      <span class="log-text" :style="{ color: getLevelColor(log.level) }">
        <span class="log-time-part">[{{ formatTime(log.timestamp) }}]</span>
        <span class="log-level-part">[{{ log.level }}]</span>
        <span class="log-device-part" :title="log.deviceId">[{{ getDeviceDisplay(log.deviceId) }}]</span>
        <span class="log-message-part" v-html="highlightKeyword(log.message || log.msg)"></span>
      </span>
    </div>

    <div v-if="logs.length === 0" class="empty">
      <el-empty description="暂无日志数据" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { formatTime } from '@/utils/format'
import { getLevelColor } from '@/utils/log'
import { highlightKeyword } from '@/utils/string'

const props = defineProps({
  logs: {
    type: Array,
    default: () => []
  },
  selectedLog: {
    type: Object,
    default: null
  },
  deviceAliases: {
    type: Object,
    default: () => ({})
  },
  keyword: {
    type: String,
    default: ''
  }
})

defineEmits(['select'])

const logContainer = ref(null)

function isSelected(log) {
  return props.selectedLog?.id === log.id
}

function getDeviceDisplay(deviceId) {
  return props.deviceAliases[deviceId] || deviceId
}

// 暴露方法供父组件调用
defineExpose({
  scrollToBottom() {
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight
    }
  }
})
</script>

<style scoped>
.log-container {
  flex: 1;
  height: 100%;
  overflow-y: auto;
  border-radius: 14px;
  background: #1e1e1e;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  box-shadow: 0 10px 24px rgba(0, 0, 0, .18);
  padding: 16px 20px;
}

.log-container::-webkit-scrollbar {
  width: 8px;
}

.log-container::-webkit-scrollbar-track {
  background: #2d2d2d;
  border-radius: 4px;
}

.log-container::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 4px;
}

.log-container::-webkit-scrollbar-thumb:hover {
  background: #777;
}

.log-line {
  padding: 6px 0;
  border-bottom: 1px solid #2a2a2a;
  line-height: 1.75;
  transition: background .15s;
  cursor: pointer;
}

.log-line:hover {
  background: rgba(255, 255, 255, .035);
}

.log-line.active {
  background: rgba(139, 92, 246, 0.2);
  border-left: 3px solid #8b5cf6;
  padding-left: 8px;
}

.log-text {
  font-size: 13.5px;
  font-weight: 500;
  display: block;
}

.log-time-part {
  color: #94a3b8;
  margin-right: 8px;
}

.log-level-part {
  font-weight: 700;
  margin-right: 8px;
}

.log-device-part {
  color: #6ee7b7;
  font-weight: 700;
  margin-right: 8px;
  cursor: help;
}

.log-message-part {
  color: #cbd5e1;
  word-break: break-all;
}

.log-message-part :deep(mark) {
  background: #fbbf24;
  color: #1e293b;
  padding: 0 4px;
  border-radius: 3px;
  font-weight: 700;
}

.empty {
  display: grid;
  place-items: center;
  height: 100%;
}

.empty :deep(.el-empty__description) {
  color: #94a3b8;
}

.empty :deep(.el-empty__image svg) {
  fill: #475569;
}
</style>

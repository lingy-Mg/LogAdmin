<template>
  <div class="log-container-wrapper">
    <div class="log-container" ref="logContainer" @wheel="handleUserInteraction" @mousedown="handleUserInteraction"
      @keydown="handleUserInteraction">
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

    <!-- 自动滚动状态指示器 - 始终显示,根据状态显示不同内容 -->
    <transition name="fade">
      <div v-if="logs.length > 0" class="auto-scroll-indicator" :class="{ active: props.autoScroll }"
        @click="toggleAutoScroll">
        <el-icon>
          <Bottom v-if="props.autoScroll" />
          <Bottom v-else />
        </el-icon>
        <span v-if="props.autoScroll">自动滚动</span>
        <span v-else>已暂停</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { Bottom } from '@element-plus/icons-vue'
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
  },
  autoScroll: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['select', 'update:autoScroll'])

const logContainer = ref(null)
let scrollTimer = null
let userInteracted = false

function isSelected(log) {
  return props.selectedLog?.id === log.id
}

function getDeviceDisplay(deviceId) {
  return props.deviceAliases[deviceId] || deviceId
}

// 处理用户交互 - 退出自动滚动模式
function handleUserInteraction(event) {
  // 如果不是自动滚动模式,不处理
  if (!props.autoScroll) return

  // 鼠标滚轮向上、点击、键盘操作 -> 退出自动滚动
  if (
    (event.type === 'wheel' && event.deltaY < 0) || // 向上滚动
    event.type === 'mousedown' ||
    event.type === 'keydown'
  ) {
    emit('update:autoScroll', false)
    userInteracted = true
  }
}

// 切换自动滚动状态
function toggleAutoScroll() {
  emit('update:autoScroll', !props.autoScroll)
}

// 节流滚动函数 - 优化高速刷新时的性能
function scrollToBottomThrottled() {
  if (!props.autoScroll) return

  if (scrollTimer) {
    clearTimeout(scrollTimer)
  }

  scrollTimer = setTimeout(() => {
    if (logContainer.value && props.autoScroll) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight
    }
  }, 50) // 50ms 节流,高速刷新时避免过度滚动
}

// 强制立即滚动到底部
function scrollToBottom() {
  if (logContainer.value) {
    logContainer.value.scrollTop = logContainer.value.scrollHeight
  }
}

// 监听日志变化 - 自动滚动
watch(
  () => props.logs.length,
  () => {
    if (props.autoScroll) {
      nextTick(() => {
        scrollToBottomThrottled()
      })
    }
  }
)

// 监听自动滚动状态变化
watch(
  () => props.autoScroll,
  (newVal) => {
    if (newVal) {
      userInteracted = false
      nextTick(() => {
        scrollToBottom() // 开启时立即滚动到底部
      })
    }
  }
)

// 监听容器滚动 - 检测是否在底部
function handleScroll() {
  if (!logContainer.value) return

  const { scrollTop, scrollHeight, clientHeight } = logContainer.value
  const isAtBottom = scrollHeight - scrollTop - clientHeight < 10

  // 如果滚动到底部且当前不是自动滚动模式,自动开启
  if (isAtBottom && !props.autoScroll) {
    emit('update:autoScroll', true)
    userInteracted = false
    return
  }

  // 如果不在底部且是自动滚动模式且没有用户交互,退出自动滚动
  if (!isAtBottom && props.autoScroll && !userInteracted) {
    emit('update:autoScroll', false)
  }
}

onMounted(() => {
  if (logContainer.value) {
    logContainer.value.addEventListener('scroll', handleScroll)
  }
  if (props.autoScroll) {
    scrollToBottom()
  }
})

onUnmounted(() => {
  if (scrollTimer) {
    clearTimeout(scrollTimer)
  }
  if (logContainer.value) {
    logContainer.value.removeEventListener('scroll', handleScroll)
  }
})

// 暴露方法供父组件调用
defineExpose({
  scrollToBottom
})
</script>

<style scoped>
.log-container-wrapper {
  flex: 1;
  height: 100%;
  position: relative;
}

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

/* 自动滚动指示器 */
.auto-scroll-indicator {
  position: absolute;
  bottom: 24px;
  right: 24px;
  padding: 10px 16px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 100;
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

/* 激活状态 - 绿色 */
.auto-scroll-indicator.active {
  background: rgba(34, 197, 94, 0.95);
  color: white;
}

.auto-scroll-indicator.active:hover {
  background: rgba(34, 197, 94, 1);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(34, 197, 94, 0.6);
}

.auto-scroll-indicator.active .el-icon {
  animation: bounce 1s infinite;
}

/* 暂停状态 - 橙色 */
.auto-scroll-indicator:not(.active) {
  background: rgba(249, 115, 22, 0.95);
  color: white;
}

.auto-scroll-indicator:not(.active):hover {
  background: rgba(249, 115, 22, 1);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(249, 115, 22, 0.6);
}

.auto-scroll-indicator:not(.active) .el-icon {
  animation: pulse 1.5s infinite;
}

.auto-scroll-indicator .el-icon {
  font-size: 16px;
}

/* 移除旧的按钮样式 */

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-4px);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.6;
  }
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

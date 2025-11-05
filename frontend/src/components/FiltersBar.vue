<template>
  <section class="filters-bar">
    <div class="filters-form">
      <div class="filter-item">
        <label class="filter-label">设备</label>
        <el-select :model-value="filters.deviceId" @update:model-value="$emit('update:deviceId', $event)"
          placeholder="全部设备" clearable filterable size="small" class="filter-select filter-select-device">
          <el-option v-for="device in deviceList" :key="device.deviceId" :label="device.alias || device.deviceId"
            :value="device.deviceId" />
        </el-select>
      </div>

      <div class="filter-item">
        <label class="filter-label">级别</label>
        <el-select :model-value="filters.level" @update:model-value="$emit('update:level', $event)"
          placeholder="全部级别" clearable size="small" class="filter-select filter-select-level">
          <el-option label="DEBUG" value="DEBUG" />
          <el-option label="INFO" value="INFO" />
          <el-option label="WARN" value="WARN" />
          <el-option label="ERROR" value="ERROR" />
        </el-select>
      </div>

      <div class="filter-item filter-item-search">
        <label class="filter-label">搜索</label>
        <el-input :model-value="filters.keyword" @update:model-value="$emit('update:keyword', $event)"
          placeholder="关键词..." clearable size="small" class="filter-input">
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>
      </div>

      <div class="filter-actions">
        <el-button size="small" @click="$emit('reset')">重置</el-button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { Search } from '@element-plus/icons-vue'

defineProps({
  filters: {
    type: Object,
    required: true
  },
  deviceList: {
    type: Array,
    default: () => []
  }
})

defineEmits(['update:deviceId', 'update:level', 'update:keyword', 'reset'])
</script>

<style scoped>
.filters-bar {
  flex-shrink: 0;
  padding: 12px 16px;
}

.filters-form {
  width: 100%;
  padding: 14px 16px;
  border-radius: 14px;
  background: #1e293b;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(148, 163, 184, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: nowrap;
}

/* 筛选项容器 */
.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.filter-item-search {
  flex: 1;
  min-width: 200px;
}

/* 标签样式 */
.filter-label {
  color: #cbd5e1;
  font-size: 14px;
  white-space: nowrap;
  user-select: none;
}

/* 下拉框宽度 */
.filter-select-device {
  width: 220px;
}

.filter-select-level {
  width: 160px;
}

.filter-input {
  flex: 1;
  min-width: 200px;
}

/* 操作按钮区域 */
.filter-actions {
  flex-shrink: 0;
  margin-left: auto;
}

/* 输入框样式 */
.filters-form :deep(.el-input__wrapper) {
  background-color: #0f172a;
  box-shadow: 0 0 0 1px rgba(148, 163, 184, 0.2) inset;
  transition: all 0.2s;
}

.filters-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.4) inset;
}

.filters-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #6366f1 inset !important;
  background-color: #1e293b;
}

.filters-form :deep(.el-input__inner) {
  color: #e2e8f0 !important;
  height: 32px;
  line-height: 32px;
}

.filters-form :deep(.el-input__inner::placeholder) {
  color: #64748b !important;
}

/* Select 下拉框样式 */
.filters-form :deep(.el-select .el-input .el-input__inner) {
  color: #e2e8f0 !important;
}

.filters-form :deep(.el-select .el-input .el-select__caret) {
  color: #94a3b8;
}

.filters-form :deep(.el-select .el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 1px #6366f1 inset !important;
}

/* Select 选中值的文字颜色 */
.filters-form :deep(.el-select .el-select__selected-item) {
  color: #e2e8f0 !important;
}

.filters-form :deep(.el-select .el-select__placeholder) {
  color: #64748b !important;
}

/* 图标颜色 */
.filters-form :deep(.el-icon) {
  color: #94a3b8;
}

.filters-form :deep(.el-input__prefix) {
  color: #94a3b8;
}

.filters-form :deep(.el-input__suffix) {
  color: #94a3b8;
}

/* 清除按钮 */
.filters-form :deep(.el-input__clear) {
  color: #94a3b8;
}

.filters-form :deep(.el-input__clear:hover) {
  color: #e2e8f0;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .filters-form {
    flex-wrap: wrap;
  }
  
  .filter-item-search {
    flex: 1 1 100%;
    min-width: 100%;
  }
}
</style>

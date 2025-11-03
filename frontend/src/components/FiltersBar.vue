<template>
  <section class="filters-bar">
    <el-form :inline="true" label-width="56px" class="filters-form">
      <el-form-item label="设备">
        <el-select :model-value="filters.deviceId" @update:model-value="$emit('update:deviceId', $event)"
          placeholder="全部设备" clearable filterable size="small" style="min-width: 220px">
          <el-option v-for="device in deviceList" :key="device.deviceId" :label="device.alias || device.deviceId"
            :value="device.deviceId" />
        </el-select>
      </el-form-item>

      <el-form-item label="级别">
        <el-select :model-value="filters.level" @update:model-value="$emit('update:level', $event)"
          placeholder="全部级别" clearable size="small" style="min-width: 160px">
          <el-option label="DEBUG" value="DEBUG">
            <span class="level-badge debug">DEBUG</span>
          </el-option>
          <el-option label="INFO" value="INFO">
            <span class="level-badge info">INFO</span>
          </el-option>
          <el-option label="WARN" value="WARN">
            <span class="level-badge warn">WARN</span>
          </el-option>
          <el-option label="ERROR" value="ERROR">
            <span class="level-badge error">ERROR</span>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="搜索">
        <el-input :model-value="filters.keyword" @update:model-value="$emit('update:keyword', $event)"
          placeholder="关键词..." clearable size="small" style="min-width: 280px">
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item>
        <el-button size="small" @click="$emit('reset')">重置</el-button>
      </el-form-item>
    </el-form>
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
  gap: 12px;
  flex-wrap: wrap;
}

/* 表单项样式 */
.filters-form :deep(.el-form-item) {
  margin-bottom: 0;
}

.filters-form :deep(.el-form-item__label) {
  color: #cbd5e1;
  line-height: 32px;
}

.filters-form :deep(.el-form-item__content) {
  line-height: 32px;
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

.level-badge.warn {
  background: #78350f;
  color: #fcd34d;
  border: 1px solid #f59e0b;
}

.level-badge.error {
  background: #7f1d1d;
  color: #fca5a5;
  border: 1px solid #dc2626;
}
</style>

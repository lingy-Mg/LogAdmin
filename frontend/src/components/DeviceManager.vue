<template>
  <el-dialog :model-value="visible" @update:model-value="$emit('update:visible', $event)" title="📱 设备管理"
    width="720px" class="device-dialog">
    <div class="device-manager">
      <el-table :data="devices" style="width: 100%" size="small" border>
        <el-table-column prop="deviceId" label="设备ID" width="260">
          <template #default="scope">
            <el-tooltip :content="scope.row.deviceId" placement="top">
              <span class="device-id-cell">{{ scope.row.deviceId }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="设备别名">
          <template #default="scope">
            <el-input v-model="scope.row.alias" placeholder="输入设备别名" size="small"
              @blur="handleSaveAlias(scope.row)" @keyup.enter="handleSaveAlias(scope.row)">
              <template #append>
                <el-button size="small" @click="handleSaveAlias(scope.row)">保存</el-button>
              </template>
            </el-input>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <template #footer>
      <el-button @click="$emit('update:visible', false)">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
const props = defineProps({
  visible: Boolean,
  devices: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:visible', 'save-alias'])

function handleSaveAlias(device) {
  emit('save-alias', device.deviceId, device.alias)
}
</script>

<style scoped>
.device-dialog :deep(.el-dialog) {
  background-color: #1e293b;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.device-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #334155 0%, #475569 100%);
  color: #f1f5f9;
  padding: 16px;
  margin: 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
}

.device-dialog :deep(.el-dialog__title) {
  color: #f1f5f9;
  font-size: 16px;
  font-weight: 700;
}

.device-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: #e2e8f0;
}

.device-dialog :deep(.el-dialog__headerbtn .el-dialog__close:hover) {
  color: #fff;
}

.device-dialog :deep(.el-dialog__body) {
  padding: 16px;
  background-color: #1e293b;
}

.device-dialog :deep(.el-dialog__footer) {
  background-color: #1e293b;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

.device-dialog :deep(.el-table) {
  background-color: #0f172a;
  color: #e2e8f0;
}

.device-dialog :deep(.el-table th.el-table__cell) {
  background-color: #1e293b;
  color: #cbd5e1;
  border-color: #334155;
}

.device-dialog :deep(.el-table td.el-table__cell) {
  border-color: #334155;
  background-color: #0f172a;
  color: #e2e8f0;
}

.device-dialog :deep(.el-table tr) {
  background-color: #0f172a;
}

.device-dialog :deep(.el-table--border) {
  border-color: #334155;
}

.device-dialog :deep(.el-table--border::after),
.device-dialog :deep(.el-table--border::before) {
  background-color: #334155;
}

.device-dialog :deep(.el-table__inner-wrapper::before) {
  background-color: #334155;
}

.device-dialog :deep(.el-input__wrapper) {
  background-color: #1e293b;
  box-shadow: 0 0 0 1px rgba(148, 163, 184, 0.2) inset;
}

.device-dialog :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.4) inset;
}

.device-dialog :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #6366f1 inset !important;
}

.device-dialog :deep(.el-input__inner) {
  color: #e2e8f0;
}

.device-dialog :deep(.el-input__inner::placeholder) {
  color: #64748b;
}

.device-dialog :deep(.el-input-group__append) {
  background-color: #334155;
  border-color: rgba(148, 163, 184, 0.2);
  box-shadow: none;
}

.device-manager {
  padding: 6px 0;
}

.device-id-cell {
  display: inline-block;
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  color: #a78bfa;
}
</style>

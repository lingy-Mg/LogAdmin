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
.device-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: #fff;
  padding: 16px;
  margin: 0;
}

.device-dialog :deep(.el-dialog__title) {
  color: #fff;
  font-size: 16px;
  font-weight: 700;
}

.device-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: #fff;
}

.device-dialog :deep(.el-dialog__body) {
  padding: 16px;
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
  color: #409eff;
}
</style>

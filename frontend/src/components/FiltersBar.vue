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
  padding: 12px;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(31, 38, 135, 0.12);
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.level-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.level-badge.debug {
  background: #eef2f7;
  color: #64748b;
}

.level-badge.info {
  background: #ecfdf5;
  color: #059669;
}

.level-badge.warn {
  background: #fef3c7;
  color: #b45309;
}

.level-badge.error {
  background: #fee2e2;
  color: #b91c1c;
}
</style>

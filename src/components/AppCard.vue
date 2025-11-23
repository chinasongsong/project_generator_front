<template>
  <div class="app-card-info" @click="onClick">
    <a-avatar :size="40">
      <template v-if="app?.user?.userAvatar">
        <img :src="app.user.userAvatar" alt="avatar" />
      </template>
      <template v-else>
        <span class="avatar-placeholder">U</span>
      </template>
    </a-avatar>
    <div class="info-right">
      <div class="title" :title="app?.appName || '未命名应用'">{{ app?.appName || '未命名应用' }}</div>
      <div class="subtitle" :title="app?.user?.userName || '-'">{{ app?.user?.userName || '-' }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {PropType} from 'vue'

const props = defineProps({
  app: {
    type: Object as PropType<API.AppVO>,
    required: true,
  },
})

const emit = defineEmits<{ (e: 'click'): void }>()

const onClick = () => emit('click')
</script>

<style scoped>
.app-card-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-placeholder {
  display: block;
  width: 100%;
  height: 100%;
  background: #e5e6eb;
}

.info-right {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.title {
  font-size: 16px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.subtitle {
  margin-top: 2px;
  font-size: 13px;
  color: #888;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>



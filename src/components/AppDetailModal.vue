<template>
  <a-modal
    :open="open"
    @update:open="(v: boolean) => emit('update:open', v)"
    :title="app?.appName || '应用详情'"
    :footer="null"
    :destroyOnClose="true"
    :maskClosable="false"
    width="720px"
  >
    <div class="app-detail-modal">
      <div class="left">
        <div class="cover">
          <img v-if="app?.cover" :src="normalizedCover" alt="cover" @error="onImgError" />
          <div v-else class="cover-placeholder">暂无封面</div>
        </div>
      </div>
      <div class="right">
        <div class="row">
          <span class="label">应用名称</span>
          <span class="value" :title="app?.appName || '-'">{{ app?.appName || '-' }}</span>
        </div>
        <div class="row">
          <span class="label">创建者</span>
          <span class="value" :title="app?.user?.userName || '-'">{{ app?.user?.userName || '-' }}</span>
        </div>
        <div class="row">
          <span class="label">代码类型</span>
          <a-tag v-if="app?.codeGenType" color="blue">{{ app?.codeGenType }}</a-tag>
          <span v-else class="value">-</span>
        </div>
        <div class="row">
          <span class="label">优先级</span>
          <span class="value">{{ app?.priority ?? '-' }}</span>
        </div>
        <div class="row">
          <span class="label">初始提示词</span>
          <span class="value multiline">{{ app?.initPrompt || '-' }}</span>
        </div>
      </div>
    </div>
  </a-modal>

</template>

<script setup lang="ts">
import type {PropType} from 'vue'
import {computed} from 'vue'
import {useCover} from '@/composables/useCover'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  app: {
    type: Object as PropType<API.AppVO | null>,
    default: null,
  },
})

const emit = defineEmits<{ (e: 'update:open', v: boolean): void }>()

const { normalizedCover, onImgError } = useCover(computed(() => props.app?.cover || ''))
</script>

<style scoped>
.app-detail-modal {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 16px;
}

.cover {
  width: 100%;
  height: 180px;
  background: #f5f5f5;
  border: 1px solid #eee;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  color: #999;
  font-size: 14px;
}

.row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.label {
  width: 90px;
  color: #666;
}

.value {
  flex: 1;
  color: #333;
}

.multiline {
  white-space: pre-wrap;
}
</style>



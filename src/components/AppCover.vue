<template>
  <div class="app-cover" @click="emit('click')">
    <img
      v-if="cover"
      :src="normalizedCover"
      alt="cover"
      referrerpolicy="no-referrer"
      crossorigin="anonymous"
      @error="onImgError"
    />
    <div v-else class="app-cover-placeholder">
      <slot name="placeholder">无封面</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useCover} from '@/composables/useCover'

const props = defineProps({
  cover: {
    type: String,
    default: '',
  },
})

const emit = defineEmits<{ (e: 'click'): void }>()

const { normalizedCover, onImgError } = useCover(props.cover)
</script>

<style scoped>
.app-cover {
  height: 120px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.03);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.app-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.app-cover-placeholder {
  font-size: 48px;
  color: #d9d9d9;
}
</style>



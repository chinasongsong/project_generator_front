<template>
  <a-layout-footer class="global-footer">
    <div class="footer-content">
      <p class="copyright">
        © {{ currentYear }} AI零代码应用生成平台. All rights reserved.
      </p>
    </div>
  </a-layout-footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.global-footer {
  background: #f0f2f5;
  border-top: 1px solid #e8e8e8;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-content {
  text-align: center;
}

.copyright {
  margin: 0;
  color: #666;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .global-footer {
    height: 60px;
  }
  
  .copyright {
    font-size: 12px;
  }
}
</style> 
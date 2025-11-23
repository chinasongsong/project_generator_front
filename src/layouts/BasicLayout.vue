<template>
  <a-layout class="basic-layout">
    <!-- 头部导航 -->
    <GlobalHeader />

    <!-- 内容区域 -->
    <a-layout-content class="layout-content">
      <RouterView />
    </a-layout-content>

    <!-- 底部版权 -->
    <GlobalFooter />
  </a-layout>
</template>

<script setup lang="ts">
import {onMounted} from 'vue'
import {RouterView} from 'vue-router'
import GlobalHeader from '@/components/GlobalHeader.vue'
import GlobalFooter from '@/components/GlobalFooter.vue'
import {useUserStore} from '@/stores/user'

const userStore = useUserStore()

// 应用启动时恢复用户登录状态
onMounted(async () => {
  // 如果 store 中没有用户信息，尝试从后端恢复（会先检查 localStorage，然后验证后端 session）
  if (!userStore.loginUser) {
    await userStore.fetchLoginUser()
  }
})
</script>

<style scoped>
.basic-layout {
  min-height: 100vh;
}

.layout-content {
  padding: 24px;
  background: #fff;
  margin-top: 64px; /* 为固定头部留出空间 */
  margin-bottom: 70px; /* 为固定底部留出空间 */
  min-height: calc(100vh - 64px - 70px); /* 减去头部和底部的高度 */
}
</style>

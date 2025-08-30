<template>
  <a-layout-header class="global-header">
    <div class="header-content">
      <!-- 左侧 Logo 和标题 -->
      <div class="header-left">
        <div class="logo-container">
          <img src="/logo.png" alt="Logo" class="logo" />
          <h1 class="site-title">AI零代码应用生成平台</h1>
        </div>
      </div>
      
      <!-- 中间菜单 -->
      <div class="header-center">
        <a-menu
          v-model:selectedKeys="selectedKeys"
          mode="horizontal"
          :items="menuItems"
          class="header-menu"
          @click="handleMenuClick"
        />
      </div>
      
      <!-- 右侧用户信息 -->
      <div class="header-right">
        <a-button type="primary" @click="handleLogin">
          <template #icon>
            <UserOutlined />
          </template>
          登录
        </a-button>
      </div>
    </div>
  </a-layout-header>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { UserOutlined } from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()

// 选中的菜单项
const selectedKeys = ref<string[]>(['home'])

// 菜单配置
const menuItems = [
  {
    key: 'home',
    label: '首页',
    icon: '🏠'
  },
  {
    key: 'projects',
    label: '项目管理',
    icon: '📁'
  },
  {
    key: 'templates',
    label: '模板中心',
    icon: '📋'
  },
  {
    key: 'docs',
    label: '帮助文档',
    icon: '📚'
  }
]

// 监听路由变化，更新选中的菜单项
watch(() => route.name, (newRouteName) => {
  if (newRouteName) {
    selectedKeys.value = [newRouteName as string]
  }
}, { immediate: true })

// 菜单点击处理
const handleMenuClick = ({ key }: { key: string }) => {
  selectedKeys.value = [key]
  router.push({ name: key })
}

// 登录处理
const handleLogin = () => {
  console.log('用户点击登录')
  // TODO: 实现登录逻辑
}
</script>

<style scoped>
.global-header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 64px;
  line-height: 64px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 100%;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.site-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color:rgba(24, 97, 255, 0.83);
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.header-menu {
  border: none;
  background: transparent;
}

.header-right {
  display: flex;
  align-items: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
  }
  
  .site-title {
    font-size: 16px;
  }
  
  .header-menu {
    display: none;
  }
}

@media (max-width: 480px) {
  .site-title {
    display: none;
  }
}
</style> 
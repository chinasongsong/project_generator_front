<template>
  <a-layout-header class="header">
    <a-row :wrap="false">
      <!-- 左侧：Logo和标题 -->
      <a-col flex="300px">
        <RouterLink to="/">
          <div class="header-left">
            <img class="logo" src="/logo.png" alt="Logo" />
            <h1 class="site-title">AI零代码应用生成平台</h1>
          </div>
        </RouterLink>
      </a-col>
      <!-- 中间：导航菜单 -->
      <a-col flex="auto">
        <a-menu
          v-model:selectedKeys="selectedKeys"
          mode="horizontal"
          :items="menuItems"
          @click="handleMenuClick"
        />
      </a-col>
      <!-- 右侧：用户操作区域 -->
      <a-col>
        <div class="user-login-status">
          <div v-if="userStore.loginUser && userStore.loginUser.userName">
            <a-dropdown>
              <a-space>
                <a-avatar :src="userStore.loginUser.userAvatar">
                  <template v-if="!userStore.loginUser.userAvatar">
                    <UserOutlined />
                  </template>
                </a-avatar>
                {{ userStore.loginUser.userName }}
              </a-space>
              <template #overlay>
                <a-menu>
                  <a-menu-item @click="doLogout">
                    <LogoutOutlined />
                    退出登录
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
          <div v-else>
            <a-button type="primary" href="/user/login">登录</a-button>
          </div>
        </div>
      </a-col>
    </a-row>
  </a-layout-header>
</template>

<script setup lang="ts">
import { computed, h, ref } from 'vue'
import { useRouter } from 'vue-router'
import { type MenuProps, message } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'
import { userLogout } from '@/api/userController'
import {
  LogoutOutlined,
  UserOutlined,
  HomeOutlined,
  FolderOutlined,
  FileTextOutlined,
  BookOutlined,
  TeamOutlined,
  AppstoreOutlined,
} from '@ant-design/icons-vue'

const userStore = useUserStore()
const router = useRouter()

// 当前选中菜单
const selectedKeys = ref<string[]>(['/'])

// 监听路由变化，更新当前选中菜单
router.afterEach((to) => {
  selectedKeys.value = [to.path]
})

// 菜单配置项
const originItems = [
  {
    key: '/',
    icon: () => h(HomeOutlined),
    label: '首页',
    title: '首页',
  },
  {
    key: '/projects',
    icon: () => h(FolderOutlined),
    label: '项目管理',
    title: '项目管理',
  },
  {
    key: '/templates',
    icon: () => h(FileTextOutlined),
    label: '模板中心',
    title: '模板中心',
  },
  {
    key: '/docs',
    icon: () => h(BookOutlined),
    label: '帮助文档',
    title: '帮助文档',
  },
  {
    key: '/admin/users',
    icon: () => h(TeamOutlined),
    label: '用户管理',
    title: '用户管理',
  },
  {
    key: '/admin/apps',
    icon: () => h(AppstoreOutlined),
    label: '应用管理',
    title: '应用管理',
  },
]

// 过滤菜单项
const filterMenus = (menus = [] as MenuProps['items']) => {
  return menus?.filter((menu) => {
    const menuKey = menu?.key as string
    if (menuKey?.startsWith('/admin')) {
      const loginUser = userStore.loginUser
      if (!loginUser || loginUser.userRole !== 'admin') {
        return false
      }
    }
    return true
  })
}

// 展示在菜单的路由数组
const menuItems = computed<MenuProps['items']>(() => filterMenus(originItems))

// 处理菜单点击
const handleMenuClick: MenuProps['onClick'] = (e) => {
  const key = e.key as string
  selectedKeys.value = [key]
  // 跳转到对应页面
  if (key.startsWith('/')) {
    router.push(key)
  }
}

// 退出登录
const doLogout = async () => {
  try {
    const res = await userLogout()
    if (res.data.code === 0) {
      userStore.clearLoginUser()
      message.success('退出登录成功')
      await router.push('/user/login')
    } else {
      message.error('退出登录失败，' + res.data.message)
    }
  } catch (e) {
    message.error('退出登录失败，请检查网络连接')
  }
}
</script>

<style scoped>
.header {
  background: #fff;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 64px;
  line-height: 64px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  height: 32px;
  width: 32px;
  object-fit: contain;
}

.site-title {
  margin: 0;
  font-size: 18px;
  color: rgba(24, 97, 255, 0.83);
  font-weight: 600;
}

/* 让中间导航菜单居中 */
.ant-menu-horizontal {
  border-bottom: none !important;
  display: flex;
  justify-content: center;
  width: 100%;
}

.user-login-status {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .header {
    padding: 0 16px;
  }
  .site-title {
    font-size: 16px;
  }
  .ant-menu-horizontal {
    display: none;
  }
}

@media (max-width: 480px) {
  .site-title {
    display: none;
  }
}
</style>

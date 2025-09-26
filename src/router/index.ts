import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/projects',
      name: 'projects',
      component: () => import('../views/ProjectsView.vue'),
    },
    {
      path: '/templates',
      name: 'templates',
      component: () => import('../views/TemplatesView.vue'),
    },
    {
      path: '/docs',
      name: 'docs',
      component: () => import('../views/DocsView.vue'),
    },
    {
      path: '/user/login',
      name: 'userLogin',
      component: () => import('../pages/UserLogin.vue'),
    },
    {
      path: '/user/register',
      name: 'userRegister',
      component: () => import('../pages/UserRegister.vue'),
    },
    {
      path: '/admin/users',
      name: 'adminUsers',
      component: () => import('../pages/AdminUsers.vue'),
      meta: { requiresAdmin: true },
    },
  ],
})

// 路由守卫：仅管理员可访问标记了 requiresAdmin 的路由
router.beforeEach(async (to, from, next) => {
  if (to.meta && (to.meta as any).requiresAdmin) {
    // 动态引入，以避免循环依赖
    const { useUserStore } = await import('@/stores/user')
    const store = useUserStore()
    // 如果还没有用户信息，尝试获取一次
    if (!store.loginUser) {
      await store.fetchLoginUser()
    }
    if (store.loginUser?.userRole === 'admin') {
      next()
    } else {
      next('/user/login')
    }
  } else {
    next()
  }
})

export default router

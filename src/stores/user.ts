import {defineStore} from 'pinia'
import {getLoginUser} from '@/api/userController'

// 从 localStorage 恢复用户信息的辅助函数
const getCachedUser = (): API.LoginUserVO | null => {
  try {
    const cached = localStorage.getItem('userInfo')
    if (cached) {
      return JSON.parse(cached) as API.LoginUserVO
    }
  } catch (_) {
    // 解析失败，清除无效缓存
    localStorage.removeItem('userInfo')
  }
  return null
}

export const useUserStore = defineStore('user', {
  state: () => ({
    // 初始化时从 localStorage 恢复用户信息（用于快速显示，后续会验证后端 session）
    loginUser: getCachedUser(),
    loading: false as boolean,
  }),
  actions: {
    setLoginUser(user: API.LoginUserVO | null) {
      this.loginUser = user
      if (user) {
        localStorage.setItem('userInfo', JSON.stringify(user))
      } else {
        localStorage.removeItem('userInfo')
      }
    },
    clearLoginUser() {
      this.setLoginUser(null)
    },
    async fetchLoginUser() {
      try {
        this.loading = true
        // 先尝试从本地恢复
        const cached = localStorage.getItem('userInfo')
        if (cached && !this.loginUser) {
          try {
            this.loginUser = JSON.parse(cached) as API.LoginUserVO
          } catch (_) {}
        }
        const { data } = await getLoginUser()
        if (data?.code === 0) {
          this.setLoginUser((data.data || null) as API.LoginUserVO | null)
        } else {
          this.clearLoginUser()
        }
      } finally {
        this.loading = false
      }
    },
  },
})

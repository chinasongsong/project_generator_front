import { defineStore } from 'pinia'
import { getLoginUser } from '@/api/userController'

export const useUserStore = defineStore('user', {
  state: () => ({
    loginUser: null as API.LoginUserVO | null,
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
        }
      } finally {
        this.loading = false
      }
    },
  },
})

<template>
  <div class="login-container">
    <div class="login-form">
      <div class="login-header">
        <h1>用户登录</h1>
        <p>欢迎回到AI零代码应用生成平台</p>
      </div>

      <a-form
        :model="loginForm"
        :rules="loginRules"
        @finish="handleLogin"
        class="login-form-content"
      >
        <a-form-item name="userAccount">
          <a-input v-model:value="loginForm.userAccount" placeholder="请输入用户名" size="large">
            <template #prefix>
              <UserOutlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item name="userPassword">
          <a-input-password
            v-model:value="loginForm.userPassword"
            placeholder="请输入密码"
            size="large"
          >
            <template #prefix>
              <LockOutlined />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item>
          <a-button type="primary" html-type="submit" size="large" :loading="loading" block
            >登录</a-button
          >
        </a-form-item>
      </a-form>

      <div class="login-footer">
        <p>
          还没有账号？
          <a @click="goToRegister">立即注册</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { userLogin } from '@/api/userController'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const loginForm = ref<API.UserLoginRequest>({
  userAccount: '',
  userPassword: '',
})

const loading = ref(false)

const loginRules = {
  userAccount: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 4, max: 20, message: '用户名长度在4到20个字符', trigger: 'blur' },
  ],
  userPassword: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, max: 20, message: '密码长度在8到20个字符', trigger: 'blur' },
  ],
}

const handleLogin = async () => {
  try {
    loading.value = true
    const { data } = await userLogin(loginForm.value)
    if (data?.code === 0) {
      message.success('登录成功')
      // 立即更新全局用户状态（Header 可即时响应）
      userStore.setLoginUser((data.data || null) as API.LoginUserVO | null)
      // 保留本地存储由 store 处理
      router.push('/')
    } else {
      message.error(data?.message || '登录失败')
    }
  } catch (error) {
    message.error('登录失败，请检查网络连接')
  } finally {
    loading.value = false
  }
}

const goToRegister = () => {
  router.push('/user/register')
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-form {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h1 {
  color: #1890ff;
  margin-bottom: 8px;
  font-size: 28px;
  font-weight: 600;
}

.login-header p {
  color: #666;
  margin: 0;
  font-size: 14px;
}

.login-form-content {
  margin-bottom: 24px;
}

.login-footer {
  text-align: center;
}

.login-footer p {
  color: #666;
  margin: 0;
  font-size: 14px;
}

.login-footer a {
  color: #1890ff;
  text-decoration: none;
  cursor: pointer;
}

.login-footer a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .login-form {
    padding: 24px;
    margin: 16px;
  }

  .login-header h1 {
    font-size: 24px;
  }
}
</style>

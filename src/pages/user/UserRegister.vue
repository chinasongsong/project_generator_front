<template>
  <div class="register-container">
    <div class="register-form">
      <div class="register-header">
        <h1>用户注册</h1>
        <p>创建您的账号，开启AI零代码之旅</p>
      </div>

      <a-form :model="form" :rules="rules" @finish="handleRegister" class="register-form-content">
        <a-form-item name="userAccount">
          <a-input v-model:value="form.userAccount" placeholder="请输入用户名" size="large" />
        </a-form-item>

        <a-form-item name="userPassword">
          <a-input-password
            v-model:value="form.userPassword"
            placeholder="请输入密码"
            size="large"
          />
        </a-form-item>

        <a-form-item name="checkPassword">
          <a-input-password
            v-model:value="form.checkPassword"
            placeholder="请再次输入密码"
            size="large"
          />
        </a-form-item>

        <a-form-item>
          <a-button type="primary" html-type="submit" size="large" :loading="loading" block>
            注册
          </a-button>
        </a-form-item>

        <div class="register-footer">
          <p>已有账号？<a @click="goToLogin">去登录</a></p>
        </div>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {message} from 'ant-design-vue'
import {userRegister} from '@/api/userController'

const router = useRouter()

const form = ref<API.UserRegisterRequest>({
  userAccount: '',
  userPassword: '',
  checkPassword: '',
})

const loading = ref(false)

const rules = {
  userAccount: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 4, max: 20, message: '用户名长度在4到20个字符', trigger: 'blur' },
  ],
  userPassword: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, max: 20, message: '密码长度在8到20个字符', trigger: 'blur' },
  ],
  checkPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (_: any, value: string) => {
        if (!value) return Promise.reject('请再次输入密码')
        if (value !== form.value.userPassword) return Promise.reject('两次输入的密码不一致')
        return Promise.resolve()
      },
      trigger: 'blur',
    },
  ],
}

const handleRegister = async () => {
  try {
    loading.value = true
    const { data } = await userRegister(form.value)
    if (data?.code === 0) {
      message.success('注册成功，请登录')
      router.push('/user/login')
    } else {
      message.error(data?.message || '注册失败')
    }
  } catch (e) {
    message.error('注册失败，请检查网络连接')
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/user/login')
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-form {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.register-header {
  text-align: center;
  margin-bottom: 32px;
}

.register-header h1 {
  color: #1890ff;
  margin-bottom: 8px;
  font-size: 28px;
  font-weight: 600;
}

.register-header p {
  color: #666;
  margin: 0;
  font-size: 14px;
}

.register-form-content {
  margin-bottom: 24px;
}

.register-footer {
  text-align: center;
}

.register-footer p {
  color: #666;
  margin: 0;
  font-size: 14px;
}

.register-footer a {
  color: #1890ff;
  text-decoration: none;
  cursor: pointer;
}

.register-footer a:hover {
  text-decoration: underline;
}
</style>

<template>
  <div class="app-edit-view">
    <a-card title="编辑应用" :loading="loading">
      <a-form
        :model="form"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 20 }"
        @submit.prevent
      >
        <a-form-item label="应用名称" required>
          <a-input v-model:value="form.appName" placeholder="请输入应用名称" />
        </a-form-item>

        <a-form-item label="应用封面">
          <a-input v-model:value="form.cover" placeholder="请输入封面图URL" />
          <div v-if="form.cover" class="cover-preview">
            <img :src="form.cover" alt="cover" @error="handleImageError" />
          </div>
        </a-form-item>

        <a-form-item label="初始提示词">
          <a-textarea
            v-model:value="form.initPrompt"
            :rows="4"
            placeholder="请输入初始提示词"
            :disabled="true"
          />
        </a-form-item>

        <a-form-item label="代码类型">
          <a-input v-model:value="form.codeGenType" placeholder="代码类型" :disabled="true" />
        </a-form-item>

        <a-form-item label="部署密钥">
          <a-input v-model:value="form.deployKey" placeholder="部署密钥" :disabled="true" />
        </a-form-item>

        <a-form-item>
          <a-space>
            <a-button type="primary" :loading="submitting" @click="handleSubmit">
              保存
            </a-button>
            <a-button @click="handleCancel">取消</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'
import { getAppById, getAppVoById, updateApp, deleteApp } from '@/api/appController'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const appId = ref<number>(Number(route.params.id))
const loading = ref(false)
const submitting = ref(false)

const form = reactive({
  id: undefined as number | undefined,
  appName: '',
  cover: '',
  initPrompt: '',
  codeGenType: '',
  deployKey: '',
})

// 获取应用信息
const fetchAppInfo = async () => {
  try {
    loading.value = true
    const { data } = await getAppVoById({ id: appId.value })
    if (data?.code === 0 && data.data) {
      const app = data.data
      // 检查权限
      if (userStore.loginUser?.userRole !== 'admin' && app.userId !== userStore.loginUser?.id) {
        message.error('无权限访问此应用')
        router.back()
        return
      }

      // 填充表单
      form.id = app.id
      form.appName = app.appName || ''
      form.cover = app.cover || ''
      form.initPrompt = app.initPrompt || ''
      form.codeGenType = app.codeGenType || ''
      form.deployKey = app.deployKey || ''
    } else {
      message.error(data?.message || '获取应用信息失败')
      router.back()
    }
  } catch (e) {
    message.error('获取应用信息失败，请检查网络连接')
    router.back()
  } finally {
    loading.value = false
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!form.appName.trim()) {
    message.warning('请输入应用名称')
    return
  }

  try {
    submitting.value = true
    const { data } = await updateApp({
      id: form.id,
      appName: form.appName,
    })

    if (data?.code === 0) {
      message.success('保存成功')
      router.back()
    } else {
      message.error(data?.message || '保存失败')
    }
  } catch (e) {
    message.error('保存失败，请检查网络连接')
  } finally {
    submitting.value = false
  }
}

// 取消
const handleCancel = () => {
  router.back()
}

// 图片加载错误
const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
}

onMounted(() => {
  fetchAppInfo()
})
</script>

<style scoped>
.app-edit-view {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

.cover-preview {
  margin-top: 12px;
  max-width: 300px;
}

.cover-preview img {
  width: 100%;
  height: auto;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
}
</style>

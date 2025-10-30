<template>
  <div class="home-view">
    <!-- 用户提示词输入框 -->
    <div class="prompt-section">
      <div class="prompt-container">
        <a-input
          v-model:value="promptText"
          placeholder="输入你的应用需求，例如：创建一个在线图书管理系统..."
          size="large"
          :disabled="loading"
          @pressEnter="handleCreateApp"
        >
          <template #suffix>
            <a-button
              type="primary"
              :loading="loading"
              @click="handleCreateApp"
              :disabled="!promptText.trim()"
            >
              创建应用
            </a-button>
          </template>
        </a-input>
      </div>
    </div>

    <!-- 我的应用分页列表 -->
    <div class="apps-section">
      <h2 class="section-title">
        <FolderOutlined /> 我的应用
      </h2>
      <a-row :gutter="[16, 16]">
        <a-col :span="6" v-for="app in myApps" :key="app.id">
          <a-card hoverable class="app-card">
            <template #cover>
              <div class="app-cover">
                <img
                  v-if="app.cover"
                  :src="getCoverUrl(app.cover)"
                  alt="cover"
                  referrerpolicy="no-referrer"
                  crossorigin="anonymous"
                  @error="handleImgError"
                />
                <div v-else class="app-cover-placeholder">
                  <FileTextOutlined />
                </div>
              </div>
            </template>
            <AppCard :app="app" @click="handleViewApp(app.id!, true)" />
            <div class="app-actions">
              <a-button type="link" size="small" @click.stop="handleViewApp(app.id!, true)">查看对话</a-button>
              <a-button
                v-if="app.deployKey"
                type="link"
                size="small"
                @click.stop="handleViewDeployedApp(app.deployKey!)"
              >
                查看作品
              </a-button>
              <a-button type="link" size="small" @click.stop="handleEditApp(app.id!)">编辑</a-button>
              <a-popconfirm
                title="确认删除此应用吗？"
                @confirm="handleDeleteApp(app.id!)"
              >
                <a-button type="link" size="small" danger @click.stop>删除</a-button>
              </a-popconfirm>
            </div>
          </a-card>
        </a-col>
      </a-row>
      <div v-if="myApps.length === 0" class="empty-state">
        <a-empty description="暂无应用，开始创建你的第一个应用吧！" />
      </div>
      <div class="pagination-wrapper">
        <a-pagination
          v-if="myTotal > 0"
          v-model:current="myPageNum"
          v-model:page-size="myPageSize"
          :total="myTotal"
          :page-size-options="['6', '12', '24']"
          show-size-changer
          @change="fetchMyApps"
          @showSizeChange="onMyPageSizeChange"
        />
      </div>
    </div>

    <a-divider />

    <!-- 精选应用分页列表 -->
    <div class="apps-section">
      <h2 class="section-title">
        <StarOutlined /> 精选应用
      </h2>
      <a-row :gutter="[16, 16]">
        <a-col :span="6" v-for="app in featuredApps" :key="app.id">
          <a-card hoverable class="app-card">
            <template #cover>
              <div class="app-cover" @click="handleViewApp(app.id!, true)">
                <img
                  v-if="app.cover"
                  :src="getCoverUrl(app.cover)"
                  alt="cover"
                  referrerpolicy="no-referrer"
                  crossorigin="anonymous"
                  @error="handleImgError"
                />
                <div v-else class="app-cover-placeholder">
                  <FileTextOutlined />
                </div>
              </div>
            </template>
            <AppCard :app="app" @click="handleViewApp(app.id!, true)" />
            <div class="app-actions">
              <a-button type="link" size="small" @click.stop="handleViewApp(app.id!, true)">查看对话</a-button>
              <a-button
                v-if="app.deployKey"
                type="link"
                size="small"
                @click.stop="handleViewDeployedApp(app.deployKey!)"
              >
                查看作品
              </a-button>
            </div>
          </a-card>
        </a-col>
      </a-row>
      <div v-if="featuredApps.length === 0" class="empty-state">
        <a-empty description="暂无精选应用" />
      </div>
      <div class="pagination-wrapper">
        <a-pagination
          v-if="featuredTotal > 0"
          v-model:current="featuredPageNum"
          v-model:page-size="featuredPageSize"
          :total="featuredTotal"
          :page-size-options="['6', '12', '24']"
          show-size-changer
          @change="fetchFeaturedApps"
          @showSizeChange="onFeaturedPageSizeChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { FolderOutlined, FileTextOutlined, StarOutlined } from '@ant-design/icons-vue'
import AppCard from '@/components/AppCard.vue'
import { useUserStore } from '@/stores/user'
import { addApp, listMyAppVoByPage, listFeaturedAppVoByPage, deleteApp } from '@/api/appController'

const router = useRouter()
const userStore = useUserStore()

// 提示词输入
const promptText = ref('')
const loading = ref(false)

// 我的应用分页
const myApps = ref<API.AppVO[]>([])
const myPageNum = ref(1)
const myPageSize = ref(6)
const myTotal = ref(0)

// 精选应用分页
const featuredApps = ref<API.AppVO[]>([])
const featuredPageNum = ref(1)
const featuredPageSize = ref(6)
const featuredTotal = ref(0)

// 创建应用
const handleCreateApp = async () => {
  if (!promptText.value.trim()) {
    message.warning('请输入应用需求')
    return
  }

  if (!userStore.loginUser) {
    message.warning('请先登录')
    router.push('/user/login')
    return
  }

  try {
    loading.value = true
    const { data } = await addApp({
      initPrompt: promptText.value.trim(),
    })

    if (data?.code === 0 && data.data) {
      message.success('应用创建成功')
      // 跳转到对话页面
      router.push(`/app/chat/${String(data.data)}`)
    } else {
      message.error(data?.message || '创建应用失败')
    }
  } catch (e) {
    message.error('创建应用失败，请检查网络连接')
  } finally {
    loading.value = false
  }
}

// 查看应用详情
const handleViewApp = (appId: number, isView = false) => {
  const url = isView ? `/app/chat/${appId}?view=1` : `/app/chat/${appId}`
  router.push(url)
}

// 查看部署的应用作品
const handleViewDeployedApp = (deployKey: string) => {
  const deployUrl = `http://localhost:8088/${deployKey}`
  window.open(deployUrl, '_blank')
}

// 编辑应用
const handleEditApp = (appId: number) => {
  router.push(`/app/edit/${appId}`)
}

// 删除应用
const handleDeleteApp = async (appId: number) => {
  try {
    const { data } = await deleteApp({ id: appId })
    if (data?.code === 0) {
      message.success('删除成功')
      fetchMyApps()
    } else {
      message.error(data?.message || '删除失败')
    }
  } catch (e) {
    message.error('删除失败，请检查网络连接')
  }
}

// 获取我的应用列表
const fetchMyApps = async () => {
  if (!userStore.loginUser) {
    myApps.value = []
    myTotal.value = 0
    return
  }

  try {
    const { data } = await listMyAppVoByPage({
      pageNum: myPageNum.value,
      pageSize: myPageSize.value,
    })

    if (data?.code === 0) {
      myApps.value = data.data?.records || []
      myTotal.value = data.data?.totalRow || 0
    } else {
      message.error(data?.message || '获取应用列表失败')
    }
  } catch (e) {
    message.error('获取应用列表失败，请检查网络连接')
  }
}

// 我的应用分页大小变化
const onMyPageSizeChange = (_: number, size: number) => {
  myPageSize.value = size
  myPageNum.value = 1
  fetchMyApps()
}

// 获取精选应用列表
const fetchFeaturedApps = async () => {
  try {
    const { data } = await listFeaturedAppVoByPage({
      pageNum: featuredPageNum.value,
      pageSize: featuredPageSize.value,
    })

    if (data?.code === 0) {
      featuredApps.value = data.data?.records || []
      featuredTotal.value = data.data?.totalRow || 0
    } else {
      message.error(data?.message || '获取精选应用失败')
    }
  } catch (e) {
    message.error('获取精选应用失败，请检查网络连接')
  }
}

// 精选应用分页大小变化
const onFeaturedPageSizeChange = (_: number, size: number) => {
  featuredPageSize.value = size
  featuredPageNum.value = 1
  fetchFeaturedApps()
}

onMounted(() => {
  fetchMyApps()
  fetchFeaturedApps()
})

// 规范化封面图链接，兼容 GitHub 仓库图片直链
const getCoverUrl = (url?: string) => {
  if (!url) return ''
  let u = url.trim()
  // 将 github.com/.../blob/... 转为 raw.githubusercontent.com/.../...
  if (u.includes('github.com') && !u.includes('raw.githubusercontent.com')) {
    if (u.includes('/blob/')) {
      u = u
        .replace('https://github.com/', 'https://raw.githubusercontent.com/')
        .replace('http://github.com/', 'https://raw.githubusercontent.com/')
        .replace('/blob/', '/')
      return u
    }
    // 对非 blob 链接，补充 ?raw=1 以获取原始文件
    if (!/[?&]raw=1\b/.test(u)) {
      u += (u.includes('?') ? '&' : '?') + 'raw=1'
    }
  }
  return u
}

// 图片加载失败时回退到默认图
const handleImgError = (e: Event) => {
  const img = e.target as HTMLImageElement
  if (!img) return
  // 防止无限触发
  img.onerror = null
  img.src = '/logo.png'
}
</script>

<style scoped>
.home-view {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.prompt-section {
  margin-bottom: 40px;
}

.prompt-container {
  max-width: 800px;
  margin: 0 auto;
}

.prompt-container :deep(.ant-input-affix-wrapper) {
  border-radius: 8px;
}

.prompt-container :deep(.ant-input) {
  padding-right: 120px;
}

.apps-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #1890ff;
  display: flex;
  align-items: center;
  gap: 8px;
}

.app-card {
  cursor: pointer;
  transition: all 0.3s;
}

.app-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.app-cover {
  height: 120px;
  overflow: hidden;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.app-cover-placeholder {
  font-size: 48px;
  color: #d9d9d9;
}

.app-title {
  font-size: 16px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-description {
  font-size: 14px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.5;
  height: 42px;
}

.empty-state {
  padding: 40px 0;
}

.pagination-wrapper {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

@media (max-width: 1200px) {
  .home-view :deep(.ant-col-6) {
    flex: 0 0 33.333333%;
    max-width: 33.333333%;
  }
}

@media (max-width: 768px) {
  .home-view :deep(.ant-col-6) {
    flex: 0 0 50%;
    max-width: 50%;
  }

  .prompt-container {
    padding: 0 16px;
  }
}

@media (max-width: 480px) {
  .home-view :deep(.ant-col-6) {
    flex: 0 0 100%;
    max-width: 100%;
  }
}

.app-actions {
  padding-top: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.app-cover {
  cursor: pointer;
}

.app-title,
.app-description {
  cursor: pointer;
}

.app-title:hover,
.app-description:hover {
  color: #1890ff;
}
</style>

<template>
  <div class="home-view">
    <!-- 主页 SLOGAN -->
    <div class="hero">
      <h1 class="hero-title">AI 应用生成平台</h1>
      <p class="hero-subtitle">一句话轻松创建网站应用</p>
    </div>

    <!-- 用户提示词输入框 -->
    <div class="prompt-section">
      <div class="prompt-container">
        <div class="prompt-input-wrapper">
          <a-textarea
            v-model:value="promptText"
            placeholder="输入你的应用需求，例如：创建一个在线图书管理系统..."
            :rows="4"
            :disabled="loading"
            @keydown.enter.prevent="handleCreateApp"
          />
          <a-tooltip title="发送">
            <a-button
              class="send-button"
              type="primary"
              :loading="loading"
              @click="handleCreateApp"
              :disabled="!promptText.trim()"
            >
              <template #icon>
                <ArrowRightOutlined/>
              </template>
            </a-button>
          </a-tooltip>
        </div>

        <!-- 快捷提示词示例 -->
        <div class="quick-prompts">
          <div
            v-for="(item, idx) in quickPrompts"
            :key="idx"
            class="quick-prompt-item"
            @click="applyQuickPrompt(item.content)"
          >
            <div class="qp-title">{{ item.title }}</div>
            <div class="qp-content">{{ item.preview }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 我的应用分页列表 -->
    <div class="apps-section">
      <h2 class="section-title">
        <FolderOutlined/>
        我的应用
      </h2>
      <a-row :gutter="[16, 16]">
        <a-col :span="6" v-for="app in myApps" :key="app.id">
          <a-card hoverable class="app-card">
            <template #cover>
              <AppCover :cover="app.cover || ''" @click="handleViewApp(app.id, true)">
                <template #placeholder>
                  <FileTextOutlined/>
                </template>
              </AppCover>
            </template>
            <AppCard :app="app" @click="handleViewApp(app.id, true)"/>
            <div class="app-actions">
              <a-button type="link" size="small" @click.stop="handleViewApp(app.id, true)">
                查看对话
              </a-button>
              <a-button
                v-if="app.deployKey"
                type="link"
                size="small"
                @click.stop="handleViewDeployedApp(app.deployKey)"
              >
                查看作品
              </a-button>
              <a-button type="link" size="small" @click.stop="handleEditApp(app.id)">编辑</a-button>
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
        <a-empty description="暂无应用，开始创建你的第一个应用吧！"/>
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

    <a-divider/>

    <!-- 精选应用分页列表 -->
    <div class="apps-section">
      <h2 class="section-title">
        <StarOutlined/>
        精选应用
      </h2>
      <a-row :gutter="[16, 16]">
        <a-col :span="6" v-for="app in featuredApps" :key="app.id">
          <a-card hoverable class="app-card">
            <template #cover>
              <AppCover :cover="app.cover || ''" @click="handleViewApp(app.id!, true)">
                <template #placeholder>
                  <FileTextOutlined/>
                </template>
              </AppCover>
            </template>
            <AppCard :app="app" @click="handleViewApp(app.id!, true)"/>
            <div class="app-actions">
              <a-button type="link" size="small" @click.stop="handleViewApp(app.id!, true)">
                查看对话
              </a-button>
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
        <a-empty description="暂无精选应用"/>
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
import {ref, onMounted} from 'vue'
import {useRouter} from 'vue-router'
import {message} from 'ant-design-vue'
import {
  FolderOutlined,
  FileTextOutlined,
  StarOutlined,
  ArrowRightOutlined
} from '@ant-design/icons-vue'
import AppCard from '@/components/AppCard.vue'
import AppCover from '@/components/AppCover.vue'
import {useUserStore} from '@/stores/user'
import {addApp, listMyAppVoByPage, listFeaturedAppVoByPage, deleteApp} from '@/api/appController'

const router = useRouter()
const userStore = useUserStore()

// 提示词输入
const promptText = ref('')
const loading = ref(false)

// 快捷提示词
const quickPrompts = ref([
  {
    title: '企业官网（响应式）',
    content:
      '请为一家名为“星航科技”的AI解决方案公司生成响应式企业官网，包含首页、产品与解决方案、成功案例、关于我们、联系我们等5个页面；顶部有固定导航与LOGO，主色为深蓝与青色渐变；首页有大幅Hero区、客户Logo墙、优势卡片与CTA按钮；代码需语义化，含基础SEO元信息。',
    preview:
      '星航科技AI企业官网：5页、深蓝-青色渐变、固定导航、Hero、Logo墙、优势卡片、CTA、语义化+SEO。',
  },
  {
    title: '在线课程着陆页',
    content:
      '生成一个推广“前端工程化”在线课程的单页着陆页，包含课程亮点、讲师介绍、学员评价、常见问题、价格与报名区域；支持移动端；加入倒计时组件和回到顶部；主色为紫色系渐变，按钮突出对比；使用整洁卡片与图标网格展示要点。',
    preview:
      '课程着陆页：亮点/讲师/评价/FAQ/价格报名，紫色渐变，倒计时+回到顶部，移动端友好。',
  },
  {
    title: '科技博客（暗色主题）',
    content:
      '创建一个暗色主题的技术博客模板，包含首页文章列表、文章详情、关于、标签归档；首页卡片式列表，支持标签过滤与分页；详情支持代码高亮和目录锚点；头部粘性导航，底部备案位；采用灰黑+蓝绿点缀的赛博风格。',
    preview:
      '暗色科技博客：列表/详情/关于/标签，代码高亮与目录锚点，赛博配色与粘性导航。',
  },
  {
    title: 'SaaS 仪表盘',
    content:
      '生成一个SaaS业务管理仪表盘，包含数据总览（折线/柱状/饼图）、用户列表、订单管理、设置页面；支持侧边导航与顶部搜索；主题明亮简洁，图表区留白合理；组件模块化，表格含筛选与分页；自适应布局。',
    preview:
      'SaaS仪表盘：总览图表、用户/订单/设置，侧边栏+顶部搜索，明亮风格，自适应布局。',
  },
])

const applyQuickPrompt = (text: string) => {
  promptText.value = text
}

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
    const {data} = await addApp({
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
  const deployDomain = (import.meta as any).env?.VITE_DEPLOY_DOMAIN || 'http://localhost:8088'
  const base = String(deployDomain).replace(/\/$/, '')
  const deployUrl = `${base}/${deployKey}`
  window.open(deployUrl, '_blank')
}

// 编辑应用
const handleEditApp = (appId: number) => {
  router.push(`/app/edit/${appId}`)
}

// 删除应用
const handleDeleteApp = async (appId: number) => {
  try {
    const {data} = await deleteApp({id: appId})
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
    const {data} = await listMyAppVoByPage({
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
    const {data} = await listFeaturedAppVoByPage({
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

// 封面展示逻辑已抽象到 AppCover 组件
</script>

<style scoped>
.home-view {
  /* 让主页内容打破布局内边距，铺满可见宽度以展示渐变背景 */
  margin: 0 -24px;
  padding: 24px;
  /* 浅色系渐变背景：顶部纯白，向下过渡到极浅的蓝灰，衔接白色顶部栏 */
  background: linear-gradient(180deg, #ffffff 0%, #ffffff 18%, #f7fafc 45%, #f3f6fb 70%, #eef4ff 100%);
  color: #1f2937;
}

.hero {
  text-align: center;
  padding: 48px 16px 24px;
}

.hero-title {
  font-size: 42px;
  line-height: 1.2;
  letter-spacing: 1px;
  margin-bottom: 12px;
  background: linear-gradient(90deg, #7dd3fc 0%, #60a5fa 35%, #c084fc 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: 800;
}

.hero-subtitle {
  font-size: 18px;
  color: rgba(0, 0, 0, 0.65);
}

.prompt-section {
  margin-bottom: 40px;
}

.prompt-container {
  max-width: 900px;
  margin: 0 auto;
}

.prompt-input-wrapper {
  position: relative;
}

.prompt-input-wrapper :deep(textarea.ant-input) {
  font-size: 16px;
  line-height: 1.6;
  min-height: 120px;
  resize: vertical;
  border: none;
  outline: none;
  border-radius: 16px;
  padding: 18px 64px 18px 20px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.12) inset;
  background: #ffffff;
  color: #1f2937;
  transition: box-shadow 0.25s ease, background 0.25s ease, transform 0.1s ease;
}

.prompt-input-wrapper :deep(textarea.ant-input:hover) {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(59, 130, 246, 0.35) inset;
  background: #ffffff;
}

.prompt-input-wrapper :deep(textarea.ant-input:focus) {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.6) inset, 0 8px 24px rgba(0, 0, 0, 0.08);
}

.send-button {
  position: absolute;
  right: 12px;
  bottom: 12px;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quick-prompts {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.quick-prompt-item {
  cursor: pointer;
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 12px 14px;
  transition: transform 0.12s ease, box-shadow 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}

.quick-prompt-item:hover {
  transform: translateY(-2px);
  background: rgba(0, 0, 0, 0.04);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: rgba(59, 130, 246, 0.3);
}

.qp-title {
  font-size: 14px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 6px;
}

.qp-content {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.65);
}

.apps-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #7dd3fc;
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
  background: rgba(0, 0, 0, 0.03);
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
  color: #6b7280;
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
  color: #2563eb;
}
</style>

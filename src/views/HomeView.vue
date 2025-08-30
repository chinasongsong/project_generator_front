<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const startCreate = () => {
  router.push({ name: 'projects' })
}

const viewTemplates = () => {
  router.push({ name: 'templates' })
}
</script>

<template>
  <div class="home-view">
    <div class="hero-section">
      <h1>AI零代码应用生成平台</h1>
      <p class="hero-description">
        无需编程知识，通过AI智能生成，快速构建您的应用
      </p>
      <div class="hero-actions">
        <a-button type="primary" size="large" @click="startCreate">
          开始创建
        </a-button>
        <a-button size="large" @click="viewTemplates">
          浏览模板
        </a-button>
      </div>
    </div>

    <a-divider />

    <div class="features-section">
      <h2>平台特色</h2>
      <a-row :gutter="[24, 24]">
        <a-col :span="8">
          <a-card hoverable>
            <template #cover>
              <div class="feature-icon">🤖</div>
            </template>
            <a-card-meta
              title="AI智能生成"
              description="基于先进的AI技术，智能分析需求并生成应用代码"
            />
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card hoverable>
            <template #cover>
              <div class="feature-icon">⚡</div>
            </template>
            <a-card-meta
              title="零代码开发"
              description="无需编程知识，通过可视化界面快速构建应用"
            />
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card hoverable>
            <template #cover>
              <div class="feature-icon">🚀</div>
            </template>
            <a-card-meta
              title="快速部署"
              description="一键部署到云端，立即上线运行"
            />
          </a-card>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<style scoped>
.home-view {
  padding: 20px;
}

.hero-section {
  text-align: center;
  padding: 60px 0;
}

.hero-section h1 {
  font-size: 48px;
  color: #1890ff;
  margin-bottom: 20px;
  font-weight: bold;
}

.hero-description {
  font-size: 20px;
  color: #666;
  margin-bottom: 40px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.features-section {
  padding: 40px 0;
}

.features-section h2 {
  text-align: center;
  font-size: 32px;
  color: #1890ff;
  margin-bottom: 40px;
}

.feature-icon {
  font-size: 48px;
  text-align: center;
  padding: 40px 0;
  background: #f5f5f5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-section h1 {
    font-size: 32px;
  }
  
  .hero-description {
    font-size: 16px;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .features-section h2 {
    font-size: 24px;
  }
}
</style>

<template>
  <div class="about-view">
    <h1>关于我们</h1>
    <p class="about-description">
      AI零代码应用生成平台致力于让每个人都能轻松创建自己的应用，无需编程知识。
    </p>
    
    <a-row :gutter="[24, 24]" style="margin-top: 40px;">
      <a-col :span="12">
        <a-card title="我们的使命">
          <p>通过AI技术降低应用开发门槛，让创意快速转化为现实。</p>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="我们的愿景">
          <p>成为全球领先的AI驱动应用生成平台，赋能千万开发者。</p>
        </a-card>
      </a-col>
    </a-row>
    
    <a-divider />
    
    <a-card title="技术优势" style="margin-top: 20px;">
      <a-row :gutter="[16, 16]">
        <a-col :span="8">
          <div class="tech-item">
            <h3>🤖 AI智能</h3>
            <p>基于最新的AI技术，智能分析需求并生成代码</p>
          </div>
        </a-col>
        <a-col :span="8">
          <div class="tech-item">
            <h3>⚡ 高性能</h3>
            <p>优化的代码生成算法，确保应用性能优异</p>
          </div>
        </a-col>
        <a-col :span="8">
          <div class="tech-item">
            <h3>🔒 安全可靠</h3>
            <p>企业级安全标准，保护您的数据和隐私</p>
          </div>
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script setup lang="ts">
// 关于页面逻辑
</script>

<style scoped>
.about-view {
  padding: 20px;
}

h1 {
  color: #1890ff;
  margin-bottom: 16px;
  text-align: center;
}

.about-description {
  color: #666;
  margin-bottom: 20px;
  text-align: center;
  font-size: 16px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.tech-item {
  text-align: center;
  padding: 20px;
}

.tech-item h3 {
  color: #1890ff;
  margin-bottom: 12px;
}

.tech-item p {
  color: #666;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .about-view {
    padding: 16px;
  }
  
  h1 {
    font-size: 24px;
  }
  
  .about-description {
    font-size: 14px;
  }
}
</style>

<template>
  <div class="docs-view">
    <h1>帮助文档</h1>
    <p>查看详细的使用指南和API文档。</p>
    
    <a-row :gutter="[24, 24]" style="margin-top: 20px;">
      <a-col :span="8">
        <a-card title="快速开始" hoverable>
          <p>了解如何快速上手使用我们的平台</p>
          <a-button type="primary">查看指南</a-button>
        </a-card>
      </a-col>
      
      <a-col :span="8">
        <a-card title="API 文档" hoverable>
          <p>详细的API接口文档和示例</p>
          <a-button type="primary">查看文档</a-button>
        </a-card>
      </a-col>
      
      <a-col :span="8">
        <a-card title="常见问题" hoverable>
          <p>解答用户常见问题和疑惑</p>
          <a-button type="primary">查看FAQ</a-button>
        </a-card>
      </a-col>
    </a-row>
    
    <a-divider />
    
    <a-card title="最新更新" style="margin-top: 20px;">
      <a-timeline>
        <a-timeline-item>
          <p>v1.2.0 - 新增项目管理功能</p>
          <p style="color: #666; font-size: 12px;">2024-01-15</p>
        </a-timeline-item>
        <a-timeline-item>
          <p>v1.1.0 - 优化模板中心</p>
          <p style="color: #666; font-size: 12px;">2024-01-10</p>
        </a-timeline-item>
        <a-timeline-item>
          <p>v1.0.0 - 平台正式发布</p>
          <p style="color: #666; font-size: 12px;">2024-01-01</p>
        </a-timeline-item>
      </a-timeline>
    </a-card>
  </div>
</template>

<script setup lang="ts">
// 帮助文档页面逻辑
</script>

<style scoped>
.docs-view {
  padding: 20px;
}

h1 {
  color: #1890ff;
  margin-bottom: 16px;
}

p {
  color: #666;
  margin-bottom: 20px;
}
</style> 
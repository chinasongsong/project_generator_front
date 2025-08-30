<template>
  <div class="projects-view">
    <h1>项目管理</h1>
    <p>这里是项目管理页面，您可以在这里管理您的项目。</p>
    <a-card title="我的项目" style="margin-top: 20px;">
      <a-empty description="暂无项目，开始创建您的第一个项目吧！" />
    </a-card>
  </div>
</template>

<script setup lang="ts">
// 项目管理页面逻辑
</script>

<style scoped>
.projects-view {
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
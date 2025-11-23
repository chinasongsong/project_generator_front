<template>
  <div class="templates-view">
    <h1>模板中心</h1>
    <p>浏览和选择各种应用模板，快速开始您的项目。</p>
    <a-row :gutter="[16, 16]" style="margin-top: 20px">
      <a-col :span="8" v-for="template in templates" :key="template.id">
        <a-card hoverable>
          <template #cover>
            <img :alt="template.name" />
          </template>
          <a-card-meta :title="template.name" :description="template.description" />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const templates = ref([
  {
    id: 1,
    name: '电商网站模板',
    description: '完整的电商网站解决方案',
  },
  {
    id: 2,
    name: '企业官网模板',
    description: '专业的企业展示网站',
  },
  {
    id: 3,
    name: '博客系统模板',
    description: '现代化的博客平台',
  },
])
</script>

<style scoped>
.templates-view {
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

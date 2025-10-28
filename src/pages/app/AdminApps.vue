<template>
  <div class="admin-apps-page">
    <a-card title="应用管理">
      <a-form layout="inline" :model="searchForm" @submit.prevent>
        <a-form-item label="应用名称">
          <a-input v-model:value="searchForm.appName" placeholder="请输入应用名称" allow-clear />
        </a-form-item>
        <a-form-item label="代码类型">
          <a-input
            v-model:value="searchForm.codeGenType"
            placeholder="请输入代码类型"
            allow-clear
          />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">搜索</a-button>
            <a-button @click="resetSearch">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>

      <a-table
        :data-source="tableData"
        :columns="columns"
        :loading="loading"
        :pagination="false"
        row-key="id"
        style="margin-top: 16px"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'cover'">
            <a-avatar :size="48">
              <template v-if="record.cover">
                <img :src="record.cover" alt="cover" />
              </template>
              <template v-else>
                <span style="background: #e5e6eb; width: 100%; height: 100%; display: block" />
              </template>
            </a-avatar>
          </template>
          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a-button size="small" type="link" @click="openEdit(record)">编辑</a-button>
              <a-button
                size="small"
                type="link"
                danger
                @click="handleDelete(record)"
              >
                删除
              </a-button>
              <a-button
                v-if="record.priority !== 99"
                size="small"
                type="link"
                @click="handleSetFeatured(record)"
              >
                精选
              </a-button>
              <a-button
                v-else
                size="small"
                type="link"
                @click="handleUnsetFeatured(record)"
              >
                取消精选
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>

      <div class="table-footer">
        <a-pagination
          :current="pageParams.pageNumber"
          :page-size="pageParams.pageSize"
          :total="total"
          show-size-changer
          :page-size-options="['10', '20', '50']"
          @change="onPageChange"
          @showSizeChange="onPageSizeChange"
        />
      </div>
    </a-card>

    <a-modal
      :open="modalOpen"
      @update:open="(v: boolean) => (modalOpen = v)"
      title="编辑应用"
      :confirm-loading="modalLoading"
      :destroyOnClose="true"
      :maskClosable="false"
      :get-container="getModalContainer"
      @ok="submitForm"
      @cancel="closeModal"
    >
      <a-form :model="form" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
        <a-form-item label="应用名称">
          <a-input v-model:value="form.appName" placeholder="请输入应用名称" />
        </a-form-item>
        <a-form-item label="封面图">
          <a-input v-model:value="form.cover" placeholder="请输入封面图URL" />
        </a-form-item>
        <a-form-item label="初始提示词">
          <a-textarea
            v-model:value="form.initPrompt"
            :rows="3"
            placeholder="请输入初始提示词"
          />
        </a-form-item>
        <a-form-item label="代码类型">
          <a-input v-model:value="form.codeGenType" placeholder="请输入代码类型" />
        </a-form-item>
        <a-form-item label="部署密钥">
          <a-input v-model:value="form.deployKey" placeholder="请输入部署密钥" />
        </a-form-item>
        <a-form-item label="优先级">
          <a-input-number v-model:value="form.priority" :min="0" style="width: 100%" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  listAppVoByPageAdmin,
  editAppByAdmin,
  deleteAppByAdmin,
} from '@/api/appController'

const loading = ref(false)
const tableData = ref<API.AppVO[]>([])
const total = ref(0)

const searchForm = reactive<Partial<API.AppQueryRequest>>({
  appName: null,
  codeGenType: null,
})

const pageParams = reactive({
  pageNumber: 1,
  pageSize: 10,
})

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '封面', dataIndex: 'cover', key: 'cover', width: 100 },
  { title: '应用名称', dataIndex: 'appName', key: 'appName' },
  { title: '代码类型', dataIndex: 'codeGenType', key: 'codeGenType', width: 120 },
  { title: '用户', dataIndex: ['user', 'userName'], key: 'userName', width: 120 },
  { title: '优先级', dataIndex: 'priority', key: 'priority', width: 100 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '操作', key: 'actions', width: 250 },
]

const fetchData = async () => {
  try {
    loading.value = true
    const body: API.AppQueryRequest = {
      pageNum: pageParams.pageNumber,
      pageSize: pageParams.pageSize,
      appName: searchForm.appName || null,
      codeGenType: searchForm.codeGenType || null,
    }
    const { data } = await listAppVoByPageAdmin(body)
    if (data?.code === 0) {
      tableData.value = data.data?.records || []
      total.value = data.data?.totalRow || 0
    } else {
      message.error(data?.message || '获取数据失败')
    }
  } catch (e) {
    message.error('获取数据失败，请检查网络连接')
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)

const handleSearch = () => {
  pageParams.pageNumber = 1
  fetchData()
}

const resetSearch = () => {
  searchForm.appName = null
  searchForm.codeGenType = null
  handleSearch()
}

const onPageChange = (page: number) => {
  pageParams.pageNumber = page
  fetchData()
}

const onPageSizeChange = (_: number, size: number) => {
  pageParams.pageSize = size
  pageParams.pageNumber = 1
  fetchData()
}

// 新增 / 编辑
const modalOpen = ref(false)
const modalLoading = ref(false)
const form = reactive<Partial<API.AppEditRequest>>({
  id: undefined,
  appName: '',
  cover: '',
  initPrompt: '',
  codeGenType: '',
  deployKey: '',
  priority: 0,
})

const openEdit = (record: API.AppVO) => {
  Object.assign(form, {
    id: record.id,
    appName: record.appName,
    cover: record.cover,
    initPrompt: record.initPrompt,
    codeGenType: record.codeGenType,
    deployKey: record.deployKey,
    priority: record.priority,
  })
  modalOpen.value = true
}

const closeModal = () => {
  modalOpen.value = false
}

const submitForm = async () => {
  try {
    modalLoading.value = true
    const { data } = await editAppByAdmin({
      id: form.id,
      appName: form.appName,
      cover: form.cover,
      initPrompt: form.initPrompt,
      codeGenType: form.codeGenType,
      deployKey: form.deployKey,
      priority: form.priority,
    })

    if (data?.code === 0) {
      message.success('更新成功')
      closeModal()
      fetchData()
    } else {
      message.error(data?.message || '更新失败')
    }
  } catch (e) {
    message.error('提交失败，请检查网络连接')
  } finally {
    modalLoading.value = false
  }
}

const handleDelete = async (record: API.AppVO) => {
  try {
    const { data } = await deleteAppByAdmin({ id: record.id as number })
    if (data?.code === 0) {
      message.success('删除成功')
      fetchData()
    } else {
      message.error(data?.message || '删除失败')
    }
  } catch (e) {
    message.error('删除失败，请检查网络连接')
  }
}

const handleSetFeatured = async (record: API.AppVO) => {
  try {
    const { data } = await editAppByAdmin({
      id: record.id,
      appName: record.appName,
      cover: record.cover,
      initPrompt: record.initPrompt,
      codeGenType: record.codeGenType,
      deployKey: record.deployKey,
      priority: 99,
    })

    if (data?.code === 0) {
      message.success('设置精选成功')
      fetchData()
    } else {
      message.error(data?.message || '设置精选失败')
    }
  } catch (e) {
    message.error('设置精选失败，请检查网络连接')
  }
}

const handleUnsetFeatured = async (record: API.AppVO) => {
  try {
    const { data } = await editAppByAdmin({
      id: record.id,
      appName: record.appName,
      cover: record.cover,
      initPrompt: record.initPrompt,
      codeGenType: record.codeGenType,
      deployKey: record.deployKey,
      priority: 0,
    })

    if (data?.code === 0) {
      message.success('取消精选成功')
      fetchData()
    } else {
      message.error(data?.message || '取消精选失败')
    }
  } catch (e) {
    message.error('取消精选失败，请检查网络连接')
  }
}

const getModalContainer = () => (typeof window !== 'undefined' ? window.document.body : undefined)
</script>

<style scoped>
.admin-apps-page {
  padding: 16px;
}
.table-footer {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>

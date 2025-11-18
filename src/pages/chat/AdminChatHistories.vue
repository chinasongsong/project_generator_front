<template>
  <div class="admin-chat-histories-page">
    <a-card title="对话管理">
      <a-form layout="inline" :model="searchForm" @submit.prevent>
        <a-form-item label="应用ID">
          <a-input v-model:value="searchForm.appId" placeholder="请输入应用ID" allow-clear style="width: 150px" />
        </a-form-item>
        <a-form-item label="用户ID">
          <a-input v-model:value="searchForm.userId" placeholder="请输入用户ID" allow-clear style="width: 150px" />
        </a-form-item>
        <a-form-item label="消息类型">
          <a-input
            v-model:value="searchForm.messageType"
            placeholder="请输入消息类型"
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
          <template v-if="column.key === 'message'">
            <div class="message-cell">
              {{ record.message && record.message.length > 100 ? record.message.substring(0, 100) + '...' : record.message }}
            </div>
          </template>
          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a-button
                size="small"
                type="link"
                danger
                @click="handleDelete(record)"
              >
                删除
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
  </div>
</template>

<script setup lang="ts">
import {onMounted, reactive, ref} from 'vue'
import {message} from 'ant-design-vue'
import {listChatHistoryVoByPageAdmin} from '@/api/chatHistoryController'
import request from '@/request'

const loading = ref(false)
const tableData = ref<API.ChatHistoryVO[]>([])
const total = ref(0)

const searchForm = reactive<Partial<API.ChatHistoryQueryRequest>>({
  appId: null,
  userId: null,
  messageType: null,
})

const pageParams = reactive({
  pageNumber: 1,
  pageSize: 10,
})

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '应用ID', dataIndex: 'appId', key: 'appId', width: 100 },
  { title: '用户ID', dataIndex: 'userId', key: 'userId', width: 100 },
  { title: '消息类型', dataIndex: 'messageType', key: 'messageType', width: 120 },
  { title: '消息内容', dataIndex: 'message', key: 'message', ellipsis: true },
  { title: '父消息ID', dataIndex: 'parentId', key: 'parentId', width: 120 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '操作', key: 'actions', width: 100 },
]

const fetchData = async () => {
  try {
    loading.value = true
    const body: API.ChatHistoryQueryRequest = {
      pageNum: pageParams.pageNumber,
      pageSize: pageParams.pageSize,
      appId: searchForm.appId || null,
      userId: searchForm.userId || null,
      messageType: searchForm.messageType || null,
    }
    const { data } = await listChatHistoryVoByPageAdmin(body)
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
  searchForm.appId = null
  searchForm.userId = null
  searchForm.messageType = null
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

const handleDelete = async (record: API.ChatHistoryVO) => {
  try {
    const { data } = await request<API.BaseResponseBoolean>('/chatHistory/delete/admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: { id: record.id },
    })
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
</script>

<style scoped>
.admin-chat-histories-page {
  padding: 16px;
}
.table-footer {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
.message-cell {
  max-width: 400px;
  word-break: break-word;
}
</style>


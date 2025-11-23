<template>
  <div class="admin-users-page">
    <a-card title="用户管理">
      <a-form layout="inline" :model="searchForm" @submit.prevent>
        <a-form-item label="用户名">
          <a-input v-model:value="searchForm.userName" placeholder="请输入用户名" allow-clear />
        </a-form-item>
        <a-form-item label="账号">
          <a-input v-model:value="searchForm.userAccount" placeholder="请输入账号" allow-clear />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">搜索</a-button>
            <a-button @click="resetSearch">重置</a-button>
            <a-button type="dashed" @click="openCreate">新增用户</a-button>
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
          <template v-if="column.key === 'userAvatar'">
            <a-avatar :size="32">
              <template v-if="record.userAvatar">
                <img :src="record.userAvatar" alt="avatar" />
              </template>
              <template v-else>
                <span style="background: #e5e6eb; width: 100%; height: 100%; display: block" />
              </template>
            </a-avatar>
          </template>
          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a-button size="small" type="link" @click="openEdit(record)">编辑</a-button>
              <a-popconfirm title="确认删除该用户吗？" @confirm="() => handleDelete(record)">
                <a-button size="small" type="link" danger>删除</a-button>
              </a-popconfirm>
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
      :title="isEdit ? '编辑用户' : '新增用户'"
      :confirm-loading="modalLoading"
      :destroyOnClose="true"
      :maskClosable="false"
      :get-container="getModalContainer"
      @ok="submitForm"
      @cancel="closeModal"
    >
      <a-form :model="form" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
        <a-form-item label="用户名">
          <a-input v-model:value="form.userName" placeholder="请输入用户名" />
        </a-form-item>
        <a-form-item label="账号">
          <a-input v-model:value="form.userAccount" placeholder="请输入账号" />
        </a-form-item>
        <a-form-item label="角色">
          <a-select v-model:value="form.userRole" :options="roleOptions" placeholder="请选择角色" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import {onMounted, reactive, ref} from 'vue'
import {message} from 'ant-design-vue'
import {addUser, deleteUser, listUserVoByPage, updateUser} from '@/api/userController'

const loading = ref(false)
const tableData = ref<API.UserVO[]>([])
const total = ref(0)

const searchForm = reactive<Partial<API.UserQueryRequest>>({
  userName: '',
  userAccount: '',
})

const pageParams = reactive({
  pageNumber: 1,
  pageSize: 10,
})

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '头像', dataIndex: 'userAvatar', key: 'userAvatar', width: 80 },
  { title: '账号', dataIndex: 'userAccount', key: 'userAccount' },
  { title: '用户名', dataIndex: 'userName', key: 'userName' },
  { title: '角色', dataIndex: 'userRole', key: 'userRole', width: 120 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '操作', key: 'actions', width: 160 },
]

const fetchData = async () => {
  try {
    loading.value = true
    const body: API.UserQueryRequest = {
      pageNum: pageParams.pageNumber,
      pageSize: pageParams.pageSize,
      userName: searchForm.userName,
      userAccount: searchForm.userAccount,
    }
    const { data } = await listUserVoByPage(body)
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
  searchForm.userName = ''
  searchForm.userAccount = ''
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
const isEdit = ref(false)
const form = reactive<Partial<API.User & API.UserAddRequest>>({
  id: undefined,
  userName: '',
  userAccount: '',
  userRole: 'user',
})

const roleOptions = [
  { label: '用户', value: 'user' },
  { label: '管理员', value: 'admin' },
]

const openCreate = () => {
  isEdit.value = false
  Object.assign(form, { id: undefined, userName: '', userAccount: '', userRole: 'user' })
  modalOpen.value = true
}

const openEdit = (record: API.UserVO) => {
  isEdit.value = true
  Object.assign(form, {
    id: record.id,
    userName: record.userName,
    userAccount: record.userAccount,
    userRole: record.userRole,
  })
  modalOpen.value = true
}

const closeModal = () => {
  modalOpen.value = false
}

const submitForm = async () => {
  try {
    modalLoading.value = true
    if (isEdit.value) {
      const payload: API.UserUpdateRequest = {
        id: form.id!,
        userName: form.userName,
        userAvatar: undefined,
        userProfile: undefined,
        userRole: form.userRole,
      }
      const { data } = await updateUser(payload)
      if (data?.code === 0) {
        message.success('更新成功')
        closeModal()
        fetchData()
      } else {
        message.error(data?.message || '更新失败')
      }
    } else {
      const payload: API.UserAddRequest = {
        userName: form.userName,
        userAccount: form.userAccount,
        userRole: form.userRole,
      }
      const { data } = await addUser(payload)
      if (data?.code === 0) {
        message.success('新增成功')
        closeModal()
        fetchData()
      } else {
        message.error(data?.message || '新增失败')
      }
    }
  } catch (e) {
    message.error('提交失败，请检查网络连接')
  } finally {
    modalLoading.value = false
  }
}

const handleDelete = async (record: API.UserVO) => {
  try {
    const { data } = await deleteUser({ id: record.id as number })
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

const getModalContainer = () => (typeof window !== 'undefined' ? window.document.body : undefined)
</script>

<style scoped>
.admin-users-page {
  padding: 16px;
}
.table-footer {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>

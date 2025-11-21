<template>
  <div class="users-container">
    <div class="page-header">
      <div class="header-left">
        <h2>用户管理</h2>
        <p>管理系统家长/管理员账户</p>
      </div>
      <el-button type="primary" @click="openDialog()" class="add-btn">
        <el-icon><Plus /></el-icon>
        新增用户
      </el-button>
    </div>

    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="用户名">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入用户名"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input
            v-model="searchForm.phone"
            placeholder="请输入手机号"
            clearable
            style="width: 180px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="角色">
          <el-select
            v-model="searchForm.role"
            placeholder="请选择角色"
            clearable
            style="width: 160px"
          >
            <el-option
              v-for="item in roleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <el-table
        :data="users"
        v-loading="loading"
        stripe
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        class="desktop-table"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="140" />
        <el-table-column prop="phone" label="手机号" width="150" />
        <el-table-column prop="email" label="邮箱" width="200" show-overflow-tooltip />
        <el-table-column prop="department" label="部门" width="120" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ row.role || 'USER' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="openDialog(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row.id)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="mobile-list" v-if="isMobile">
        <div
          v-for="user in users"
          :key="user.id"
          class="mobile-card"
        >
          <div class="card-header">
            <div class="card-title">
              <span class="user-name">{{ user.username }}</span>
              <el-tag size="small">{{ user.role || 'USER' }}</el-tag>
            </div>
            <div class="card-actions">
              <el-button size="small" type="primary" @click="openDialog(user)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button size="small" type="danger" @click="handleDelete(user.id)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
          <div class="card-content">
            <div class="info-row">
              <span class="label">手机：</span>
              <span class="value">{{ user.phone || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="label">邮箱：</span>
              <span class="value">{{ user.email || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="label">部门：</span>
              <span class="value">{{ user.department || '-' }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑用户' : '新增用户'"
      :width="isMobile ? '95%' : '800px'"
      :close-on-click-modal="false"
      class="user-dialog"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        :label-width="isMobile ? '80px' : '120px'"
        class="user-form"
      >
        <el-form-item label="用户名" prop="name">
          <el-input v-model="form.name" placeholder="请输入用户名" />
        </el-form-item>

        <el-form-item v-if="!isEdit" label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="部门" prop="department">
          <el-input v-model="form.department" placeholder="请输入部门" />
        </el-form-item>

        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色">
            <el-option
              v-for="item in roleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ isEdit ? '更新' : '保存' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { Plus, Search, Refresh, Edit, Delete } from "@element-plus/icons-vue"
import { userManagerAPI } from "../api/index"

export default {
  name: "Users",
  components: {
    Plus,
    Search,
    Refresh,
    Edit,
    Delete
  },
  setup() {
    const formRef = ref()
    const loading = ref(false)
    const submitting = ref(false)
    const dialogVisible = ref(false)
    const isEdit = ref(false)
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const isMobile = ref(false)

    const roleOptions = [
      { label: "管理员", value: "ADMIN" },
      { label: "普通用户", value: "USER" }
    ]

    const searchForm = reactive({
      name: "",
      phone: "",
      role: ""
    })

    const form = reactive({
      id: null,
      name: "",
      phone: "",
      email: "",
      department: "",
      avatar: "",
      password: "",
      role: "USER"
    })

    const rules = {
      name: [{ required: true, message: "请输入用户名", trigger: "blur" }],
      phone: [
        { required: true, message: "请输入手机号", trigger: "blur" },
        { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号", trigger: "blur" }
      ],
      email: [
        { type: "email", message: "请输入正确的邮箱地址", trigger: "blur" }
      ],
      password: [
        { required: true, message: "请输入密码", trigger: "blur" },
        { min: 6, message: "密码长度不能少于6位", trigger: "blur" }
      ]
    }

    const users = ref([])

    const checkScreenSize = () => {
      isMobile.value = window.innerWidth <= 768
    }

    const loadUsers = async () => {
      loading.value = true
      try {
        const params = {
          current: currentPage.value,
          size: pageSize.value
        }
        if (searchForm.name) params.username = searchForm.name
        if (searchForm.phone) params.phone = searchForm.phone
        if (searchForm.role) params.role = searchForm.role

        const response = await userManagerAPI.getUserList(params)
        if (response.data) {
          users.value = response.data.records || response.data.list || []
          total.value = response.data.total || 0
        }
      } catch (error) {
        console.error("加载用户列表失败:", error)
        ElMessage.error("加载用户列表失败")
      } finally {
        loading.value = false
      }
    }

    const openDialog = async (user = null) => {
      isEdit.value = !!user
      if (user) {
        try {
          const response = await userManagerAPI.getUser(user.id)
          if (response.data) {
            form.id = response.data.id
            form.name = response.data.username || ""
            form.phone = response.data.phone || ""
            form.email = response.data.email || ""
            form.department = response.data.department || ""
            form.avatar = response.data.avatar || ""
            form.role = response.data.role || "USER"
          }
        } catch (error) {
          console.error("获取用户详情失败:", error)
          ElMessage.error("获取用户详情失败")
        }
      } else {
        resetForm()
      }
      dialogVisible.value = true
    }

    const resetForm = () => {
      Object.keys(form).forEach(key => {
        form[key] = ""
      })
      form.id = null
      form.role = "USER"
      formRef.value?.resetFields()
    }

    const handleSubmit = async () => {
      try {
        await formRef.value.validate()
        submitting.value = true

        const inputData = {
          username: form.name,
          phone: form.phone,
          email: form.email || "",
          department: form.department || "",
          avatar: form.avatar || "",
          password: form.password || "",
          role: form.role || ""
        }

        if (isEdit.value) {
          await userManagerAPI.updateUser(form.id, inputData)
          ElMessage.success("用户信息更新成功")
        } else {
          await userManagerAPI.createUser(inputData)
          ElMessage.success("用户信息添加成功")
        }

        dialogVisible.value = false
        resetForm()
        loadUsers()
      } catch (error) {
        console.error("表单提交失败:", error)
        ElMessage.error(error.message || "操作失败")
      } finally {
        submitting.value = false
      }
    }

    const handleDelete = async (id) => {
      try {
        await ElMessageBox.confirm("确定要删除这个用户吗？", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })

        await userManagerAPI.deleteUser(id)
        ElMessage.success("删除成功")
        loadUsers()
      } catch (error) {
        if (error !== "cancel") {
          console.error("删除失败:", error)
          ElMessage.error(error.message || "删除失败")
        }
      }
    }

    const handleSearch = () => {
      currentPage.value = 1
      loadUsers()
    }

    const handleReset = () => {
      Object.keys(searchForm).forEach(key => {
        searchForm[key] = ""
      })
      currentPage.value = 1
      loadUsers()
    }

    const handleSizeChange = (val) => {
      pageSize.value = val
      currentPage.value = 1
      loadUsers()
    }

    const handleCurrentChange = (val) => {
      currentPage.value = val
      loadUsers()
    }

    onMounted(() => {
      checkScreenSize()
      window.addEventListener("resize", checkScreenSize)
      loadUsers()
    })

    onUnmounted(() => {
      window.removeEventListener("resize", checkScreenSize)
    })

    return {
      formRef,
      loading,
      submitting,
      dialogVisible,
      isEdit,
      currentPage,
      pageSize,
      total,
      isMobile,
      searchForm,
      form,
      rules,
      users,
      roleOptions,
      openDialog,
      handleSubmit,
      handleDelete,
      handleSearch,
      handleReset,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>

<style scoped>
.users-container {
  padding: 24px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-left h2 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.header-left p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.add-btn {
  height: 40px;
  padding: 0 20px;
  font-size: 14px;
}

.search-card {
  margin-bottom: 24px;
  border-radius: 8px;
}

.search-form {
  margin: 0;
}

.search-form .el-form-item {
  margin-bottom: 0;
}

.table-card {
  border-radius: 8px;
}

.desktop-table {
  display: table;
}

.mobile-list {
  display: none;
}

.mobile-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  font-weight: 600;
  color: #303133;
  font-size: 16px;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  align-items: center;
}

.label {
  color: #909399;
  font-size: 14px;
  min-width: 80px;
}

.value {
  color: #606266;
  font-size: 14px;
  flex: 1;
}

.pagination-wrapper {
  margin-top: 24px;
  text-align: right;
}

.user-dialog .el-dialog__body {
  padding: 20px 24px;
}

.user-form .el-form-item {
  margin-bottom: 20px;
}

.dialog-footer {
  text-align: right;
}

@media (max-width: 768px) {
  .users-container {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .search-form {
    flex-direction: column;
  }

  .search-form .el-form-item {
    width: 100%;
    margin-bottom: 16px;
  }

  .search-form .el-input,
  .search-form .el-select {
    width: 100% !important;
  }

  .desktop-table {
    display: none;
  }

  .mobile-list {
    display: block;
  }

  .user-dialog .el-dialog__body {
    padding: 16px;
  }

  .pagination-wrapper {
    text-align: center;
  }
}

@media (max-width: 480px) {
  .users-container {
    padding: 12px;
  }

  .page-header {
    padding: 16px;
  }

  .header-left h2 {
    font-size: 20px;
  }

  .mobile-card {
    padding: 12px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .card-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>


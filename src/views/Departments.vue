<template>
  <div class="departments-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>科室管理</h2>
        <p>管理医院科室信息</p>
      </div>
      <el-button type="primary" @click="openDialog()" class="add-btn">
        <el-icon><Plus /></el-icon>
        新增科室
      </el-button>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="科室名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入科室名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="科室主任">
          <el-input
            v-model="searchForm.director"
            placeholder="请输入科室主任"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
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

    <!-- 科室列表 -->
    <el-card class="table-card" shadow="never">
      <!-- 桌面端表格 -->
      <el-table
        :data="filteredDepartments"
        v-loading="loading"
        stripe
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        class="desktop-table"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="科室名称" width="150" />
        <el-table-column prop="description" label="科室描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="director" label="科室主任" width="120" />
        <el-table-column prop="phone" label="联系电话" width="140" />
        <el-table-column prop="location" label="位置" width="120" />
        <el-table-column prop="doctorCount" label="医生数量" width="100">
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ row.doctorCount }}人</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
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

      <!-- 移动端卡片列表 -->
      <div class="mobile-list" v-if="isMobile">
        <div 
          v-for="department in filteredDepartments" 
          :key="department.id"
          class="mobile-card"
        >
          <div class="card-header">
            <div class="card-title">
              <span class="department-name">{{ department.name }}</span>
              <el-tag type="info" size="small">{{ department.doctorCount }}人</el-tag>
            </div>
            <div class="card-actions">
              <el-button size="small" type="primary" @click="openDialog(department)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button size="small" type="danger" @click="handleDelete(department.id)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
          <div class="card-content">
            <div class="info-row">
              <span class="label">主任：</span>
              <span class="value">{{ department.director }}</span>
            </div>
            <div class="info-row">
              <span class="label">电话：</span>
              <span class="value">{{ department.phone }}</span>
            </div>
            <div class="info-row">
              <span class="label">位置：</span>
              <span class="value">{{ department.location }}</span>
            </div>
            <div class="info-row">
              <span class="label">描述：</span>
              <span class="value">{{ department.description }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
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

    <!-- 新增/编辑科室对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑科室' : '新增科室'"
      :width="isMobile ? '95%' : '700px'"
      :close-on-click-modal="false"
      class="department-dialog"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        :label-width="isMobile ? '80px' : '120px'"
        class="department-form"
      >
        <el-row :gutter="20">
          <el-col :span="isMobile ? 24 : 12">
            <el-form-item label="科室名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入科室名称" />
            </el-form-item>
          </el-col>
          <el-col :span="isMobile ? 24 : 12">
            <el-form-item label="科室主任" prop="director">
              <el-input v-model="form.director" placeholder="请输入科室主任姓名" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="isMobile ? 24 : 12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
          <el-col :span="isMobile ? 24 : 12">
            <el-form-item label="科室位置" prop="location">
              <el-input v-model="form.location" placeholder="请输入科室位置" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="科室描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入科室描述"
          />
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

export default {
  name: "Departments",
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

    const searchForm = reactive({
      name: "",
      director: ""
    })

    const form = reactive({
      id: null,
      name: "",
      director: "",
      phone: "",
      location: "",
      description: ""
    })

    const rules = {
      name: [
        { required: true, message: '请输入科室名称', trigger: 'blur' }
      ],
      director: [
        { required: true, message: '请输入科室主任姓名', trigger: 'blur' }
      ],
      phone: [
        { required: true, message: '请输入联系电话', trigger: 'blur' },
        { pattern: /^[\d\-\+\(\)\s]+$/, message: '请输入正确的电话号码', trigger: 'blur' }
      ],
      location: [
        { required: true, message: '请输入科室位置', trigger: 'blur' }
      ],
      description: [
        { required: true, message: '请输入科室描述', trigger: 'blur' }
      ]
    }

    // 模拟数据
    const departments = ref([
      {
        id: 1,
        name: "内科",
        director: "李主任",
        phone: "025-12345678",
        location: "1号楼2层",
        description: "内科是医院的主要科室之一，负责内科疾病的诊断和治疗，包括心血管、呼吸、消化、内分泌等系统疾病。",
        doctorCount: 15,
        createTime: "2024-01-15 10:30:00"
      },
      {
        id: 2,
        name: "外科",
        director: "王主任",
        phone: "025-12345679",
        location: "2号楼3层",
        description: "外科科室负责各种外科手术，包括普外科、骨科、神经外科等，拥有先进的手术设备和专业的医疗团队。",
        doctorCount: 12,
        createTime: "2024-01-14 15:20:00"
      },
      {
        id: 3,
        name: "儿科",
        director: "张主任",
        phone: "025-12345680",
        location: "3号楼1层",
        description: "儿科专门负责儿童疾病的诊治，包括新生儿科、小儿内科、小儿外科等，为儿童提供专业的医疗服务。",
        doctorCount: 8,
        createTime: "2024-01-13 09:15:00"
      },
      {
        id: 4,
        name: "妇产科",
        director: "陈主任",
        phone: "025-12345681",
        location: "4号楼2层",
        description: "妇产科负责女性生殖系统疾病的诊治，包括妇科、产科、计划生育等，为女性健康提供全方位服务。",
        doctorCount: 10,
        createTime: "2024-01-12 14:45:00"
      },
      {
        id: 5,
        name: "康复科",
        director: "刘主任",
        phone: "025-12345682",
        location: "5号楼1层",
        description: "康复科负责患者康复治疗，包括物理治疗、作业治疗、言语治疗等，帮助患者恢复身体功能。",
        doctorCount: 6,
        createTime: "2024-01-11 11:30:00"
      }
    ])

    // 检测屏幕尺寸
    const checkScreenSize = () => {
      isMobile.value = window.innerWidth <= 768
    }

    // 过滤后的科室列表
    const filteredDepartments = computed(() => {
      let result = departments.value
      
      if (searchForm.name) {
        result = result.filter(dept => dept.name.includes(searchForm.name))
      }
      if (searchForm.director) {
        result = result.filter(dept => dept.director.includes(searchForm.director))
      }
      
      total.value = result.length
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return result.slice(start, end)
    })

    // 打开对话框
    const openDialog = (department = null) => {
      isEdit.value = !!department
      if (department) {
        Object.keys(form).forEach(key => {
          form[key] = department[key]
        })
      } else {
        resetForm()
      }
      dialogVisible.value = true
    }

    // 重置表单
    const resetForm = () => {
      Object.keys(form).forEach(key => {
        form[key] = ""
      })
      formRef.value?.resetFields()
    }

    // 提交表单
    const handleSubmit = async () => {
      try {
        await formRef.value.validate()
        submitting.value = true
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        if (isEdit.value) {
          const index = departments.value.findIndex(d => d.id === form.id)
          if (index !== -1) {
            departments.value[index] = { ...form }
          }
          ElMessage.success("科室信息更新成功")
        } else {
          const newDepartment = {
            ...form,
            id: Date.now(),
            doctorCount: 0,
            createTime: new Date().toLocaleString()
          }
          departments.value.unshift(newDepartment)
          ElMessage.success("科室信息添加成功")
        }
        
        dialogVisible.value = false
        resetForm()
      } catch (error) {
        console.error("表单验证失败:", error)
      } finally {
        submitting.value = false
      }
    }

    // 删除科室
    const handleDelete = async (id) => {
      try {
        await ElMessageBox.confirm("确定要删除这个科室吗？", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        
        const index = departments.value.findIndex(d => d.id === id)
        if (index !== -1) {
          departments.value.splice(index, 1)
          ElMessage.success("删除成功")
        }
      } catch (error) {
        if (error !== "cancel") {
          ElMessage.error("删除失败")
        }
      }
    }

    // 搜索
    const handleSearch = () => {
      currentPage.value = 1
    }

    // 重置搜索
    const handleReset = () => {
      Object.keys(searchForm).forEach(key => {
        searchForm[key] = ""
      })
      currentPage.value = 1
    }

    // 分页处理
    const handleSizeChange = (val) => {
      pageSize.value = val
      currentPage.value = 1
    }

    const handleCurrentChange = (val) => {
      currentPage.value = val
    }

    onMounted(() => {
      checkScreenSize()
      window.addEventListener('resize', checkScreenSize)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', checkScreenSize)
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
      filteredDepartments,
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
.departments-container {
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

.department-name {
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

.department-dialog .el-dialog__body {
  padding: 20px 24px;
}

.department-form .el-form-item {
  margin-bottom: 20px;
}

.dialog-footer {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .departments-container {
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

  .department-dialog .el-dialog__body {
    padding: 16px;
  }

  .pagination-wrapper {
    text-align: center;
  }
}

@media (max-width: 480px) {
  .departments-container {
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
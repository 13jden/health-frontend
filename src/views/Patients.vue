<template>
  <div class="patients-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>患者管理</h2>
        <p>管理医院患者信息</p>
      </div>
      <el-button type="primary" @click="openDialog()" class="add-btn">
        <el-icon><Plus /></el-icon>
        新增患者
      </el-button>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="姓名">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入患者姓名"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="searchForm.gender" placeholder="请选择性别" clearable style="width: 120px">
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
          </el-select>
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

    <!-- 患者列表 -->
    <el-card class="table-card" shadow="never">
      <!-- 桌面端表格 -->
      <el-table
        :data="filteredPatients"
        v-loading="loading"
        stripe
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        class="desktop-table"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="{ row }">
            <el-tag :type="row.gender === '男' ? 'primary' : 'success'" size="small">
              {{ row.gender }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="age" label="年龄" width="80" />
        <el-table-column prop="phone" label="手机号" width="140" />
        <el-table-column prop="idCard" label="身份证号" width="180" show-overflow-tooltip />
        <el-table-column prop="address" label="地址" min-width="200" show-overflow-tooltip />
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
          v-for="patient in filteredPatients" 
          :key="patient.id"
          class="mobile-card"
        >
          <div class="card-header">
            <div class="card-title">
              <span class="patient-name">{{ patient.name }}</span>
              <el-tag :type="patient.gender === '男' ? 'primary' : 'success'" size="small">
                {{ patient.gender }}
              </el-tag>
            </div>
            <div class="card-actions">
              <el-button size="small" type="primary" @click="openDialog(patient)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button size="small" type="danger" @click="handleDelete(patient.id)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
          <div class="card-content">
            <div class="info-row">
              <span class="label">年龄：</span>
              <span class="value">{{ patient.age }}岁</span>
            </div>
            <div class="info-row">
              <span class="label">手机：</span>
              <span class="value">{{ patient.phone }}</span>
            </div>
            <div class="info-row">
              <span class="label">身份证：</span>
              <span class="value">{{ patient.idCard }}</span>
            </div>
            <div class="info-row">
              <span class="label">地址：</span>
              <span class="value">{{ patient.address }}</span>
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

    <!-- 新增/编辑患者对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑患者' : '新增患者'"
      :width="isMobile ? '95%' : '800px'"
      :close-on-click-modal="false"
      class="patient-dialog"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        :label-width="isMobile ? '80px' : '120px'"
        class="patient-form"
      >
        <el-row :gutter="20">
          <el-col :span="isMobile ? 24 : 12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" placeholder="请输入患者姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="isMobile ? 24 : 12">
            <el-form-item label="性别" prop="gender">
              <el-select v-model="form.gender" placeholder="请选择性别" style="width: 100%">
                <el-option label="男" value="男" />
                <el-option label="女" value="女" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="isMobile ? 24 : 12">
            <el-form-item label="年龄" prop="age">
              <el-input-number
                v-model="form.age"
                :min="0"
                :max="150"
                style="width: 100%"
                placeholder="请输入年龄"
              />
            </el-form-item>
          </el-col>
          <el-col :span="isMobile ? 24 : 12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="form.idCard" placeholder="请输入身份证号" />
        </el-form-item>
        
        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入地址" />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="isMobile ? 24 : 12">
            <el-form-item label="紧急联系人" prop="emergencyContact">
              <el-input v-model="form.emergencyContact" placeholder="请输入紧急联系人" />
            </el-form-item>
          </el-col>
          <el-col :span="isMobile ? 24 : 12">
            <el-form-item label="紧急联系电话" prop="emergencyPhone">
              <el-input v-model="form.emergencyPhone" placeholder="请输入紧急联系电话" />
            </el-form-item>
          </el-col>
        </el-row>
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
  name: "Patients",
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
      gender: "",
      phone: ""
    })

    const form = reactive({
      id: null,
      name: "",
      gender: "",
      age: null,
      phone: "",
      idCard: "",
      address: "",
      emergencyContact: "",
      emergencyPhone: ""
    })

    const rules = {
      name: [{ required: true, message: "请输入患者姓名", trigger: "blur" }],
      gender: [{ required: true, message: "请选择性别", trigger: "change" }],
      age: [{ required: true, message: "请输入年龄", trigger: "blur" }],
      phone: [
        { required: true, message: "请输入手机号", trigger: "blur" },
        { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号", trigger: "blur" }
      ],
      idCard: [
        { required: true, message: "请输入身份证号", trigger: "blur" },
        { pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/, message: "请输入正确的身份证号", trigger: "blur" }
      ],
      address: [{ required: true, message: "请输入地址", trigger: "blur" }],
      emergencyContact: [{ required: true, message: "请输入紧急联系人", trigger: "blur" }],
      emergencyPhone: [
        { required: true, message: "请输入紧急联系电话", trigger: "blur" },
        { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号", trigger: "blur" }
      ]
    }

    // 模拟数据
    const patients = ref([
      {
        id: 1,
        name: "张三",
        gender: "男",
        age: 35,
        phone: "13800138001",
        idCard: "320123198801011234",
        address: "江苏省南京市玄武区中山路123号",
        emergencyContact: "李四",
        emergencyPhone: "13900139001",
        createTime: "2024-01-15 10:30:00"
      },
      {
        id: 2,
        name: "王五",
        gender: "女",
        age: 28,
        phone: "13800138002",
        idCard: "320123199601011234",
        address: "江苏省南京市鼓楼区北京路456号",
        emergencyContact: "赵六",
        emergencyPhone: "13900139002",
        createTime: "2024-01-14 15:20:00"
      },
      {
        id: 3,
        name: "刘七",
        gender: "男",
        age: 42,
        phone: "13800138003",
        idCard: "320123198201011234",
        address: "江苏省南京市秦淮区夫子庙789号",
        emergencyContact: "陈八",
        emergencyPhone: "13900139003",
        createTime: "2024-01-13 09:15:00"
      }
    ])

    // 检测屏幕尺寸
    const checkScreenSize = () => {
      isMobile.value = window.innerWidth <= 768
    }

    // 过滤后的患者列表
    const filteredPatients = computed(() => {
      let result = patients.value
      
      if (searchForm.name) {
        result = result.filter(patient => patient.name.includes(searchForm.name))
      }
      if (searchForm.gender) {
        result = result.filter(patient => patient.gender === searchForm.gender)
      }
      if (searchForm.phone) {
        result = result.filter(patient => patient.phone.includes(searchForm.phone))
      }
      
      total.value = result.length
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return result.slice(start, end)
    })

    // 打开对话框
    const openDialog = (patient = null) => {
      isEdit.value = !!patient
      if (patient) {
        Object.keys(form).forEach(key => {
          form[key] = patient[key]
        })
      } else {
        resetForm()
      }
      dialogVisible.value = true
    }

    // 重置表单
    const resetForm = () => {
      Object.keys(form).forEach(key => {
        form[key] = key === "age" ? null : ""
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
          const index = patients.value.findIndex(p => p.id === form.id)
          if (index !== -1) {
            patients.value[index] = { ...form }
          }
          ElMessage.success("患者信息更新成功")
        } else {
          const newPatient = {
            ...form,
            id: Date.now(),
            createTime: new Date().toLocaleString()
          }
          patients.value.unshift(newPatient)
          ElMessage.success("患者信息添加成功")
        }
        
        dialogVisible.value = false
        resetForm()
      } catch (error) {
        console.error("表单验证失败:", error)
      } finally {
        submitting.value = false
      }
    }

    // 删除患者
    const handleDelete = async (id) => {
      try {
        await ElMessageBox.confirm("确定要删除这个患者吗？", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        
        const index = patients.value.findIndex(p => p.id === id)
        if (index !== -1) {
          patients.value.splice(index, 1)
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
      filteredPatients,
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
.patients-container {
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

.patient-name {
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

.patient-dialog .el-dialog__body {
  padding: 20px 24px;
}

.patient-form .el-form-item {
  margin-bottom: 20px;
}

.dialog-footer {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .patients-container {
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

  .patient-dialog .el-dialog__body {
    padding: 16px;
  }

  .pagination-wrapper {
    text-align: center;
  }
}

@media (max-width: 480px) {
  .patients-container {
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
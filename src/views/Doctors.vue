<template>
  <div class="doctors-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>医生管理</h2>
        <p>管理医院医生信息</p>
      </div>
      <el-button type="primary" @click="openDialog()" class="add-btn">
        <el-icon><Plus /></el-icon>
        新增医生
      </el-button>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="姓名">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入医生姓名"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="科室">
          <el-select v-model="searchForm.department" placeholder="请选择科室" clearable style="width: 150px">
            <el-option label="内科" value="内科" />
            <el-option label="外科" value="外科" />
            <el-option label="儿科" value="儿科" />
            <el-option label="妇产科" value="妇产科" />
            <el-option label="康复科" value="康复科" />
          </el-select>
        </el-form-item>
        <el-form-item label="职称">
          <el-select v-model="searchForm.title" placeholder="请选择职称" clearable style="width: 150px">
            <el-option label="主任医师" value="主任医师" />
            <el-option label="副主任医师" value="副主任医师" />
            <el-option label="主治医师" value="主治医师" />
            <el-option label="住院医师" value="住院医师" />
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

    <!-- 医生列表 -->
    <el-card class="table-card" shadow="never">
      <!-- 桌面端表格 -->
      <el-table
        :data="filteredDoctors"
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
        <el-table-column prop="department" label="科室" width="120" />
        <el-table-column prop="title" label="职称" width="120">
          <template #default="{ row }">
            <el-tag :type="getTitleType(row.title)" size="small">
              {{ row.title }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="specialty" label="专长" min-width="150" show-overflow-tooltip />
        <el-table-column prop="workYears" label="工作年限" width="100" />
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
          v-for="doctor in filteredDoctors" 
          :key="doctor.id"
          class="mobile-card"
        >
          <div class="card-header">
            <div class="card-title">
              <span class="doctor-name">{{ doctor.name }}</span>
              <el-tag :type="getTitleType(doctor.title)" size="small">
                {{ doctor.title }}
              </el-tag>
            </div>
            <div class="card-actions">
              <el-button size="small" type="primary" @click="openDialog(doctor)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button size="small" type="danger" @click="handleDelete(doctor.id)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
          <div class="card-content">
            <div class="info-row">
              <span class="label">性别：</span>
              <span class="value">{{ doctor.gender }}</span>
            </div>
            <div class="info-row">
              <span class="label">年龄：</span>
              <span class="value">{{ doctor.age }}岁</span>
            </div>
            <div class="info-row">
              <span class="label">科室：</span>
              <span class="value">{{ doctor.department }}</span>
            </div>
            <div class="info-row">
              <span class="label">专长：</span>
              <span class="value">{{ doctor.specialty }}</span>
            </div>
            <div class="info-row">
              <span class="label">手机：</span>
              <span class="value">{{ doctor.phone }}</span>
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

    <!-- 新增/编辑医生对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑医生' : '新增医生'"
      :width="isMobile ? '95%' : '900px'"
      :close-on-click-modal="false"
      class="doctor-dialog"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        :label-width="isMobile ? '80px' : '120px'"
        class="doctor-form"
      >
        <el-row :gutter="20">
          <el-col :span="isMobile ? 24 : 12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" placeholder="请输入医生姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="isMobile ? 24 : 12">
            <el-form-item label="工号" prop="employeeId">
              <el-input v-model="form.employeeId" placeholder="请输入工号" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="isMobile ? 24 : 12">
            <el-form-item label="性别" prop="gender">
              <el-select v-model="form.gender" placeholder="请选择性别" style="width: 100%">
                <el-option label="男" value="男" />
                <el-option label="女" value="女" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="isMobile ? 24 : 12">
            <el-form-item label="年龄" prop="age">
              <el-input-number
                v-model="form.age"
                :min="22"
                :max="70"
                style="width: 100%"
                placeholder="请输入年龄"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="isMobile ? 24 : 12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
          <el-col :span="isMobile ? 24 : 12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="isMobile ? 24 : 12">
            <el-form-item label="科室" prop="department">
              <el-select v-model="form.department" placeholder="请选择科室" style="width: 100%">
                <el-option label="内科" value="内科" />
                <el-option label="外科" value="外科" />
                <el-option label="儿科" value="儿科" />
                <el-option label="妇产科" value="妇产科" />
                <el-option label="康复科" value="康复科" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="isMobile ? 24 : 12">
            <el-form-item label="职称" prop="title">
              <el-select v-model="form.title" placeholder="请选择职称" style="width: 100%">
                <el-option label="主任医师" value="主任医师" />
                <el-option label="副主任医师" value="副主任医师" />
                <el-option label="主治医师" value="主治医师" />
                <el-option label="住院医师" value="住院医师" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="isMobile ? 24 : 12">
            <el-form-item label="专业" prop="specialty">
              <el-input v-model="form.specialty" placeholder="请输入专业" />
            </el-form-item>
          </el-col>
          <el-col :span="isMobile ? 24 : 12">
            <el-form-item label="入职日期" prop="hireDate">
              <el-date-picker
                v-model="form.hireDate"
                type="date"
                placeholder="请选择入职日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="简介" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入医生简介"
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
  name: "Doctors",
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
      department: "",
      title: ""
    })

    const form = reactive({
      id: null,
      name: "",
      employeeId: "",
      gender: "",
      age: null,
      phone: "",
      email: "",
      department: "",
      title: "",
      specialty: "",
      hireDate: "",
      description: ""
    })

    const rules = {
      name: [{ required: true, message: "请输入医生姓名", trigger: "blur" }],
      employeeId: [{ required: true, message: "请输入工号", trigger: "blur" }],
      gender: [{ required: true, message: "请选择性别", trigger: "change" }],
      age: [{ required: true, message: "请输入年龄", trigger: "blur" }],
      phone: [
        { required: true, message: "请输入手机号", trigger: "blur" },
        { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号", trigger: "blur" }
      ],
      email: [
        { type: "email", message: "请输入正确的邮箱", trigger: "blur" }
      ],
      department: [{ required: true, message: "请选择科室", trigger: "change" }],
      title: [{ required: true, message: "请选择职称", trigger: "change" }],
      specialty: [{ required: true, message: "请输入专业", trigger: "blur" }],
      hireDate: [{ required: true, message: "请选择入职日期", trigger: "change" }]
    }

    // 模拟数据
    const doctors = ref([
      {
        id: 1,
        name: "李医生",
        employeeId: "DOC001",
        gender: "男",
        age: 45,
        phone: "13800138001",
        email: "li.doctor@hospital.com",
        department: "内科",
        title: "主任医师",
        specialty: "心血管内科",
        hireDate: "2010-03-15",
        description: "从事心血管内科临床工作20年，擅长冠心病、高血压等疾病的诊治。",
        createTime: "2024-01-15 10:30:00"
      },
      {
        id: 2,
        name: "王医生",
        employeeId: "DOC002",
        gender: "女",
        age: 38,
        phone: "13800138002",
        email: "wang.doctor@hospital.com",
        department: "外科",
        title: "副主任医师",
        specialty: "普外科",
        hireDate: "2015-07-20",
        description: "普外科专家，擅长腹腔镜手术，微创治疗经验丰富。",
        createTime: "2024-01-14 15:20:00"
      },
      {
        id: 3,
        name: "张医生",
        employeeId: "DOC003",
        gender: "男",
        age: 32,
        phone: "13800138003",
        email: "zhang.doctor@hospital.com",
        department: "儿科",
        title: "主治医师",
        specialty: "小儿呼吸科",
        hireDate: "2018-09-10",
        description: "儿科主治医师，专长小儿呼吸系统疾病诊治。",
        createTime: "2024-01-13 09:15:00"
      }
    ])

    // 检测屏幕尺寸
    const checkScreenSize = () => {
      isMobile.value = window.innerWidth <= 768
    }

    // 过滤后的医生列表
    const filteredDoctors = computed(() => {
      let result = doctors.value
      
      if (searchForm.name) {
        result = result.filter(doctor => doctor.name.includes(searchForm.name))
      }
      if (searchForm.department) {
        result = result.filter(doctor => doctor.department === searchForm.department)
      }
      if (searchForm.title) {
        result = result.filter(doctor => doctor.title === searchForm.title)
      }
      
      total.value = result.length
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return result.slice(start, end)
    })

    // 获取职称类型
    const getTitleType = (title) => {
      const titleMap = {
        "主任医师": "danger",
        "副主任医师": "warning",
        "主治医师": "primary",
        "住院医师": "success"
      }
      return titleMap[title] || "info"
    }

    // 打开对话框
    const openDialog = (doctor = null) => {
      isEdit.value = !!doctor
      if (doctor) {
        Object.keys(form).forEach(key => {
          form[key] = doctor[key]
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
          const index = doctors.value.findIndex(d => d.id === form.id)
          if (index !== -1) {
            doctors.value[index] = { ...form }
          }
          ElMessage.success("医生信息更新成功")
        } else {
          const newDoctor = {
            ...form,
            id: Date.now(),
            createTime: new Date().toLocaleString()
          }
          doctors.value.unshift(newDoctor)
          ElMessage.success("医生信息添加成功")
        }
        
        dialogVisible.value = false
        resetForm()
      } catch (error) {
        console.error("表单验证失败:", error)
      } finally {
        submitting.value = false
      }
    }

    // 删除医生
    const handleDelete = async (id) => {
      try {
        await ElMessageBox.confirm("确定要删除这个医生吗？", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        
        const index = doctors.value.findIndex(d => d.id === id)
        if (index !== -1) {
          doctors.value.splice(index, 1)
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
      filteredDoctors,
      getTitleType,
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
.doctors-container {
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

.doctor-name {
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

.doctor-dialog .el-dialog__body {
  padding: 20px 24px;
}

.doctor-form .el-form-item {
  margin-bottom: 20px;
}

.dialog-footer {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .doctors-container {
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

  .doctor-dialog .el-dialog__body {
    padding: 16px;
  }

  .pagination-wrapper {
    text-align: center;
  }
}

@media (max-width: 480px) {
  .doctors-container {
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
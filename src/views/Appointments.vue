<template>
  <div class="appointments-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>预约管理</h2>
        <p>管理医院预约信息</p>
      </div>
      <el-button type="primary" @click="openDialog()" class="add-btn">
        <el-icon><Plus /></el-icon>
        新增预约
      </el-button>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="患者姓名">
          <el-input
            v-model="searchForm.patientName"
            placeholder="请输入患者姓名"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="医生姓名">
          <el-input
            v-model="searchForm.doctorName"
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
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px">
            <el-option label="已预约" value="已预约" />
            <el-option label="已完成" value="已完成" />
            <el-option label="已取消" value="已取消" />
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

    <!-- 预约列表 -->
    <el-card class="table-card" shadow="never">
      <!-- 桌面端表格 -->
      <el-table
        :data="filteredAppointments"
        v-loading="loading"
        stripe
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        class="desktop-table"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="patientName" label="患者姓名" width="120" />
        <el-table-column prop="doctorName" label="医生姓名" width="120" />
        <el-table-column prop="department" label="科室" width="120" />
        <el-table-column prop="appointmentTime" label="预约时间" width="160" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="symptoms" label="症状描述" min-width="200" show-overflow-tooltip />
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
          v-for="appointment in filteredAppointments" 
          :key="appointment.id"
          class="mobile-card"
        >
          <div class="card-header">
            <div class="card-title">
              <span class="patient-name">{{ appointment.patientName }}</span>
              <el-tag :type="getStatusType(appointment.status)" size="small">
                {{ appointment.status }}
              </el-tag>
            </div>
            <div class="card-actions">
              <el-button size="small" type="primary" @click="openDialog(appointment)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button size="small" type="danger" @click="handleDelete(appointment.id)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
          <div class="card-content">
            <div class="info-row">
              <span class="label">医生：</span>
              <span class="value">{{ appointment.doctorName }}</span>
            </div>
            <div class="info-row">
              <span class="label">科室：</span>
              <span class="value">{{ appointment.department }}</span>
            </div>
            <div class="info-row">
              <span class="label">预约时间：</span>
              <span class="value">{{ appointment.appointmentTime }}</span>
            </div>
            <div class="info-row">
              <span class="label">症状：</span>
              <span class="value">{{ appointment.symptoms }}</span>
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

    <!-- 新增/编辑预约对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑预约' : '新增预约'"
      :width="isMobile ? '95%' : '800px'"
      :close-on-click-modal="false"
      class="appointment-dialog"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        :label-width="isMobile ? '80px' : '120px'"
        class="appointment-form"
      >
        <el-row :gutter="20">
          <el-col :span="isMobile ? 24 : 12">
            <el-form-item label="患者" prop="patientId">
              <el-select v-model="form.patientId" placeholder="请选择患者" filterable style="width: 100%">
                <el-option
                  v-for="patient in patients"
                  :key="patient.id"
                  :label="patient.name"
                  :value="patient.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="isMobile ? 24 : 12">
            <el-form-item label="医生" prop="doctorId">
              <el-select v-model="form.doctorId" placeholder="请选择医生" style="width: 100%">
                <el-option
                  v-for="doctor in doctors"
                  :key="doctor.id"
                  :label="doctor.name"
                  :value="doctor.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="isMobile ? 24 : 12">
            <el-form-item label="预约时间" prop="appointmentTime">
              <el-date-picker
                v-model="form.appointmentTime"
                type="datetime"
                placeholder="请选择预约时间"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="isMobile ? 24 : 12">
            <el-form-item label="科室" prop="departmentId">
              <el-select v-model="form.departmentId" placeholder="请选择科室" style="width: 100%">
                <el-option
                  v-for="dept in departments"
                  :key="dept.id"
                  :label="dept.name"
                  :value="dept.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="症状描述" prop="symptoms">
          <el-input
            v-model="form.symptoms"
            type="textarea"
            :rows="4"
            placeholder="请描述患者症状"
          />
        </el-form-item>
        
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
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
  name: "Appointments",
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
      patientName: "",
      doctorName: "",
      department: "",
      status: ""
    })

    const form = reactive({
      id: null,
      patientId: "",
      doctorId: "",
      appointmentTime: "",
      departmentId: "",
      symptoms: "",
      remark: ""
    })

    const rules = {
      patientId: [
        { required: true, message: '请选择患者', trigger: 'change' }
      ],
      doctorId: [
        { required: true, message: '请选择医生', trigger: 'change' }
      ],
      appointmentTime: [
        { required: true, message: '请选择预约时间', trigger: 'change' }
      ],
      departmentId: [
        { required: true, message: '请选择科室', trigger: 'change' }
      ],
      symptoms: [
        { required: true, message: '请输入症状描述', trigger: 'blur' }
      ]
    }

    // 模拟数据
    const appointments = ref([
      {
        id: 1,
        patientId: 1,
        doctorId: 1,
        patientName: "张三",
        doctorName: "李医生",
        department: "内科",
        appointmentTime: "2024-01-20 09:00:00",
        status: "已预约",
        symptoms: "胸闷气短，心慌",
        remark: "患者有高血压病史",
        createTime: "2024-01-15 10:30:00"
      },
      {
        id: 2,
        patientId: 2,
        doctorId: 2,
        patientName: "王五",
        doctorName: "王医生",
        department: "外科",
        appointmentTime: "2024-01-21 14:30:00",
        status: "已完成",
        symptoms: "腹痛，恶心呕吐",
        remark: "需要进一步检查",
        createTime: "2024-01-14 15:20:00"
      },
      {
        id: 3,
        patientId: 3,
        doctorId: 3,
        patientName: "刘七",
        doctorName: "张医生",
        department: "儿科",
        appointmentTime: "2024-01-22 10:00:00",
        status: "已取消",
        symptoms: "发热咳嗽",
        remark: "患者临时有事取消",
        createTime: "2024-01-13 09:15:00"
      }
    ])

    // 患者、医生、科室数据
    const patients = ref([
      { id: 1, name: '张三' },
      { id: 2, name: '王五' },
      { id: 3, name: '刘七' }
    ])
    
    const doctors = ref([
      { id: 1, name: '李医生' },
      { id: 2, name: '王医生' },
      { id: 3, name: '张医生' }
    ])
    
    const departments = ref([
      { id: 1, name: '内科' },
      { id: 2, name: '外科' },
      { id: 3, name: '儿科' },
      { id: 4, name: '妇产科' },
      { id: 5, name: '康复科' }
    ])

    // 检测屏幕尺寸
    const checkScreenSize = () => {
      isMobile.value = window.innerWidth <= 768
    }

    // 过滤后的预约列表
    const filteredAppointments = computed(() => {
      let result = appointments.value
      
      if (searchForm.patientName) {
        result = result.filter(appointment => appointment.patientName.includes(searchForm.patientName))
      }
      if (searchForm.doctorName) {
        result = result.filter(appointment => appointment.doctorName.includes(searchForm.doctorName))
      }
      if (searchForm.department) {
        result = result.filter(appointment => appointment.department === searchForm.department)
      }
      if (searchForm.status) {
        result = result.filter(appointment => appointment.status === searchForm.status)
      }
      
      total.value = result.length
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return result.slice(start, end)
    })

    // 获取状态类型
    const getStatusType = (status) => {
      const statusMap = {
        "已预约": "primary",
        "已完成": "success",
        "已取消": "danger"
      }
      return statusMap[status] || "info"
    }

    // 打开对话框
    const openDialog = (appointment = null) => {
      isEdit.value = !!appointment
      if (appointment) {
        Object.keys(form).forEach(key => {
          form[key] = appointment[key]
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
          const index = appointments.value.findIndex(a => a.id === form.id)
          if (index !== -1) {
            appointments.value[index] = { ...form }
          }
          ElMessage.success("预约信息更新成功")
        } else {
          const newAppointment = {
            ...form,
            id: Date.now(),
            patientName: patients.value.find(p => p.id === form.patientId)?.name || '',
            doctorName: doctors.value.find(d => d.id === form.doctorId)?.name || '',
            department: departments.value.find(dept => dept.id === form.departmentId)?.name || '',
            status: "已预约",
            createTime: new Date().toLocaleString()
          }
          appointments.value.unshift(newAppointment)
          ElMessage.success("预约信息添加成功")
        }
        
        dialogVisible.value = false
        resetForm()
      } catch (error) {
        console.error("表单验证失败:", error)
      } finally {
        submitting.value = false
      }
    }

    // 删除预约
    const handleDelete = async (id) => {
      try {
        await ElMessageBox.confirm("确定要删除这个预约吗？", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        
        const index = appointments.value.findIndex(a => a.id === id)
        if (index !== -1) {
          appointments.value.splice(index, 1)
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
      patients,
      doctors,
      departments,
      filteredAppointments,
      getStatusType,
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
.appointments-container {
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

.appointment-dialog .el-dialog__body {
  padding: 20px 24px;
}

.appointment-form .el-form-item {
  margin-bottom: 20px;
}

.dialog-footer {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .appointments-container {
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

  .appointment-dialog .el-dialog__body {
    padding: 16px;
  }

  .pagination-wrapper {
    text-align: center;
  }
}

@media (max-width: 480px) {
  .appointments-container {
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
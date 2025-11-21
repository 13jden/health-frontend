import axios from "axios"
import { ElMessage } from "element-plus"

// 创建axios实例
// 开发环境使用代理（/api），生产环境使用环境变量或完整URL
// 如果设置了 VITE_API_BASE_URL，开发环境也可以直接使用（不使用代理）
const baseURL = import.meta.env.PROD 
  ? (import.meta.env.VITE_API_BASE_URL || "http://115.190.53.97:8081")
  : (import.meta.env.VITE_API_BASE_URL || "/api")

const request = axios.create({
  baseURL,
  timeout: 30000, // 增加到30秒，避免网络慢时超时
  headers: {
    "Content-Type": "application/json"
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const { data } = response
    
    // 如果返回的状态码为200，说明接口请求成功，可以正常拿到数据
    if (data.code === 200 || response.status === 200) {
      // 如果data有code字段，说明是Result格式，直接返回data
      // 如果data没有code字段，说明是直接返回的数据，包装一下
      if (data.code !== undefined) {
        return data
      } else {
        return { code: 200, data: data, message: "success" }
      }
    } else {
      // 否则的话抛出错误
      ElMessage.error(data.message || "请求失败")
      return Promise.reject(new Error(data.message || "请求失败"))
    }
  },
  (error) => {
    const { response } = error
    
    if (response) {
      switch (response.status) {
        case 401:
          ElMessage.error("未授权，请重新登录")
          // 清除token并跳转到登录页
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          window.location.href = "/login"
          break
        case 403:
          ElMessage.error("拒绝访问")
          break
        case 404:
          ElMessage.error("请求地址出错")
          break
        case 500:
          ElMessage.error("服务器内部错误")
          break
        default:
          ElMessage.error(`网络错误: ${response.status}`)
      }
    } else {
      // 网络连接失败（可能是后端服务未启动或地址错误）
      const errorMsg = code === 'ERR_NETWORK' 
        ? "无法连接到后端服务，请检查后端是否运行或地址配置是否正确"
        : "网络连接失败"
      ElMessage.error(errorMsg)
      console.error("网络错误详情:", {
        code,
        message,
        url: error.config?.url,
        baseURL: error.config?.baseURL
      })
    }
    
    return Promise.reject(error)
  }
)

// 用户相关API
export const userAPI = {
  // 登录
  login: (data) => request.post("/auth/login", data),
  
  // 获取用户信息
  getUserInfo: () => request.get("/auth/user"),
  
  // 登出
  logout: () => request.post("/auth/logout")
}

// 管理员用户管理API
export const userManagerAPI = {
  // 创建用户
  createUser: (data) => request.post("/admin/user", data),
  
  // 获取用户详情
  getUser: (id) => request.get(`/admin/user/${id}`),
  
  // 获取用户列表（分页）
  getUserList: (params) => request.get("/admin/user", { params }),
  
  // 获取所有用户列表（不分页）
  getAllUsers: () => request.get("/admin/user/all"),
  
  // 更新用户信息
  updateUser: (id, data) => request.put(`/admin/user/${id}`, data),
  
  // 删除用户
  deleteUser: (id) => request.delete(`/admin/user/${id}`),

  // 获取患者列表（儿童+家长信息）
  getPatientList: (params) => request.get("/admin/user/patients", { params }),
  
  // 根据childId获取患者信息
  getPatientByChildId: (childId) => request.get(`/admin/user/patient/${childId}`)
}

// 患者相关API
export const patientAPI = {
  // 获取患者列表
  getPatients: (params) => request.get("/patients", { params }),
  
  // 获取患者详情
  getPatient: (id) => request.get(`/patients/${id}`),
  
  // 创建患者
  createPatient: (data) => request.post("/patients", data),
  
  // 更新患者
  updatePatient: (id, data) => request.put(`/patients/${id}`, data),
  
  // 删除患者
  deletePatient: (id) => request.delete(`/patients/${id}`)
}

// 医生相关API
export const doctorAPI = {
  // 获取医生列表
  getDoctors: (params) => request.get("/doctors", { params }),
  
  // 获取医生详情
  getDoctor: (id) => request.get(`/doctors/${id}`),
  
  // 创建医生
  createDoctor: (data) => request.post("/doctors", data),
  
  // 更新医生
  updateDoctor: (id, data) => request.put(`/doctors/${id}`, data),
  
  // 删除医生
  deleteDoctor: (id) => request.delete(`/doctors/${id}`)
}

// 预约相关API
export const appointmentAPI = {
  // 获取预约列表
  getAppointments: (params) => request.get("/appointments", { params }),
  
  // 获取预约详情
  getAppointment: (id) => request.get(`/appointments/${id}`),
  
  // 创建预约
  createAppointment: (data) => request.post("/appointments", data),
  
  // 更新预约
  updateAppointment: (id, data) => request.put(`/appointments/${id}`, data),
  
  // 删除预约
  deleteAppointment: (id) => request.delete(`/appointments/${id}`)
}

// 科室相关API
export const departmentAPI = {
  // 获取科室列表
  getDepartments: (params) => request.get("/departments", { params }),
  
  // 获取科室详情
  getDepartment: (id) => request.get(`/departments/${id}`),
  
  // 创建科室
  createDepartment: (data) => request.post("/departments", data),
  
  // 更新科室
  updateDepartment: (id, data) => request.put(`/departments/${id}`, data),
  
  // 删除科室
  deleteDepartment: (id) => request.delete(`/departments/${id}`)
}

// 饮食记录API
export const dietRecordAPI = {
  // 上传饮食图片
  uploadImage: (image) => {
    const formData = new FormData()
    formData.append("image", image)
    return request.post("/diet-record/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
  },
  
  // 快速添加饮食记录（通过图片URL）
  addQuickRecordByUrls: (childId, data) => request.post(`/diet-record/${childId}`, data),
  
  // 添加饮食记录
  addRecord: (data) => request.post("/diet-record", data),
  
  // 获取饮食记录详情
  getRecord: (id) => request.get(`/diet-record/${id}`),
  
  // 获取儿童饮食记录列表
  getRecordsByChildId: (childId) => request.get(`/diet-record/child/${childId}`),
  
  // 获取儿童指定日期的饮食记录
  getRecordsByChildIdAndDate: (childId, recordDate) => 
    request.get(`/diet-record/child/${childId}/date/${recordDate}`),
  
  // 获取儿童最新饮食记录
  getLatestRecords: (childId, limit = 5) => 
    request.get(`/diet-record/child/${childId}/latest`, { params: { limit } }),
  
  // 获取儿童指定餐次的饮食记录
  getRecordsByChildIdAndMealTypeAndDate: (childId, mealType, recordDate) =>
    request.get(`/diet-record/child/${childId}/meal/${mealType}/date/${recordDate}`),
  
  // 更新饮食记录
  updateRecord: (id, data) => request.put(`/diet-record/${id}`, data),
  
  // 删除饮食记录
  deleteRecord: (id) => request.delete(`/diet-record/${id}`),
  
  // 删除儿童所有饮食记录
  deleteRecordsByChildId: (childId) => request.delete(`/diet-record/child/${childId}`)
}

// 运动记录API
export const exerciseRecordAPI = {
  // 快速添加运动记录
  addQuickRecord: (childId, content) => 
    request.post(`/exercise-record/${childId}`, null, { params: { content } }),
  
  // 添加运动记录
  addRecord: (data) => request.post("/exercise-record", data),
  
  // 获取运动记录详情
  getRecord: (id) => request.get(`/exercise-record/${id}`),
  
  // 获取儿童运动记录列表
  getRecordsByChildId: (childId) => request.get(`/exercise-record/child/${childId}`),
  
  // 获取儿童指定日期的运动记录
  getRecordsByChildIdAndDate: (childId, recordDate) =>
    request.get(`/exercise-record/child/${childId}/date/${recordDate}`),
  
  // 获取儿童最新运动记录
  getLatestRecords: (childId, limit = 5) =>
    request.get(`/exercise-record/child/${childId}/latest`, { params: { limit } }),
  
  // 获取儿童指定类型的运动记录
  getRecordsByChildIdAndExerciseType: (childId, exerciseType) =>
    request.get(`/exercise-record/child/${childId}/type/${exerciseType}`),
  
  // 更新运动记录
  updateRecord: (id, data) => request.put(`/exercise-record/${id}`, data),
  
  // 删除运动记录
  deleteRecord: (id) => request.delete(`/exercise-record/${id}`),
  
  // 删除儿童所有运动记录
  deleteRecordsByChildId: (childId) => request.delete(`/exercise-record/child/${childId}`)
}

// 生长记录API（体测记录）
export const growthRecordAPI = {
  // 添加生长记录
  addRecord: (data) => request.post("/growth-record", data),
  
  // 获取生长记录详情
  getRecord: (id) => request.get(`/growth-record/${id}`),
  
  // 获取儿童生长记录列表
  getRecordsByChildId: (childId) => request.get(`/growth-record/child/${childId}`),
  
  // 获取儿童最新记录
  getLatestRecords: (childId, limit = 5) =>
    request.get(`/growth-record/child/${childId}/latest`, { params: { limit } }),
  
  // 更新生长记录
  updateRecord: (id, data) => request.put(`/growth-record/${id}`, data),
  
  // 删除生长记录
  deleteRecord: (id) => request.delete(`/growth-record/${id}`),
  
  // 删除儿童所有记录
  deleteRecordsByChildId: (childId) => request.delete(`/growth-record/child/${childId}`)
}

// 儿童相关API
export const childAPI = {
  // 获取儿童详情
  getChild: (id) => request.get(`/child/${id}`),
  
  // 添加儿童信息
  addChild: (data) => request.post("/child", data)
}

export default request


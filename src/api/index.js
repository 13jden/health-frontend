import axios from "axios"
import { ElMessage } from "element-plus"

// 创建axios实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  timeout: 10000,
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
    if (data.code === 200) {
      return data
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
          ElMessage.error("网络错误")
      }
    } else {
      ElMessage.error("网络连接失败")
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

export default request


import { createRouter, createWebHistory } from "vue-router"
import { useUserStore } from "../store/user"
import Login from "../views/Login.vue"
import Layout from "../views/Layout.vue"
import Home from "../views/Home.vue"

const routes = [
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { title: "登录" }
  },
  {
    path: "/",
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        name: "Home",
        component: Home,
        meta: { title: "首页" }
      },
      {
        path: "patients",
        name: "Patients",
        component: () => import("../views/Patients.vue"),
        meta: { title: "患者管理" }
      },
      {
        path: "doctors",
        name: "Doctors",
        component: () => import("../views/Doctors.vue"),
        meta: { title: "医生管理" }
      },
      {
        path: "departments",
        name: "Departments",
        component: () => import("../views/Departments.vue"),
        meta: { title: "科室管理" }
      },
      {
        path: "patients/:id/detail",
        name: "PatientPunch",
        component: () => import("../views/PatientPunch.vue"),
        meta: { title: "患者详细信息" }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 嘉兴医院管理系统`
  }
  
  // 检查是否需要登录
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next("/login")
  } else if (to.path === "/login" && userStore.isLoggedIn) {
    next("/")
  } else {
    next()
  }
})

export default router

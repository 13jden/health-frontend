<template>
  <div class="app-wrapper">
    <!-- 移动端遮罩层 -->
    <div 
      v-if="isMobile && sidebarVisible" 
      class="sidebar-mask" 
      @click="toggleSidebar"
    ></div>
    
    <div class="sidebar-container" :class="{ 'sidebar-collapsed': !sidebarVisible }">
      <!-- 侧边栏 -->
      <div class="logo-container">
        <h1 class="logo-title">嘉兴医院管理系统</h1>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        router
        @select="handleMenuSelect"
      >
        <el-menu-item index="/">
          <el-icon><House /></el-icon>
          <span>首页</span>
        </el-menu-item>
        
        <el-sub-menu index="patient">
          <template #title>
            <el-icon><User /></el-icon>
            <span>患者管理</span>
          </template>
          <el-menu-item index="/patients">患者列表</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="doctor">
          <template #title>
            <el-icon><Avatar /></el-icon>
            <span>医生管理</span>
          </template>
          <el-menu-item index="/doctors">医生列表</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="appointment">
          <template #title>
            <el-icon><Calendar /></el-icon>
            <span>预约管理</span>
          </template>
          <el-menu-item index="/appointments">预约列表</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="department">
          <template #title>
            <el-icon><OfficeBuilding /></el-icon>
            <span>科室管理</span>
          </template>
          <el-menu-item index="/departments">科室列表</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </div>

    <div class="main-container" :class="{ 'main-expanded': !sidebarVisible }">
      <div class="navbar">
        <!-- 移动端菜单按钮 -->
        <div class="mobile-menu-btn" @click="toggleSidebar">
          <el-icon><Menu /></el-icon>
        </div>
        
        <!-- 左侧标题 -->
        <div class="page-title">
          {{ pageTitle }}
        </div>
        
        <div class="right-menu">
          <el-dropdown @command="handleCommand" trigger="click">
            <span class="el-dropdown-link">
              {{ userStore.user?.name || '管理员' }}<el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人资料
                </el-dropdown-item>
                <el-dropdown-item command="settings">
                  <el-icon><Setting /></el-icon>
                  系统设置
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      
      <div class="app-main">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useUserStore } from "../store/user"
import { ElMessage, ElMessageBox } from "element-plus"
import {
  House,
  User,
  Avatar,
  Calendar,
  OfficeBuilding,
  ArrowDown,
  Setting,
  SwitchButton,
  Menu
} from "@element-plus/icons-vue"

export default {
  name: "Layout",
  components: {
    House,
    User,
    Avatar,
    Calendar,
    OfficeBuilding,
    ArrowDown,
    Setting,
    SwitchButton,
    Menu
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const userStore = useUserStore()
    
    // 响应式状态
    const sidebarVisible = ref(true)
    const isMobile = ref(false)
    
    const activeMenu = computed(() => route.path)
    
    const pageTitle = computed(() => {
      const matched = route.matched.filter(item => item.meta && item.meta.title)
      if (matched.length > 0) {
        return matched[matched.length - 1].meta.title
      }
      return '首页'
    })
    
    // 检测屏幕尺寸
    const checkScreenSize = () => {
      isMobile.value = window.innerWidth <= 768
      if (isMobile.value) {
        sidebarVisible.value = false
      } else {
        sidebarVisible.value = true
      }
    }
    
    // 切换侧边栏
    const toggleSidebar = () => {
      sidebarVisible.value = !sidebarVisible.value
    }
    
    // 菜单选择处理
    const handleMenuSelect = () => {
      if (isMobile.value) {
        sidebarVisible.value = false
      }
    }
    
    const handleCommand = async (command) => {
      switch (command) {
        case "profile":
          ElMessage.info("个人资料功能开发中...")
          break
        case "settings":
          ElMessage.info("系统设置功能开发中...")
          break
        case "logout":
          try {
            await ElMessageBox.confirm("确认要退出登录吗？", "提示", {
              confirmButtonText: "确认",
              cancelButtonText: "取消",
              type: "warning"
            })
            userStore.logout()
            ElMessage.success("已退出登录")
            router.push("/login")
          } catch {
            // 用户取消
          }
          break
      }
    }
    
    // 生命周期
    onMounted(() => {
      checkScreenSize()
      window.addEventListener('resize', checkScreenSize)
    })
    
    onUnmounted(() => {
      window.removeEventListener('resize', checkScreenSize)
    })
    
    return {
      userStore,
      activeMenu,
      pageTitle,
      sidebarVisible,
      isMobile,
      toggleSidebar,
      handleMenuSelect,
      handleCommand
    }
  }
}
</script>

<style scoped>
.app-wrapper {
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
}

/* 移动端遮罩层 */
.sidebar-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 998;
}

.sidebar-container {
  width: 210px;
  height: 100%;
  background-color: #304156;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  overflow-y: auto;
  z-index: 999;
  transition: transform 0.3s ease;
}

.sidebar-container.sidebar-collapsed {
  transform: translateX(-100%);
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-title {
  color: #fff;
  font-size: 18px;
  margin: 0;
}

.sidebar-menu {
  border-right: none;
}

.main-container {
  margin-left: 210px;
  min-height: 100%;
  width: calc(100% - 210px);
  position: relative;
  transition: margin-left 0.3s ease, width 0.3s ease;
}

.main-container.main-expanded {
  margin-left: 0;
  width: 100%;
}

.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.mobile-menu-btn {
  display: none;
  cursor: pointer;
  padding: 8px;
  color: #606266;
  font-size: 18px;
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.right-menu {
  display: flex;
  align-items: center;
}

.app-main {
  padding: 20px;
  min-height: calc(100vh - 50px);
  position: relative;
  overflow-x: auto;
}

/* 移动端响应式设计 */
@media (max-width: 768px) {
  .sidebar-container {
    width: 280px;
  }
  
  .main-container {
    margin-left: 0;
    width: 100%;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .navbar {
    padding: 0 16px;
  }
  
  .app-main {
    padding: 16px;
  }
  
  .logo-title {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .sidebar-container {
    width: 100%;
  }
  
  .navbar {
    padding: 0 12px;
  }
  
  .app-main {
    padding: 12px;
  }
  
  .page-title {
    font-size: 14px;
  }
  
  .logo-title {
    font-size: 14px;
  }
}

/* 确保内容可以滚动 */
.app-main {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

/* 修复Element Plus在移动端的样式问题 */
@media (max-width: 768px) {
  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    padding-left: 20px !important;
  }
  
  :deep(.el-sub-menu .el-menu-item) {
    padding-left: 40px !important;
  }
}
</style>

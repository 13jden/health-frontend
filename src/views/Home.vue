<template>
  <div class="home-container">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <h1>欢迎使用嘉兴医院管理系统</h1>
        <p>Health Management System</p>
        <div class="welcome-stats">
          <div class="stat-item">
            <span class="stat-number">{{ stats.patients }}</span>
            <span class="stat-label">患者总数</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ stats.doctors }}</span>
            <span class="stat-label">医生总数</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ stats.appointments }}</span>
            <span class="stat-label">今日预约</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ stats.departments }}</span>
            <span class="stat-label">科室总数</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 快速操作区域 -->
    <div class="quick-actions-section">
      <h2>快速操作</h2>
      <div class="actions-grid">
        <div class="action-card" @click="navigateTo('/patients')">
          <div class="action-icon patient">
            <el-icon><User /></el-icon>
          </div>
          <div class="action-content">
            <h3>患者管理</h3>
            <p>管理患者信息</p>
          </div>
        </div>
        
        <div class="action-card" @click="navigateTo('/doctors')">
          <div class="action-icon doctor">
            <el-icon><Avatar /></el-icon>
          </div>
          <div class="action-content">
            <h3>医生管理</h3>
            <p>管理医生信息</p>
          </div>
        </div>
        
        <div class="action-card" @click="navigateToPunch">
          <div class="action-icon punch">
            <el-icon><Finished /></el-icon>
          </div>
          <div class="action-content">
            <h3>患者打卡</h3>
            <p>记录患者每日状态</p>
          </div>
        </div>
        
        <div class="action-card" @click="navigateTo('/departments')">
          <div class="action-icon department">
            <el-icon><OfficeBuilding /></el-icon>
          </div>
          <div class="action-content">
            <h3>科室管理</h3>
            <p>管理科室信息</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 最近活动区域 -->
    <div class="recent-activities-section">
      <h2>最近活动</h2>
      <el-card class="activities-card" shadow="never">
        <el-timeline>
          <el-timeline-item
            v-for="activity in recentActivities"
            :key="activity.id"
            :timestamp="activity.time"
            :type="activity.type"
            :icon="getActivityIcon(activity.type)"
          >
            <div class="activity-content">
              <h4>{{ activity.title }}</h4>
              <p>{{ activity.content }}</p>
            </div>
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { ElMessage } from "element-plus"
import { User, Avatar, OfficeBuilding, Check, Warning, InfoFilled, Finished } from "@element-plus/icons-vue"

export default {
  name: "Home",
  components: {
    User,
    Avatar,
    OfficeBuilding,
    Check,
    Warning,
    InfoFilled,
    Finished
  },
  setup() {
    const router = useRouter()
    
    const stats = ref({
      patients: 0,
      doctors: 0,
      appointments: 0,
      departments: 0
    })
    
    const recentActivities = ref([])
    
    const loadStats = async () => {
      try {
        // 直接使用写死的数据
        stats.value = {
          patients: 1250,
          doctors: 85,
          appointments: 45,
          departments: 12
        }
      } catch (error) {
        ElMessage.error("加载统计数据失败")
      }
    }
    
    const loadRecentActivities = async () => {
      await new Promise(resolve => setTimeout(resolve, 300))
      recentActivities.value = [
        {
          id: 1,
          title: "新增患者",
          content: "新增患者：张三",
          time: "2024-01-15 10:30",
          type: "primary"
        },
        {
          id: 2,
          title: "预约成功",
          content: "预约成功：李四 - 内科",
          time: "2024-01-15 09:15",
          type: "success"
        },
        {
          id: 3,
          title: "医生信息更新",
          content: "医生信息更新：王医生",
          time: "2024-01-15 08:45",
          type: "warning"
        },
        {
          id: 4,
          title: "新增科室",
          content: "新增科室：康复科",
          time: "2024-01-14 16:20",
          type: "info"
        }
      ]
    }
    
    const getActivityIcon = (type) => {
      const iconMap = {
        primary: Check,
        success: Check,
        warning: Warning,
        info: InfoFilled
      }
      return iconMap[type] || Check
    }
    
    const navigateTo = (path) => {
      router.push(path)
    }

    const navigateToPunch = () => {
      router.push("/patients")
      ElMessage.info("请选择患者以记录打卡")
    }
    
    onMounted(() => {
      loadStats()
      loadRecentActivities()
    })
    
    return {
      stats,
      recentActivities,
      getActivityIcon,
      navigateTo,
      navigateToPunch
    }
  }
}
</script>

<style scoped>
.home-container {
  padding: 24px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.welcome-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  padding: 40px;
  margin-bottom: 32px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.welcome-content h1 {
  font-size: 32px;
  margin-bottom: 12px;
  font-weight: 600;
}

.welcome-content p {
  font-size: 16px;
  opacity: 0.9;
  margin-bottom: 32px;
}

.welcome-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 24px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.stat-number {
  display: block;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.quick-actions-section {
  margin-bottom: 32px;
}

.quick-actions-section h2 {
  margin-bottom: 24px;
  color: #303133;
  font-size: 20px;
  font-weight: 600;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.action-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.action-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  flex-shrink: 0;
}

.action-icon.patient {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.action-icon.doctor {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

.action-icon.appointment {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
}

.action-icon.department {
  background: linear-gradient(135deg, #43e97b, #38f9d7);
}

.action-icon.punch {
  background: linear-gradient(135deg, #f6d365, #fda085);
}

.action-content h3 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.action-content p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.recent-activities-section h2 {
  margin-bottom: 24px;
  color: #303133;
  font-size: 20px;
  font-weight: 600;
}

.activities-card {
  border-radius: 12px;
  padding: 24px;
}

.activity-content h4 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.activity-content p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .home-container {
    padding: 16px;
  }
  
  .welcome-section {
    padding: 24px;
  }
  
  .welcome-content h1 {
    font-size: 24px;
  }
  
  .welcome-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .stat-item {
    padding: 16px;
  }
  
  .stat-number {
    font-size: 24px;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .action-card {
    padding: 20px;
  }
  
  .action-icon {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }

  .activities-card {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .home-container {
    padding: 12px;
  }
  
  .welcome-section {
    padding: 20px;
  }
  
  .welcome-content h1 {
    font-size: 20px;
  }
  
  .welcome-stats {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .stat-item {
    padding: 12px;
  }
  
  .stat-number {
    font-size: 20px;
  }
  
  .action-card {
    padding: 16px;
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .action-icon {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }

  .activities-card {
    padding: 12px;
  }

  .activity-content h4 {
    font-size: 14px;
  }

  .activity-content p {
    font-size: 12px;
  }
}
</style>

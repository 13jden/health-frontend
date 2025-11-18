<template>
  <div class="insight-container" v-loading="loading">
    <div class="page-header">
      <div class="header-left">
        <el-button link type="primary" @click="handleBack">
          <el-icon><Back /></el-icon>
          返回患者列表
        </el-button>
        <h2>患者健康打卡概览</h2>
        <p>查看患者在客户端的体测、饮食、锻炼与智能报告</p>
      </div>
      <div class="header-right" v-if="patient">
        <el-tag type="success">患者ID：{{ patient.id }}</el-tag>
        <el-tag>{{ patient.gender }} · {{ patient.age }}岁</el-tag>
      </div>
    </div>

    <el-row :gutter="20">
      <el-col :span="24" :lg="7">
        <el-card class="profile-card" shadow="never">
          <template #header>
            <div class="card-title">
              <span>基本信息</span>
            </div>
          </template>
          <template v-if="patient">
            <div class="profile-name">
              <strong>{{ patient.name }}</strong>
              <span>{{ patient.department }}</span>
            </div>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="主管医生">{{ patient.doctor }}</el-descriptions-item>
              <el-descriptions-item label="联系电话">{{ patient.phone }}</el-descriptions-item>
              <el-descriptions-item label="紧急联系人">{{ patient.emergencyContact }}</el-descriptions-item>
              <el-descriptions-item label="紧急电话">{{ patient.emergencyPhone }}</el-descriptions-item>
            </el-descriptions>
          </template>
          <el-empty v-else description="未找到患者信息" />
        </el-card>

        <el-card class="kpi-card" shadow="never">
          <template #header>
            <div class="card-title">
              <span>关键指标</span>
            </div>
          </template>
          <div class="kpi-grid">
            <div class="kpi-item">
              <div class="kpi-icon body">
                <el-icon><DataAnalysis /></el-icon>
              </div>
              <div>
                <p class="kpi-value">{{ bodyTests.length }}</p>
                <p class="kpi-label">体测记录</p>
              </div>
            </div>
            <div class="kpi-item">
              <div class="kpi-icon diet">
                <el-icon><ForkSpoon /></el-icon>
              </div>
              <div>
                <p class="kpi-value">{{ dietSummary.calories }} kcal</p>
                <p class="kpi-label">本周饮食热量</p>
              </div>
            </div>
            <div class="kpi-item">
              <div class="kpi-icon sport">
                <el-icon><Timer /></el-icon>
              </div>
              <div>
                <p class="kpi-value">{{ exerciseSummary.duration }} min</p>
                <p class="kpi-label">锻炼时长</p>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="24" :lg="17">
        <el-card class="module-card body-card" shadow="never">
          <template #header>
            <div class="module-header">
              <div class="module-meta">
                <el-icon class="body-icon"><DataAnalysis /></el-icon>
                <div>
                  <h3>体测记录</h3>
                  <p>身高体重趋势、骨龄与BMI变化</p>
                </div>
              </div>
              <div v-if="latestBodyTest" class="module-highlight">
                <span>最近体测：{{ latestBodyTest.testDate }}</span>
                <el-tag size="small" type="info">BMI {{ latestBodyTest.bmi }}</el-tag>
              </div>
            </div>
          </template>
          <el-table :data="bodyTests" stripe>
            <el-table-column prop="testDate" label="体测日期" width="140" />
            <el-table-column prop="height" label="身高(cm)" width="120" />
            <el-table-column prop="weight" label="体重(kg)" width="120" />
            <el-table-column prop="bmi" label="BMI" width="100" />
            <el-table-column prop="boneAge" label="骨龄" width="100" />
            <el-table-column prop="createTime" label="采集时间" min-width="200" show-overflow-tooltip />
          </el-table>
        </el-card>

        <el-card class="module-card diet-card" shadow="never">
          <template #header>
            <div class="module-header">
              <div class="module-meta">
                <el-icon class="diet-icon"><ForkSpoon /></el-icon>
                <div>
                  <h3>饮食打卡</h3>
                  <p>客户端上传的膳食与营养素记录</p>
                </div>
              </div>
              <div class="module-highlight">
                <span>累计热量：{{ dietSummary.calories }} kcal</span>
              </div>
            </div>
          </template>
          <div class="diet-list">
            <div v-for="record in displayedDietRecords" :key="record.id" class="diet-item">
              <div class="diet-cover" v-if="record.imageList?.length">
                <img :src="record.imageList[0]" :alt="record.foodName" loading="lazy" />
                <span class="diet-badge">{{ record.mealType }}</span>
              </div>
              <div class="diet-content">
                <div class="diet-title">
                  <strong>{{ record.foodName }}</strong>
                  <el-tag size="small">{{ record.foodCategory }}</el-tag>
                </div>
                <p class="diet-notes">{{ record.notes }}</p>
                <div class="diet-meta">
                  <span>摄入量：{{ record.quantity }}{{ record.unit }}</span>
                  <span>热量：{{ record.calories }} kcal</span>
                  <span>蛋白质：{{ record.protein }} g</span>
                  <span>碳水：{{ record.carbohydrate }} g</span>
                  <span>脂肪：{{ record.fat }} g</span>
                </div>
                <small>记录时间：{{ record.recordDate }}</small>
              </div>
            </div>
          </div>
          <div
            v-if="dietRecords.length > initialDisplayCount && dietRecords.length"
            class="list-controls"
          >
            <el-button
              size="small"
              type="primary"
              plain
              @click="loadMoreDiet"
              :disabled="displayedDietRecords.length >= dietRecords.length"
            >
              加载更多
            </el-button>
            <el-button
              size="small"
              link
              @click="collapseDiet"
              :disabled="displayedDietRecords.length <= initialDisplayCount"
            >
              一键收起
            </el-button>
          </div>
          <div v-if="!dietRecords.length" class="empty-block">
            <el-empty description="暂无饮食打卡" />
          </div>
        </el-card>

        <el-card class="module-card exercise-card" shadow="never">
          <template #header>
            <div class="module-header">
              <div class="module-meta">
                <el-icon class="sport-icon"><Timer /></el-icon>
                <div>
                  <h3>锻炼打卡</h3>
                  <p>记录客户端的运动类型、强度与消耗</p>
                </div>
              </div>
              <div class="module-highlight">
                <span>总时长：{{ exerciseSummary.duration }} 分钟</span>
                <el-tag size="small" type="success">消耗 {{ exerciseSummary.calories }} kcal</el-tag>
              </div>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="exercise in displayedExerciseRecords"
              :key="exercise.id"
              :timestamp="exercise.recordDate"
              placement="top"
            >
              <div class="exercise-item">
                <div class="exercise-title">
                  <strong>{{ exercise.exerciseType }}</strong>
                  <el-tag size="small" type="info">{{ exercise.intensity }}</el-tag>
                </div>
                <div class="exercise-meta">
                  <span>类型：{{ exercise.exerciseCategory }}</span>
                  <span>时长：{{ exercise.duration }} 分钟</span>
                  <span>消耗：{{ exercise.caloriesBurned }} kcal</span>
                  <span v-if="exercise.distance">距离：{{ exercise.distance }} km</span>
                </div>
                <p v-if="exercise.notes">备注：{{ exercise.notes }}</p>
              </div>
            </el-timeline-item>
          </el-timeline>
          <div
            v-if="exerciseRecords.length > initialDisplayCount && exerciseRecords.length"
            class="list-controls"
          >
            <el-button
              size="small"
              type="primary"
              plain
              @click="loadMoreExercise"
              :disabled="displayedExerciseRecords.length >= exerciseRecords.length"
            >
              加载更多
            </el-button>
            <el-button
              size="small"
              link
              @click="collapseExercise"
              :disabled="displayedExerciseRecords.length <= initialDisplayCount"
            >
              一键收起
            </el-button>
          </div>
          <div v-if="!exerciseRecords.length" class="empty-block">
            <el-empty description="暂无锻炼记录" />
          </div>
        </el-card>

        <el-card class="module-card report-card" shadow="never">
          <template #header>
            <div class="module-header">
              <div class="module-meta">
                <el-icon class="report-icon"><Document /></el-icon>
                <div>
                  <h3>智能报告</h3>
                  <p>系统根据全部打卡生成的Markdown报告</p>
                </div>
              </div>
              <el-button size="small" type="primary" plain @click="handleDownloadReport" :disabled="!reportContent">
                下载Markdown
              </el-button>
            </div>
          </template>
          <div v-if="reportContent" class="markdown-preview" v-html="renderedReport"></div>
          <div v-else class="empty-block">
            <el-empty description="暂无报告" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import { ElMessage } from "element-plus"
import { Back, DataAnalysis, ForkSpoon, Timer, Document } from "@element-plus/icons-vue"

export default {
  name: "PatientPunch",
  components: {
    Back,
    DataAnalysis,
    ForkSpoon,
    Timer,
    Document
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const loading = ref(true)
    const patient = ref(null)
    const bodyTests = ref([])
    const dietRecords = ref([])
    const exerciseRecords = ref([])
    const reportContent = ref("")
    const initialDisplayCount = 5
    const loadMoreStep = 10
    const dietDisplayCount = ref(initialDisplayCount)
    const exerciseDisplayCount = ref(initialDisplayCount)

    const latestBodyTest = computed(() => bodyTests.value[0] || null)

    const dietSummary = computed(() => {
      const totals = { calories: 0, protein: 0, carbohydrate: 0, fat: 0 }
      dietRecords.value.forEach(item => {
        totals.calories += Number(item.calories || 0)
        totals.protein += Number(item.protein || 0)
        totals.carbohydrate += Number(item.carbohydrate || 0)
        totals.fat += Number(item.fat || 0)
      })
      return {
        calories: totals.calories.toFixed(0),
        protein: totals.protein.toFixed(1),
        carbohydrate: totals.carbohydrate.toFixed(1),
        fat: totals.fat.toFixed(1)
      }
    })

    const exerciseSummary = computed(() => {
      const totals = { duration: 0, calories: 0 }
      exerciseRecords.value.forEach(item => {
        totals.duration += Number(item.duration || 0)
        totals.calories += Number(item.caloriesBurned || 0)
      })
      return {
        duration: totals.duration.toFixed(0),
        calories: totals.calories.toFixed(0)
      }
    })

    const renderMarkdown = (markdown) => {
      if (!markdown) return ""
      return markdown
        .split("\n")
        .map(line => {
          if (line.startsWith("### ")) return `<h3>${line.slice(4)}</h3>`
          if (line.startsWith("## ")) return `<h2>${line.slice(3)}</h2>`
          if (line.startsWith("- ")) return `<li>${line.slice(2)}</li>`
          if (!line.trim()) return "<br />"
          return `<p>${line}</p>`
        })
        .join("")
        .replace(/(<li>.*<\/li>)+/g, match => `<ul>${match}</ul>`)
    }

    const renderedReport = computed(() => renderMarkdown(reportContent.value))
    const displayedDietRecords = computed(() =>
      dietRecords.value.slice(0, Math.min(dietDisplayCount.value, dietRecords.value.length))
    )
    const displayedExerciseRecords = computed(() =>
      exerciseRecords.value.slice(0, Math.min(exerciseDisplayCount.value, exerciseRecords.value.length))
    )

    const loadData = async () => {
      loading.value = true
      await new Promise(resolve => setTimeout(resolve, 300))
      if (!route.params.id) {
        ElMessage.error("缺少患者ID参数")
        router.push("/patients")
        return
      }

      patient.value = {
        id: route.params.id,
        name: "张三",
        gender: "男",
        age: 12,
        phone: "13800138001",
        department: "儿童康复科",
        doctor: "李医生",
        emergencyContact: "张妈妈",
        emergencyPhone: "13900139001"
      }

      bodyTests.value = [
        {
          id: 3,
          childId: 1,
          height: 120.0,
          weight: 35.0,
          bmi: 24.3,
          boneAge: 8.0,
          testDate: "2025-10-20",
          createTime: "Mon Oct 20 11:15:33 CST 2025"
        },
        {
          id: 2,
          childId: 1,
          height: 100.0,
          weight: 20.0,
          bmi: 20.0,
          boneAge: 5.0,
          testDate: "2022-03-01",
          createTime: "Mon Oct 20 00:10:34 CST 2025"
        },
        {
          id: 1,
          childId: 1,
          height: 70.0,
          weight: 14.0,
          bmi: 28.6,
          boneAge: 2.0,
          testDate: "2020-04-01",
          createTime: "Mon Oct 20 00:10:09 CST 2025"
        }
      ]

      dietRecords.value = [
        {
          id: 2,
          childId: 1,
          mealType: "晚餐",
          foodName: "烤串拼盘",
          foodCategory: "烧烤",
          quantity: 500.0,
          unit: "克",
          calories: 800.0,
          protein: 40.0,
          carbohydrate: 20.0,
          fat: 60.0,
          fiber: 5.0,
          recordDate: "2025-11-17",
          notes: "包含牛肉串、鸡肉串和蔬菜串，搭配绿色蔬菜和炸物，适合晚餐食用。",
          imageList: ["http://115.190.53.97:8081/files/diet/2025/11/17/a5016e45-aeaa-422e-af7f-c91d9ae4aa78.jpg"]
        },
        {
          id: 1,
          childId: 1,
          mealType: "早餐",
          foodName: "牛肉米粉",
          foodCategory: "主食",
          quantity: 500.0,
          unit: "克",
          calories: 600.0,
          protein: 25.0,
          carbohydrate: 90.0,
          fat: 15.0,
          fiber: 3.0,
          recordDate: "2025-11-09",
          notes: "包含牛肉片、鸡蛋、香菜和辣椒油，适合早餐食用。",
          imageList: ["http://115.190.53.97:8081/files/diet/2025/11/09/78761be7-a75a-4e60-b1f8-351dff707703.jpg"]
        }
      ]
      dietDisplayCount.value = initialDisplayCount

      exerciseRecords.value = [
        {
          id: 4,
          childId: 1,
          exerciseType: "跑步",
          exerciseCategory: "有氧运动",
          duration: 30,
          intensity: "中等强度",
          caloriesBurned: 157.5,
          recordDate: "2025-11-17",
          notes: ""
        },
        {
          id: 2,
          childId: 1,
          exerciseType: "骑行",
          exerciseCategory: "有氧运动",
          duration: 60,
          intensity: "中高强度",
          caloriesBurned: 115.5,
          distance: 20.0,
          recordDate: "2025-11-15",
          notes: ""
        },
        {
          id: 3,
          childId: 1,
          exerciseType: "跑步",
          exerciseCategory: "有氧运动",
          duration: 25,
          intensity: "中等",
          caloriesBurned: 15.31,
          recordDate: "2025-11-15",
          notes: ""
        },
        {
          id: 1,
          childId: 1,
          exerciseType: "跑步",
          exerciseCategory: "有氧运动",
          duration: 30,
          intensity: "高强度",
          caloriesBurned: 157.5,
          recordDate: "2025-11-10",
          notes: ""
        }
      ]
      exerciseDisplayCount.value = initialDisplayCount

      reportContent.value = [
        "## 智能报告",
        "### 体测趋势",
        "- 最近一次体测日期：2025-10-20，BMI 24.3，骨龄 8 岁。",
        "- 身高较2022年上涨 20 cm，体重增长 15 kg。",
        "### 饮食分析",
        "- 近2次饮食记录总热量约 1400 kcal，建议控制晚餐油脂摄入。",
        "- 早餐营养均衡，搭配蛋白质与碳水，继续保持。",
        "### 锻炼建议",
        "- 近一周共训练 145 分钟，其中跑步占 57%。",
        "- 建议增加力量训练与拉伸，平衡肌群发展。",
        "### 医生建议",
        "- 关注体脂增长速度，建议每周监测一次体重。",
        "- 睡眠与饮食需同步记录，方便持续追踪。"
      ].join("\n")

      loading.value = false
    }

    const handleDownloadReport = () => {
      if (!reportContent.value) return
      const blob = new Blob([reportContent.value], { type: "text/markdown" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${patient.value?.name || "patient"}-report.md`
      link.click()
      URL.revokeObjectURL(url)
    }

    const handleBack = () => {
      router.push("/patients")
    }

    const loadMoreDiet = () => {
      if (dietRecords.value.length === 0) return
      dietDisplayCount.value = Math.min(
        dietDisplayCount.value + loadMoreStep,
        dietRecords.value.length
      )
    }

    const collapseDiet = () => {
      dietDisplayCount.value = initialDisplayCount
    }

    const loadMoreExercise = () => {
      if (exerciseRecords.value.length === 0) return
      exerciseDisplayCount.value = Math.min(
        exerciseDisplayCount.value + loadMoreStep,
        exerciseRecords.value.length
      )
    }

    const collapseExercise = () => {
      exerciseDisplayCount.value = initialDisplayCount
    }

    onMounted(() => {
      loadData()
    })

    return {
      loading,
      patient,
      bodyTests,
      dietRecords,
      exerciseRecords,
      reportContent,
      latestBodyTest,
      dietSummary,
      exerciseSummary,
      renderedReport,
      displayedDietRecords,
      displayedExerciseRecords,
      initialDisplayCount,
      handleBack,
      handleDownloadReport,
      loadMoreDiet,
      collapseDiet,
      loadMoreExercise,
      collapseExercise
    }
  }
}
</script>

<style scoped>
.insight-container {
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
  padding: 20px 24px;
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.header-left h2 {
  margin: 8px 0 4px;
  font-size: 22px;
  color: #303133;
}

.header-left p {
  margin: 0;
  color: #909399;
}

.header-right {
  display: flex;
  gap: 12px;
}

.profile-card,
.kpi-card,
.module-card {
  margin-bottom: 20px;
  border-radius: 14px;
}

.card-title {
  font-weight: 600;
  color: #303133;
}

.profile-name {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 16px;
}

.profile-name strong {
  font-size: 20px;
  color: #303133;
}

.profile-name span {
  color: #909399;
}

.kpi-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.kpi-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  background: #f8fafc;
}

.kpi-icon {
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  color: white;
}

.kpi-icon.body {
  background: linear-gradient(120deg, #6dd5fa, #2980b9);
}

.kpi-icon.diet {
  background: linear-gradient(120deg, #f6d365, #fda085);
}

.kpi-icon.sport {
  background: linear-gradient(120deg, #84fab0, #8fd3f4);
}

.kpi-value {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.kpi-label {
  margin: 0;
  color: #909399;
  font-size: 13px;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.module-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.module-meta h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.module-meta p {
  margin: 0;
  color: #909399;
  font-size: 13px;
}

.module-highlight {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #606266;
}

.module-card .el-table {
  margin-top: 12px;
}

.diet-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 12px;
}

.diet-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  background: #fffdf9;
}

.diet-cover {
  position: relative;
  min-width: 160px;
  max-width: 160px;
  height: 110px;
  border-radius: 10px;
  overflow: hidden;
}

.diet-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.diet-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 999px;
}

.diet-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.diet-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.diet-title strong {
  font-size: 16px;
}

.diet-notes {
  margin: 0;
  color: #606266;
}

.diet-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 13px;
  color: #909399;
}

.exercise-item {
  padding: 12px 0;
}

.exercise-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.exercise-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: #909399;
  font-size: 13px;
  margin: 6px 0;
}

.markdown-preview {
  font-family: "Microsoft YaHei", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  line-height: 1.7;
  color: #303133;
}

.markdown-preview h2,
.markdown-preview h3 {
  margin-top: 16px;
}

.markdown-preview ul {
  padding-left: 20px;
}

.markdown-preview li {
  margin-bottom: 6px;
}

.empty-block {
  padding: 30px 0;
}

.list-controls {
  margin-top: 16px;
  display: flex;
  gap: 12px;
}

@media (max-width: 992px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .diet-item {
    flex-direction: column;
  }

  .diet-cover {
    width: 100%;
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .insight-container {
    padding: 16px;
  }

  .module-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>


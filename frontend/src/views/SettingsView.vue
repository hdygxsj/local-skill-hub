<template>
  <AppLayout>
    <div class="settings-view">
      <h2>设置</h2>

      <el-card class="setting-card">
        <template #header>
          <span>API 配置</span>
        </template>
        <el-form label-width="120px">
          <el-form-item label="API Key">
            <el-input
              v-model="apiKey"
              type="password"
              show-password
              placeholder="输入 LLM API Key"
            />
          </el-form-item>
          <el-form-item label="API Base URL">
            <el-input
              v-model="apiBaseUrl"
              placeholder="https://api.openai.com/v1"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveConfig" :loading="saving">
              保存
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card class="setting-card" style="margin-top: 20px">
        <template #header>
          <span>关于</span>
        </template>
        <p>Local Skill Hub v0.1.0</p>
        <p>AI IDE 技能包管理工具</p>
        <p>
          <a href="https://github.com/your-username/local-skill-hub" target="_blank">
            GitHub
          </a>
        </p>
      </el-card>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getConfig, setConfig } from '../api'
import AppLayout from '../components/AppLayout.vue'

const apiKey = ref('')
const apiBaseUrl = ref('')
const saving = ref(false)

const fetchConfig = async () => {
  try {
    const [keyRes, urlRes] = await Promise.all([
      getConfig('api_key'),
      getConfig('api_base_url')
    ])
    apiKey.value = keyRes.data.value || ''
    apiBaseUrl.value = urlRes.data.value || ''
  } catch (error) {
    console.error('Failed to fetch config')
  }
}

const saveConfig = async () => {
  saving.value = true
  try {
    await Promise.all([
      setConfig('api_key', apiKey.value),
      setConfig('api_base_url', apiBaseUrl.value)
    ])
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(fetchConfig)
</script>

<style scoped>
.settings-view {
  max-width: 600px;
}

.settings-view h2 {
  margin-bottom: 20px;
}

.setting-card {
  background: white;
}
</style>

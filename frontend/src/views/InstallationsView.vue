<template>
  <AppLayout>
    <div class="installations-view">
      <div class="header">
        <h2>安装管理</h2>
        <el-button type="primary" @click="showInstallDialog = true">
          安装分组
        </el-button>
      </div>

      <el-table :data="installations" v-loading="loading" stripe>
        <el-table-column label="分组" width="150">
          <template #default="{ row }">
            {{ getGroupName(row.group_id) }}
          </template>
        </el-table-column>
        <el-table-column prop="target_ide" label="目标 IDE" width="100" />
        <el-table-column prop="install_scope" label="范围" width="100" />
        <el-table-column prop="install_path" label="安装路径" />
        <el-table-column prop="installed_version" label="版本" width="100" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="handleUpgrade(row)">升级</el-button>
            <el-button type="danger" size="small" @click="handleUninstall(row)">卸载</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Install Dialog -->
      <el-dialog v-model="showInstallDialog" title="安装分组" width="500px">
        <el-form :model="installForm" label-width="100px">
          <el-form-item label="分组">
            <el-select v-model="installForm.group_id" style="width: 100%">
              <el-option
                v-for="group in groups"
                :key="group.id"
                :label="group.name"
                :value="group.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="目标 IDE">
            <el-select v-model="installForm.target_ide" style="width: 100%">
              <el-option label="Qoder" value="qoder" />
              <el-option label="Cursor" value="cursor" />
            </el-select>
          </el-form-item>
          <el-form-item label="安装范围">
            <el-select v-model="installForm.install_scope" style="width: 100%">
              <el-option label="用户级" value="user" />
              <el-option label="项目级" value="project" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="installForm.install_scope === 'project'" label="项目路径">
            <el-input v-model="installForm.install_path" placeholder="/path/to/your/project" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showInstallDialog = false">取消</el-button>
          <el-button type="primary" @click="handleInstall" :loading="installing">
            安装
          </el-button>
        </template>
      </el-dialog>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listInstallations, installGroup, uninstall, upgradeInstallation, listGroups } from '../api'
import AppLayout from '../components/AppLayout.vue'

const installations = ref([])
const groups = ref([])
const loading = ref(false)
const showInstallDialog = ref(false)
const installing = ref(false)
const installForm = ref({
  group_id: null,
  target_ide: 'qoder',
  install_scope: 'user',
  install_path: ''
})

const getGroupName = (groupId) => {
  const group = groups.value.find(g => g.id === groupId)
  return group?.name || '-'
}

const fetchData = async () => {
  loading.value = true
  try {
    const [installRes, groupsRes] = await Promise.all([listInstallations(), listGroups()])
    installations.value = installRes.data
    groups.value = groupsRes.data
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

const handleInstall = async () => {
  if (!installForm.value.group_id) {
    ElMessage.warning('请选择分组')
    return
  }
  if (installForm.value.install_scope === 'project' && !installForm.value.install_path) {
    ElMessage.warning('请输入项目路径')
    return
  }
  installing.value = true
  try {
    await installGroup(installForm.value)
    ElMessage.success('安装成功')
    showInstallDialog.value = false
    installForm.value = { group_id: null, target_ide: 'qoder', install_scope: 'user', install_path: '' }
    fetchData()
  } catch (error) {
    ElMessage.error('安装失败: ' + (error.response?.data?.detail || error.message))
  } finally {
    installing.value = false
  }
}

const handleUninstall = async (row) => {
  try {
    await ElMessageBox.confirm('确定卸载此安装？', '确认卸载')
    await uninstall(row.id)
    ElMessage.success('卸载成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('卸载失败')
    }
  }
}

const handleUpgrade = async (row) => {
  try {
    await ElMessageBox.confirm('确定升级到最新版本？', '确认升级')
    await upgradeInstallation(row.id)
    ElMessage.success('升级成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('升级失败')
    }
  }
}

onMounted(fetchData)
</script>

<style scoped>
.installations-view {
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
}
</style>

<template>
  <AppLayout>
    <div class="packages-view">
      <div class="header">
        <h2>技能包管理</h2>
        <el-button type="primary" @click="showImportDialog = true">
          导入技能包
        </el-button>
      </div>

      <el-table :data="packages" v-loading="loading" stripe>
        <el-table-column prop="name" label="名称" width="200" />
        <el-table-column prop="version" label="版本" width="120" />
        <el-table-column prop="local_path" label="本地路径" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Import Dialog -->
      <el-dialog v-model="showImportDialog" title="导入技能包" width="500px">
        <el-form :model="importForm" label-width="80px">
          <el-form-item label="来源">
            <el-select v-model="importForm.source_type">
              <el-option label="Git 仓库" value="git" />
              <el-option label="本地路径" value="local" />
            </el-select>
          </el-form-item>
          <el-form-item label="地址">
            <el-input 
              v-model="importForm.url_or_path" 
              :placeholder="importForm.source_type === 'git' ? 'https://github.com/...' : '/path/to/package'"
            />
          </el-form-item>
          <el-form-item label="名称">
            <el-input v-model="importForm.name" placeholder="可选，默认从地址提取" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showImportDialog = false">取消</el-button>
          <el-button type="primary" @click="handleImport" :loading="importing">
            导入
          </el-button>
        </template>
      </el-dialog>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listPackages, importPackage, deletePackage } from '../api'
import AppLayout from '../components/AppLayout.vue'

const packages = ref([])
const loading = ref(false)
const showImportDialog = ref(false)
const importing = ref(false)
const importForm = ref({
  source_type: 'git',
  url_or_path: '',
  name: ''
})

const fetchPackages = async () => {
  loading.value = true
  try {
    const response = await listPackages()
    packages.value = response.data
  } catch (error) {
    ElMessage.error('获取技能包列表失败')
  } finally {
    loading.value = false
  }
}

const handleImport = async () => {
  if (!importForm.value.url_or_path) {
    ElMessage.warning('请输入地址')
    return
  }
  importing.value = true
  try {
    await importPackage(importForm.value)
    ElMessage.success('导入成功')
    showImportDialog.value = false
    importForm.value = { source_type: 'git', url_or_path: '', name: '' }
    fetchPackages()
  } catch (error) {
    ElMessage.error('导入失败: ' + (error.response?.data?.detail || error.message))
  } finally {
    importing.value = false
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除技能包 "${row.name}"？`, '确认删除')
    await deletePackage(row.id)
    ElMessage.success('删除成功')
    fetchPackages()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(fetchPackages)
</script>

<style scoped>
.packages-view {
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

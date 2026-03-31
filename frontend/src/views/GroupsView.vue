<template>
  <AppLayout>
    <div class="groups-view">
      <div class="header">
        <h2>分组管理</h2>
        <el-button type="primary" @click="showCreateDialog = true">
          创建分组
        </el-button>
      </div>

      <el-table :data="groups" v-loading="loading" stripe>
        <el-table-column prop="name" label="名称" width="200" />
        <el-table-column prop="description" label="描述" />
        <el-table-column label="包含技能包" width="300">
          <template #default="{ row }">
            <el-tag v-for="pkg in row.packages" :key="pkg.id" style="margin-right: 4px">
              {{ pkg.name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="showAddPackage(row)">添加包</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Create Dialog -->
      <el-dialog v-model="showCreateDialog" title="创建分组" width="400px">
        <el-form :model="createForm" label-width="60px">
          <el-form-item label="名称">
            <el-input v-model="createForm.name" />
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="createForm.description" type="textarea" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="handleCreate">创建</el-button>
        </template>
      </el-dialog>

      <!-- Add Package Dialog -->
      <el-dialog v-model="showAddDialog" title="添加技能包" width="400px">
        <el-select v-model="selectedPackageId" placeholder="选择技能包" style="width: 100%">
          <el-option
            v-for="pkg in availablePackages"
            :key="pkg.id"
            :label="pkg.name"
            :value="pkg.id"
          />
        </el-select>
        <template #footer>
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="handleAddPackage">添加</el-button>
        </template>
      </el-dialog>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listGroups, getGroup, createGroup, deleteGroup, addPackageToGroup, listPackages } from '../api'
import AppLayout from '../components/AppLayout.vue'

const groups = ref([])
const packages = ref([])
const loading = ref(false)
const showCreateDialog = ref(false)
const showAddDialog = ref(false)
const selectedGroupId = ref(null)
const selectedPackageId = ref(null)
const createForm = ref({ name: '', description: '' })

const availablePackages = computed(() => {
  const group = groups.value.find(g => g.id === selectedGroupId.value)
  const existingIds = group?.packages?.map(p => p.id) || []
  return packages.value.filter(p => !existingIds.includes(p.id))
})

const fetchData = async () => {
  loading.value = true
  try {
    const [groupsRes, packagesRes] = await Promise.all([listGroups(), listPackages()])
    // Get full group details with packages
    const groupDetails = await Promise.all(
      groupsRes.data.map(g => getGroup(g.id).then(r => r.data))
    )
    groups.value = groupDetails
    packages.value = packagesRes.data
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

const handleCreate = async () => {
  if (!createForm.value.name) {
    ElMessage.warning('请输入名称')
    return
  }
  try {
    await createGroup(createForm.value)
    ElMessage.success('创建成功')
    showCreateDialog.value = false
    createForm.value = { name: '', description: '' }
    fetchData()
  } catch (error) {
    ElMessage.error('创建失败')
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除分组 "${row.name}"？`, '确认删除')
    await deleteGroup(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const showAddPackage = (group) => {
  selectedGroupId.value = group.id
  selectedPackageId.value = null
  showAddDialog.value = true
}

const handleAddPackage = async () => {
  if (!selectedPackageId.value) {
    ElMessage.warning('请选择技能包')
    return
  }
  try {
    await addPackageToGroup(selectedGroupId.value, selectedPackageId.value)
    ElMessage.success('添加成功')
    showAddDialog.value = false
    fetchData()
  } catch (error) {
    ElMessage.error('添加失败')
  }
}

onMounted(fetchData)
</script>

<style scoped>
.groups-view {
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

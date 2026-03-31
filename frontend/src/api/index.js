import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000
})

// Packages
export const listPackages = () => api.get('/packages/')
export const getPackage = (id) => api.get(`/packages/${id}`)
export const importPackage = (data) => api.post('/packages/', data)
export const deletePackage = (id) => api.delete(`/packages/${id}`)

// Groups
export const listGroups = () => api.get('/groups/')
export const getGroup = (id) => api.get(`/groups/${id}`)
export const createGroup = (data) => api.post('/groups/', data)
export const deleteGroup = (id) => api.delete(`/groups/${id}`)
export const addPackageToGroup = (groupId, packageId) => 
  api.post(`/groups/${groupId}/packages/${packageId}`)
export const removePackageFromGroup = (groupId, packageId) => 
  api.delete(`/groups/${groupId}/packages/${packageId}`)

// Installations
export const listInstallations = () => api.get('/installations/')
export const getInstallation = (id) => api.get(`/installations/${id}`)
export const installGroup = (data) => api.post('/installations/', data)
export const uninstall = (id) => api.delete(`/installations/${id}`)
export const compareVersions = (id) => api.get(`/installations/${id}/compare`)
export const upgradeInstallation = (id) => api.post(`/installations/${id}/upgrade`)

// Config
export const getConfig = (key) => api.get(`/config/${key}`)
export const setConfig = (key, value) => api.put(`/config/${key}`, { key, value })

// Chat
export const sendMessage = (message) => api.post('/chat/', { message })

export default api

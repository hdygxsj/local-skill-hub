<template>
  <AppLayout>
    <div class="chat-view">
      <div class="chat-messages" ref="messagesRef">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['message', msg.role]"
        >
          <div class="message-content">
            <div class="avatar">{{ msg.role === 'user' ? '你' : 'AI' }}</div>
            <div class="text">{{ msg.content }}</div>
          </div>
        </div>
      </div>
      <div class="chat-input">
        <el-input
          v-model="input"
          placeholder="输入消息..."
          @keyup.enter="sendMessage"
          :disabled="loading"
        >
          <template #append>
            <el-button @click="sendMessage" :loading="loading">
              发送
            </el-button>
          </template>
        </el-input>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { sendMessage as apiSendMessage } from '../api'
import AppLayout from '../components/AppLayout.vue'

const messages = ref([
  { role: 'assistant', content: '你好！我是 Local Skill Hub 助手。我可以帮你管理技能包、分组和安装。请问有什么可以帮你的？' }
])
const input = ref('')
const loading = ref(false)
const messagesRef = ref(null)

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
}

const sendMessage = async () => {
  if (!input.value.trim() || loading.value) return

  const userMessage = input.value.trim()
  messages.value.push({ role: 'user', content: userMessage })
  input.value = ''
  scrollToBottom()

  loading.value = true
  try {
    const response = await apiSendMessage(userMessage)
    messages.value.push({ role: 'assistant', content: response.data.response })
  } catch (error) {
    messages.value.push({ role: 'assistant', content: '抱歉，发生了错误：' + error.message })
  } finally {
    loading.value = false
    scrollToBottom()
  }
}
</script>

<style scoped>
.chat-view {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
  background: white;
  border-radius: 8px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.message {
  margin-bottom: 16px;
}

.message-content {
  display: flex;
  gap: 12px;
}

.message.user .message-content {
  flex-direction: row-reverse;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #409eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.message.user .avatar {
  background: #67c23a;
}

.text {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 8px;
  background: #f4f4f5;
  line-height: 1.5;
}

.message.user .text {
  background: #ecf5ff;
}

.chat-input {
  padding: 16px;
  border-top: 1px solid #eee;
}
</style>

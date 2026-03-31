# Local Skill Hub

<p align="center">
  <strong>AI IDE 技能包管理工具</strong>
</p>

<p align="center">
  集中管理、分组和安装 AI IDE 技能包（skills、agents、hooks）到 Qoder、Cursor 等 AI IDE
</p>

<p align="center">
  <a href="#功能特性">功能特性</a> •
  <a href="#快速开始">快速开始</a> •
  <a href="#使用指南">使用指南</a> •
  <a href="#开发">开发</a> •
  <a href="#贡献">贡献</a>
</p>

---

## 为什么需要 Local Skill Hub？

当你使用多个 AI IDE（如 Qoder、Cursor）并安装了多组技能包时，经常会遇到以下问题：

- **技能包冲突**：不同技能包可能相互干扰
- **切换困难**：想换一组技能包需要手动删除、重新安装
- **版本混乱**：不清楚当前安装的是哪个版本
- **管理分散**：技能包散落在各处，难以统一管理

**Local Skill Hub** 解决了这些痛点，让你可以：

✅ 集中管理所有技能包  
✅ 灵活分组，一键切换  
✅ 精准卸载，无残留  
✅ 版本追踪，清晰可见  
✅ 对话安装，智能便捷  

---

## 功能特性

### 📦 包管理

- 从 **Git 仓库** 导入技能包
- 从 **INSTALL.md 安装指引** 解析并归档
- 从 **本地文件** 导入
- 支持更新、删除本地副本

### 📁 分组管理

- 创建自定义分组
- 将多个包组合到一个分组
- 同一个包可以属于多个分组

### 🚀 安装管理

- 安装分组到 **Qoder** 或 **Cursor**
- 支持 **用户级** 或 **项目级** 安装
- 精准卸载（根据安装记录删除）
- 一键切换分组

### 📊 版本追踪

- 查看本地版本 vs IDE 安装版本
- 检测可升级的包
- 一键升级到最新版本

### 💬 对话式交互

- 内置 AI Agent
- 自然语言完成所有操作
- 自动解析 INSTALL.md 安装指引

---

## 快速开始

### 前置要求

- Python 3.10+
- Node.js 18+
- Git

### 安装

```bash
# 克隆仓库
git clone https://github.com/your-username/local-skill-hub.git
cd local-skill-hub

# 安装后端依赖
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 安装前端依赖
cd ../frontend
npm install
```

### 启动

```bash
# 启动后端 (端口 3847)
cd backend
uvicorn app.main:app --port 3847

# 启动前端 (新终端)
cd frontend
npm run dev
```

访问 http://localhost:5173 打开界面。

---

## 使用指南

### 导入技能包

**方式 1：从 Git 导入**

在对话框输入：
```
导入 https://github.com/hdygxsj/superpowers
```

**方式 2：从安装指引导入**

```
从 https://raw.githubusercontent.com/hdygxsj/superpowers/main/.qoder/INSTALL.md 导入
```

**方式 3：界面操作**

点击 "导入" 按钮，粘贴 Git URL 或 INSTALL.md 链接。

### 创建分组

```
创建一个分组叫 "开发流程"，把 superpowers 添加进去
```

### 安装到 IDE

```
把 "开发流程" 分组安装到 Qoder 用户目录
```

### 切换分组

```
切换到 "代码审查" 分组
```

### 卸载

```
卸载当前安装的分组
```

---

## 配置

### API Key 配置

在设置页面配置 LLM API Key，支持：

- OpenAI API
- Anthropic API
- 其他兼容 OpenAI 格式的 API

### IDE 路径配置

默认路径：

| IDE | 用户级 | 项目级 |
|-----|--------|--------|
| Qoder | `~/.qoder/` | `.qoder/` |
| Cursor | `~/.cursor/` | `.cursor/` |

可在设置中自定义。

---

## 项目结构

```
local-skill-hub/
├── backend/              # Python 后端 (FastAPI)
│   ├── app/
│   │   ├── api/          # API 路由
│   │   ├── services/     # 业务逻辑
│   │   ├── models/       # 数据模型
│   │   ├── installers/   # IDE 安装器
│   │   └── agent/        # 内置 Agent
│   └── tests/            # 测试用例
├── frontend/             # Vue 前端
│   └── src/
│       ├── views/        # 页面
│       ├── components/   # 组件
│       └── api/          # API 调用
├── agents/               # Agent 配置
├── data/                 # 数据目录 (gitignore)
└── docs/                 # 文档
```

---

## 开发

### 运行测试

```bash
cd backend
pytest
```

### 代码规范

```bash
# 后端
ruff check .
ruff format .

# 前端
npm run lint
```

---

## 技术栈

- **后端**: Python, FastAPI, SQLAlchemy, SQLite
- **前端**: Vue 3, Vite, Element Plus
- **Agent**: LangChain / 自定义实现

---

## 路线图

- [x] 核心功能：导入、分组、安装
- [x] Qoder 支持
- [ ] Cursor 支持
- [ ] 更多 AI IDE 支持 (Codex, OpenCode, Gemini CLI)
- [ ] 技能包市场
- [ ] 远程版本检测

---

## 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解如何参与。

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的改动 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开一个 Pull Request

---

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

## 致谢

- [Superpowers](https://github.com/obra/superpowers) - 优秀的技能包框架
- [Qoder](https://qoder.com) - AI IDE
- [Cursor](https://cursor.com) - AI IDE

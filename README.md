# Easy Skills

**让 AI Agent 自动管理你的 IDE Skills。**

## 痛点

在使用 AI IDE（如 Cursor、Qoder）时，你是否遇到过这些困扰？

- **手动安装繁琐**：每次换电脑或重装系统，都要重新查找、下载、配置各种 Skills
- **版本管理混乱**：不知道已安装的 Skills 是什么版本，升级后出问题也不知道如何回滚
- **多 IDE 不同步**：在 Cursor 和 Qoder 之间切换时，Skills 无法复用
- **分享困难**：想让团队成员用上你的 Skill 包，需要手动复制粘贴一堆文件

## 解决方案

Easy Skills 是一个 AI IDE 的 Local Skill Hub，让你的 AI Agent 自动搞定一切：

- **一句话安装**：告诉 AI Agent "帮我安装 xxx skill"，剩下的它来完成
- **版本可控**：支持版本管理和回滚，随时可以回到之前的稳定版本
- **多 IDE 共用**：Qoder 和 Cursor 可以安装同一套 Skills
- **包管理理念**：像 npm 一样管理 Skills，支持从 GitHub 注册和分发

## 功能特性

- **AI 驱动**：告诉 AI Agent 你想要什么，它会自动完成安装和管理
- **多 IDE 支持**：同时支持 Qoder 和 Cursor
- **包管理**：从 GitHub 注册和管理 Skill Packages
- **版本追踪**：支持版本管理和回滚
- **Web 界面**：现代化 Web 界面查看已安装的 Packages (http://localhost:27842)

## 架构设计

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           easy-skills                                   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                         CLI (核心)                               │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐  │   │
│  │  │  register  │  │    list    │  │   status   │  │   serve  │  │   │
│  │  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └────┬─────┘  │   │
│  │        │               │               │              │         │   │
│  │        └───────────────┴───────┬───────┴──────────────┘         │   │
│  │                               ▼                                  │   │
│  │  ┌──────────────────────────────────────────────────────────┐   │   │
│  │  │                     Hub Core                              │   │   │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │   │   │
│  │  │  │  Registry   │  │  Versions   │  │   SQLite DB     │   │   │   │
│  │  │  └─────────────┘  └─────────────┘  └─────────────────┘   │   │   │
│  │  └──────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                               │                                         │
│                               ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    HTTP Server (serve)                            │   │
│  │  /api/packages  ──calls──>  easy-skills list --json              │   │
│  │  /api/projects  ──calls──>  easy-skills projects                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                               │                                         │
│                               ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        Web GUI                                   │   │
│  │  http://localhost:27842                                          │   │
│  │  - Packages 视图 (User/Project scope 筛选)                        │   │
│  │  - Components 视图 (skill/agent/hook/rule 分组)                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 核心设计原则

- **CLI 是核心**：所有数据库操作（注册、列表、状态）都在 CLI 侧
- **服务端只读**：HTTP 服务通过调用 CLI 获取数据，不直接访问数据库
- **独立运行**：即使不启动 Web 服务，CLI 也能正常工作
  ```bash
  easy-skills list --target qoder  # 独立运行
  easy-skills serve --port 27842    # 启动 Web 服务
  ```

## 核心概念

| 术语 | 定义 |
|------|------|
| **Package** | 可分发的技能包，包含多个 Components |
| **Component** | Package 中的最小单位（skill/agent/hook/rule） |
| **Target** | 目标 IDE 类型（qoder/cursor） |
| **Installation** | Component 安装到 IDE 目录的记录 |

## Installation（给人类阅读）

### 从 Release 下载安装（推荐）

从 [GitHub Releases](https://github.com/hdygxsj/easy-skills/releases) 下载：

- `easy-skills` - macOS/Linux CLI 二进制
- `Easy Skills.dmg` - macOS 安装器
- `easy-skills-source.tar.gz` - 源代码

### 通过 npm 安装 CLI（推荐）

```bash
npm install -g easy-skills-cli
```

### 从源码构建

```bash
# 克隆仓库
git clone https://github.com/hdygxsj/easy-skills.git
cd easy-skills

# 构建 CLI + Mac App + 源码包
make release

# 或单独构建：
make build          # 仅 CLI
make build-tauri   # 仅 Mac App
make source-tar    # 仅源码包
```

### 构建 Web UI（开发用）

```bash
cd web
npm install
npm run dev
# 打开 http://localhost:27842
```

## Installation（给 Agent 阅读）

最简单的方式是让 AI Agent 自动处理一切：

**对于 Qoder：**
```
Fetch and follow instructions from https://raw.githubusercontent.com/hdygxsj/easy-skills/master/skills/qoder/INSTALL.md
```

**对于 Cursor：**
```
Fetch and follow instructions from https://raw.githubusercontent.com/hdygxsj/easy-skills/master/skills/cursor/INSTALL.md
```

AI Agent 会自动完成：
1. 下载并安装 easy-skills CLI
2. 启动 Hub 服务
3. 将 skill 安装到你的 IDE

## CLI 命令

| 命令 | 说明 |
|------|------|
| `register` | 注册 Package 到 Hub |
| `list` | 列出 Hub 中的 Packages |
| `info` | 查看 Package 详细信息 |
| `status` | 查看 IDE 中已安装的 Packages |
| `serve` | 启动 Web GUI 服务 (http://localhost:27842) |
| `restart` | 重启 Web GUI 服务 |

### 服务管理

```bash
easy-skills serve              # 启动服务
easy-skills serve --port 27842 # 指定端口启动
easy-skills restart            # 重启服务
```

服务启动后会生成 PID 文件 (`~/.easy-skills/easy-skills.pid`)，重启时会自动停止旧进程并启动新进程。

## 数据存储

```
~/.local/easy-skills/
├── hub.db           # SQLite 数据库
└── packages/        # Package 文件缓存
    ├── qoder/
    └── cursor/
```

## 给 AI Agent 使用

详见 [AGENTS.md](AGENTS.md) 了解 AI Agent 使用说明。

## 开源协议

MIT

# Easy Skills

AI IDE 的 Local Skill Hub，支持多 IDE (Cursor/Qoder) 的 Skill 托管和切换。

## Features

- **Package Management**: 注册、管理多个 Skill Package
- **Multi-IDE Support**: 支持 Qoder 和 Cursor
- **Version Tracking**: Hub 内部版本号 + 真实版本号追踪
- **Agent Integration**: 提供 CLI Skill 给 AI IDE Agent 使用
- **Web GUI**: 现代化 Web 界面查看状态 (http://localhost:27842)
- **Mac App**: Tauri 打包的桌面客户端

## Architecture

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

## Concepts

| Term | Definition |
|------|------------|
| **Package** | 可分发的技能包，包含多个 Components |
| **Component** | Package 中的最小单位（skill/agent/hook/rule） |
| **Target** | 目标 IDE 类型（qoder/cursor） |
| **Installation** | Component 安装到 IDE 目录的记录 |

## Installation

### Install from Release (Recommended)

Download from [GitHub Releases](https://github.com/hdygxsj/easy-skills/releases):

- `easy-skills` - CLI binary for macOS/Linux
- `Easy Skills.dmg` - macOS installer
- `easy-skills-source.tar.gz` - Source code

### Install CLI via Go

```bash
go install github.com/hdygxsj/easy-skills@latest
```

### Build from Source

```bash
# Clone the repo
git clone https://github.com/hdygxsj/easy-skills.git
cd easy-skills

# Build CLI + Mac App + Source
make release

# Or build individually:
make build          # CLI only
make build-tauri   # Mac App only
make source-tar    # Source archive only
```

### Build Web UI (for development)

```bash
cd web
npm install
npm run dev
# Open http://localhost:27842
```

## Quick Start

### 1. Install CLI

```bash
# Install via go
go install github.com/hdygxsj/easy-skills@latest

# Or download from releases
```

### 2. Start Web GUI or Mac App

```bash
# Option A: Start Web GUI (recommended)
easy-skills serve
# Opens http://localhost:27842

# Option B: Use Mac App (double-click Easy Skills.dmg)
open releases/Easy\ Skills.dmg
```

### 3. Install easy-skills Skill to Your IDE

Tell your AI Agent to install:

```
/easy-skills Fetch and follow instructions from http://localhost:27842/qoder/easy-skills.md
```

### 4. Done! 

Now your AI Agent can manage skills via `/easy-skills`:

```
/easy-skills 查看已安装的 packages
/easy-skills 帮我安装 superpowers 到 qoder
/easy-skills 升级 superpowers 到最新版本
/easy-skills 查看 superpowers 的版本历史
```

**No manual CLI commands needed** - your AI Agent handles everything!

## CLI Commands

| Command | Description |
|---------|-------------|
| `register` | 注册 Package 到 Hub |
| `list` | 列出 Hub 中的 Packages |
| `info` | 查看 Package 详细信息 |
| `status` | 查看 IDE 中已安装的 Packages |
| `serve` | 启动 Web GUI 服务 (http://localhost:27842) |

## Storage

```
~/.local/easy-skills/
├── hub.db           # SQLite 数据库
└── packages/        # Package 文件缓存
    ├── qoder/
    └── cursor/
```

## For AI Agents

See [AGENTS.md](AGENTS.md) for AI agent usage instructions.

## License

MIT

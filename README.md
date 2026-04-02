# Easy Skills

**让 AI Agent 自动管理你的 IDE Skills。**

Easy Skills 是一个 AI IDE 的 Local Skill Hub，支持 Qoder 和 Cursor。通过自然语言，你的 AI Agent 可以自动安装、升级和管理各种 Skills，无需手动操作。

## Features

- **AI-Powered**: 告诉 AI Agent 你想要什么，它会自动完成安装和管理
- **Multi-IDE Support**: 同时支持 Qoder 和 Cursor
- **Package Management**: 从 GitHub 注册和管理 Skill Packages
- **Version Tracking**: 支持版本管理和回滚
- **Web GUI**: 现代化 Web 界面查看已安装的 Packages (http://localhost:27842)

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

### Install CLI via npm (Recommended)

```bash
npm install -g easy-skills-cli
```

### Install CLI via Go (Alternative)

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

### 1. Tell Your AI Agent to Install

The easiest way is to let your AI Agent handle everything:

**For Qoder:**
```
Fetch and follow instructions from https://raw.githubusercontent.com/hdygxsj/easy-skills/master/web/public/qoder/INSTALL.md
```

**For Cursor:**
```
Fetch and follow instructions from https://raw.githubusercontent.com/hdygxsj/easy-skills/master/web/public/cursor/INSTALL.md
```

The AI Agent will automatically:
1. Download and install the easy-skills CLI
2. Start the Hub service
3. Install the skill to your IDE

### 2. Done!

Now your AI Agent can manage skills via `/easy-skills`:

```
/easy-skills 列出 qoder 可用的 packages
/easy-skills 帮我安装某个 package 到 qoder
/easy-skills 查看某个 package 的详情
/easy-skills 升级某个 package
/easy-skills 卸载某个 package
```

**No manual commands needed** - your AI Agent handles everything!

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

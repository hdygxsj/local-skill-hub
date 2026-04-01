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
┌─────────────────────────────────────────────────────────┐
│  easy-skills CLI                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Hub Core     │  │ IDE Adapter  │  │ CLI Commands │  │
│  │ - Registry   │  │ - Qoder     │  │ - register   │  │
│  │ - Versions   │  │ - Cursor    │  │ - list      │  │
│  │ - SQLite     │  │             │  │ - install   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Concepts

| Term | Definition |
|------|------------|
| **Package** | 可分发的技能包，包含多个 Components |
| **Component** | Package 中的最小单位（skill/agent/hook/rule） |
| **Target** | 目标 IDE 类型（qoder/cursor） |
| **Installation** | Component 安装到 IDE 目录的记录 |

## Installation

### CLI

```bash
# From source
git clone https://github.com/easy-skills/easy-skills.git
cd easy-skills
go install

# Or download binary from releases
```

### Web UI

```bash
cd web
npm install
npm run dev
# Open http://localhost:27842
```

### Mac App

```bash
cd src-tauri
cargo build --release
# Binary at target/release/easy-skills
```

## Quick Start

```bash
# Register a package to Hub
easy-skills register --name superpowers --target qoder --source https://github.com/obra/superpowers

# List packages in Hub
easy-skills list --target qoder

# Show package details
easy-skills info --name superpowers --target qoder

# Check installation status
easy-skills status --ide qoder
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `register` | 注册 Package 到 Hub |
| `list` | 列出 Hub 中的 Packages |
| `info` | 查看 Package 详细信息 |
| `status` | 查看 IDE 中已安装的 Packages |

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

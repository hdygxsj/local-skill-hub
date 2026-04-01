# Easy Skills

AI IDE 的 Local Skill Hub，支持多 IDE (Cursor/Qoder) 的 Skill 托管和切换。

## Features

- **Package Management**: 注册、管理多个 Skill Package
- **Multi-IDE Support**: 支持 Qoder 和 Cursor
- **Version Tracking**: Hub 内部版本号 + 真实版本号追踪
- **Agent Integration**: 提供 CLI Skill 给 AI IDE Agent 使用
- **Read-only GUI**: Web/Tauri 可视化界面查看状态

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

```bash
# From source
git clone https://github.com/easy-skills/easy-skills.git
cd easy-skills
go install

# Or download binary from releases
```

## Quick Start

```bash
# Register a package to Hub
easy-skills register --name superpowers --target qoder --source https://github.com/obra/superpowers

# List packages in Hub
easy-skills list --target qoder

# Show package details
easy-skills info --name superpowers --target qoder

# Install package to IDE
easy-skills install --name superpowers --target qoder --ide qoder --scope user

# Check installation status
easy-skills status --ide qoder

# Uninstall package
easy-skills uninstall --name superpowers --target qoder --ide qoder --scope user
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `register` | 注册 Package 到 Hub |
| `list` | 列出 Hub 中的 Packages |
| `info` | 查看 Package 详细信息 |
| `install` | 安装 Package 到 IDE |
| `uninstall` | 从 IDE 卸载 Package |
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

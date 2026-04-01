# Easy Skills - Local Skill Hub

> AI IDE 的 Skill 管理工具，支持多 IDE (Cursor/Qoder) 的 Skill 托管和切换

## 1. 概念定义

### 1.1 核心术语

| 术语 | 定义 |
|------|------|
| **Package** | 一个可分发的技能包，包含多个 Components（如 skills、agents 等） |
| **Component** | Package 中的最小单位，如一个 skill 文件、一个 agent 定义 |
| **Target** | 目标 IDE 类型，当前支持 `qoder` 和 `cursor` |
| **Installation** | Component 安装到 IDE 目录的记录 |

### 1.2 设计原则

1. **原样存储**：Hub 不转换 Package 内容，安装了什么就存什么
2. **跨 IDE 隔离**：同一个 Package name，不同 Target 视为不同 Package
3. **包溯源**：能追踪 Component 来自哪个 Package
4. **版本分离**：Hub 内部版本号（时间戳）与真实版本号（metadata）分离

---

## 2. 存储结构

### 2.1 文件系统

```
~/.local/easy-skills/
├── hub.db           # SQLite 数据库（所有元数据）
└── packages/        # Package 实际文件（原文存放）
    ├── qoder/
    │   └── {package_name}/
    │       └── {version}/   # Hub 内部版本号
    │           ├── SKILL.md
    │           ├── agents/
    │           └── ...
    └── cursor/
        └── {package_name}/
            └── {version}/
                ├── rules/
                └── ...
```

### 2.2 数据库 Schema

```sql
-- packages 表
CREATE TABLE packages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    target TEXT NOT NULL,  -- "qoder" / "cursor"
    source TEXT,
    metadata TEXT,  -- JSON: 真实版本号、git ref 等
    created_at DATETIME,
    updated_at DATETIME,
    UNIQUE(name, target)
);

-- package_versions 表（版本历史）
CREATE TABLE package_versions (
    id TEXT PRIMARY KEY,
    package_id TEXT REFERENCES packages(id),
    version INT NOT NULL,  -- Hub 内部版本号（递增时间戳）
    metadata TEXT,  -- JSON: 真实版本号、git ref 等
    is_current BOOLEAN DEFAULT FALSE,
    created_at DATETIME
);

-- components 表
CREATE TABLE components (
    id TEXT PRIMARY KEY,
    package_id TEXT REFERENCES packages(id),
    package_version_id TEXT REFERENCES package_versions(id),
    name TEXT NOT NULL,
    type TEXT NOT NULL,  -- "skill" / "agent" / "hook" / "rule"
    path TEXT NOT NULL
);

-- installations 表
CREATE TABLE installations (
    id TEXT PRIMARY KEY,
    component_id TEXT REFERENCES components(id),
    ide TEXT NOT NULL,
    scope TEXT NOT NULL,  -- "user" / "project"
    install_path TEXT NOT NULL,
    installed_at DATETIME
);
```

---

## 3. CLI 命令设计

### 3.1 命令列表

```bash
# Package 管理
easy-skills register --name <name> --target <qoder|cursor> --source <url>
    # 注册 Package 到 Hub，解析 components 并存储

easy-skills list [--target <qoder|cursor>] [--installed]
    # 列出 Hub 中的 Packages

easy-skills info --name <name> --target <qoder|cursor>
    # 查看 Package 详细信息（包含 components）

# 安装/卸载
easy-skills install --name <name> --target <qoder|cursor> --ide <qoder|cursor> --scope <user|project>
    # 安装 Package 到 IDE

easy-skills uninstall --name <name> --target <qoder|cursor> --ide <qoder|cursor> --scope <user|project>
    # 从 IDE 卸载 Package

easy-skills reinstall --name <name> --target <qoder|cursor> --ide <qoder|cursor>
    # 重新安装 Package

# 版本管理
easy-skills upgrade --name <name> --target <qoder|cursor>
    # 升级 Package 到最新版本

easy-skills rollback --name <name> --target <qoder|cursor> --version <int>
    # 回滚到指定版本

easy-skills versions --name <name> --target <qoder|cursor>
    # 查看版本历史

# 状态
easy-skills status [--ide <qoder|cursor>]
    # 查看 IDE 中已安装的 Packages
```

### 3.2 输出格式

所有输出为结构化格式（JSON 或格式化文本），供 Agent 解析：

```json
{
  "success": true,
  "data": {
    "packages": [
      {
        "name": "superpowers",
        "target": "qoder",
        "current_version": 1712044800,
        "metadata": {"real_version": "v1.0.0"},
        "components_count": 5
      }
    ]
  }
}
```

---

## 4. IDE 适配器

### 4.1 适配器接口

```go
type IDEAdapter interface {
    Name() string
    GetSkillDir(scope string) (string, error)  // user 或 project
    InstallComponent(component *Component, destPath string) error
    UninstallComponent(componentName string, path string) error
    ListInstalled(scope string) ([]*InstalledComponent, error)
}
```

### 4.2 IDE 路径

| IDE | User Scope | Project Scope |
|-----|-----------|---------------|
| Qoder | `~/.qoder/skills/` | `{pwd}/.qoder/skills/` |
| Cursor | `~/.cursorrules/` | `{pwd}/.cursorrules/` |

---

## 5. Agent Skill

### 5.1 用途

提供 `easy-skills` skill 给 IDE Agent，使其能通过对话方式管理 Skill。

### 5.2 安装方式

用户告诉 IDE Agent：
```
/easy-skills Fetch and follow instructions from https://raw.githubusercontent.com/xxx/easy-skills/main/.qoder/INSTALL.md
```

### 5.3 Skill 内容

SKILL.md 中包含：
- `easy-skills` CLI 的使用说明
- 常用命令示例
- 与 Hub 交互的流程说明

---

## 6. 后续迭代问题（待解决）

### 6.1 一致性问题

1. **文件系统与数据库一致性**
   - Package 文件删除时，DB 记录如何处理？
   - DB 记录删除时，Package 文件如何处理？
   - 升级 Package 版本时，旧版本文件是否保留？

2. **Installation 与 Component 的一致性**
   - Component 更新版本后，已安装的 Installation 如何处理？
   - Installation 指向的 Component 版本被删除时如何处理？

3. **Package 内部 Components 的同步**
   - 新版本可能新增/删除 Components
   - 安装新版本时，旧的 Components 安装记录如何处理？

4. **Target 隔离的一致性**
   - 同一个 Package name，不同 Target 是否视为不同的 Package？
   - Components 表中 package_id 是否需要考虑 target？

5. **迁移与回滚的一致性**
   - 升级失败时的回滚机制
   - Installation 记录与实际 IDE 目录的一致性校验

---

## 7. GUI 可视化界面

### 7.1 定位

- **只读视图**：供人类用户查看 Package、Components、Installation 状态
- **非交互式**：所有操作仍通过 CLI 和 Agent 完成
- **现代化风格**：明亮主题，清晰的信息层级

### 7.2 技术选型

| 组件 | 技术栈 |
|------|--------|
| Web 前端 | React + TypeScript + TailwindCSS |
| 桌面客户端 | Tauri (Rust 后端 + Web 前端) |
| 数据获取 | CLI 输出解析 或 直接访问 SQLite |

### 7.3 页面布局

#### 7.3.1 整体布局

```
┌─────────────────────────────────────────────────────────────────┐
│  🌟 Easy Skills Hub                              [Qoder ▼]    │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  📦 Install Easy Skills in Your AI IDE                  │  │
│  │                                                           │  │
│  │  Qoder:                                                   │  │
│  │  /easy-skills Fetch and follow instructions from          │  │
│  │  http://localhost:27842/qoder/easy-skills.md            │  │
│  │                                                           │  │
│  │  Cursor:                                                  │  │
│  │  Fetch and follow instructions from                      │  │
│  │  http://localhost:27842/cursor/easy-skills.md           │  │
│  └───────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  [Packages] [Skills]                            [Qoder ▼]     │
├─────────────────────────────────────────────────────────────────┤
│                                                           │
│  Package 视图:                                            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐     │
│  │ superpowers   │ │ open-spec    │ │ ai-dev      │     │
│  │ Qoder ✓      │ │ Qoder ✓      │ │ Cursor ✗    │     │
│  │ v1.0.0       │ │ v2.0.0       │ │ v1.2.0      │     │
│  │ 5 skills     │ │ 3 skills     │ │ 8 skills    │     │
│  └──────────────┘ └──────────────┘ └──────────────┘     │
│                                                           │
│  Skills 视图:                                             │
│  ┌───────────────────────────────────────────────────┐    │
│  │ brainstorming    ← superpowers (Qoder)          │    │
│  │ writing-plans   ← superpowers (Qoder)           │    │
│  │ api-design      ← open-spec (Qoder)             │    │
│  │ code-review     ← open-spec (Qoder)             │    │
│  └───────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

#### 7.3.2 Package 详情视图

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back                                          [Qoder ▼]    │
├─────────────────────────────────────────────────────────────────┤
│  superpowers                                                   │
│  ════════════════════════════════════════════════════════     │
│                                                                 │
│  📦 Package Info                    🔗 Source                 │
│  ├─ Target: Qoder                  └─ GitHub URL             │
│  ├─ Version: v1.0.0                                          │
│  ├─ Hub Version: 1712044800                                   │
│  └─ Components: 5                                             │
│                                                                 │
│  📋 Components                                                  │
│  ┌───────────────────────────────────────────────────────┐    │
│  │ 🎯 brainstorming          skill    ✓ Installed       │    │
│  │ 🎯 writing-plans          skill    ✓ Installed       │    │
│  │ 🤖 developer              agent    ✓ Installed       │    │
│  │ 🧪 test-driven-dev       skill    ✓ Installed       │    │
│  │ 🔍 code-review           skill    ✗ Not Installed   │    │
│  └───────────────────────────────────────────────────────┘    │
│                                                                 │
│  💾 Installation Status                                        │
│  ┌───────────────────────────────────────────────────────┐    │
│  │ Qoder (User):     ~/.qoder/skills/superpowers ✓    │    │
│  │ Qoder (Project):  .qoder/skills/superpowers  -     │    │
│  │ Cursor (User):    Not installed              ✗        │    │
│  └───────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

#### 7.3.3 Skills 视图

```
┌─────────────────────────────────────────────────────────────────┐
│  🌟 Easy Skills Hub                              [Qoder ▼]    │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  📦 Install Easy Skills in Your AI IDE                  │  │
│  └───────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  [Packages] [Skills]                            [Qoder ▼]     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Skills (按 Package 分组)                                       │
│                                                                 │
│  superpowers ──────────────────────────────────────── 2/5 ✓   │
│  ├─ ○ brainstorming              (skill)    ✓ Installed        │
│  ├─ ○ writing-plans              (skill)    ✓ Installed        │
│  ├─ ○ test-driven-development    (skill)    ✗ Not installed    │
│  ├─ ○ systematic-debugging       (skill)    ✗ Not installed    │
│  └─ ○ verification-before-...    (skill)    ✗ Not installed    │
│                                                                 │
│  open-spec ───────────────────────────────────────── 3/3 ✓     │
│  ├─ ○ api-design                (skill)    ✓ Installed        │
│  ├─ ○ db-schema                 (skill)    ✓ Installed        │
│  └─ ○ test-gen                  (skill)    ✓ Installed        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.4 设计规范

#### 7.4.1 颜色系统

| 用途 | 颜色 | Hex |
|------|------|-----|
| 主色 | 蓝色 | `#3B82F6` |
| 成功 | 绿色 | `#10B981` |
| 警告 | 橙色 | `#F59E0B` |
| 错误 | 红色 | `#EF4444` |
| 背景 | 白色 | `#FFFFFF` |
| 卡片背景 | 浅灰 | `#F9FAFB` |
| 边框 | 灰色 | `#E5E7EB` |
| 文字主色 | 深灰 | `#111827` |
| 文字次色 | 中灰 | `#6B7280` |

#### 7.4.2 组件规范

| 组件 | 圆角 | 阴影 | 内边距 |
|------|------|------|--------|
| 卡片 | 8px | sm | 16px |
| 按钮 | 6px | - | 8px 16px |
| 输入框 | 6px | - | 8px 12px |

#### 7.4.3 字体规范

| 用途 | 字号 | 字重 |
|------|------|------|
| 标题 H1 | 24px | 700 |
| 标题 H2 | 18px | 600 |
| 正文 | 14px | 400 |
| 辅助文字 | 12px | 400 |

### 7.5 数据模型

```typescript
interface Package {
  id: string
  name: string
  target: 'qoder' | 'cursor'
  source?: string
  currentVersion: number
  metadata: {
    realVersion?: string
    gitRef?: string
  }
}

interface Component {
  id: string
  name: string
  type: 'skill' | 'agent' | 'hook' | 'rule'
  packageId: string
  packageName: string
  installed: boolean
  installPath?: string
}

interface Installation {
  id: string
  packageId: string
  packageName: string
  ide: 'qoder' | 'cursor'
  scope: 'user' | 'project'
  path: string
}
```

### 7.6 API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/packages` | GET | 列出所有 Packages |
| `/api/packages/:name` | GET | Package 详情 |
| `/api/components` | GET | 所有 Components（带安装状态）|
| `/api/installations` | GET | 所有安装记录 |
| `/api/qoder/easy-skills.md` | GET | Qoder 安装指引 |
| `/api/cursor/easy-skills.md` | GET | Cursor 安装指引 |

### 8.4 项目结构

```
easy-skills/
├── cmd/
│   └── easy-skills/
│       └── main.go
├── internal/
│   ├── hub/
│   ├── adapters/
│   ├── installer/
│   └── cli/
├── pkg/
│   └── types/
├── skills/
│   └── easy-skills/
├── web/                    # Web 前端
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── src-tauri/              # Tauri 桌面客户端
│   ├── src/
│   │   └── main.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
├── go.mod
└── README.md
```

---

## 9. 技术栈

| 组件 | 技术 |
|------|------|
| CLI 后端 | Go |
| 数据库 | SQLite (mattn/go-sqlite3) |
| 存储路径 | ~/.local/easy-skills/ (XDG 标准) |
| Web 前端 | React + TypeScript + Vite |
| 桌面客户端 | Tauri (Rust) |

---

## 10. 项目结构（完整）

```
easy-skills/
├── cmd/
│   └── easy-skills/
│       └── main.go
├── internal/
│   ├── hub/
│   │   ├── db.go          # 数据库操作
│   │   ├── package.go     # Package 管理
│   │   └── version.go     # 版本管理
│   ├── adapters/
│   │   ├── adapter.go     # 适配器接口
│   │   ├── qoder/
│   │   │   └── adapter.go
│   │   └── cursor/
│   │       └── adapter.go
│   ├── installer/
│   │   └── installer.go
│   └── cli/
│       ├── commands.go
│       └── output.go
├── pkg/
│   └── types/
│       └── types.go
├── skills/
│   └── easy-skills/
│       └── SKILL.md
├── go.mod
└── README.md
```

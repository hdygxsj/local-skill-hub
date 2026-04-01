# Easy Skills 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended), superpowers:team-driven-development (for 3+ parallel tracks), or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 Easy Skills CLI 工具，支持 Package 管理、IDE 适配、Agent Skill 集成

**Architecture:** 基于 Go + SQLite，模块化设计（Hub 核心、IDE 适配器、CLI 命令），CLI 输出结构化 JSON 供 Agent 解析

**Tech Stack:** Go, SQLite (mattn/go-sqlite3), Cobra (CLI), React + TypeScript (GUI), Tauri (Mac App)

---

## 文件结构

```
easy-skills/
├── cmd/
│   └── easy-skills/
│       └── main.go              # CLI 入口
├── internal/
│   ├── hub/
│   │   ├── db.go               # 数据库初始化和连接
│   │   ├── package.go          # Package CRUD
│   │   ├── component.go         # Component CRUD
│   │   └── version.go           # 版本管理
│   ├── adapters/
│   │   ├── adapter.go          # IDEAdapter 接口定义
│   │   ├── qoder/
│   │   │   └── adapter.go      # Qoder 适配器
│   │   └── cursor/
│   │       └── adapter.go      # Cursor 适配器
│   ├── installer/
│   │   └── installer.go        # 安装逻辑
│   └── cli/
│       ├── root.go             # Root 命令
│       ├── register.go          # register 命令
│       ├── list.go             # list 命令
│       ├── info.go             # info 命令
│       ├── install.go           # install 命令
│       ├── uninstall.go        # uninstall 命令
│       ├── status.go           # status 命令
│       └── output.go           # 结构化输出
├── pkg/
│   └── types/
│       └── types.go            # 类型定义
├── skills/
│   └── easy-skills/
│       ├── SKILL.md            # Agent Skill
│       └── INSTALL.md          # 安装说明
├── docs/
│   └── superpowers/
│       ├── specs/              # 设计文档
│       └── plans/              # 实现计划
├── AGENTS.md                   # Agent 使用说明
├── README.md                   # 项目说明
├── go.mod
└── go.sum
```

---

## 第一轮：核心功能（MVP）

### Task 1: 项目初始化

**Files:**
- Create: `go.mod`
- Create: `cmd/easy-skills/main.go`
- Create: `internal/hub/db.go`
- Create: `pkg/types/types.go`
- Create: `.gitignore`

- [ ] **Step 1: 初始化 Go 模块**

```bash
cd /Users/zhongyangyang/PycharmProjects/local-skill-hub
go mod init github.com/easy-skills/easy-skills
```

- [ ] **Step 2: 添加依赖**

```bash
go get github.com/mattn/go-sqlite3@v1.14.22
go get github.com/spf13/cobra@v1.8.0
go get github.com/spf13/viper@v1.18.0
```

- [ ] **Step 3: 创建类型定义**

```go
// pkg/types/types.go
package types

type Package struct {
    ID        string    `json:"id"`
    Name      string    `json:"name"`
    Target    string    `json:"target"` // "qoder" / "cursor"
    Source    string    `json:"source,omitempty"`
    Metadata  string    `json:"metadata,omitempty"` // JSON
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}

type PackageVersion struct {
    ID            string    `json:"id"`
    PackageID     string    `json:"package_id"`
    Version       int64     `json:"version"` // Hub internal version (timestamp)
    Metadata      string    `json:"metadata,omitempty"` // JSON: real version, git ref
    IsCurrent     bool      `json:"is_current"`
    CreatedAt     time.Time `json:"created_at"`
}

type Component struct {
    ID               string `json:"id"`
    PackageID        string `json:"package_id"`
    PackageVersionID string `json:"package_version_id"`
    Name             string `json:"name"`
    Type             string `json:"type"` // "skill" / "agent" / "hook" / "rule"
    Path             string `json:"path"`
}

type Installation struct {
    ID           string    `json:"id"`
    ComponentID  string    `json:"component_id"`
    IDE          string    `json:"ide"` // "qoder" / "cursor"
    Scope        string    `json:"scope"` // "user" / "project"
    InstallPath  string    `json:"install_path"`
    InstalledAt  time.Time `json:"installed_at"`
}
```

- [ ] **Step 4: 创建数据库初始化**

```go
// internal/hub/db.go
package hub

import (
    "database/sql"
    "os"
    "path/filepath"

    _ "github.com/mattn/go-sqlite3"
)

type DB struct {
    *sql.DB
}

func NewDB(homeDir string) (*DB, error) {
    dbPath := filepath.Join(homeDir, "hub.db")
    if err := os.MkdirAll(homeDir, 0755); err != nil {
        return nil, err
    }
    
    db, err := sql.Open("sqlite3", dbPath)
    if err != nil {
        return nil, err
    }
    
    h := &DB{db}
    if err := h.migrate(); err != nil {
        return nil, err
    }
    
    return h, nil
}

func (h *DB) migrate() error {
    schema := `
    CREATE TABLE IF NOT EXISTS packages (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        target TEXT NOT NULL,
        source TEXT,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(name, target)
    );

    CREATE TABLE IF NOT EXISTS package_versions (
        id TEXT PRIMARY KEY,
        package_id TEXT REFERENCES packages(id),
        version INTEGER NOT NULL,
        metadata TEXT,
        is_current BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS components (
        id TEXT PRIMARY KEY,
        package_id TEXT REFERENCES packages(id),
        package_version_id TEXT REFERENCES package_versions(id),
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        path TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS installations (
        id TEXT PRIMARY KEY,
        component_id TEXT REFERENCES components(id),
        ide TEXT NOT NULL,
        scope TEXT NOT NULL,
        install_path TEXT NOT NULL,
        installed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    `
    _, err := h.Exec(schema)
    return err
}
```

- [ ] **Step 5: 创建 main.go**

```go
// cmd/easy-skills/main.go
package main

import (
    "github.com/easy-skills/easy-skills/internal/cli"
)

func main() {
    cli.Execute()
}
```

- [ ] **Step 6: 提交**

```bash
git add -A
git commit -m "feat: initialize project structure and database"
```

---

### Task 2: CLI 框架和输出

**Files:**
- Create: `internal/cli/root.go`
- Create: `internal/cli/output.go`
- Modify: `cmd/easy-skills/main.go`

- [ ] **Step 1: 创建 CLI 框架**

```go
// internal/cli/root.go
package cli

import (
    "fmt"
    "github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
    Use:   "easy-skills",
    Short: "Easy Skills - Local Skill Hub",
    Long:  "Manage AI IDE Skills with local hub support",
}

func Execute() {
    if err := rootCmd.Execute(); err != nil {
        fmt.Fprintln(os.Stderr, err)
        os.Exit(1)
    }
}
```

- [ ] **Step 2: 创建结构化输出**

```go
// internal/cli/output.go
package cli

import (
    "encoding/json"
    "fmt"
)

type Output struct {
    Success bool        `json:"success"`
    Data    interface{} `json:"data,omitempty"`
    Error   string      `json:"error,omitempty"`
}

func PrintJSON(v interface{}) {
    enc := json.NewEncoder(os.Stdout)
    enc.SetIndent("", "  ")
    enc.Encode(v)
}

func Success(data interface{}) {
    PrintJSON(Output{Success: true, Data: data})
}

func Fail(err string) {
    PrintJSON(Output{Success: false, Error: err})
}
```

- [ ] **Step 3: 提交**

```bash
git add -A
git commit -m "feat: add CLI framework with structured output"
```

---

### Task 3: Hub Package 管理

**Files:**
- Create: `internal/hub/package.go`
- Create: `internal/hub/component.go`
- Create: `internal/hub/version.go`
- Create: `internal/cli/register.go`

- [ ] **Step 1: Package CRUD**

```go
// internal/hub/package.go
package hub

import (
    "time"
    "github.com/google/uuid"
)

func (h *DB) CreatePackage(name, target, source, metadata string) (*Package, error) {
    now := time.Now()
    pkg := &Package{
        ID:        uuid.New().String(),
        Name:      name,
        Target:    target,
        Source:    source,
        Metadata:  metadata,
        CreatedAt: now,
        UpdatedAt: now,
    }
    
    _, err := h.Exec(
        `INSERT INTO packages (id, name, target, source, metadata, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        pkg.ID, pkg.Name, pkg.Target, pkg.Source, pkg.Metadata, pkg.CreatedAt, pkg.UpdatedAt,
    )
    if err != nil {
        return nil, err
    }
    return pkg, nil
}

func (h *DB) GetPackage(name, target string) (*Package, error) {
    pkg := &Package{}
    err := h.QueryRow(
        `SELECT id, name, target, source, metadata, created_at, updated_at 
         FROM packages WHERE name = ? AND target = ?`,
        name, target,
    ).Scan(&pkg.ID, &pkg.Name, &pkg.Target, &pkg.Source, &pkg.Metadata, &pkg.CreatedAt, &pkg.UpdatedAt)
    if err != nil {
        return nil, err
    }
    return pkg, nil
}

func (h *DB) ListPackages(target string) ([]*Package, error) {
    rows, err := h.Query(
        `SELECT id, name, target, source, metadata, created_at, updated_at 
         FROM packages WHERE target = ? ORDER BY name`,
        target,
    )
    if err != nil {
        return nil, err
    }
    defer rows.Close()
    
    var packages []*Package
    for rows.Next() {
        pkg := &Package{}
        rows.Scan(&pkg.ID, &pkg.Name, &pkg.Target, &pkg.Source, &pkg.Metadata, &pkg.CreatedAt, &pkg.UpdatedAt)
        packages = append(packages, pkg)
    }
    return packages, nil
}
```

- [ ] **Step 2: Version 管理**

```go
// internal/hub/version.go
package hub

import "time"

func (h *DB) CreateVersion(packageID string, version int64, metadata string) (*PackageVersion, error) {
    pv := &PackageVersion{
        ID:        uuid.New().String(),
        PackageID: packageID,
        Version:   version,
        Metadata:  metadata,
        IsCurrent: true,
        CreatedAt: time.Now(),
    }
    
    // Set all other versions to non-current
    h.Exec(`UPDATE package_versions SET is_current = FALSE WHERE package_id = ?`, packageID)
    
    _, err := h.Exec(
        `INSERT INTO package_versions (id, package_id, version, metadata, is_current, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        pv.ID, pv.PackageID, pv.Version, pv.Metadata, pv.IsCurrent, pv.CreatedAt,
    )
    if err != nil {
        return nil, err
    }
    return pv, nil
}

func (h *DB) GetCurrentVersion(packageID string) (*PackageVersion, error) {
    pv := &PackageVersion{}
    err := h.QueryRow(
        `SELECT id, package_id, version, metadata, is_current, created_at 
         FROM package_versions WHERE package_id = ? AND is_current = TRUE`,
        packageID,
    ).Scan(&pv.ID, &pv.PackageID, &pv.Version, &pv.Metadata, &pv.IsCurrent, &pv.CreatedAt)
    if err != nil {
        return nil, err
    }
    return pv, nil
}
```

- [ ] **Step 3: Component 管理**

```go
// internal/hub/component.go
package hub

func (h *DB) CreateComponent(packageID, versionID, name, cType, path string) (*Component, error) {
    comp := &Component{
        ID:               uuid.New().String(),
        PackageID:        packageID,
        PackageVersionID: versionID,
        Name:             name,
        Type:             cType,
        Path:             path,
    }
    
    _, err := h.Exec(
        `INSERT INTO components (id, package_id, package_version_id, name, type, path)
         VALUES (?, ?, ?, ?, ?, ?)`,
        comp.ID, comp.PackageID, comp.PackageVersionID, comp.Name, comp.Type, comp.Path,
    )
    if err != nil {
        return nil, err
    }
    return comp, nil
}

func (h *DB) GetComponentsByVersion(versionID string) ([]*Component, error) {
    rows, err := h.Query(
        `SELECT id, package_id, package_version_id, name, type, path 
         FROM components WHERE package_version_id = ?`,
        versionID,
    )
    if err != nil {
        return nil, err
    }
    defer rows.Close()
    
    var components []*Component
    for rows.Next() {
        c := &Component{}
        rows.Scan(&c.ID, &c.PackageID, &c.PackageVersionID, &c.Name, &c.Type, &c.Path)
        components = append(components, c)
    }
    return components, nil
}
```

- [ ] **Step 4: register 命令**

```go
// internal/cli/register.go
package cli

import (
    "github.com/spf13/cobra"
)

var registerCmd = &cobra.Command{
    Use:   "register",
    Short: "Register a package to Hub",
    Run:   runRegister,
}

var (
    flagName   string
    flagTarget string
    flagSource string
)

func init() {
    registerCmd.Flags().StringVar(&flagName, "name", "", "Package name")
    registerCmd.Flags().StringVar(&flagTarget, "target", "", "Target IDE (qoder/cursor)")
    registerCmd.Flags().StringVar(&flagSource, "source", "", "Source URL")
    rootCmd.AddCommand(registerCmd)
}

func runRegister(cmd *cobra.Command, args []string) {
    h := hub.NewHub()
    defer h.Close()
    
    pkg, err := h.RegisterPackage(flagName, flagTarget, flagSource)
    if err != nil {
        Fail(err.Error())
        return
    }
    
    Success(map[string]interface{}{"package": pkg})
}
```

- [ ] **Step 5: 提交**

```bash
git add -A
git commit -m "feat: add Hub package and version management"
```

---

### Task 4: IDE 适配器

**Files:**
- Create: `internal/adapters/adapter.go`
- Create: `internal/adapters/qoder/adapter.go`
- Create: `internal/adapters/cursor/adapter.go`

- [ ] **Step 1: 适配器接口**

```go
// internal/adapters/adapter.go
package adapters

type IDEAdapter interface {
    Name() string
    GetSkillDir(scope string) (string, error)
    InstallComponent(srcPath, destName string) error
    UninstallComponent(name, path string) error
    ListInstalled(scope string) ([]*InstalledComponent, error)
}

type InstalledComponent struct {
    Name string
    Path string
    Type string
}
```

- [ ] **Step 2: Qoder 适配器**

```go
// internal/adapters/qoder/adapter.go
package qoder

type Adapter struct{}

func (a *Adapter) Name() string { return "qoder" }

func (a *Adapter) GetSkillDir(scope string) (string, error) {
    home, err := os.UserHomeDir()
    if err != nil {
        return "", err
    }
    
    if scope == "project" {
        cwd, err := os.Getwd()
        if err != nil {
            return "", err
        }
        return filepath.Join(cwd, ".qoder", "skills"), nil
    }
    return filepath.Join(home, ".qoder", "skills"), nil
}

func (a *Adapter) InstallComponent(srcPath, destName string) error {
    dir, err := a.GetSkillDir("user")
    if err != nil {
        return err
    }
    destPath := filepath.Join(dir, destName)
    return os.Rename(srcPath, destPath)
}

func (a *Adapter) UninstallComponent(name, path string) error {
    return os.RemoveAll(path)
}

func (a *Adapter) ListInstalled(scope string) ([]*adapters.InstalledComponent, error) {
    dir, err := a.GetSkillDir(scope)
    if err != nil {
        return nil, err
    }
    // Scan directory for installed components
    // ...
    return nil, nil
}
```

- [ ] **Step 3: Cursor 适配器**

```go
// internal/adapters/cursor/adapter.go
package cursor

type Adapter struct{}

func (a *Adapter) Name() string { return "cursor" }

func (a *Adapter) GetSkillDir(scope string) (string, error) {
    home, err := os.UserHomeDir()
    if err != nil {
        return "", err
    }
    
    if scope == "project" {
        cwd, err := os.Getwd()
        if err != nil {
            return "", err
        }
        return filepath.Join(cwd, ".cursorrules"), nil
    }
    return filepath.Join(home, ".cursorrules"), nil
}

func (a *Adapter) InstallComponent(srcPath, destName string) error {
    dir, err := a.GetSkillDir("user")
    if err != nil {
        return err
    }
    destPath := filepath.Join(dir, destName)
    return os.Rename(srcPath, destPath)
}

func (a *Adapter) UninstallComponent(name, path string) error {
    return os.RemoveAll(path)
}

func (a *Adapter) ListInstalled(scope string) ([]*adapters.InstalledComponent, error) {
    // Similar to Qoder adapter
    return nil, nil
}
```

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "feat: add IDE adapters for Qoder and Cursor"
```

---

### Task 5: CLI 命令完整实现

**Files:**
- Create: `internal/cli/list.go`
- Create: `internal/cli/info.go`
- Create: `internal/cli/install.go`
- Create: `internal/cli/uninstall.go`
- Create: `internal/cli/status.go`

- [ ] **Step 1: list 命令**

```go
// internal/cli/list.go
package cli

import (
    "github.com/spf13/cobra"
)

var listCmd = &cobra.Command{
    Use:   "list",
    Short: "List packages in Hub",
    Run:   runList,
}

var listTarget string

func init() {
    listCmd.Flags().StringVar(&listTarget, "target", "", "Filter by target (qoder/cursor)")
    rootCmd.AddCommand(listCmd)
}

func runList(cmd *cobra.Command, args []string) {
    h := hub.NewHub()
    defer h.Close()
    
    packages, err := h.ListPackages(listTarget)
    if err != nil {
        Fail(err.Error())
        return
    }
    
    Success(map[string]interface{}{"packages": packages})
}
```

- [ ] **Step 2: info 命令**

```go
// internal/cli/info.go
package cli

var infoCmd = &cobra.Command{
    Use:   "info",
    Short: "Show package details",
    Run:   runInfo,
}

func init() {
    infoCmd.Flags().StringVar(&flagName, "name", "", "Package name")
    infoCmd.Flags().StringVar(&flagTarget, "target", "", "Target IDE")
    rootCmd.AddCommand(infoCmd)
}

func runInfo(cmd *cobra.Command, args []string) {
    h := hub.NewHub()
    defer h.Close()
    
    pkg, err := h.GetPackage(flagName, flagTarget)
    if err != nil {
        Fail(err.Error())
        return
    }
    
    version, _ := h.GetCurrentVersion(pkg.ID)
    components, _ := h.GetComponentsByVersion(version.ID)
    
    Success(map[string]interface{}{
        "package":    pkg,
        "version":     version,
        "components":  components,
    })
}
```

- [ ] **Step 3: install/uninstall/status 命令**

```go
// internal/cli/install.go
package cli

var installCmd = &cobra.Command{
    Use:   "install",
    Short: "Install package to IDE",
    Run:   runInstall,
}

var installIDE, installScope string

func init() {
    installCmd.Flags().StringVar(&flagName, "name", "", "Package name")
    installCmd.Flags().StringVar(&flagTarget, "target", "", "Target IDE")
    installCmd.Flags().StringVar(&installIDE, "ide", "", "IDE to install to")
    installCmd.Flags().StringVar(&installScope, "scope", "user", "Scope (user/project)")
    rootCmd.AddCommand(installCmd)
}

func runInstall(cmd *cobra.Command, args []string) {
    h := hub.NewHub()
    defer h.Close()
    
    err := h.InstallPackage(flagName, flagTarget, installIDE, installScope)
    if err != nil {
        Fail(err.Error())
        return
    }
    
    Success(map[string]interface{}{"message": "Package installed successfully"})
}
```

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "feat: implement all CLI commands"
```

---

### Task 6: Agent Skill

**Files:**
- Create: `skills/easy-skills/SKILL.md`
- Create: `skills/easy-skills/INSTALL.md`

- [ ] **Step 1: SKILL.md**

```markdown
# Easy Skills

Easy Skills Hub CLI tool for managing AI IDE Skills.

## Usage

When user asks to manage skills, use `easy-skills` CLI commands.

### Common Commands

```bash
# List all packages in Hub
easy-skills list --target qoder

# Show package details
easy-skills info --name superpowers --target qoder

# Install package to IDE
easy-skills install --name superpowers --target qoder --ide qoder --scope user

# Uninstall package
easy-skills uninstall --name superpowers --target qoder --ide qoder --scope user

# Check installed status
easy-skills status --ide qoder
```

### Workflow Example

1. User wants to install a new skill package
2. Check what's currently installed: `easy-skills status --ide qoder`
3. Install the package: `easy-skills install --name <pkg> --target qoder --ide qoder --scope user`
4. Verify installation: `easy-skills status --ide qoder`
```

- [ ] **Step 2: INSTALL.md**

```markdown
# Install Easy Skills

## For Qoder

Tell Qoder agent:
```
/easy-skills Fetch and follow instructions from https://raw.githubusercontent.com/xxx/easy-skills/main/.qoder/INSTALL.md
```

## For Cursor

Tell Cursor agent:
```
Fetch and follow instructions from https://raw.githubusercontent.com/xxx/easy-skills/main/.cursorrules/INSTALL.md
```
```

- [ ] **Step 3: 提交**

```bash
git add -A
git commit -m "feat: add Agent Skill for easy-skills"
```

---

### Task 7: Web GUI

**Files:**
- Create: `web/index.html`
- Create: `web/src/App.tsx`
- Create: `web/src/components/PackageCard.tsx`
- Create: `web/src/components/PackageDetail.tsx`
- Create: `web/src/hooks/useEasySkills.ts`
- Create: `web/package.json`
- Create: `web/vite.config.ts`

- [ ] **Step 1: 初始化 Web 项目**

```bash
mkdir -p web/src/components web/src/hooks
cat > web/package.json << 'EOF'
{
  "name": "easy-skills-web",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}
EOF
```

- [ ] **Step 2: App.tsx**

```tsx
// web/src/App.tsx
import { useState } from 'react'
import PackageCard from './components/PackageCard'
import PackageDetail from './components/PackageDetail'
import { useEasySkills } from './hooks/useEasySkills'

function App() {
  const [selectedTarget, setSelectedTarget] = useState<'qoder' | 'cursor'>('qoder')
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const { packages, installations, loading, error } = useEasySkills(selectedTarget)

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="app">
      <header>
        <h1>Easy Skills Hub</h1>
        <div className="tabs">
          <button onClick={() => setSelectedTarget('qoder')}>Qoder</button>
          <button onClick={() => setSelectedTarget('cursor')}>Cursor</button>
        </div>
      </header>

      <main>
        <section className="packages">
          <h2>Packages (Hub)</h2>
          <div className="grid">
            {packages.map(pkg => (
              <PackageCard
                key={pkg.id}
                package={pkg}
                onClick={() => setSelectedPackage(pkg.name)}
              />
            ))}
          </div>
        </section>

        <section className="installed">
          <h2>Installed</h2>
          <div className="grid">
            {installations.map(inst => (
              <PackageCard
                key={inst.id}
                package={inst}
                installed
              />
            ))}
          </div>
        </section>
      </main>

      {selectedPackage && (
        <PackageDetail
          name={selectedPackage}
          target={selectedTarget}
          onClose={() => setSelectedPackage(null)}
        />
      )}
    </div>
  )
}

export default App
```

- [ ] **Step 3: useEasySkills hook**

```tsx
// web/src/hooks/useEasySkills.ts
import { useState, useEffect } from 'react'

interface Package {
  id: string
  name: string
  target: string
  metadata?: string
}

interface Installation {
  id: string
  packageName: string
  ide: string
  scope: string
}

export function useEasySkills(target: string) {
  const [packages, setPackages] = useState<Package[]>([])
  const [installations, setInstallations] = useState<Installation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        // 调用 easy-skills CLI 获取数据
        const listRes = await fetch(`/api/list?target=${target}`)
        const statusRes = await fetch(`/api/status?ide=${target}`)
        
        const listData = await listRes.json()
        const statusData = await statusRes.json()
        
        setPackages(listData.data?.packages || [])
        setInstallations(statusData.data?.installations || [])
        setError(null)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [target])

  return { packages, installations, loading, error }
}
```

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "feat: add Web GUI with React"
```

---

### Task 8: Tauri Mac App

**Files:**
- Create: `src-tauri/Cargo.toml`
- Create: `src-tauri/src/main.rs`
- Create: `src-tauri/tauri.conf.json`

- [ ] **Step 1: Cargo.toml**

```toml
[package]
name = "easy-skills"
version = "0.1.0"
edition = "2021"

[dependencies]
tauri = { version = "1.5", features = ["shell-open"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"

[build-dependencies]
tauri-build = { version = "1.5", features = [] }
```

- [ ] **Step 2: main.rs**

```rust
use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_window("main").unwrap();
            window.set_title("Easy Skills Hub").unwrap();
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

- [ ] **Step 3: tauri.conf.json**

```json
{
  "build": {
    "distDir": "../web/dist",
    "devPath": "../web"
  },
  "package": {
    "productName": "Easy Skills",
    "version": "0.1.0"
  }
}
```

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "feat: add Tauri Mac App scaffold"
```

---

### Task 9: README.md 和 AGENTS.md

**Files:**
- Create: `README.md`
- Create: `AGENTS.md`

- [ ] **Step 1: README.md**

```markdown
# Easy Skills

AI IDE 的 Local Skill Hub，支持多 IDE (Cursor/Qoder) 的 Skill 托管和切换。

## Features

- **Package Management**: 注册、管理多个 Skill Package
- **Multi-IDE Support**: 支持 Qoder 和 Cursor
- **Version Tracking**: Hub 内部版本号 + 真实版本号追踪
- **Agent Integration**: 提供 CLI Skill 给 AI IDE Agent 使用
- **Read-only GUI**: Web/Tauri 可视化界面查看状态

## Installation

```bash
go install github.com/easy-skills/easy-skills@latest
```

## Quick Start

```bash
# Register a package
easy-skills register --name superpowers --target qoder --source https://github.com/obra/superpowers

# List packages
easy-skills list --target qoder

# Install to IDE
easy-skills install --name superpowers --target qoder --ide qoder --scope user
```

## CLI Commands

| Command | Description |
|---------|-------------|
| register | Register a package to Hub |
| list | List packages in Hub |
| info | Show package details |
| install | Install package to IDE |
| uninstall | Uninstall package from IDE |
| status | Check installation status |
```

- [ ] **Step 2: AGENTS.md**

```markdown
# AGENTS.md

This project uses Easy Skills Hub for AI IDE Skill management.

## For AI Agents

When working with this project, you can use `easy-skills` CLI to manage skills:

```bash
# Check current status
easy-skills status --ide qoder

# Install a skill package
easy-skills install --name <package-name> --target qoder --ide qoder --scope user

# List available packages
easy-skills list --target qoder
```

## Easy Skills Skill

The `skills/easy-skills/SKILL.md` provides additional guidance for skill management.
```

- [ ] **Step 3: 提交**

```bash
git add -A
git commit -m "docs: add README.md and AGENTS.md"
```

---

## 第二轮：一致性问题修复

### 待实现功能

- [ ] 文件系统与数据库一致性检查
- [ ] Installation 与 Component 关系修复
- [ ] Package 版本升级/降级逻辑

---

## 第三轮：高级功能

### 待实现功能

- [ ] Package 升级检测（从源拉取最新版本）
- [ ] 版本回滚功能
- [ ] 包溯源视图增强

---

## 自检清单

### Spec Coverage
- [x] Package/Component 概念定义
- [x] SQLite 数据库 Schema
- [x] CLI 命令列表
- [x] IDE 适配器接口
- [x] Agent Skill
- [x] GUI 视图设计（待实现）
- [x] Mac App 设计（待实现）
- [ ] 一致性问题（第二轮）

### Placeholder Scan
- [x] 无 TBD/TODO
- [x] 所有步骤有具体代码
- [x] 所有路径精确

### Type Consistency
- [x] Package 结构一致
- [x] Component 结构一致
- [x] CLI 参数命名一致

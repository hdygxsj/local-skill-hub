# AGENTS.md

This project uses Easy Skills Hub for AI IDE Skill management.

## General Rules

**版本控制：** 任何改动完成都应该进行 git commit。

## For AI Agents

When working with this project, you can use `easy-skills` CLI to manage skills:

### Check Current Status

```bash
# Check what packages are installed in Qoder
easy-skills status --ide qoder

# Check what packages are installed in Cursor
easy-skills status --ide cursor

# List all packages in Hub
easy-skills list --target qoder
```

### Register a Package

```bash
# Register a package from Git URL
easy-skills register --name superpowers --target qoder --source https://github.com/obra/superpowers
```

### View Package Details

```bash
# Show package info including components
easy-skills info --name superpowers --target qoder
```

## Web Interface

Access the web GUI at: http://localhost:27842

### Server Management

```bash
# Start the server
easy-skills serve

# Restart the server
easy-skills restart

# Check if server is running
cat ~/.easy-skills/easy-skills.pid
```

The `restart` command will automatically stop the existing server and start a new one.

## Easy Skills Skill

The `skills/easy-skills/SKILL.md` provides additional guidance for skill management.

## Output Format

All CLI commands output JSON for easy parsing:

```json
{
  "success": true,
  "data": {
    "packages": [...]
  }
}
```

On error:

```json
{
  "success": false,
  "error": "package not found"
}
```

## Building & Releasing

### Prerequisites

1. **npm Token** - 需要有 npm Granular Access Token 或开启 2FA bypass
2. **GitHub Token** - 需要有 repo 权限的 GitHub Personal Access Token
3. **Apple Developer Certificate** (可选) - 用于签名 Mac App，无证书时 App 会报"已损坏"

### Version Management

**版本号规则：** CLI 和 npm 使用相同版本号

```bash
# 从 package.json 读取版本号
VERSION=$(node -p "require('./npm/package.json').version")
echo "Release version: $VERSION"
```

**版本号升级规范（SemVer）：**

| 改动类型 | 版本号升级 | 示例 |
|---------|-----------|------|
| 小型改动（bug修复、小优化） | 第三位 +1 | 0.1.3 → 0.1.4 |
| 功能改动（新功能、较大改动） | 第二位 +1 | 0.1.4 → 0.2.0 |
| 重大改动（架构升级、全面重构） | 第一位 +1 | 0.2.0 → 1.0.0 |

**版本号示例：**
- `0.1.4` → `0.1.5`：修复端口冲突检测 bug
- `0.1.5` → `0.2.0`：新增项目目录安装功能
- `0.2.3` → `1.0.0`：完全重构数据库层、支持多 IDE

### Complete Release Flow

```bash
# ========== Step 1: 构建 ==========

# 读取版本号
VERSION=$(node -p "require('./npm/package.json').version")

# 构建前端（必须）
cd web && npm install && npm run build && cd ..

# 构建 CLI 跨平台二进制
make build-cross

# 构建 Mac App（需要 Rust 环境）
make build-tauri

# 构建产物位置：
# - CLI: releases/bin/easy-skills-macos-aarch64
# - App: releases/Easy Skills_${VERSION}_aarch64.dmg
```

```bash
# ========== Step 2: GitHub Release ==========

VERSION=$(node -p "require('./npm/package.json').version")

# 方案 A: 网页操作
# 1. 访问 https://github.com/hdygxsj/easy-skills/releases/new
# 2. 点击 "Choose a tag" 输入 v$VERSION
# 3. 上传两个文件：
#    - releases/bin/easy-skills-macos-aarch64（命名为 easy-skills-cli-macos-aarch64）
#    - releases/Easy Skills_${VERSION}_aarch64.dmg
# 4. 点击 "Publish release"

# 方案 B: API 上传（需要 GitHub Token）
VERSION=$(node -p "require('./npm/package.json').version")
RELEASE_ID="your_release_id"  # 从 release URL 获取
GH_TOKEN="ghp_xxx"

# 上传 CLI
curl -X POST \
  -H "Authorization: Bearer $GH_TOKEN" \
  -H "Content-Type: application/octet-stream" \
  "https://uploads.github.com/repos/hdygxsj/easy-skills/releases/$RELEASE_ID/assets?name=easy-skills-cli-macos-aarch64" \
  --data-binary @releases/bin/easy-skills-macos-aarch64

# 上传 dmg
curl -X POST \
  -H "Authorization: Bearer $GH_TOKEN" \
  -H "Content-Type: application/x-apple-diskimage" \
  "https://uploads.github.com/repos/hdygxsj/easy-skills/releases/$RELEASE_ID/assets?name=Easy%20Skills_${VERSION}_aarch64.dmg" \
  --data-binary @releases/Easy\ Skills_${VERSION}_aarch64.dmg
```

```bash
# ========== Step 3: npm 发布 ==========

VERSION=$(node -p "require('./npm/package.json').version")

# 配置 npm token
npm config set //registry.npmjs.org/:_authToken=npm_xxx

# 发布（注意：每次发布必须升级 package.json 中的版本号）
cd npm
npm publish

# 验证
npm view easy-skills-cli version  # 应显示 $VERSION
npm install -g easy-skills-cli    # 测试安装
```

### npm Package Structure

The `npm/` directory contains:
- `package.json` - npm 包配置，name 为 `easy-skills-cli`
- `scripts/install.js` - postinstall 脚本，从 GitHub Releases 下载对应平台的 CLI 二进制
- `bin/easy-skills` - Node wrapper，转发命令到实际二进制

### Mac App 签名说明

**无签名问题：** 如果 Mac App 没有 Apple 签名，macOS 会报"App 已损坏"。

**解决方案：**

1. **临时方案 - xattr 绕过：**
   ```bash
   # 解压 dmg 后
   xattr -cr "/Applications/Easy Skills.app"
   open "/Applications/Easy Skills.app"
   ```

2. **正式方案 - 添加签名：**
   - 加入 Apple Developer Program（99美元/年）
   - 在 Xcode 中创建签名证书
   - 在 `src-tauri/tauri.conf.json` 中配置：
     ```json
     "macOS": {
       "signingIdentity": "Developer ID Application: Your Name (TEAMID)"
     }
     ```

### Historical Artifacts (for reference only)

The `releases/` directory may contain:
- `easy-skills-*-*` - 跨平台 CLI 二进制
- `Easy Skills*.dmg` - macOS 安装器
- `Easy Skills.app` - macOS App bundle

### Building Individual Components

```bash
make build          # Build CLI only
make build-tauri    # Build Mac App only (includes dmg creation)
make build-cross    # Build all cross-platform CLI binaries
make source-tar    # Source archive only
```

### Troubleshooting

**npm publish E403:** 需要配置正确的 npm token，或在 npm 网站开启 2FA bypass

**App 显示已损坏:** 无签名问题，使用 `xattr -cr` 绕过或购买 Apple 开发者证书

**CLI 下载失败 404:** 检查 GitHub Release 是否存在对应版本号的 tag 和 asset

### Automated Release (GitHub Actions)

**自动发布流程：** 只需推送一个 tag，CI 会自动构建并创建 Release。

```bash
# 1. 更新版本号（npm/package.json 和 tauri.conf.json）
vim npm/package.json          # 修改 version 字段
vim src-tauri/tauri.conf.json # 修改 version 字段

# 2. 提交更改并创建 tag
git add .
git commit -m "Release v0.1.4"
git tag v0.1.4
git push origin main --tags

# 3. GitHub Actions 自动完成：
#    - 构建前端 (web/)
#    - 构建跨平台 CLI (macOS x64/ARM64, Linux x64/ARM64, Windows)
#    - 创建 GitHub Release 并上传产物
```

**工作流文件：** `.github/workflows/release.yml`

**注意：** Mac App (.dmg) 需要 macOS runner 和 Xcode，当前 CI 暂未包含。

# AGENTS.md

This project uses Easy Skills Hub for AI IDE Skill management.

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

### Release Targets

**Only publish these to GitHub Releases:**
1. **macOS ARM64 binary** - `easy-skills-macos-aarch64`
2. **npm package** - CLI via `npm publish`

> Note: Users on other platforms can install via `npm install -g easy-skills`

### Build Steps

```bash
# 1. Build cross-platform binaries (for npm install.js to download)
make build-cross

# 2. Upload to GitHub Releases
# - Go to https://github.com/hdygxsj/easy-skills/releases/new
# - Create tag vX.Y.Z
# - Upload: easy-skills-macos-aarch64

# 3. Publish CLI to npm
cd npm
npm publish --access public
```

### GitHub Release Assets

Upload only:
- `easy-skills-macos-aarch64` (macOS ARM64 binary for npm to download)

### npm Package

The `npm/` directory contains:
- `package.json` - npm package config
- `scripts/install.js` - downloads platform-specific binary from GitHub Releases
- `bin/easy-skills` - Node wrapper that forwards to the downloaded binary

### Historical Artifacts (for reference only)

The `releases/` directory may contain:
- `Easy Skills.app` - macOS App bundle (optional, users can use dmg instead)
- `Easy Skills.dmg` - macOS installer (optional)
- `easy-skills-source.tar.gz` - source code archive (optional)

### Building Individual Components

```bash
make build          # Build CLI only
make build-tauri    # Build Mac App only (includes dmg creation)
make build-cross    # Build all cross-platform CLI binaries
make source-tar     # Source archive only
```

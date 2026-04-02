# Easy Skills

This skill guides AI agents to manage skill packages using the `easy-skills` CLI for **Qoder**.

## Overview

Easy Skills is a local skill hub that manages skill packages for Qoder IDE. Use this skill when the user wants to:
- Install or uninstall skill packages
- Check what packages are installed
- View package details
- Upgrade or rollback packages

## Commands

### Package Management

```bash
# Register a package to Hub
easy-skills register --name <name> --target qoder --source <git-url>

# List all packages for Qoder
easy-skills list --target qoder

# View package details
easy-skills info --name <name> --target qoder

# List only installed packages
easy-skills list --target qoder --installed
```

### Installation

```bash
# Install package to Qoder (user scope)
easy-skills install --name <name> --target qoder --ide qoder --scope user

# Install to project scope
easy-skills install --name <name> --target qoder --ide qoder --scope project

# Uninstall package
easy-skills uninstall --name <name> --target qoder --ide qoder --scope user

# Reinstall package
easy-skills reinstall --name <name> --target qoder --ide qoder
```

### Version Management

```bash
# Upgrade to latest version
easy-skills upgrade --name <name> --target qoder

# View version history
easy-skills versions --name <name> --target qoder

# Rollback to specific version
easy-skills rollback --name <name> --target qoder --version <timestamp>
```

### Status

```bash
# Check installed packages in Qoder
easy-skills status --ide qoder
```

## Output Format

All commands return JSON:

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
  "error": "error message"
}
```

## Workflow Examples

### Check Installed Packages
1. Run `easy-skills status --ide qoder`
2. Parse JSON output to show installed packages

### Install a New Package
1. Register: `easy-skills register --name <pkg> --target qoder --source <url>`
2. Install: `easy-skills install --name <pkg> --target qoder --ide qoder --scope user`
3. Verify: `easy-skills status --ide qoder`

### Upgrade Package
1. Check versions: `easy-skills versions --name <pkg> --target qoder`
2. Upgrade: `easy-skills upgrade --name <pkg> --target qoder`
3. Verify: `easy-skills info --name <pkg> --target qoder`

## Web UI

View skill status visually at: http://localhost:27842

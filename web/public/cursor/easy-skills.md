# Easy Skills

This skill guides AI agents to manage skill packages using the `easy-skills` CLI for **Cursor**.

## Overview

Easy Skills is a local skill hub that manages skill packages for Cursor IDE. Use this skill when the user wants to:
- Install or uninstall skill packages
- Check what packages are installed
- View package details
- Upgrade or rollback packages

## Commands

### Package Management

```bash
# Register a package to Hub
easy-skills register --name <name> --target cursor --source <git-url>

# List all packages for Cursor
easy-skills list --target cursor

# View package details
easy-skills info --name <name> --target cursor

# List only installed packages
easy-skills list --target cursor --installed
```

### Installation

```bash
# Install package to Cursor (user scope)
easy-skills install --name <name> --target cursor --ide cursor --scope user

# Install to project scope
easy-skills install --name <name> --target cursor --ide cursor --scope project

# Uninstall package
easy-skills uninstall --name <name> --target cursor --ide cursor --scope user

# Reinstall package
easy-skills reinstall --name <name> --target cursor --ide cursor
```

### Version Management

```bash
# Upgrade to latest version
easy-skills upgrade --name <name> --target cursor

# View version history
easy-skills versions --name <name> --target cursor

# Rollback to specific version
easy-skills rollback --name <name> --target cursor --version <timestamp>
```

### Status

```bash
# Check installed packages in Cursor
easy-skills status --ide cursor
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
1. Run `easy-skills status --ide cursor`
2. Parse JSON output to show installed packages

### Install a New Package
1. Register: `easy-skills register --name <pkg> --target cursor --source <url>`
2. Install: `easy-skills install --name <pkg> --target cursor --ide cursor --scope user`
3. Verify: `easy-skills status --ide cursor`

### Upgrade Package
1. Check versions: `easy-skills versions --name <pkg> --target cursor`
2. Upgrade: `easy-skills upgrade --name <pkg> --target cursor`
3. Verify: `easy-skills info --name <pkg> --target cursor`

## Web UI

View skill status visually at: http://localhost:27842

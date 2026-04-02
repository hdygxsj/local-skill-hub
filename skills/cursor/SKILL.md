# Easy Skills

This skill guides AI agents to manage skill packages using the `easy-skills` CLI for **Cursor**.

## Overview

Easy Skills is a local skill hub that manages skill packages for Cursor IDE. Use this skill when the user wants to:
- Register packages to local Hub
- List available packages
- View package details
- Install or uninstall packages to/from Cursor
- Check installation status

## Commands

### Register Package

```bash
# Register a package to Hub
easy-skills register --name <name> --target cursor --source <git-url>
```

### List Packages

```bash
# List all packages for Cursor
easy-skills list --target cursor
```

### Package Details

```bash
# View package details
easy-skills info --name <name> --target cursor
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

### Install a Package
1. Register: `easy-skills register --name <pkg> --target cursor --source <url>`
2. Install: `easy-skills install --name <pkg> --target cursor --ide cursor --scope user`
3. Verify: `easy-skills status --ide cursor`

### Uninstall a Package
1. Run `easy-skills uninstall --name <pkg> --target cursor --ide cursor --scope user`
2. Verify: `easy-skills status --ide cursor`

## Web UI

View skill status visually at: http://localhost:27842

Start server: `easy-skills serve`

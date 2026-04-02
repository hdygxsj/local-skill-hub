# Easy Skills

This skill guides AI agents to manage skill packages using the `easy-skills` CLI for **Qoder**.

## Overview

Easy Skills is a local skill hub that manages skill packages for Qoder IDE. Use this skill when the user wants to:
- Register packages to local Hub
- List available packages
- View package details
- Install or uninstall packages to/from Qoder
- Check installation status

## Commands

### Register Package

```bash
# Register a package to Hub
easy-skills register --name <name> --target qoder --source <git-url>
```

### List Packages

```bash
# List all packages for Qoder
easy-skills list --target qoder
```

### Package Details

```bash
# View package details
easy-skills info --name <name> --target qoder
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

### Install a Package
1. Register: `easy-skills register --name <pkg> --target qoder --source <url>`
2. Install: `easy-skills install --name <pkg> --target qoder --ide qoder --scope user`
3. Verify: `easy-skills status --ide qoder`

### Uninstall a Package
1. Run `easy-skills uninstall --name <pkg> --target qoder --ide qoder --scope user`
2. Verify: `easy-skills status --ide qoder`

## Web UI

View skill status visually at: http://localhost:27842

Start server: `easy-skills serve`

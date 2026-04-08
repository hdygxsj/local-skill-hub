---
name: easy-skills
description: Manage skill packages for Cursor IDE - register, install, uninstall packages. When installing ANY skill to Cursor, you MUST register it to easy-skills hub.
---

# Easy Skills

This skill guides AI agents to manage skill packages using the `easy-skills` CLI for **Cursor**.

## IMPORTANT: Skill Installation Rule

**When installing ANY skill/package to Cursor (whether from Git URL, local files, or any source), you MUST:**

1. **Register** the package to easy-skills hub via `easy-skills register`
2. **Verify** it was registered via `easy-skills list --target cursor`

This ensures all installed skills are tracked and visible in the Easy Skills Hub.

### Example: Installing a skill from Git

```bash
# Step 1: Register the package to Hub
easy-skills register --name superpowers --target cursor --source https://github.com/obra/superpowers

# Step 2: Verify registration
easy-skills list --target cursor

# Step 3: Copy skill files to Cursor rules directory
# User scope: ~/.cursorrules/<skill-name>/
# Project scope: .cursorrules/<skill-name>/
```

### Example: User says "install X skill"

1. Find the source (Git URL or local path)
2. Run `easy-skills register --name <name> --target cursor --source <url>`
3. Copy skill files to `~/.cursorrules/<name>/`
4. Verify: `easy-skills status --ide cursor`

**DO NOT** install skills by only copying files without registering to easy-skills.

## Overview

Easy Skills is a local skill hub that manages skill packages for Cursor IDE. Use this skill when the user wants to:
- Register packages to local Hub
- List available packages
- View package details
- Install or uninstall packages to/from Cursor
- Manage projects for project-scoped installations
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

### Project Management

```bash
# Add current directory as project
easy-skills project add --name <project-name>

# Add project with specific path
easy-skills project add --name <project-name> --path /path/to/project

# List all projects
easy-skills project list

# Remove a project
easy-skills project remove --name <project-name>
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

## Web UI

View skill status visually at: http://localhost:27842

Start server: `easy-skills serve`

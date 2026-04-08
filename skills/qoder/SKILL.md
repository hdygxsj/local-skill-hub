---
name: easy-skills
description: Manage skill packages for Qoder IDE - register, install, uninstall packages. When installing ANY skill to Qoder, you MUST register it to easy-skills hub.
---

# Easy Skills

This skill guides AI agents to manage skill packages using the `easy-skills` CLI for **Qoder**.

## IMPORTANT: Skill Installation Rule

**When installing ANY skill/package to Qoder (whether from Git URL, local files, or any source), you MUST:**

1. **Select correct target** - Use `--target qoder` for Qoder IDE
2. **Register** the package to easy-skills hub via `easy-skills register`
3. **Register components** - After registering package, use `easy-skills register-components` to register all components
4. **Verify** registration via `easy-skills list --target qoder` and `easy-skills info --name <name> --target qoder`

This ensures all installed skills are tracked and visible in the Easy Skills Hub.

### Example: Installing a skill from Git

```bash
# Step 1: Register the package to Hub (MUST use --target qoder)
easy-skills register --name superpowers --target qoder --source https://github.com/obra/superpowers

# Step 2: Register all components from the package
easy-skills register-components --name superpowers --target qoder

# Step 3: Verify registration
easy-skills info --name superpowers --target qoder

# Step 4: Copy skill files to Qoder skills directory
# User scope: ~/.qoder/skills/<skill-name>/
# Project scope: .qoder/skills/<skill-name>/
```

### Example: User says "install X skill"

1. Find the source (Git URL or local path)
2. Run `easy-skills register --name <name> --target qoder --source <url>`
3. Run `easy-skills register-components --name <name> --target qoder`
4. Copy skill files to `~/.qoder/skills/<name>/`
5. Verify: `easy-skills info --name <name> --target qoder`

**DO NOT** install skills by only copying files without registering to easy-skills.

**IMPORTANT:** Always use `--target qoder` when working with Qoder IDE. Using `--target cursor` or other targets is incorrect.

## Overview

Easy Skills is a local skill hub that manages skill packages for Qoder IDE. Use this skill when the user wants to:
- Register packages to local Hub
- List available packages
- View package details
- Install or uninstall packages to/from Qoder
- Manage projects for project-scoped installations
- Check installation status

## Commands

### Register Package

```bash
# Register a package to Hub
easy-skills register --name <name> --target qoder --source <git-url>

# Register all components from the package source
easy-skills register-components --name <name> --target qoder
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

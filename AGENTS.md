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

### Install a Skill Package

```bash
# Install a package to Qoder
easy-skills install --name <package-name> --target qoder --ide qoder --scope user

# Install to project scope
easy-skills install --name <package-name> --target qoder --ide qoder --scope project
```

### Uninstall a Skill Package

```bash
# Uninstall from Qoder
easy-skills uninstall --name <package-name> --target qoder --ide qoder --scope user
```

### Register a New Package

```bash
# Register a package from Git URL
easy-skills register --name <package-name> --target qoder --source <git-url>
```

### View Package Details

```bash
# Show package info including components
easy-skills info --name <package-name> --target qoder
```

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

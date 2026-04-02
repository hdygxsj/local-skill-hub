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

To build release artifacts:

```bash
# Build CLI + Mac App + Source archive
make release

# Artifacts will be in releases/:
# - easy-skills              # CLI binary
# - Easy Skills.dmg          # macOS installer
# - easy-skills-source.tar.gz  # Source code
```

To build individual components:

```bash
make build          # CLI only
make build-tauri    # Mac App only (includes dmg creation)
make source-tar    # Source archive only
```

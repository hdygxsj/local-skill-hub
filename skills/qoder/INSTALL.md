# Installing Easy Skills for Qoder

## Step 1: Install easy-skills

Choose one of these methods:

### Option A: Via npm
```bash
npm install -g easy-skills-cli
```

## Step 2: Start the Hub

```bash
easy-skills serve
```

This starts the Web GUI at http://localhost:27842

## Step 3: Install Easy Skills Skill

Fetch and follow instructions from ./SKILL.md

This will install the skill file to `~/.qoder/skills/easy-skills/`.

## Troubleshooting

### Skill not loading

1. Verify skill file exists: `ls ~/.qoder/skills/easy-skills/`
2. Restart Qoder
3. Check skill is registered: `/easy-skills status --ide qoder`

### Hub not accessible

1. Verify CLI installed: `which easy-skills`
2. Check server running: `ps aux | grep easy-skills`
3. Try restarting: `easy-skills restart`

## Getting Help

- Releases: https://github.com/hdygxsj/easy-skills/releases
- Full documentation: https://github.com/hdygxsj/easy-skills
- Report issues: https://github.com/hdygxsj/easy-skills/issues

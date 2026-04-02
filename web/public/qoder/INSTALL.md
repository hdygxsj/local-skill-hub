# Installing Easy Skills for Qoder

## Step 1: Download and Install easy-skills

Tell the user to choose one of these options:

### Option A: Mac App (Recommended)
1. Download from: https://github.com/hdygxsj/easy-skills/releases
2. Double-click `Easy Skills_0.1.0_aarch64.dmg` to install

### Option B: CLI Binary
```bash
# Download the latest release
curl -L https://github.com/hdygxsj/easy-skills/releases/latest/download/easy-skills -o ~/Downloads/easy-skills

# Make it executable and install
chmod +x ~/Downloads/easy-skills
mv ~/Downloads/easy-skills /usr/local/bin/easy-skills
```

### Option C: Via Go
```bash
go install github.com/hdygxsj/easy-skills@latest
```

## Step 2: Start the Hub

```bash
easy-skills serve
```

This starts the Web GUI at http://localhost:27842

## Step 3: Install Easy Skills Skill

Tell your AI Agent:

```
Fetch and follow instructions from http://localhost:27842/qoder/easy-skills.md
```

This will install the skill file to `~/.qoder/skills/easy-skills/`.

## Usage

After installation, your AI Agent can manage packages via:

```
/easy-skills 列出 qoder 可用的 packages
/easy-skills 帮我安装某个 package 到 qoder
/easy-skills 查看某个 package 的详情
/easy-skills 升级某个 package
```

## Troubleshooting

### Skill not loading

1. Verify skill file exists: `ls ~/.qoder/skills/easy-skills/`
2. Restart Qoder
3. Check skill is registered: `/easy-skills status --ide qoder`

### Hub not accessible

1. Verify CLI installed: `which easy-skills`
2. Check server running: `ps aux | grep easy-skills`
3. Try restarting: `easy-skills serve`

## Getting Help

- Releases: https://github.com/hdygxsj/easy-skills/releases
- Full documentation: https://github.com/hdygxsj/easy-skills
- Report issues: https://github.com/hdygxsj/easy-skills/issues

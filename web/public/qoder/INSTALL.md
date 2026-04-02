# Installing Easy Skills for Qoder

## Step 1: Install easy-skills CLI

告诉用户运行：

```bash
go install github.com/hdygxsj/easy-skills@latest
```

## Step 2: Install Easy Skills Skill

Tell the AI Agent to install the skill:

```
/easy-skills Fetch and follow instructions from http://localhost:27842/qoder/easy-skills.md
```

This will install the skill file to `~/.qoder/skills/easy-skills/`.

## Step 3: Start Hub

```bash
easy-skills serve
```

This starts the Web GUI at http://localhost:27842

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

- Full documentation: https://github.com/hdygxsj/easy-skills
- Report issues: https://github.com/hdygxsj/easy-skills/issues

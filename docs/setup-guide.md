## Topics
1. File reference - line 7
2. Post-copy steps - line 20
3. Progression path - line 31
4. When to add each component - line 38

---

# Setup Guide

## 1. File Reference

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Project instructions - pointer file, under 75 lines |
| `inception-checklist.json` | Tracks what's been set up for this project |
| `.claude/settings.json` | Permissions, hooks, environment config |
| `.claude/rules/` | Auto-loaded rules (point-dont-dump, resource-discovery) |
| `.claude/commands/` | Slash commands (user-triggered prompts) |
| `.claude/skills/` | Skills (auto-loaded context) |
| `.claude/agents/` | Sub-agents (specialized workers) |
| `.claude/scripts/` | Hook scripts (zero-cost validation) |
| `docs/` | Accumulated project knowledge (decisions, patterns, reference) |

## 2. Post-Copy Steps

1. **Fill in CLAUDE.md** - project name, purpose, run commands, rules
2. **Review settings.json** - add permissions for your project's common commands
3. **Run inception checklist** - use framework/ to systematically fill in each item
4. **Create first skill or command** - copy from _example, customize, delete original
5. **Clean up** - delete all _example files when done

## 3. Progression Path

```
CLAUDE.md (understanding) -> settings.json (safety) -> skills (context)
  -> commands (workflows) -> agents (specialization) -> GSD (automation)
```

Start at CLAUDE.md. Add components as patterns emerge. Don't pre-build what you don't need yet.

## 4. When to Add Each Component

| Need | Add |
|------|-----|
| Trigger a specific workflow | Slash command |
| Reusable knowledge Claude should auto-load | Skill |
| Context isolation or specialist work | Agent |
| Zero-token validation (banned words, format) | Hook script |
| External app integration | MCP connection |
| Phased planning for large project | GSD (`/gsd:new-project`) |

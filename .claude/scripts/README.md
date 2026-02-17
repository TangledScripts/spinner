# Hook Scripts

Shell scripts triggered by lifecycle hooks. Zero LLM tokens - purely programmatic.

## How It Works

Scripts are wired in `.claude/settings.json` under the `hooks` object. They run automatically when matching events fire.

## Hook Events

| Event | When | Common Use |
|-------|------|------------|
| PreToolUse | Before tool execution | Block dangerous operations |
| PostToolUse | After successful tool | Validate output, check size |
| Stop | After Claude finishes | Post-response validation |
| SessionStart | Session begins | Initialize environment |
| PreCompact | Before context compaction | Preserve critical info |

## Active Hook

`check-file-size.sh` runs after every Edit/Write to enforce CLAUDE.md line limits and warn about large files.

## Creating New Hooks

1. Write a bash script in this directory
2. Wire it in `.claude/settings.json` under the appropriate event
3. Use `jq` to parse tool input from stdin
4. Exit 0 for advisory, non-zero to signal error

Docs: code.claude.com/docs/en/hooks

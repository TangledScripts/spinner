# Sub-Agents

Specialized Claude instances with isolated context windows for delegated tasks.

## When to Use

- Context isolation needed (prevent rot in long sessions)
- Specialist expertise beneficial (researcher, reviewer, debugger)
- Parallel work on independent tasks
- Lower cost important (isolated context = fewer tokens)

## Create an Agent

1. Add a markdown file here: `agent-name.md`
2. Define frontmatter (name, description, tools, model)
3. Write agent instructions below frontmatter

## Key Frontmatter

| Field | Purpose |
|-------|---------|
| `name` | Internal identifier |
| `description` | When to delegate to this agent |
| `tools` | Allowed tools (comma-separated) |
| `model` | sonnet, opus, haiku, or inherit |
| `maxTurns` | Cap on autonomous turns (cost safeguard) |
| `memory` | Persistence: user, project, or local |

## Progression

Single agent -> sub-agents -> agent teams (only when agents need to communicate)

See `_example.md` for a copyable template. Delete it after creating your own.

Docs: code.claude.com/docs/en/sub-agents

# Skills

Background knowledge Claude loads automatically when relevant, based on the skill's description.

## Skills vs Commands

- **Commands**: you trigger manually (`/command-name`)
- **Skills**: Claude loads automatically when the description matches the task

## Create a Skill

1. Create folder: `skills/your-skill-name/`
2. Add `SKILL.md` with frontmatter (name, description)
3. Add supporting files (examples/, templates/) as needed

## Key Frontmatter

| Field | Purpose |
|-------|---------|
| `name` | Display name, becomes `/slash-command` |
| `description` | Triggers auto-loading - be precise |
| `context` | `fork` for isolated context window |
| `agent` | Sub-agent type when context: fork |
| `allowed-tools` | Tools available without prompting |

## Auto-Invocation

Description precision determines reliability. Be specific:
- Bad: "Writing skill"
- Good: "Remove signs of AI-generated writing from text"

See `_example/` for a copyable template. Delete it after creating your own.

Docs: code.claude.com/docs/en/skills

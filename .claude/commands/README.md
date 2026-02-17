# Slash Commands

Saved prompts triggered manually with `/command-name`.

## Create a Command

1. Add a markdown file here: `command-name.md`
2. Use `$ARGUMENTS` for dynamic user input
3. Restart Claude Code for new commands to register

## Example

```markdown
Summarize $ARGUMENTS in 3 bullet points, focusing on actionable insights.
```

Usage: `/summarize <topic or text>`

See `_example.md` for a copyable template. Delete it after creating your own.

Docs: code.claude.com/docs/en/skills (commands merged into skills system)

# Point, Don't Dump

This rule is auto-loaded every session. It governs how project knowledge is organized.

## CLAUDE.md Limit

CLAUDE.md must stay under 75 lines (ideal: under 50). It is a pointer file, not a container. If you need to add knowledge, write it to docs/ and add a one-line pointer in CLAUDE.md.

## Storage Routing

All project knowledge goes into docs/ subdirectories:
- **docs/decisions/** - architectural decisions, trade-offs, ADRs
- **docs/patterns/** - reusable patterns, conventions, established approaches
- **docs/reference/** - context, specifications, domain knowledge

## Directory Reuse

Use existing directories. Do NOT create a new subdirectory for every document. Before creating any new directory under docs/, check what already exists and use the closest match. The three top-level categories (decisions, patterns, reference) should cover most needs. Only create deeper subdirectories when a category accumulates 10+ files on distinct subtopics. When that happens, group related files into a subdirectory and update any pointers in CLAUDE.md.

## Self-Enforcement

Even if the user pastes content directly into chat expecting it to go into CLAUDE.md or another root file, redirect: store it in the appropriate docs/ subdirectory and add a pointer. Explain why.

## Numbered Topic Index

Every document in docs/ must have a numbered topic index at the top with approximate starting line numbers:

```
## Topics
1. Authentication flow - line 12
2. Database schema - line 45
3. API conventions - line 78
```

Update the index when adding or reorganizing content.

## File Naming

Files in docs/: `YYYY-MM-DD-descriptive-slug.md`

## Pattern Reuse

Before creating new patterns, check docs/patterns/ AND the SSD library (`/media/tony/studios-d-e/forge/library/patterns/`) for existing ones. Reuse and adapt established patterns rather than creating new ones for similar problems. If a new pattern is truly needed, document it in docs/patterns/ AND consider adding it to the SSD library for cross-project reuse.

## Gotchas and Lessons Learned

When a bug, pitfall, or non-obvious fix is discovered during a session:
1. Record it immediately in auto memory (`~/.claude/projects/{path}/memory/MEMORY.md`) under a "Gotchas" heading so it loads every future session
2. If it applies across projects (not just this one), also add it to the SSD library at `library/patterns/` with a "gotcha" or "pitfall" tag in catalog.json

Do NOT wait until the end of a session. Record gotchas the moment they're resolved. This prevents repeating the same debugging cycle and wasting tokens.

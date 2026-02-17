# Resource Discovery Hierarchy

This rule is auto-loaded every session. It governs how external resources are found, cached, and reused.

## Discovery Order

When looking for pre-built skills, hooks, agents, MCP servers, patterns, rules, or integration configs:

1. **Local SSD library** - check `/media/tony/studios-d-e/forge/library/catalog.json` first. If SSD not mounted, note to user and skip to step 2.
2. **Pre-approved sources** - check `library/approved-sources.json` for trusted sites. Sources with a `programmatic` field have APIs, MCPs, or CLIs for direct search. Prefer programmatic access over web browsing. If a useful resource is found, cache it back to the SSD library under the appropriate directory and update catalog.json.
3. **Web search** - search the open web. Before using any resource from an unapproved site, validate the source (repo stars, author reputation, code review). If validated and used, cache it to the SSD library and add the source to approved-sources.json.

## Programmatic Access (Preferred)

Several approved sources support direct programmatic search. Use these instead of web browsing when available:

- **Skills**: SkillsMP MCP (`npx skillsmp-mcp-server`) or `skills-installer` CLI
- **Plugins**: `claude plugin marketplace` (built-in) or `claude-plugins` CLI
- **MCP servers**: PulseMCP MCP server or their REST API
- **GitHub repos**: `gh` CLI for any GitHub-hosted resource

Check `approved-sources.json` for setup details (API keys, install commands).

## Library Structure

When caching resources, use the correct directory:

| Resource Type | Library Path |
|---------------|-------------|
| Skills | `community/skills/` |
| Hooks | `community/hooks/` |
| Agents | `community/agents/` |
| Commands | `community/commands/` |
| Plugins | `community/plugins/` |
| Patterns | `patterns/` |
| Rules (individual) | `rules/individual/` |
| Rules (groups) | `rules/groups/` (JSON manifests referencing individual rules) |
| Integration configs | `integrations/` (per-service JSON with setup steps + credentials ref) |
| Starter file templates | `templates/` (Dockerfile, CI/CD, .gitignore, PRD, etc.) |
| Checklists | `checklists/` (starter frameworks customized per project) |
| Saved prompts | `prompts/` (refined, reusable prompts via `/save-prompt`) |

## Indexing (Critical)

Every cached resource MUST be indexed in `catalog.json` with: name, path, description, tags, source URL, date added. Without indexing, cached resources are invisible to search. Tags should include the resource type, domain (e.g., "coding", "marketing"), and key capabilities.

## Never Fetch Twice

Before fetching any external resource, search catalog.json by name and tags. If it's already in the library, use the local copy.

## Credentials for Integrations

Integration configs reference credentials by KeePass entry name or `~/Security/` path - never store actual secrets in the library. During project inception, Claude checks if needed credentials exist and prompts the user to set them up if missing.

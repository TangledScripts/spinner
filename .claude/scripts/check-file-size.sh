#!/bin/bash
# PostToolUse hook: check file size after Edit/Write
# Zero LLM tokens - runs as shell command
# Returns non-zero for CLAUDE.md violations (immediate feedback to Claude)
# SCOPED: Only checks documentation and config files, NOT source code

FILE_PATH=$(jq -r '.tool_input.file_path // empty' 2>/dev/null)

if [ -z "$FILE_PATH" ] || [ ! -f "$FILE_PATH" ]; then
  exit 0
fi

LINE_COUNT=$(wc -l < "$FILE_PATH")
BASENAME=$(basename "$FILE_PATH")
EXT="${BASENAME##*.}"

# CLAUDE.md has a hard limit - always enforced
if [ "$BASENAME" = "CLAUDE.md" ] && [ "$LINE_COUNT" -gt 75 ]; then
  echo "CLAUDE.md is ${LINE_COUNT} lines (max 75). Move content to docs/ and add a pointer."
  exit 1
fi

# Files exempt from size checks (legitimately grow large)
case "$BASENAME" in
  settings.json|package.json|package-lock.json|*.lock|catalog.json|approved-sources.json)
    exit 0
    ;;
esac

# Only check documentation and config files for the 200-line advisory
# Skip: source code, data files, generated files
case "$EXT" in
  md|json|yaml|yml|toml|ini|cfg|conf|txt)
    # These are doc/config files - check them
    ;;
  *)
    # Source code, binaries, data - skip
    exit 0
    ;;
esac

# Skip files in directories that shouldn't be checked
case "$FILE_PATH" in
  */node_modules/*|*/vendor/*|*/dist/*|*/build/*|*/.git/*|*/.planning/*)
    exit 0
    ;;
esac

if [ "$LINE_COUNT" -gt 200 ]; then
  echo "${BASENAME} is ${LINE_COUNT} lines. Consider adding a topic index or splitting."
  exit 0
fi

exit 0

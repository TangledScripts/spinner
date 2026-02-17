#!/bin/bash
# Project-level RAG initialization — run once after FORGE inception
# Initializes LanceDB, ingests PRD and docs, verifies setup

set -e

PROJECT_PATH="$(pwd)"
FORGE_HOME="${FORGE_HOME:-/media/tony/studios-d-e/forge}"
RAG_ENGINE="$FORGE_HOME/rag/engine/rag_engine.py"

echo "Initializing RAG for project at $PROJECT_PATH..."

# 1. Initialize LanceDB
"$FORGE_HOME/rag/.venv/bin/python3" "$RAG_ENGINE" init "$PROJECT_PATH"

# 2. Ingest PRD if it exists
if [ -f "$PROJECT_PATH/docs/reference/prd.md" ]; then
  "$FORGE_HOME/rag/.venv/bin/python3" "$RAG_ENGINE" ingest-file "$PROJECT_PATH/docs/reference/prd.md" "$PROJECT_PATH"
  echo "Ingested: docs/reference/prd.md"
fi

# 3. Ingest CLAUDE.md
if [ -f "$PROJECT_PATH/CLAUDE.md" ]; then
  "$FORGE_HOME/rag/.venv/bin/python3" "$RAG_ENGINE" ingest-file "$PROJECT_PATH/CLAUDE.md" "$PROJECT_PATH"
  echo "Ingested: CLAUDE.md"
fi

# 4. Ingest all docs/
find "$PROJECT_PATH/docs" -name "*.md" -not -name ".gitkeep" 2>/dev/null | while read -r doc; do
  "$FORGE_HOME/rag/.venv/bin/python3" "$RAG_ENGINE" ingest-file "$doc" "$PROJECT_PATH"
  echo "Ingested: $(basename "$doc")"
done

# 5. Verify
if [ -d "$PROJECT_PATH/.rag/.lance" ]; then
  echo "RAG initialized successfully. LanceDB at .rag/.lance/"
else
  echo "WARNING: RAG initialization may have failed. Check .rag/.lance/"
fi

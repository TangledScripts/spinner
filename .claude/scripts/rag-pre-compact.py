#!/usr/bin/env python3
"""RAG PreCompact hook — capture decisions/state before context compression."""

import os
import sys
import re
from pathlib import Path
from datetime import datetime, timezone

def _setup_forge(forge_home):
    """Add venv site-packages + engine to sys.path."""
    if forge_home:
        venv_lib = Path(forge_home) / "rag" / ".venv" / "lib"
        if venv_lib.exists():
            for d in venv_lib.iterdir():
                sp = d / "site-packages"
                if sp.exists():
                    sys.path.insert(0, str(sp))
        sys.path.insert(0, str(Path(forge_home) / "rag"))

DECISION_PATTERNS = re.compile(
    r"(decided|agreed|will use|confirmed|chosen|selected|approved|settled on)",
    re.IGNORECASE
)

def main():
    project_path = os.getcwd()
    rag_dir = Path(project_path) / ".rag"
    if not rag_dir.exists():
        return

    forge_home = os.environ.get("FORGE_HOME")
    if not forge_home:
        return
    _setup_forge(forge_home)

    # Read conversation from stdin
    conversation = ""
    if not sys.stdin.isatty():
        conversation = sys.stdin.read()
    if not conversation:
        return

    # Extract lines with decision language
    decisions = []
    for line in conversation.splitlines():
        if DECISION_PATTERNS.search(line):
            decisions.append(line.strip())

    # Extract TODO/action items
    actions = []
    for line in conversation.splitlines():
        if re.search(r"(TODO|FIXME|action item|next step)", line, re.IGNORECASE):
            actions.append(line.strip())

    if not decisions and not actions:
        return

    summary_parts = []
    if decisions:
        summary_parts.append("Decisions:\n" + "\n".join(f"- {d}" for d in decisions[:10]))
    if actions:
        summary_parts.append("Action items:\n" + "\n".join(f"- {a}" for a in actions[:5]))
    summary = "\n\n".join(summary_parts)

    from engine.rag_engine import ingest_text

    metadata = {
        "source_type": "compaction_capture",
        "status": "draft",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    ingest_text(summary, metadata, project_path)
    count = len(decisions) + len(actions)
    print(f"[RAG] Captured {count} decisions/actions before compaction")

if __name__ == "__main__":
    try:
        main()
    except Exception:
        pass

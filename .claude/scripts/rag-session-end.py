#!/usr/bin/env python3
"""RAG Stop hook — extract facts from session, sync to meta-RAG."""

import os
import sys
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

def main():
    project_path = os.getcwd()
    rag_dir = Path(project_path) / ".rag"
    if not rag_dir.exists():
        return

    forge_home = os.environ.get("FORGE_HOME")
    if not forge_home:
        return
    _setup_forge(forge_home)

    # Read session text from stdin or session-context
    session_text = ""
    if not sys.stdin.isatty():
        session_text = sys.stdin.read()
    if not session_text:
        ctx_file = Path(project_path) / ".claude" / "session-context.md"
        if ctx_file.exists():
            session_text = ctx_file.read_text()
    if not session_text:
        return

    from engine.quality_gates import is_meaningful_session, extract_facts
    from engine.rag_engine import ingest_text, sync_to_meta

    if not is_meaningful_session(session_text):
        return

    facts = extract_facts(session_text)
    if not facts:
        return

    # Ingest each fact
    counts = {"confirmed": 0, "draft": 0, "action_item": 0}
    for fact in facts:
        status = fact.get("status", "confirmed")
        counts[status] = counts.get(status, 0) + 1
        metadata = {
            "source_type": "session_extraction",
            "status": status,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        ingest_text(fact["fact"], metadata, project_path)

    # Lazy sync to meta-RAG
    synced = False
    if counts.get("confirmed", 0) > 0:
        meta_path = str(Path(forge_home) / "rag" / "meta")
        try:
            sync_to_meta(project_path, meta_path)
            synced = True
        except Exception:
            pass

    # Append to session log
    log_file = rag_dir / "session-log.md"
    now = datetime.now(timezone.utc).isoformat()
    total = sum(counts.values())
    entry = (
        f"\n## Session {now}\n"
        f"- Facts extracted: {total}\n"
        f"- Confirmed: {counts.get('confirmed', 0)}, "
        f"Draft: {counts.get('draft', 0)}, "
        f"Action items: {counts.get('action_item', 0)}\n"
        f"- Meta-RAG synced: {'yes' if synced else 'no'}\n"
    )
    with open(log_file, "a") as f:
        f.write(entry)

    print(f"[RAG] Session captured: {total} facts")

if __name__ == "__main__":
    try:
        main()
    except Exception:
        pass

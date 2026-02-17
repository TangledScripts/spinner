#!/usr/bin/env python3
"""RAG SessionStart hook — inject prior knowledge into session context."""

import os
import sys
from pathlib import Path

def _setup_forge():
    """Detect FORGE_HOME and add venv site-packages + engine to sys.path."""
    forge_home = os.environ.get("FORGE_HOME")
    if not forge_home:
        config = Path.home() / ".forge-device.yaml"
        if config.exists():
            for line in config.read_text().splitlines():
                if line.startswith("forge_home:"):
                    forge_home = line.split(":", 1)[1].strip()
    if forge_home:
        venv_lib = Path(forge_home) / "rag" / ".venv" / "lib"
        if venv_lib.exists():
            for d in venv_lib.iterdir():
                sp = d / "site-packages"
                if sp.exists():
                    sys.path.insert(0, str(sp))
        sys.path.insert(0, str(Path(forge_home) / "rag"))
    return forge_home

def main():
    forge_home = _setup_forge()
    if not forge_home:
        return

    project_path = os.getcwd()
    rag_dir = Path(project_path) / ".rag"
    if not rag_dir.exists():
        return

    from engine.rag_engine import query

    # Fast path: skip meta-RAG if recently queried
    last_query = rag_dir / ".last-query"
    import time
    skip_meta = False
    if last_query.exists():
        age = time.time() - last_query.stat().st_mtime
        if age < 300:  # 5 minutes
            skip_meta = True

    # Query project RAG
    results = query("recent decisions and patterns", project_path, top_k=3)
    if results:
        print("[RAG Context]")
        print("Project knowledge:")
        for r in results:
            print(f"  - {r['text'][:150]}")

    # Query meta-RAG
    if not skip_meta:
        meta_path = str(Path(forge_home) / "rag" / "meta")
        if Path(meta_path).exists() and (Path(meta_path) / ".lance").exists():
            meta_results = query("patterns and best practices", meta_path, top_k=2)
            if meta_results:
                print("Cross-project patterns:")
                for r in meta_results:
                    print(f"  - {r['text'][:150]}")

    # Update last-query timestamp
    last_query.touch()

if __name__ == "__main__":
    try:
        main()
    except Exception:
        pass  # Never crash — exit cleanly

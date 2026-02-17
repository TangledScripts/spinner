#!/usr/bin/env python3
"""RAG PostToolUse hook — background-ingest edited files into project RAG."""

import os
import sys
import json
import subprocess
from pathlib import Path

SKIP_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif", ".pdf", ".zip", ".tar",
                   ".gz", ".lock", ".lance", ".bin", ".exe", ".so", ".dylib"}

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
    if "--background" in sys.argv:
        # Background worker: do the actual ingestion
        file_path = sys.argv[sys.argv.index("--background") + 1]
        project_path = sys.argv[sys.argv.index("--background") + 2]
        forge_home = sys.argv[sys.argv.index("--background") + 3]
        _setup_forge(forge_home)
        from engine.rag_engine import ingest_file
        ingest_file(file_path, project_path)
        return

    # Foreground: parse hook input and fork to background
    tool_input = os.environ.get("TOOL_INPUT", "{}")
    try:
        data = json.loads(tool_input)
        file_path = data.get("file_path", "")
    except (json.JSONDecodeError, TypeError):
        return

    if not file_path:
        return

    project_path = os.getcwd()
    rag_dir = Path(project_path) / ".rag"
    if not rag_dir.exists():
        return

    # Skip binary/non-text files
    if Path(file_path).suffix.lower() in SKIP_EXTENSIONS:
        return

    forge_home = os.environ.get("FORGE_HOME", "")
    if not forge_home:
        return

    # Fork to background
    subprocess.Popen(
        [sys.executable, __file__, "--background", file_path, project_path, forge_home],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        start_new_session=True
    )

if __name__ == "__main__":
    try:
        main()
    except Exception:
        pass

#!/usr/bin/env python3
"""Check relative markdown/yml links under documentation/ resolve to real files."""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOC = ROOT / "documentation"
LINK_RE = re.compile(r"\]\(([^)#]+(?:\.md|\.lzx|\.yml)[^)]*)\)")


def main() -> int:
    broken: list[tuple[str, str]] = []
    for path in DOC.rglob("*"):
        if path.suffix not in {".md", ".yml"}:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except OSError:
            continue
        for match in LINK_RE.finditer(text):
            target = match.group(1).split("#")[0]
            if target.startswith(("http://", "https://", "mailto:")):
                continue
            resolved = (path.parent / target).resolve()
            if not resolved.exists():
                broken.append((str(path.relative_to(DOC)), target))

    if not broken:
        print(f"OK: all relative doc links resolve under {DOC}")
        return 0

    print(f"BROKEN: {len(broken)} link(s)")
    for src, tgt in sorted(set(broken)):
        print(f"  {src} -> {tgt}")
    return 1


if __name__ == "__main__":
    sys.exit(main())

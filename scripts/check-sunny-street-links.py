#!/usr/bin/env python3
"""Verify GitHub links in documentation/designs/sunny-street-outreach-links.md."""

from __future__ import annotations

import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

DOC = Path(__file__).resolve().parents[1] / "documentation/designs/sunny-street-outreach-links.md"
BLOB_RE = re.compile(
    r"https://github\.com/SimHacker/(MicropolisCore|moollm)/blob/main/([^\s\)#]+)(?:#([^\s\)]+))?"
)
TREE_RE = re.compile(
    r"https://github\.com/SimHacker/(MicropolisCore|moollm)/tree/main/([^\s\)#]+)"
)
EXTERNAL_RE = re.compile(r"https://(?!github\.com)[^\s\)]+")


def fetch(url: str, method: str = "GET") -> tuple[int, str]:
    req = urllib.request.Request(
        url,
        method=method,
        headers={"User-Agent": "MicropolisCore-link-check/1.0"},
    )
    try:
        with urllib.request.urlopen(req, timeout=25) as resp:
            if method == "GET":
                resp.read(512)
            return resp.status, ""
    except urllib.error.HTTPError as e:
        return e.code, str(e.reason)
    except Exception as e:
        return 0, str(e)


def main() -> int:
    text = DOC.read_text()
    errors: list[str] = []

    for repo, path, _anchor in sorted(set(BLOB_RE.findall(text))):
        raw = f"https://raw.githubusercontent.com/SimHacker/{repo}/main/{path}"
        code, err = fetch(raw)
        if code != 200:
            errors.append(f"BLOB  {repo}/{path}  HTTP {code} {err}")

    for repo, path in sorted(set(TREE_RE.findall(text))):
        api = f"https://api.github.com/repos/SimHacker/{repo}/contents/{path}?ref=main"
        code, err = fetch(api)
        if code != 200:
            errors.append(f"TREE  {repo}/{path}  HTTP {code} {err}")

    for url in sorted(set(EXTERNAL_RE.findall(text))):
        code, err = fetch(url, method="HEAD")
        if code not in (200, 301, 302, 303, 307, 308, 405):
            # Medium often 403 on HEAD; retry GET
            if "medium.com" in url:
                code, err = fetch(url, method="GET")
            if code not in (200, 301, 302, 303, 307, 308):
                errors.append(f"EXT   {url[:70]}…  HTTP {code} {err}")

    if errors:
        print(f"FAIL: {len(errors)} broken link(s) in {DOC.name}\n")
        for e in errors:
            print(f"  {e}")
        return 1

    n_blob = len(set(BLOB_RE.findall(text)))
    n_tree = len(set(TREE_RE.findall(text)))
    print(f"OK: {n_blob} blob + {n_tree} tree + externals in {DOC.name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

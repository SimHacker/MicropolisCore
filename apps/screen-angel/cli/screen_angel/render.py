"""Human-readable output. The only module here that formats anything.

Kept separate from client.py so that a script importing the client never drags in
opinions about terminal width, and so that changing how a table looks cannot change
what a query returns.

Everything degrades rather than fails: an element missing a name renders as blank, not
as a traceback. A formatter that can crash on unexpected data is a formatter that turns
a working query into a broken tool.
"""

from __future__ import annotations

import shutil
from typing import Any, Iterable, Sequence

INDENT = "  "


# WIDTH


def terminal_width(default: int = 100) -> int:
    try:
        return shutil.get_terminal_size((default, 24)).columns
    except OSError:
        return default


def clip(text: str, width: int) -> str:
    """Single line, at most width columns, with an ellipsis when cut."""
    flat = " ".join(str(text).split())
    if width <= 1 or len(flat) <= width:
        return flat
    return flat[: width - 1] + "…"


# TABLES


def table(headers: Sequence[str], rows: Sequence[Sequence[Any]], width: int | None = None) -> str:
    """A plain aligned table. No box drawing, because it gets pasted into things."""
    if not rows:
        return "(none)"

    limit = width or terminal_width()
    cells = [[str(value) if value is not None else "" for value in row] for row in rows]

    widths = [len(header) for header in headers]
    for row in cells:
        for index, value in enumerate(row[: len(widths)]):
            widths[index] = max(widths[index], len(" ".join(value.split())))

    # Squeeze the widest column first, repeatedly, until the whole row fits. Shrinking
    # every column equally would make the narrow ones useless to save the wide one.
    while sum(widths) + 2 * (len(widths) - 1) > limit and max(widths) > 6:
        widest = widths.index(max(widths))
        widths[widest] -= 1

    lines = ["  ".join(header.upper().ljust(w) for header, w in zip(headers, widths)).rstrip()]
    for row in cells:
        lines.append(
            "  ".join(clip(value, w).ljust(w) for value, w in zip(row, widths)).rstrip()
        )
    return "\n".join(lines)


# ELEMENTS


def element_row(element: dict[str, Any]) -> list[Any]:
    bounds = element.get("bounds") or {}
    geometry = (
        f"{bounds.get('x', '?')},{bounds.get('y', '?')} "
        f"{bounds.get('width', '?')}×{bounds.get('height', '?')}"
    )
    flags = "".join(
        [
            "f" if element.get("focused") else "",
            "" if element.get("enabled", True) else "d",
        ]
    )
    return [
        ".".join(str(step) for step in element.get("path", [])),
        element.get("role", ""),
        element.get("name", ""),
        element.get("value", ""),
        geometry,
        flags,
    ]


def elements(result: dict[str, Any], limit: int = 200) -> str:
    """A query result as a table plus the line that says what it cost."""
    found = result.get("elements") or []
    shown = found[:limit]

    body = table(
        ["path", "role", "name", "value", "bounds", ""],
        [element_row(element) for element in shown],
    )

    parts = [f"{len(found)} matched"]
    if len(found) > len(shown):
        parts.append(f"showing {len(shown)}")
    if result.get("visited") is not None:
        parts.append(f"{result['visited']} visited")
    if result.get("durationMs") is not None:
        parts.append(f"{float(result['durationMs']):.0f}ms")
    if result.get("truncated"):
        # Worth saying loudly. Silence here reads as "the app has no more widgets",
        # which is a different and wrong conclusion.
        parts.append("TRUNCATED — budget ran out, raise --nodes or narrow the selector")

    return f"{body}\n\n{' · '.join(parts)}"


def tree(result: dict[str, Any]) -> str:
    """The same elements, indented by path depth, for reading structure rather than rows."""
    lines = []
    for element in result.get("elements") or []:
        depth = max(len(element.get("path", [])) - 1, 0)
        name = element.get("name") or ""
        value = element.get("value") or ""
        label = f" {name!r}" if name else ""
        extra = f" = {clip(value, 40)!r}" if value else ""
        lines.append(f"{INDENT * depth}{element.get('role', '?')}{label}{extra}")

    if not lines:
        return "(empty tree — check `angel info` for permissions)"

    footer = f"{len(lines)} nodes"
    if result.get("truncated"):
        footer += " · TRUNCATED"
    return "\n".join(lines) + f"\n\n{footer}"


# WINDOWS


def windows(entries: Iterable[dict[str, Any]]) -> str:
    rows = []
    for entry in entries:
        bounds = entry.get("bounds") or {}
        rows.append(
            [
                entry.get("pid", ""),
                entry.get("app", ""),
                entry.get("title", ""),
                f"{bounds.get('width', '?')}×{bounds.get('height', '?')}",
            ]
        )
    return table(["pid", "app", "title", "size"], rows)


# CAPTURE


def capture(result: dict[str, Any]) -> str:
    """The path first, because that is what the next command needs.

    A person who just took a screenshot is about to open it, drag it somewhere, or pipe
    it into something. Everything else here is provenance, and provenance goes second.
    """
    size = f"{result.get('width', '?')}×{result.get('height', '?')}"
    scale = result.get("scaleFactor")
    if scale and scale != 1:
        size += f" @{scale}x"

    lines = [result.get("path") or f"(cached as {result.get('id')})"]
    lines.append(
        f"{size}  {result.get('format', '?')}  {kilobytes(result.get('byteLength', 0))}"
    )

    reason = result.get("formatReason")
    if reason:
        lines.append(reason)

    if not result.get("path"):
        # Without a path the only way to the bytes is image.fetch, and the id is the
        # whole handle. Saying so beats letting them discover it from a KeyError.
        lines.append("no file: fetch the bytes by id, or grab again with a directory")

    return "\n".join(lines)


def kilobytes(count: int) -> str:
    if count < 1024:
        return f"{count} B"
    if count < 1024 * 1024:
        return f"{count / 1024:.0f} kB"
    return f"{count / (1024 * 1024):.1f} MB"


# INFO


def info(payload: dict[str, Any]) -> str:
    backend = payload.get("backend") or {}
    permissions = payload.get("permissions") or {}
    steam = payload.get("steam") or {}

    lines = [
        f"screen-angel {payload.get('appVersion', '?')} "
        f"(electron {payload.get('electronVersion', '?')}, "
        f"protocol {payload.get('protocolVersion', '?')})",
        f"backend      {backend.get('name') or payload.get('unsupportedReason') or 'none'}",
    ]

    if permissions:
        granted = [name for name, state in permissions.items() if state == "granted"]
        missing = [name for name, state in permissions.items() if state != "granted"]
        lines.append(f"granted      {', '.join(granted) or 'nothing'}")
        if missing:
            # The failure this prevents: every query returning empty and looking like a
            # bug in the selector rather than a missing checkbox in System Settings.
            lines.append(f"MISSING      {', '.join(missing)} — queries will return nothing")

    capabilities = backend.get("can") or {}
    if capabilities:
        able = [name for name, ok in capabilities.items() if ok]
        lines.append(f"can          {', '.join(able) or 'nothing'}")

    if steam.get("available"):
        who = steam.get("personaName") or steam.get("steamId") or "signed in"
        launched = "launched by Steam" if steam.get("launchedBySteam") else "launched directly"
        lines.append(f"steam        {who} · app {steam.get('appId', '?')} · {launched}")
    else:
        lines.append(f"steam        unavailable — {steam.get('reason', 'no reason given')}")

    for module in payload.get("modules") or []:
        lines.append(f"module       {module.get('id')} ({module.get('name')})")
        for bridge in module.get("bridges") or []:
            active = " ← attached" if bridge.get("id") == payload.get("activeBridgeId") else ""
            lines.append(f"  bridge     {bridge.get('id')} → {bridge.get('target')}{active}")

    return "\n".join(lines)

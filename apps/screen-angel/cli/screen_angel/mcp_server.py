"""MCP stdio server. The same client, with a different mouth.

Every tool below is a call into client.py. There is no capability here that the CLI
does not also have, which is the property worth preserving: one implementation, three
front ends, and no surface that exists only for the agent.

Read-only by default. The three tools that change the user's screen are registered only
when SCREEN_ANGEL_MCP_ACT is set, because an MCP server is configured once in a JSON
file and then forgotten, and the thing that gets forgotten should be the safe one.

Requires the mcp package. Everything else in this package is standard library only.
"""

from __future__ import annotations

import json
import os
import sys
from typing import Any

from .client import Angel, open_angel
from .protocol import AngelError, NotRunning

TOOL_PREFIX = "screen_angel"

MAX_ELEMENTS = 60
"""Tree results are trimmed before they reach a model. A 4000-node dump is both
unusable and expensive; a caller that needs more should narrow the selector, which is
the skill the selector language exists to reward."""


def _summarize(result: dict[str, Any], limit: int = MAX_ELEMENTS) -> dict[str, Any]:
    """Trim a query result to something worth spending context on.

    Drops nativeRole and keeps path, because path is what a follow-up call needs and
    nativeRole is only interesting when debugging the normalizer.
    """
    elements = result.get("elements") or []
    trimmed = []

    for element in elements[:limit]:
        entry: dict[str, Any] = {
            "path": element.get("path"),
            "role": element.get("role"),
        }
        for key in ("name", "value"):
            if element.get(key):
                entry[key] = element[key]
        if element.get("focused"):
            entry["focused"] = True
        if element.get("enabled") is False:
            entry["enabled"] = False
        if element.get("bounds"):
            bounds = element["bounds"]
            entry["bounds"] = [
                bounds.get("x"),
                bounds.get("y"),
                bounds.get("width"),
                bounds.get("height"),
            ]
        trimmed.append(entry)

    summary: dict[str, Any] = {"matched": len(elements), "elements": trimmed}
    if len(elements) > len(trimmed):
        summary["note"] = f"showing {len(trimmed)} of {len(elements)}; narrow the selector"
    if result.get("truncated"):
        summary["truncated"] = "walk budget ran out; this is not the whole tree"
    return summary


def _sdk() -> tuple[Any, Any]:
    """The server class and the image type, from whichever SDK generation is installed.

    Version 2 renamed FastMCP to MCPServer and moved it to another module. The
    constructor arguments and the tool decorator we use did not change, so supporting
    both is an import and nothing more — worth doing, because the two versions will be
    installed side by side in the wild for a long time and the failure mode otherwise
    is an ImportError that reads like the package is missing.
    """
    try:
        from mcp.server.mcpserver import Image, MCPServer

        return MCPServer, Image
    except ImportError:
        from mcp.server.fastmcp import FastMCP, Image

        return FastMCP, Image


def _inline_image(call: Any, descriptor: dict[str, Any]) -> Any:
    """The bytes, as MCP image content.

    Read from the path when there is one, and ask the app to base64 them when there is
    not. The path is not an optimization here, it is the difference between one copy of
    the image and three: base64 over a socket, decoded, then re-encoded into the MCP
    reply. Same machine either way — stdio says so.
    """
    _, Image = _sdk()

    image_format = descriptor.get("format") or "png"
    path = descriptor.get("path")

    if path:
        try:
            with open(path, "rb") as handle:
                return Image(data=handle.read(), format=image_format)
        except OSError:
            # Reaped between the grab and the read, or written somewhere unreadable.
            # Falling through to the socket is cheaper than failing the whole tool call.
            pass

    fetched = call("fetch_image", descriptor["id"])
    if isinstance(fetched, dict) and "data" in fetched:
        import base64

        return Image(data=base64.b64decode(fetched["data"]), format=image_format)
    return None


def build_server(socket: str | None = None) -> Any:
    Server, _ = _sdk()

    server = Server(
        "screen-angel",
        instructions=(
            "Read and act on the user's live desktop through its accessibility tree. "
            "Call screen_angel_info first: if accessibility permission is missing, every "
            "query returns empty rather than failing, which looks like a broken selector. "
            "Selectors are a CSS subset: descendant by space, > for child, comma for "
            "union, [name=X] [name*=X] [name^=X] [name$=X] predicates, and :focused "
            ":enabled :disabled. Prefer a union when you want to know what is actionable: "
            "'button, checkbox, combobox, textfield' comes back deduplicated in walk order. "
            "There are no sibling combinators and no :nth-child, because sibling order is "
            "not stable between releases of the application you are pointing at. "
            "Queries only see the FOCUSED application."
        ),
    )

    def call(method: str, *args: Any, **kwargs: Any) -> Any:
        """One short-lived connection per tool call.

        A long-lived connection would be faster and would also mean an idle agent holds
        a socket to the user's screen open indefinitely. Connect, ask, hang up.
        """
        try:
            with open_angel(socket) as angel:
                return getattr(angel, method)(*args, **kwargs)
        except NotRunning:
            return {"error": "Screen Angel is not running. Ask the user to launch it."}
        except AngelError as error:
            return {"error": str(error)}

    # OBSERVING

    @server.tool(name=f"{TOOL_PREFIX}_info")
    def info() -> dict[str, Any]:
        """What Screen Angel can currently see. Call this before anything else.

        Reports the platform backend, which permissions are granted, which modules are
        loaded, and whether a game bridge is attached.
        """
        payload = call("info")
        if "error" in payload:
            return payload
        return {
            "backend": (payload.get("backend") or {}).get("name") or payload.get("unsupportedReason"),
            "permissions": payload.get("permissions"),
            "canQuery": bool((payload.get("backend") or {}).get("can", {}).get("queryTree")),
            "modules": [module.get("id") for module in payload.get("modules") or []],
            "activeBridge": payload.get("activeBridgeId"),
        }

    @server.tool(name=f"{TOOL_PREFIX}_windows")
    def windows() -> Any:
        """Every on-screen window: pid, application name, title, size.

        Use this to find out what the user has open. Only the focused window's contents
        can be read; ask the user to switch if you need a different one.
        """
        entries = call("windows")
        if isinstance(entries, dict):
            return entries
        return [
            {
                "pid": entry.get("pid"),
                "app": entry.get("app"),
                "title": entry.get("title"),
            }
            for entry in entries
        ]

    @server.tool(name=f"{TOOL_PREFIX}_query")
    def query(
        selector: str, max_nodes: int | None = None, pid: int | None = None
    ) -> dict[str, Any]:
        """Find widgets in an application by selector.

        Examples: 'button', 'button[name=Save]', 'window > toolbar button',
        'textfield:focused', 'menuitem[name*=Export]'.

        Without pid this walks whatever is frontmost. Pass pid, from the windows tool, to
        walk a specific application regardless of what the user has focused — which is
        also what makes results reproducible, since focus moves between your calls.

        Returns each match with its path, role, name, value and bounds. The path is the
        handle other tools take; it is valid until the tree changes, and is not an id to
        store.
        """
        result = call("select", selector, max_nodes=max_nodes, pid=pid)
        return result if "error" in result else _summarize(result)

    @server.tool(name=f"{TOOL_PREFIX}_tree")
    def tree(
        max_depth: int | None = None, max_nodes: int | None = None, pid: int | None = None
    ) -> dict[str, Any]:
        """Dump an application's accessibility tree, up to a budget.

        Start here when the application is unfamiliar and you do not yet know what
        selectors would match. Prefer a query once you do: this is the expensive call.

        Without pid this walks whatever is frontmost. Pass pid to pin the target.

        A browser or Electron application queried for the first time may return a thin
        tree, because Chromium builds its accessibility tree lazily once something asks.
        Asking is what this call does, so a second call usually returns the real thing.
        """
        result = call("tree", max_depth=max_depth, max_nodes=max_nodes, pid=pid)
        return result if "error" in result else _summarize(result)

    @server.tool(name=f"{TOOL_PREFIX}_element_at")
    def element_at(x: int, y: int) -> Any:
        """The widget at a screen coordinate. Cheap; does not walk the tree."""
        return call("at", x, y)

    @server.tool(name=f"{TOOL_PREFIX}_screenshot")
    def screenshot(
        selector: str | None = None,
        window: int | None = None,
        whole_screen: bool = False,
        region: str | None = None,
        size: int | None = None,
        pid: int | None = None,
        inline: bool = True,
    ) -> Any:
        """Look at the screen, or at one widget on it.

        Name one target. A selector captures the first widget it matches, with a little
        context around it; window takes an id from the windows tool; whole_screen takes
        the display the pointer is on.

        Use this together with the query tool rather than instead of it. The tree tells
        you what a widget IS and where; the picture tells you what it LOOKS like, which
        is the part no accessibility API reports — whether something is greyed out in a
        way the API did not mark, what an icon depicts, what the user actually sees.

        region narrows without measuring: top-left, center, bottom-right, title-bar,
        top-third and so on, resolved against the target when the picture is taken.

        Set inline=False to get the file path and dimensions without spending context on
        the image itself, which is worth doing when you only need to know whether
        something changed.
        """
        named = sum(1 for value in (selector, window, whole_screen) if value)
        if named != 1:
            return {"error": "Name exactly one of: selector, window, whole_screen."}

        target: dict[str, Any] = {}
        if selector is not None:
            target["selector"] = selector
        elif window is not None:
            target["window"] = window
        else:
            target["screen"] = "focused"

        result = call("grab", region=region, size=size, pid=pid, **target)
        if "error" in result:
            return result

        summary = {
            "id": result.get("id"),
            "pixels": [result.get("width"), result.get("height")],
            "format": result.get("format"),
            # Same machine, because stdio means this server runs beside the app. So the
            # path is worth handing over: a client that can read files can come back to
            # this image later without paying for the pixels twice.
            "path": result.get("path"),
            "expiresAt": result.get("expiresAt"),
        }
        if not inline:
            return summary

        image = _inline_image(call, result)
        return [image, json.dumps(summary)] if image is not None else summary

    # ACTING

    if os.environ.get("SCREEN_ANGEL_MCP_ACT"):

        @server.tool(name=f"{TOOL_PREFIX}_highlight")
        def highlight(selector: str) -> dict[str, Any]:
            """Outline everything matching a selector on the user's screen.

            Use this to show your work. A selector that returns four elements is a
            number; four boxes drawn around the wrong widgets is a mistake the user can
            see immediately.
            """
            result = call("show", selector)
            return result if "error" in result else _summarize(result)

        @server.tool(name=f"{TOOL_PREFIX}_clear_highlights")
        def clear_highlights() -> str:
            """Remove all outlines."""
            call("highlight", [])
            return "cleared"

        @server.tool(name=f"{TOOL_PREFIX}_say")
        def say(text: str, ttl_ms: int = 6000) -> str:
            """Show one line of text on the overlay, above whatever the user is doing.

            Plain text that expires. It cannot be styled to look like the
            application's own interface, and it has no buttons.
            """
            call("say", text, ttl_ms=ttl_ms)
            return "shown"

    return server


def main(socket: str | None = None) -> int:
    try:
        server = build_server(socket)
    except ImportError:
        print(
            "The MCP server needs the mcp package:\n"
            "  pip install mcp\n"
            "The CLI itself has no dependencies; only this needs one.",
            file=sys.stderr,
        )
        return 1

    server.run()
    return 0


if __name__ == "__main__":
    sys.exit(main(os.environ.get("SCREEN_ANGEL_SOCKET")))

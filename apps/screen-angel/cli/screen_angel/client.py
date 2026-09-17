"""The Screen Angel client. One method per protocol verb, plus a few compositions.

This is the module worth importing. The CLI is a wrapper around it, the MCP server is a
wrapper around it, and a script someone writes to check whether a dialog appeared is a
wrapper around it. Nothing here prints, parses arguments, or knows what a terminal is.

Results come back as plain dicts rather than dataclasses on purpose. When the
TypeScript side grows a field, a dict forwards it and a dataclass drops it, and a
client that silently discards the new information is worse than one that passes it
through unread. The TypedDicts below are for editors; they do not constrain runtime.
"""

from __future__ import annotations

from contextlib import contextmanager
from typing import Any, Iterator, Sequence, TypedDict

from .protocol import Connection, Event, connect

# SHAPES


class Rect(TypedDict, total=False):
    x: int
    y: int
    width: int
    height: int


class Element(TypedDict, total=False):
    role: str
    nativeRole: str
    name: str
    value: str
    bounds: Rect
    focused: bool
    enabled: bool
    childCount: int
    path: list[int]


class Window(TypedDict, total=False):
    pid: int
    app: str
    title: str
    bounds: Rect


class QueryResult(TypedDict, total=False):
    elements: list[Element]
    visited: int
    truncated: bool
    durationMs: float
    selector: str


# CLIENT


class Angel:
    """A connection to a running Screen Angel.

    Deliberately thin: every method is a named request with the arguments spelled out,
    so that reading this class tells you the entire surface. The methods that only
    observe are grouped first, and the four that change what is on screen are grouped
    last and marked.
    """

    def __init__(self, connection: Connection) -> None:
        self._connection = connection

    # Observing.

    def info(self) -> dict[str, Any]:
        """Version, backend, permissions, loaded modules, active bridge, Steam status.

        Worth calling first from an agent: it answers "can I see anything at all", and
        the permissions field is the difference between an empty tree and a refusal.
        """
        return self._connection.request("angel.info")

    def permissions(self) -> dict[str, Any] | None:
        return self._connection.request("angel.permissions")

    def select(
        self,
        selector: str,
        max_depth: int | None = None,
        max_nodes: int | None = None,
        pid: int | None = None,
    ) -> QueryResult:
        """Match a selector against an application's accessibility tree.

        Without a pid this walks whatever is frontmost, which is rarely what you want
        while testing: focusing a terminal to run the command makes the terminal the
        target. Pass pid to pin it.

        The selector language is a deliberate subset of CSS: whitespace for descendant,
        `>` for child, `,` for union, `[attr=value]` predicates, `:focused` and friends.
        There are no sibling combinators and no :nth-child, because sibling order is not
        stable between releases of the target application and a selector that depends on
        it is a selector that breaks on update day.

        Reach for a union when the question is "what can I act on": one walk, several
        branches, results deduplicated and in walk order.
        """
        return self._connection.request(
            "query.select",
            {"selector": selector, "options": _options(max_depth, max_nodes, pid)},
        )

    def tree(
        self,
        max_depth: int | None = None,
        max_nodes: int | None = None,
        pid: int | None = None,
    ) -> QueryResult:
        """Everything, up to the budget. The starting point when the app is unfamiliar.

        Walks are budgeted because every attribute read is a synchronous round trip to
        another process. An unbounded walk of a browser window takes seconds and can
        make the target application appear to hang.
        """
        return self._connection.request(
            "query.tree", {"options": _options(max_depth, max_nodes, pid)}
        )

    def pid_for_app(self, name: str) -> int:
        """Resolve an application name to a pid, for --app.

        Matched case-insensitively against the window list, substring first so that
        "cursor" finds "Cursor" and "code" finds "Visual Studio Code". An ambiguous name
        is an error rather than a guess: picking one of several matching applications
        silently is how you end up inspecting the wrong window for ten minutes.
        """
        windows = self.windows()
        lowered = name.casefold()

        exact = {w["pid"] for w in windows if w.get("app", "").casefold() == lowered}
        partial = {w["pid"] for w in windows if lowered in w.get("app", "").casefold()}
        matches = exact or partial

        if not matches:
            seen = sorted({w.get("app", "") for w in windows})
            raise LookupError(f"no application matching {name!r}. Running: {', '.join(seen)}")
        if len(matches) > 1:
            named = sorted(
                {w.get("app", "") for w in windows if w["pid"] in matches}
            )
            raise LookupError(f"{name!r} matches more than one application: {', '.join(named)}")
        return matches.pop()

    def at(self, x: int, y: int) -> Element | None:
        """The element under a screen coordinate. Cheap; does not walk the tree."""
        return self._connection.request("query.at", {"x": x, "y": y})

    def focused_window(self) -> Window | None:
        return self._connection.request("window.focused")

    def windows(self) -> list[Window]:
        return self._connection.request("window.list")

    def watch(self) -> Iterator[Event]:
        """Block, yielding focus changes and bridge attachments as they happen."""
        return self._connection.events()

    # Acting. Everything below changes what the user sees.

    def highlight(self, rects: Sequence[Rect]) -> dict[str, Any]:
        """Outline these screen rectangles on the overlay. Empty list clears."""
        return self._connection.request("overlay.highlight", {"rects": list(rects)})

    def say(self, text: str, ttl_ms: int = 6000) -> None:
        """Put one line of text on the overlay for a while.

        The narrowest possible channel: text and an expiry, no markup and no buttons.
        Anything that can draw arbitrary interface on top of every application on the
        machine is a phishing kit, so this cannot.
        """
        self._connection.request("overlay.say", {"text": text, "ttlMs": ttl_ms})

    def toggle_overlay(self) -> dict[str, Any]:
        return self._connection.request("overlay.toggle")

    def console_window(self, action: str = "show") -> dict[str, Any]:
        """Bring the console window up, or put it away.

        This exists because on a real desktop every other route to that window can be
        missing at the same time: an app that takes no focus at launch is absent from the
        Dock and from Cmd-Tab, an auto-hidden Dock shows nothing anyway, and a full menu
        bar silently drops a new status item. The socket has none of those dependencies.
        """
        if action not in ("show", "hide", "toggle"):
            raise ValueError(f"action must be show, hide or toggle, not {action!r}")
        return self._connection.request("window.console", {"action": action})

    # Capture. Reading, despite needing its own permission: it observes and changes
    # nothing. Screen Recording is a separate axis from the read/act split.

    def grab(
        self,
        *,
        element: Sequence[int] | None = None,
        selector: str | None = None,
        window: int | str | None = None,
        screen: int | str | None = None,
        rect: Rect | None = None,
        region: str | None = None,
        size: int | str | None = None,
        pad: int | str | None = None,
        image_format: str | None = None,
        quality: int | None = None,
        directory: str | None = None,
        pid: int | None = None,
        max_depth: int | None = None,
        max_nodes: int | None = None,
    ) -> dict[str, Any]:
        """One still frame. Returns a descriptor, never the bytes.

        Name exactly one target. Prefer the ones you already hold a handle for —
        a selector or an element path out of a query result — over a rectangle you
        computed yourself, because those are resolved against the tree at capture time
        and so cannot be stale.

        Passing `directory` transfers ownership of the file to you: it is written there
        and never reaped. Leave it out and the app deletes it on a timer and at exit.
        """
        targets = {
            "element": list(element) if element is not None else None,
            "selector": selector,
            "window": window,
            "screen": screen,
            "rect": rect,
        }
        named = {key: value for key, value in targets.items() if value is not None}
        if len(named) != 1:
            raise ValueError(
                f"Name exactly one of element, selector, window, screen, rect — got {len(named)}."
            )

        params: dict[str, Any] = {"target": named}
        for key, value in (
            ("region", region),
            ("size", size),
            ("pad", pad),
            ("format", image_format),
            ("quality", quality),
            ("dir", directory),
            ("pid", pid),
            ("maxDepth", max_depth),
            ("maxNodes", max_nodes),
        ):
            if value is not None:
                params[key] = value
        return self._connection.request("capture.grab", params)

    # Developer surface. A JavaScript console on our own windows, reachable without a
    # keyboard in front of the app.

    def devtools(self, window: str = "console", action: str = "toggle") -> dict[str, Any]:
        """Open, close or toggle DevTools on one of our windows.

        The overlay is worth naming explicitly: it is created unfocusable so it cannot
        steal keyboard from a game, which means no click and no menu accelerator ever
        reaches it. This is the only way in.
        """
        return self._connection.request(
            "dev.devtools", {"window": window, "action": action}
        )

    def eval_js(self, code: str, window: str = "console") -> Any:
        """Evaluate an expression in a window and return its value.

        The console toolkit is already installed there, so `$q('button')` and friends
        work: `angel.eval_js("await $show('button')")`.
        """
        return self._connection.request("dev.eval", {"code": code, "window": window})["value"]

    def fetch_image(self, image_id: str) -> dict[str, Any]:
        """The bytes, base64. Only for callers that cannot read a path."""
        return self._connection.request("image.fetch", {"id": image_id})

    def pin_image(self, image_id: str) -> dict[str, Any]:
        """Keep it until released. What handing out a reference to it implies."""
        return self._connection.request("image.pin", {"id": image_id})

    def release_image(self, image_id: str) -> None:
        self._connection.request("image.release", {"id": image_id})

    # Compositions. Sugar over the above, no new capability.

    def show(self, selector: str, **kwargs: Any) -> QueryResult:
        """Match a selector and outline what it found, in one call.

        The reason to reach for this instead of select(): it makes a claim visible on
        the real screen. A selector that returns four elements is a number, and a
        selector that lights up the wrong four widgets is a bug you can see.
        """
        result = self.select(selector, **kwargs)
        bounds = [element["bounds"] for element in result.get("elements", []) if "bounds" in element]
        self.highlight(bounds)
        return result

    def find_one(self, selector: str, **kwargs: Any) -> Element | None:
        """First match or None, for the common case of expecting exactly one thing."""
        elements = self.select(selector, **kwargs).get("elements", [])
        return elements[0] if elements else None


def _options(
    max_depth: int | None, max_nodes: int | None, pid: int | None = None
) -> dict[str, int]:
    """Omit rather than default. The app owns the defaults; two copies would drift."""
    options: dict[str, int] = {}
    if max_depth is not None:
        options["maxDepth"] = max_depth
    if max_nodes is not None:
        options["maxNodes"] = max_nodes
    if pid is not None:
        options["pid"] = pid
    return options


@contextmanager
def open_angel(path: str | None = None, timeout: float | None = None) -> Iterator[Angel]:
    """Connect, yield an Angel, and close. The normal way in."""
    from .protocol import DEFAULT_TIMEOUT

    transport = connect(path, timeout if timeout is not None else DEFAULT_TIMEOUT)
    connection = Connection(transport)
    try:
        yield Angel(connection)
    finally:
        connection.close()

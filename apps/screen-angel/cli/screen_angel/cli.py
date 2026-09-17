"""The command line wrapper. Argument parsing, output selection, exit codes.

Thin on purpose. Every command here is one call into client.py plus one call into
render.py, and if a command in this file ever grows a body worth reading, that body
belongs in client.py where a script can reach it too.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from typing import Any

from . import render
from .client import Angel, open_angel
from .protocol import AngelError, NotRunning, socket_path

EXIT_OK = 0
EXIT_ERROR = 1
EXIT_NOT_RUNNING = 3
"""Distinct from a failed request, because the fix is different: launch the app rather
than change the command. A script can branch on it."""


# COMMANDS


def cmd_info(angel: Angel, args: argparse.Namespace) -> int:
    payload = angel.info()
    emit(payload, args, lambda: render.info(payload))
    return EXIT_OK


def cmd_permissions(angel: Angel, args: argparse.Namespace) -> int:
    payload = angel.permissions()
    emit(payload, args, lambda: json.dumps(payload, indent=2))
    return EXIT_OK


def cmd_windows(angel: Angel, args: argparse.Namespace) -> int:
    entries = angel.windows()
    emit(entries, args, lambda: render.windows(entries))
    return EXIT_OK


def cmd_focused(angel: Angel, args: argparse.Namespace) -> int:
    window = angel.focused_window()
    if window is None:
        emit(None, args, lambda: "(nothing focused)")
        return EXIT_OK
    emit(window, args, lambda: render.windows([window]))
    return EXIT_OK


def resolve_target(angel: Angel, args: argparse.Namespace) -> int | None:
    """Which process a walk should start from: --pid, then --app, then $SCREEN_ANGEL_PID.

    None means the frontmost application, which is the documented default. The
    environment variable exists so a testing shell can pin a target once instead of
    repeating it on every command.
    """
    pid = getattr(args, "pid", None)
    if pid is not None:
        return int(pid)

    app = getattr(args, "app", None)
    if app is not None:
        return angel.pid_for_app(app)

    from_env = os.environ.get("SCREEN_ANGEL_PID")
    if from_env:
        return int(from_env)
    return None


def cmd_query(angel: Angel, args: argparse.Namespace) -> int:
    result = (angel.show if args.show else angel.select)(
        args.selector,
        max_depth=args.depth,
        max_nodes=args.nodes,
        pid=resolve_target(angel, args),
    )
    emit(result, args, lambda: render.elements(result, limit=args.limit))
    # An empty match is a legitimate answer, not an error. A script that wants to treat
    # it as one can test the count; a script that greps output should not have to.
    return EXIT_OK


def cmd_tree(angel: Angel, args: argparse.Namespace) -> int:
    result = angel.tree(
        max_depth=args.depth, max_nodes=args.nodes, pid=resolve_target(angel, args)
    )
    emit(result, args, lambda: render.tree(result))
    return EXIT_OK


def cmd_at(angel: Angel, args: argparse.Namespace) -> int:
    element = angel.at(args.x, args.y)
    if element is None:
        emit(None, args, lambda: f"(nothing at {args.x},{args.y})")
        return EXIT_OK
    emit(element, args, lambda: render.elements({"elements": [element]}))
    return EXIT_OK


def cmd_highlight(angel: Angel, args: argparse.Namespace) -> int:
    if args.clear:
        angel.highlight([])
        return EXIT_OK

    rects = []
    for spec in args.rects:
        try:
            x, y, width, height = (int(part) for part in spec.split(","))
        except ValueError:
            raise AngelError(f"rectangles are x,y,width,height — got {spec!r}") from None
        rects.append({"x": x, "y": y, "width": width, "height": height})

    angel.highlight(rects)
    print(f"{len(rects)} outlined")
    return EXIT_OK


def cmd_grab(angel: Angel, args: argparse.Namespace) -> int:
    """Capture, and by default put the file where the person running this can find it.

    The interactive default differs from the protocol default on purpose. A person at a
    terminal wants a file that is still there in ten minutes, and the app's own cache is
    reaped on a timer and emptied at exit. So unless --keep is refused with --cached,
    this names a directory, which under the ownership rule hands the lifetime over.
    """
    target: dict[str, Any] = {}
    if args.selector is not None:
        target["selector"] = args.selector
    elif args.window is not None:
        target["window"] = args.window if args.window == "focused" else int(args.window)
    elif args.screen is not None:
        target["screen"] = args.screen if args.screen == "focused" else int(args.screen)
    elif args.rect is not None:
        try:
            x, y, width, height = (int(part) for part in args.rect.split(","))
        except ValueError:
            raise AngelError(f"--rect is x,y,width,height — got {args.rect!r}") from None
        target["rect"] = {"x": x, "y": y, "width": width, "height": height}
    elif args.element is not None:
        try:
            target["element"] = [int(part) for part in args.element.split(",")]
        except ValueError:
            raise AngelError(f"--element is an index path like 0,1,4 — got {args.element!r}") from None
    else:
        raise AngelError("name a target: --selector, --element, --window, --screen or --rect")

    directory = None if args.cached else (args.dir or os.getcwd())

    result = angel.grab(
        region=args.region,
        size=numeric(args.size),
        pad=numeric(args.pad),
        image_format=args.format,
        quality=args.quality,
        directory=directory,
        pid=resolve_target(angel, args),
        max_depth=args.depth,
        max_nodes=args.nodes,
        **target,
    )

    emit(result, args, lambda: render.capture(result))
    return EXIT_OK


def numeric(value: str | None) -> int | str | None:
    """A number when it looks like one, the word otherwise.

    Options like --size and --pad take either a keyword or a measurement, and argparse
    has no type for that. The wire is typed even though the command line is not, so the
    conversion has to happen somewhere; here is the only place that knows it was typed
    by a person.
    """
    if value is None:
        return None
    try:
        return int(value)
    except ValueError:
        return value


def cmd_say(angel: Angel, args: argparse.Namespace) -> int:
    angel.say(args.text, ttl_ms=args.ttl)
    return EXIT_OK


def cmd_console(angel: Angel, args: argparse.Namespace) -> int:
    action = "hide" if args.hide else ("toggle" if args.toggle else "show")
    state = angel.console_window(action)
    print("visible" if state.get("visible") else "hidden")
    return EXIT_OK


def cmd_overlay(angel: Angel, args: argparse.Namespace) -> int:
    del args
    state = angel.toggle_overlay()
    print("visible" if state.get("visible") else "hidden")
    return EXIT_OK


def cmd_devtools(angel: Angel, args: argparse.Namespace) -> int:
    which = "overlay" if args.overlay else "console"
    action = "close" if args.close else ("open" if args.open else "toggle")
    state = angel.devtools(which, action)
    print(f"{which} devtools {'open' if state.get('open') else 'closed'}")
    return EXIT_OK


def cmd_eval(angel: Angel, args: argparse.Namespace) -> int:
    """Run JavaScript in a window, the same way you would type it into the console.

    Reads from stdin when no code is given, so a snippet in a file can be piped in
    without quoting it for the shell.
    """
    code = args.code if args.code is not None else sys.stdin.read()
    if not code.strip():
        raise AngelError("nothing to evaluate")

    value = angel.eval_js(code, "overlay" if args.overlay else "console")
    if args.json or not sys.stdout.isatty():
        print(json.dumps(value, indent=2 if args.json else None))
    elif isinstance(value, (dict, list)):
        print(json.dumps(value, indent=2))
    else:
        print(value)
    return EXIT_OK


def cmd_watch(angel: Angel, args: argparse.Namespace) -> int:
    for event in angel.watch():
        if args.json:
            print(json.dumps({"event": event.name, "payload": event.payload}), flush=True)
        else:
            print(f"{event.name}  {summarize(event.payload)}", flush=True)
    return EXIT_OK


def cmd_mcp(_angel: Angel | None, args: argparse.Namespace) -> int:
    """Hand off to the MCP server, which owns its own connection lifecycle."""
    from .mcp_server import main as mcp_main

    return mcp_main(socket=args.socket)


# OUTPUT


def emit(payload: Any, args: argparse.Namespace, human: Any) -> None:
    """JSON when asked, and when stdout is not a terminal.

    Piping implies a program is reading, and a program should not have to parse a table
    that was formatted for a person.
    """
    if args.json or not sys.stdout.isatty():
        print(json.dumps(payload, indent=2 if args.json else None))
    else:
        print(human())


def summarize(payload: Any) -> str:
    if isinstance(payload, dict):
        app = payload.get("app")
        title = payload.get("title")
        if app or title:
            return f"{app or '?'} — {render.clip(title or '', 60)}"
    return str(payload)


# PARSER


def build_parser() -> argparse.ArgumentParser:
    # The global flags live in a parent that every subparser also inherits, so that both
    # `angel --json windows` and `angel windows --json` work. People type the second one,
    # and a tool that rejects it is a tool that was written for its own parser.
    #
    # SUPPRESS is what makes it safe: without it, a subparser's default would overwrite
    # the value already parsed from before the subcommand.
    common = argparse.ArgumentParser(add_help=False)
    common.add_argument("--socket", default=argparse.SUPPRESS, help="control socket path")
    common.add_argument(
        "--timeout", type=float, default=argparse.SUPPRESS, help="seconds; default 30"
    )
    common.add_argument(
        "--json", action="store_true", default=argparse.SUPPRESS, help="machine-readable output"
    )

    parser = argparse.ArgumentParser(
        prog="screen-angel",
        parents=[common],
        description="Read and act on the desktop through Screen Angel.",
        epilog=f"socket: {socket_path()}",
    )

    sub = parser.add_subparsers(dest="command", required=True, parser_class=argparse.ArgumentParser)

    def add(name: str, help_text: str) -> argparse.ArgumentParser:
        return sub.add_parser(name, help=help_text, parents=[common])

    add("info", "version, backend, permissions, modules").set_defaults(run=cmd_info)
    add("permissions", "grant state").set_defaults(run=cmd_permissions)
    add("windows", "every on-screen window").set_defaults(run=cmd_windows)
    add("focused", "the window a query would walk").set_defaults(run=cmd_focused)

    # Which application to walk. Shared by every command that starts from a process,
    # because remembering which of them took --pid is not a thing anyone should have to do.
    def add_target(p: argparse.ArgumentParser) -> None:
        target = p.add_mutually_exclusive_group()
        target.add_argument("--pid", type=int, help="walk this process instead of the frontmost")
        target.add_argument("--app", help="walk this application by name; must match exactly one")

    query = add("query", "match a selector against an application")
    query.add_argument("selector")
    query.add_argument("--depth", type=int, help="max tree depth")
    query.add_argument("--nodes", type=int, help="max nodes visited")
    query.add_argument("--limit", type=int, default=200, help="rows to print")
    query.add_argument(
        "--show", action="store_true", help="also outline the matches on the overlay"
    )
    add_target(query)
    query.set_defaults(run=cmd_query)

    show = add("show", "query and outline what it found")
    show.add_argument("selector")
    show.add_argument("--depth", type=int)
    show.add_argument("--nodes", type=int)
    add_target(show)
    show.add_argument("--limit", type=int, default=200)
    show.set_defaults(run=cmd_query, show=True)

    tree = add("tree", "dump an application's tree up to budget")
    tree.add_argument("--depth", type=int)
    tree.add_argument("--nodes", type=int)
    add_target(tree)
    tree.set_defaults(run=cmd_tree)

    at = add("at", "the element under a screen coordinate")
    at.add_argument("x", type=int)
    at.add_argument("y", type=int)
    at.set_defaults(run=cmd_at)

    highlight = add("highlight", "outline screen rectangles")
    highlight.add_argument("rects", nargs="*", metavar="x,y,w,h")
    highlight.add_argument("--clear", action="store_true")
    highlight.set_defaults(run=cmd_highlight)

    grab = add("grab", "capture a still of an element, window, screen or rectangle")
    what = grab.add_mutually_exclusive_group()
    what.add_argument("--selector", help="capture the first match")
    what.add_argument("--element", metavar="PATH", help="index path, like 0,1,4")
    what.add_argument("--window", metavar="ID|focused", help="a window id from `windows`")
    what.add_argument("--screen", metavar="ID|focused", help="a whole display")
    what.add_argument("--rect", metavar="x,y,w,h", help="screen rectangle, in points")
    grab.add_argument("--region", help="part of the target: top-left, title-bar, center...")
    grab.add_argument("--size", default="fit", help="'fit' (1024px), 'full', or a pixel edge")
    grab.add_argument("--pad", help="tight, snug, loose, or points of context")
    grab.add_argument("--format", choices=["auto", "png", "jpeg"], help="default auto")
    grab.add_argument("--quality", type=int, help="JPEG only, 1-100")
    grab.add_argument("--dir", help="write here and own the file; defaults to the cwd")
    grab.add_argument(
        "--cached",
        action="store_true",
        help="leave it in the app's cache, which reaps it on a timer and at exit",
    )
    grab.add_argument("--depth", type=int, help="max tree depth while resolving a selector")
    grab.add_argument("--nodes", type=int, help="max nodes visited while resolving a selector")
    add_target(grab)
    grab.set_defaults(run=cmd_grab)

    devtools = add("devtools", "open a JavaScript console on our own windows")
    devtools.add_argument(
        "--overlay", action="store_true", help="the transparent layer, which cannot be clicked"
    )
    state = devtools.add_mutually_exclusive_group()
    state.add_argument("--open", action="store_true")
    state.add_argument("--close", action="store_true")
    devtools.set_defaults(run=cmd_devtools)

    evaluate = add("eval", "run JavaScript in a window; reads stdin if no code given")
    evaluate.add_argument("code", nargs="?")
    evaluate.add_argument("--overlay", action="store_true", help="evaluate in the overlay instead")
    evaluate.set_defaults(run=cmd_eval)

    say = add("say", "one line of text on the overlay")
    say.add_argument("text")
    say.add_argument("--ttl", type=int, default=6000, help="milliseconds")
    say.set_defaults(run=cmd_say)

    console = add("console", "bring the console window to the front")
    console.add_argument("--hide", action="store_true", help="put it away instead")
    console.add_argument("--toggle", action="store_true", help="show if hidden, hide if shown")
    console.set_defaults(run=cmd_console)

    add("overlay", "toggle the overlay").set_defaults(run=cmd_overlay)
    add("watch", "stream focus and bridge events").set_defaults(run=cmd_watch)
    add("mcp", "run the MCP stdio server").set_defaults(run=cmd_mcp)

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    # SUPPRESS means these are absent rather than None when unset. Filling them in once
    # here keeps every command from having to ask whether the attribute exists.
    for name, default in (("socket", None), ("timeout", None), ("json", False)):
        if not hasattr(args, name):
            setattr(args, name, default)

    if args.command == "mcp":
        return cmd_mcp(None, args)

    try:
        with open_angel(args.socket, args.timeout) as angel:
            return int(args.run(angel, args))
    except NotRunning as error:
        print(f"{error}\nIs Screen Angel running?", file=sys.stderr)
        return EXIT_NOT_RUNNING
    except AngelError as error:
        print(str(error), file=sys.stderr)
        return EXIT_ERROR
    except KeyboardInterrupt:
        return EXIT_OK
    except BrokenPipeError:
        # `angel tree | head` closes the pipe early. That is the user getting what they
        # asked for, not a failure to report.
        return EXIT_OK


if __name__ == "__main__":
    sys.exit(main())

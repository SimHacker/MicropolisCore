"""Transport for the Screen Angel control protocol.

Newline-delimited JSON over a Unix domain socket, or a named pipe on Windows. This
module knows how to move messages and nothing about what they mean.

Why Python for the client half when the app is TypeScript: a client is a script. It has
to run on a machine that installed Screen Angel from Steam, where there is no
node_modules, no pnpm, and no build step, and it has to be readable by someone
debugging at 2am. The whole protocol is json and a socket, both of which are in the
standard library, so this file has no dependencies at all.

The server half stays in the Electron main process because that is where the app is.
This is the client.
"""

from __future__ import annotations

import json
import os
import socket
import sys
from dataclasses import dataclass
from typing import Any, Iterator

PROTOCOL_VERSION = 1

DEFAULT_TIMEOUT = 30.0
"""Seconds. A full tree walk of a browser window genuinely takes several seconds, so a
short timeout here would report a working app as a broken one."""


# ERRORS


class AngelError(Exception):
    """Base for everything this package raises, so a caller can catch one thing."""


class NotRunning(AngelError):
    """No app is listening. Distinct from a failed request: the fix is to launch it."""


class RequestFailed(AngelError):
    """The app answered, and the answer was no."""

    def __init__(self, message: str, code: str | None = None) -> None:
        super().__init__(message)
        self.code = code


# SOCKET LOCATION


def socket_path() -> str:
    """Where the app listens.

    Must agree with controlSocketPath() in src/common/protocol.ts. The two are written
    out separately in two languages, which is a seam; it is a seam worth having,
    because the alternative is generating one from the other and needing a build step
    to run a shell command.
    """
    override = os.environ.get("SCREEN_ANGEL_SOCKET")
    if override:
        return override

    if sys.platform == "win32":
        user = os.environ.get("USERNAME", "user")
        return rf"\\.\pipe\screen-angel-{user}"

    runtime = os.environ.get("XDG_RUNTIME_DIR") or os.environ.get("TMPDIR") or "/tmp"
    return f"{runtime.rstrip('/')}/screen-angel-{os.getuid()}.sock"


# TRANSPORT


class Transport:
    """A bidirectional line stream. Two implementations, one interface."""

    def send_line(self, line: str) -> None:
        raise NotImplementedError

    def read_line(self) -> str | None:
        raise NotImplementedError

    def close(self) -> None:
        raise NotImplementedError

    def __enter__(self) -> Transport:
        return self

    def __exit__(self, *_exc: object) -> None:
        self.close()


class SocketTransport(Transport):
    """Unix domain socket. macOS, Linux, and anything else with AF_UNIX."""

    def __init__(self, path: str, timeout: float = DEFAULT_TIMEOUT) -> None:
        self._buffer = b""
        self._socket = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        self._socket.settimeout(timeout)
        try:
            self._socket.connect(path)
        except (FileNotFoundError, ConnectionRefusedError) as error:
            self._socket.close()
            raise NotRunning(f"no Screen Angel listening at {path}") from error

    def send_line(self, line: str) -> None:
        self._socket.sendall(line.encode("utf-8") + b"\n")

    def read_line(self) -> str | None:
        while b"\n" not in self._buffer:
            try:
                chunk = self._socket.recv(65536)
            except socket.timeout as error:
                raise AngelError("timed out waiting for a reply") from error
            if not chunk:
                return None
            self._buffer += chunk

        line, _, self._buffer = self._buffer.partition(b"\n")
        return line.decode("utf-8")

    def close(self) -> None:
        self._socket.close()


class PipeTransport(Transport):
    """Windows named pipe.

    Python's socket module has no AF_UNIX on Windows, but a named pipe opens as an
    ordinary binary file, and for a line protocol that is all this needs. The cost is
    that there is no timeout: a read blocks until the app answers or the pipe breaks.
    Acceptable, because the alternative is a pywin32 dependency on a file whose main
    virtue is having none.
    """

    def __init__(self, path: str, timeout: float = DEFAULT_TIMEOUT) -> None:
        del timeout
        self._buffer = b""
        try:
            self._pipe = open(path, "r+b", buffering=0)
        except (FileNotFoundError, OSError) as error:
            raise NotRunning(f"no Screen Angel listening at {path}") from error

    def send_line(self, line: str) -> None:
        self._pipe.write(line.encode("utf-8") + b"\n")

    def read_line(self) -> str | None:
        while b"\n" not in self._buffer:
            chunk = self._pipe.read(65536)
            if not chunk:
                return None
            self._buffer += chunk

        line, _, self._buffer = self._buffer.partition(b"\n")
        return line.decode("utf-8")

    def close(self) -> None:
        self._pipe.close()


def connect(path: str | None = None, timeout: float = DEFAULT_TIMEOUT) -> Transport:
    """Open the right transport for this platform."""
    target = path or socket_path()
    if sys.platform == "win32":
        return PipeTransport(target, timeout)
    return SocketTransport(target, timeout)


# MESSAGES


@dataclass(frozen=True)
class Event:
    """Something the app volunteered rather than answered."""

    name: str
    payload: Any


class Connection:
    """Request and response over a transport, plus the events that arrive between them.

    Events are pushed whenever they happen, which means one can land in the middle of
    waiting for a reply. Rather than dropping them, they queue, and `events()` drains
    the queue. That is what makes `watch` and `query` usable on the same connection.
    """

    def __init__(self, transport: Transport) -> None:
        self._transport = transport
        self._next_id = 1
        self._pending: list[Event] = []

    def request(self, method: str, params: Any = None) -> Any:
        """Send one request and return its result, skipping past any events."""
        request_id = self._next_id
        self._next_id += 1

        message: dict[str, Any] = {"id": request_id, "method": method}
        if params is not None:
            message["params"] = params

        self._transport.send_line(json.dumps(message))

        while True:
            line = self._transport.read_line()
            if line is None:
                raise AngelError("connection closed before a reply arrived")

            message = json.loads(line)

            if "event" in message:
                self._pending.append(Event(message["event"], message.get("payload")))
                continue

            if message.get("id") != request_id:
                # A reply to something else on a shared connection. Not ours to consume.
                continue

            if message.get("ok"):
                return message.get("result")

            error = message.get("error") or {}
            raise RequestFailed(error.get("message", "request failed"), error.get("code"))

    def events(self) -> Iterator[Event]:
        """Yield events forever, starting with any that queued during requests."""
        while self._pending:
            yield self._pending.pop(0)

        while True:
            line = self._transport.read_line()
            if line is None:
                return

            message = json.loads(line)
            if "event" in message:
                yield Event(message["event"], message.get("payload"))

    def close(self) -> None:
        self._transport.close()

    def __enter__(self) -> Connection:
        return self

    def __exit__(self, *_exc: object) -> None:
        self.close()

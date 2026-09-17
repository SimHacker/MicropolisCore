"""Screen Angel client.

    from screen_angel.client import open_angel

    with open_angel() as angel:
        angel.show('button[name*=Save]')

Modules, weakest dependency first:

    protocol.py    Socket location, framing, request and response. Stdlib only.
    client.py      Angel — one method per protocol verb. The module worth importing.
    render.py      Human-readable tables and trees. The only module that formats.
    cli.py         Thin argparse wrapper over client.py.
    mcp_server.py  MCP stdio server over client.py. Needs the mcp package.

Nothing above client.py is required to use it. The CLI and the MCP server are two
front ends over one implementation, and neither has a capability the other lacks.
"""

from .client import Angel, open_angel
from .protocol import AngelError, NotRunning, RequestFailed, socket_path

__all__ = [
    "Angel",
    "AngelError",
    "NotRunning",
    "RequestFailed",
    "open_angel",
    "socket_path",
]

__version__ = "0.1.0"

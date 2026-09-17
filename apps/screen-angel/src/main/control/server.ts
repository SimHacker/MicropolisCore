/**
 * The control socket. Listens on a named pipe or Unix domain socket and answers the
 * same questions the renderer asks, so that a command line tool or an MCP server can
 * stand where the renderer stands.
 *
 * This file knows nothing about accessibility, modules, or Steam. It is given a table
 * of functions and it moves JSON. Keeping it that dumb is what lets the same server
 * serve a CLI written this week and a caller invented next year.
 */

import { createServer, type Server, type Socket } from 'node:net';
import { unlink } from 'node:fs/promises';

import {
	controlSocketPath,
	type ControlEvent,
	type ControlMethod,
	type ControlMethods,
	type ControlRequest,
	type ControlResponse
} from '@common/protocol';

export type ControlHandlers = {
	[M in ControlMethod]: (
		params: ControlMethods[M]['params']
	) => ControlMethods[M]['result'] | Promise<ControlMethods[M]['result']>;
};

/**
 * A single request may not exceed this. A socket that can be filled without limit by
 * anything that connects to it is a way to exhaust the process, and no legitimate
 * request comes close: the largest thing anyone sends is a selector.
 */
const MAX_LINE_BYTES = 256 * 1024;

export class ControlServer {
	private server: Server | null = null;
	private readonly clients = new Set<Socket>();
	private readonly path = controlSocketPath();

	constructor(private readonly handlers: ControlHandlers) {}

	get socketPath(): string {
		return this.path;
	}

	async listen(): Promise<void> {
		// A socket file survives a crash, and the leftover would make bind fail. Removing
		// it is safe because a live server holding this path would have answered the
		// health check the CLI performs before it ever asks us to start.
		if (process.platform !== 'win32') {
			await unlink(this.path).catch(() => undefined);
		}

		this.server = createServer((socket) => this.accept(socket));

		await new Promise<void>((resolve, reject) => {
			this.server?.once('error', reject);
			this.server?.listen(this.path, () => {
				this.server?.off('error', reject);
				resolve();
			});
		});

		console.log(`[control] listening on ${this.path}`);
	}

	/** Pushed to everyone connected. Callers that only make requests simply ignore it. */
	broadcast(event: ControlEvent): void {
		const line = `${JSON.stringify(event)}\n`;
		for (const client of this.clients) {
			client.write(line);
		}
	}

	async close(): Promise<void> {
		for (const client of this.clients) {
			client.destroy();
		}
		this.clients.clear();

		await new Promise<void>((resolve) => {
			if (this.server === null) {
				resolve();
				return;
			}
			this.server.close(() => resolve());
		});

		this.server = null;
		if (process.platform !== 'win32') {
			await unlink(this.path).catch(() => undefined);
		}
	}

	private accept(socket: Socket): void {
		this.clients.add(socket);
		socket.setNoDelay(true);

		let buffer = '';

		socket.on('data', (chunk) => {
			buffer += chunk.toString('utf8');

			if (buffer.length > MAX_LINE_BYTES) {
				socket.destroy();
				return;
			}

			let newline = buffer.indexOf('\n');
			while (newline !== -1) {
				const line = buffer.slice(0, newline).trim();
				buffer = buffer.slice(newline + 1);
				if (line.length > 0) {
					void this.dispatch(socket, line);
				}
				newline = buffer.indexOf('\n');
			}
		});

		// A client that hangs up mid-request is normal, not exceptional: it is what
		// happens every time a one-shot CLI invocation finishes.
		socket.on('error', () => this.clients.delete(socket));
		socket.on('close', () => this.clients.delete(socket));
	}

	private async dispatch(socket: Socket, line: string): Promise<void> {
		let request: ControlRequest;

		try {
			request = JSON.parse(line) as ControlRequest;
		} catch {
			this.reply(socket, { id: 0, ok: false, error: { message: 'malformed JSON', code: 'parse' } });
			return;
		}

		const handler = this.handlers[request.method];
		if (typeof handler !== 'function') {
			this.reply(socket, {
				id: request.id,
				ok: false,
				error: { message: `unknown method: ${request.method}`, code: 'unknown_method' }
			});
			return;
		}

		try {
			// The cast is the one unavoidable seam: the table is typed per method, but at
			// this point the method is only known as a string off the wire.
			const result = await (handler as (params: unknown) => unknown)(request.params);
			this.reply(socket, { id: request.id, ok: true, result: result ?? null });
		} catch (error) {
			this.reply(socket, {
				id: request.id,
				ok: false,
				error: { message: error instanceof Error ? error.message : String(error) }
			});
		}
	}

	private reply(socket: Socket, response: ControlResponse): void {
		if (!socket.destroyed) {
			socket.write(`${JSON.stringify(response)}\n`);
		}
	}
}

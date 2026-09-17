/**
 * Getting a JavaScript console onto both windows, from four directions.
 *
 * Two things make this less obvious than calling openDevTools(). The first is that the
 * overlay is never focused — it is created with focusable: false so it cannot steal
 * keyboard from the game — so every mechanism that acts on "the focused window" acts on
 * the console instead, and the transparent layer, which is the one whose behaviour is
 * hardest to reason about, is exactly the one you cannot reach that way.
 *
 * The second is that a frameless transparent window cannot host docked DevTools. The
 * panel inherits the transparency and the click-through, so it renders over the page as
 * a ghost you cannot click. Detached is not a preference here, it is the only mode that
 * works, so it is chosen rather than offered.
 *
 * The four directions: the View menu, the tray, a keystroke that works even when the
 * overlay has focus, and a verb on the control socket. The last one matters most for
 * anything scripted, because it works when the app is not frontmost and from a machine
 * that only has a terminal.
 */

import { app, BrowserWindow, webContents, type WebContents } from 'electron';

import { IPC } from '@common/ipc';

export type DevWindow = 'console' | 'overlay';

export interface DevToolsTargets {
	console: () => BrowserWindow | null;
	overlay: () => BrowserWindow | null;
}

/**
 * Ask Chromium to listen for a debugger before anything else happens.
 *
 * Has to run before app ready, which is why it is a separate function called from the
 * top of index.ts rather than part of install() below — a command line switch appended
 * after the browser process has read its command line does nothing, silently.
 *
 * Opt-in, because this opens a port that any process on the machine can attach to, and
 * a debugger attached to this particular app can read the accessibility tree of every
 * window on the desktop. The log line is deliberately loud.
 */
export function enableRemoteDebugging(): number | null {
	const requested = process.env.SCREEN_ANGEL_DEBUG_PORT;
	if (requested === undefined || requested === '') {
		return null;
	}

	const port = Number(requested);
	if (!Number.isInteger(port) || port < 1024 || port > 65535) {
		console.warn(`[devtools] SCREEN_ANGEL_DEBUG_PORT=${requested} is not a usable port; ignoring`);
		return null;
	}

	app.commandLine.appendSwitch('remote-debugging-port', String(port));
	console.warn(
		`[devtools] remote debugging on 127.0.0.1:${port} — any local process can now ` +
			'attach a debugger to this app. Unset SCREEN_ANGEL_DEBUG_PORT to close it.'
	);
	return port;
}

export class DevTools {
	private targets: DevToolsTargets = { console: () => null, overlay: () => null };

	public install(targets: DevToolsTargets): void {
		this.targets = targets;

		if (process.env.SCREEN_ANGEL_DEVTOOLS !== undefined) {
			// Deliberately after a beat: opening DevTools on a window that is still
			// loading shows an empty console and no page.
			setTimeout(() => this.open('console'), 500);
		}
	}

	/**
	 * A keystroke that reaches the overlay too.
	 *
	 * Menu accelerators are fine for the console but they are dispatched to the focused
	 * window, and the overlay is never it. before-input-event fires on whichever
	 * webContents received the key, so binding it per window is what makes F12 mean
	 * "this window" rather than "the window with the menu".
	 */
	public bindShortcuts(window: BrowserWindow, which: DevWindow): void {
		// Tell the page a console has arrived, so it can introduce itself there rather
		// than into a log nobody is reading.
		window.webContents.on('devtools-opened', () => {
			window.webContents.send(IPC.devToolsOpenedEvent);
		});

		window.webContents.on('before-input-event', (event, input) => {
			if (input.type !== 'keyDown') {
				return;
			}
			const modified = process.platform === 'darwin' ? input.meta && input.alt : input.control && input.shift;
			const isToggle = input.key === 'F12' || (modified && input.key.toLowerCase() === 'i');
			if (!isToggle) {
				return;
			}
			event.preventDefault();
			this.toggle(which);
		});
	}

	/**
	 * Resolves once the window is actually there.
	 *
	 * isDevToolsOpened is false for a while after openDevTools returns, because the
	 * DevTools window is created asynchronously. Reporting the state immediately means
	 * telling the caller "closed" about a window that is opening in front of them.
	 */
	public async open(which: DevWindow): Promise<boolean> {
		const contents = this.contentsFor(which);
		if (contents === null) {
			return false;
		}
		if (contents.isDevToolsOpened()) {
			return true;
		}

		const opened = once(
			(handler) => contents.once('devtools-opened', handler),
			(handler) => contents.off('devtools-opened', handler)
		);
		// Detached for the overlay because docked is broken there; detached for the
		// console as well, so that opening DevTools does not resize the window you were
		// looking at and reflow the thing you were inspecting.
		contents.openDevTools({ mode: 'detach', activate: true });
		await opened;

		showConsolePanel(contents);
		return contents.isDevToolsOpened();
	}

	public async close(which: DevWindow): Promise<boolean> {
		const contents = this.contentsFor(which);
		if (contents === null || !contents.isDevToolsOpened()) {
			return false;
		}
		const closed = once(
			(handler) => contents.once('devtools-closed', handler),
			(handler) => contents.off('devtools-closed', handler)
		);
		contents.closeDevTools();
		await closed;
		return contents.isDevToolsOpened();
	}

	public async toggle(which: DevWindow): Promise<boolean> {
		return this.isOpen(which) ? this.close(which) : this.open(which);
	}

	public isOpen(which: DevWindow): boolean {
		return this.contentsFor(which)?.isDevToolsOpened() ?? false;
	}

	/**
	 * Run an expression in a window and return its value.
	 *
	 * The point is a console you can reach from a terminal, or from a script, or from an
	 * agent — the same JavaScript you would type into DevTools, without needing the app
	 * to be frontmost or a human to be at the keyboard.
	 *
	 * Not a new capability over this socket: a caller who can reach it can already drive
	 * every verb the renderer can. It IS a new capability over a read-only listener,
	 * which is why it is not in READ_ONLY_METHODS.
	 */
	public async evaluate(which: DevWindow, code: string): Promise<unknown> {
		const contents = this.contentsFor(which);
		if (contents === null) {
			throw new Error(`There is no ${which} window to evaluate in.`);
		}

		const source = parsesAsExpression(code) ? asExpression(code) : asStatements(code);

		let outcome: Outcome;
		try {
			// userGesture, because plenty of interesting things a person would type by
			// hand are gated on one, and a promise that never settles is a bad debugger.
			outcome = (await contents.executeJavaScript(source, true)) as Outcome;
		} catch (error) {
			throw new Error(
				'That is not valid JavaScript. A statement list has to say return. ' +
					describeError(error)
			);
		}

		if (!outcome.ok) {
			throw new Error(outcome.error ?? 'it threw, with nothing to say about it');
		}
		return sanitize(outcome.value);
	}

	/** Every DevTools window currently open, so they can be closed with the app. */
	public closeAll(): void {
		for (const contents of webContents.getAllWebContents()) {
			if (contents.isDevToolsOpened()) {
				contents.closeDevTools();
			}
		}
	}

	private contentsFor(which: DevWindow): WebContents | null {
		const window = which === 'overlay' ? this.targets.overlay() : this.targets.console();
		if (window === null || window.isDestroyed()) {
			return null;
		}
		return window.webContents;
	}
}

/**
 * One event, or a timeout.
 *
 * A promise that waits for a window event and nothing else is a promise that never
 * settles the day the event does not fire. Two seconds is far longer than opening a
 * window takes and far shorter than a person will wait before deciding it is broken.
 */
function once(
	// The subscription is passed in rather than an event name, because Electron types
	// these events as separate overloads: a union of two event names matches none of them.
	subscribe: (handler: () => void) => void,
	unsubscribe: (handler: () => void) => void
): Promise<void> {
	return new Promise((resolve) => {
		const timer = setTimeout(finish, 2000);
		function finish(): void {
			clearTimeout(timer);
			unsubscribe(finish);
			resolve();
		}
		subscribe(finish);
	});
}

/**
 * Land on the Console rather than wherever DevTools was last left.
 *
 * For this app the console IS the tool — the toolkit and the printed help live there —
 * so opening onto the Network panel because that is what was open a week ago starts
 * everyone one click behind.
 *
 * DevTools has no public API for picking a panel, so this reaches into the DevTools
 * page's own front end. Wrapped in every guard available and completely optional: if a
 * future Electron renames these internals, the failure is that DevTools opens on the
 * wrong tab, which is where it would have opened anyway.
 */
function showConsolePanel(contents: WebContents): void {
	const frontend = (contents as unknown as { devToolsWebContents?: WebContents })
		.devToolsWebContents;
	if (frontend === undefined || frontend === null) {
		return;
	}

	frontend
		.executeJavaScript(
			`(() => {
				try {
					if (typeof DevToolsAPI !== 'undefined' && DevToolsAPI.showPanel) {
						DevToolsAPI.showPanel('console');
						return 'DevToolsAPI';
					}
				} catch {}
				return 'unavailable';
			})()`
		)
		.catch(() => undefined);
}

interface Outcome {
	ok: boolean;
	value?: unknown;
	error?: string;
}

/**
 * Wrapping the caller's code so it behaves like a console prompt.
 *
 * Two things executeJavaScript will not do on its own. It has no top-level await, so
 * `await $q('button')` — the single most obvious thing anyone will type — is a syntax
 * error; and when the code throws, it rejects with "Script failed to execute, this
 * normally means an error was thrown", a sentence about the mechanism rather than the
 * mistake, with the actual error left in a console nobody is looking at.
 *
 * Both are fixed by putting the code inside an async arrow with a try/catch. Note that
 * the code is INLINED as source, never passed as a string to be compiled: the renderer's
 * Content Security Policy forbids unsafe-eval, which is correct and worth keeping, and
 * it means new Function is not available in the page. executeJavaScript itself is not
 * affected because it is not the page compiling a string.
 */
/**
 * Is this an expression, decided by V8 without running anything?
 *
 * The obvious alternative was to inject the expression form, notice it failed to parse,
 * and inject the statement form instead. It works, and it leaves a red uncaught
 * SyntaxError in the page's console every time anybody uses a statement list — so the
 * console this feature exists to make pleasant grows an error badge that means nothing.
 *
 * new Function COMPILES; it does not call. The function object is discarded, so the
 * caller's code never runs in the main process. That distinction is the whole reason
 * this is safe, and it gets us V8's own answer instead of a regular expression's guess.
 */
function parsesAsExpression(code: string): boolean {
	try {
		// eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
		new Function(`return (async () => (\n${code}\n))`);
		return true;
	} catch {
		return false;
	}
}

function asExpression(code: string): string {
	return `(async () => {
		try {
			return { ok: true, value: await (
${code}
			) };
		} catch (thrown) {
			return { ok: false, error: String((thrown && thrown.stack) || thrown) };
		}
	})()`;
}

/** A statement list, which has to say `return` — the one rule this costs. */
function asStatements(code: string): string {
	return `(async () => {
		const run = async () => {
${code}
		};
		try {
			return { ok: true, value: await run() };
		} catch (thrown) {
			return { ok: false, error: String((thrown && thrown.stack) || thrown) };
		}
	})()`;
}

/**
 * Electron's own message for a failed script says only that a script failed and points
 * at a console the caller may not have open. Repeating it adds nothing, so when that is
 * all we have, say nothing extra.
 */
function describeError(error: unknown): string {
	const message = error instanceof Error ? error.message : String(error);
	return message.startsWith('Script failed to execute') ? '' : message;
}

/**
 * Make a result safe to put on a wire that only carries JSON.
 *
 * executeJavaScript returns whatever the expression evaluated to, and a person poking at
 * a live page will regularly land on a DOM node, a function, or a cycle. Returning a
 * description beats failing to serialize, because "[Function]" answers the question
 * while a serialization error replaces it with a different one.
 */
function sanitize(value: unknown): unknown {
	try {
		return JSON.parse(JSON.stringify(value, replacer()));
	} catch {
		return String(value);
	}
}

function replacer(): (key: string, value: unknown) => unknown {
	const seen = new WeakSet<object>();
	return (_key, value) => {
		if (typeof value === 'function') {
			return `[Function ${(value as { name?: string }).name || 'anonymous'}]`;
		}
		if (typeof value === 'bigint') {
			return `${value}n`;
		}
		if (typeof value === 'object' && value !== null) {
			if (seen.has(value)) {
				return '[Circular]';
			}
			seen.add(value);
		}
		return value;
	};
}

/**
 * The transparent, always-topmost, click-through window that covers every screen.
 *
 * This is the shell from the 2013 Slate prototype, and it is worth being explicit that
 * it needs no native code at all. Four Electron calls do the whole thing, and Kando has
 * been shipping exactly these four on Windows and macOS for years. The hard part was
 * never the window; it was what you point at through it.
 */

import { BrowserWindow, screen } from 'electron';
import { join } from 'node:path';

import type { Rect } from '@common/types';

export class OverlayWindow {
	private window: BrowserWindow | null = null;
	private clickThrough = true;

	public async create(preload: string, entry: RendererEntry): Promise<BrowserWindow> {
		const bounds = unionOfAllDisplays();

		this.window = new BrowserWindow({
			...bounds,
			transparent: true,
			frame: false,
			resizable: false,
			movable: false,
			minimizable: false,
			maximizable: false,
			fullscreenable: false,
			hasShadow: false,
			skipTaskbar: true,
			// Never take focus from the game. An overlay that steals keyboard focus has
			// already failed, whatever else it does.
			focusable: false,
			show: false,
			webPreferences: {
				preload,
				contextIsolation: true,
				nodeIntegration: false,
				sandbox: false
			}
		});

		// 'screen-saver' is the highest level Electron exposes, and the only one that
		// stays above a borderless-windowed game.
		this.window.setAlwaysOnTop(true, 'screen-saver');
		this.window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

		// That call has a side effect nobody would guess and Electron does not document:
		// asking a window to join fullscreen spaces switches the whole APPLICATION to
		// macOS's accessory activation policy. The app loses its Dock icon and its place in
		// Cmd-Tab. On a machine whose Dock auto-hides and whose menu bar is already too
		// full to fit another status item, that leaves no visible way back into the app.
		//
		// It is a real either/or, measured in both directions: calling app.dock.show()
		// afterwards restores the Dock icon and the switcher entry, and the overlay then
		// stops drawing over other apps' fullscreen spaces — text put on the overlay was
		// present in its DOM and absent from a photograph of a fullscreen editor. Covering
		// a fullscreen game is the entire job, so accessory policy wins and the way back in
		// is window.console over the socket.
		this.setClickThrough(true);

		await loadRenderer(this.window, entry);
		return this.window;
	}

	/**
	 * Click-through with forwarding: the page keeps receiving pointer movement so it can
	 * hit-test its own widgets in the DOM, but clicks pass to the application beneath.
	 * The renderer flips this off when the pointer enters something interactive, which
	 * is why hit testing lives in the web layer and not here — the web layer is the only
	 * side that knows where its widgets are.
	 */
	public setClickThrough(enabled: boolean): void {
		this.clickThrough = enabled;
		this.window?.setIgnoreMouseEvents(enabled, { forward: true });
	}

	public isClickThrough(): boolean {
		return this.clickThrough;
	}

	public show(): void {
		this.window?.showInactive();
	}

	public hide(): void {
		this.window?.hide();
	}

	public toggle(): void {
		if (this.isVisible()) {
			this.hide();
		} else {
			this.show();
		}
	}

	public isVisible(): boolean {
		return this.window?.isVisible() ?? false;
	}

	/** Follows monitor changes, so plugging in a display does not leave a dead strip. */
	public refitToDisplays(): void {
		this.window?.setBounds(unionOfAllDisplays());
	}

	/**
	 * Screen coordinates to page coordinates.
	 *
	 * The page draws in CSS pixels measured from ITS OWN top-left corner, and everything
	 * upstream of it — accessibility bounds, window frames, cursor position — is measured
	 * from the top-left of the desktop. Those two agree only when the overlay happens to
	 * start at the desktop origin, and on macOS it does not: the window manager refuses
	 * to place an ordinary window under the menu bar and slides it down instead. Measured
	 * on this machine, boxes landed 36 points low, which is the menu bar exactly.
	 *
	 * A multi-monitor desktop breaks it the other way. A display to the left of the main
	 * one has negative x, so the union starts negative and every box lands too far right
	 * by the width of that display.
	 *
	 * So convert here, once, where the real window bounds are known, and let the page
	 * stay ignorant of screens.
	 */
	public toPageSpace(rects: Rect[]): Rect[] {
		const origin = this.window?.getBounds() ?? { x: 0, y: 0 };
		if (origin.x === 0 && origin.y === 0) {
			return rects;
		}
		return rects.map((rect) => ({ ...rect, x: rect.x - origin.x, y: rect.y - origin.y }));
	}

	/** What the window manager actually gave us, against what we asked for. */
	public describePlacement(): string {
		const wanted = unionOfAllDisplays();
		const got = this.window?.getBounds() ?? wanted;
		const same =
			got.x === wanted.x && got.y === wanted.y && got.width === wanted.width && got.height === wanted.height;
		return same
			? `overlay covers ${got.width}x${got.height} at ${got.x},${got.y}`
			: `overlay asked for ${wanted.width}x${wanted.height} at ${wanted.x},${wanted.y} ` +
					`and got ${got.width}x${got.height} at ${got.x},${got.y}`;
	}

	public get browserWindow(): BrowserWindow | null {
		return this.window;
	}

	public destroy(): void {
		this.window?.destroy();
		this.window = null;
	}
}

/**
 * One window across every monitor, rather than one window per monitor.
 *
 * The tradeoff is real: a single window on displays with different scale factors gets a
 * single scale factor, so overlay graphics on the secondary monitor can be soft. One
 * window per display fixes that and costs a renderer process each. Starting with one,
 * because the alternative complicates every coordinate in the system.
 */
function unionOfAllDisplays(): Rect {
	const displays = screen.getAllDisplays();
	const left = Math.min(...displays.map((d) => d.bounds.x));
	const top = Math.min(...displays.map((d) => d.bounds.y));
	const right = Math.max(...displays.map((d) => d.bounds.x + d.bounds.width));
	const bottom = Math.max(...displays.map((d) => d.bounds.y + d.bounds.height));

	return { x: left, y: top, width: right - left, height: bottom - top };
}

export interface RendererEntry {
	/** Set by electron-vite in development; absent in a packaged build. */
	devServerUrl?: string;
	/** Which view the single renderer bundle should mount. */
	view: 'overlay' | 'console';
}

export async function loadRenderer(window: BrowserWindow, entry: RendererEntry): Promise<void> {
	forwardRendererLogs(window, entry.view);

	if (entry.devServerUrl) {
		await window.loadURL(`${entry.devServerUrl}#${entry.view}`);
		return;
	}
	await window.loadFile(join(__dirname, '../renderer/index.html'), { hash: entry.view });
}

/**
 * Renderer console output, and load failures, into the main log.
 *
 * Without this the overlay is undebuggable in the case that matters most: a transparent
 * click-through window that draws nothing looks identical to one that never loaded, and
 * it has no visible surface on which to display its own error.
 */
function forwardRendererLogs(window: BrowserWindow, view: string): void {
	window.webContents.on('console-message', (event) => {
		const where =
			event.sourceId !== undefined && event.sourceId !== ''
				? ` (${event.sourceId}:${event.lineNumber})`
				: '';
		console.log(`[${view}] ${plain(event.message)}${where}`);
	});

	window.webContents.on('did-fail-load', (_event, code, description, url) => {
		console.error(`[${view}] failed to load ${url}: ${description} (${code})`);
	});

	window.webContents.on('preload-error', (_event, path, error) => {
		console.error(`[${view}] preload failed at ${path}: ${error.message}`);
	});

	window.webContents.on('render-process-gone', (_event, details) => {
		console.error(`[${view}] render process gone: ${details.reason}`);
	});
}

/**
 * Drop console styling on the way to a terminal.
 *
 * The console-message event hands over the format string and not the arguments, so a
 * styled message arrives as "%cSomething" followed by nothing, and the CSS that was
 * supposed to be argument one is simply gone. Stripping the directive leaves the words.
 */
function plain(message: string): string {
	return message.replace(/%c/g, '').trim();
}

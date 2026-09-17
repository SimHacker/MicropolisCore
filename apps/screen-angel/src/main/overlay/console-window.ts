/**
 * The ordinary window: settings, the element inspector, whatever a module puts here.
 *
 * It exists because not everything belongs on top of somebody else's game. The overlay
 * is for things that must sit in the user's line of sight; this is for everything you
 * sit down and read. Same renderer bundle, different view.
 */

import { app, BrowserWindow } from 'electron';

import { loadRenderer, type RendererEntry } from './overlay-window';

export class ConsoleWindow {
	private window: BrowserWindow | null = null;

	public async create(preload: string, entry: RendererEntry): Promise<BrowserWindow> {
		this.window = new BrowserWindow({
			width: 1100,
			height: 760,
			minWidth: 720,
			minHeight: 480,
			show: false,
			title: 'Screen Angel',
			backgroundColor: '#12121a',
			webPreferences: {
				preload,
				contextIsolation: true,
				nodeIntegration: false,
				sandbox: false
			}
		});

		/**
		 * Appear without taking focus, or — when asked — without appearing.
		 *
		 * showInactive rather than show, because this app's subject is whatever ELSE is
		 * frontmost. Half the protocol is phrased in terms of the focused window, so a
		 * console that activates itself on launch destroys the answer to the first
		 * question anyone asks it: query the focused app and you get Screen Angel's own
		 * console instead of the thing you were looking at. On macOS it is worse than
		 * wrong, it is rude — activating pulls the desktop out of whatever fullscreen
		 * space the user was working in.
		 *
		 * SCREEN_ANGEL_QUIET suppresses the window entirely, for starting the app from a
		 * script or a test run where nothing should move on screen at all.
		 */
		if (process.env.SCREEN_ANGEL_QUIET === undefined) {
			this.window.once('ready-to-show', () => this.window?.showInactive());
		}

		await loadRenderer(this.window, entry);
		return this.window;
	}

	/**
	 * Focus deliberately. This is the path for a person choosing Show Console from the
	 * tray or the menu, or clicking the dock icon — cases where taking focus is the entire
	 * request, rather than a side effect of starting up.
	 */
	public show(): void {
		// Appear in the space the user is in, including someone else's fullscreen space.
		// The overlay's fullscreen setting costs this application its Dock icon and its
		// Cmd-Tab entry (see overlay-window.ts), so summoning this window is the way back
		// in — and a window that opens on a space you are not looking at is not a way in.
		//
		// Never cleared afterwards, even though an ordinary window would want to be. The
		// fullscreen setting is APPLICATION-wide and last-writer-wins: clearing it here
		// switches the whole app back to regular activation policy and the overlay stops
		// covering fullscreen apps — a window politely undoing its own request revoking a
		// different window's guarantee. Caught by photographing the overlay after a hide.
		this.window?.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
		this.window?.show();
		this.window?.focus();
		app.focus({ steal: true });
	}

	public hide(): void {
		this.window?.hide();
	}

	public get visible(): boolean {
		return this.window?.isVisible() ?? false;
	}

	public get browserWindow(): BrowserWindow | null {
		return this.window;
	}

	public destroy(): void {
		this.window?.destroy();
		this.window = null;
	}
}

/**
 * The Electron main process. Everything that cannot happen in a web page happens here,
 * and nothing else does.
 *
 * Read this file to see the whole shape: pick a backend for the platform, put up two
 * windows, hand the layer to a module host, open the door to the renderer, and get out
 * of the way. There is no UI code below this line and there should never be any.
 */

import { app, BrowserWindow, ipcMain, nativeImage } from 'electron';
import { join } from 'node:path';

import { IPC, type HostInfo, type Utterance } from '@common/ipc';
import { PROTOCOL_VERSION, type GrabParams } from '@common/protocol';
import type { QueryOptions, Rect } from '@common/types';

import { getBackend, UnsupportedPlatformError, type ScreenAngelBackend } from './backends';
import { CaptureService } from './capture/service';
import { RecognizeService } from './recognize/service';
import { ImageStore } from './capture/store';
import { ControlServer, type ControlHandlers } from './control/server';
import { DevTools, enableRemoteDebugging } from './devtools';
import { installApplicationMenu } from './menu';
import { ModuleHost } from './modules/host';
import { builtInModules } from './modules/registry';
import { ConsoleWindow } from './overlay/console-window';
import { OverlayWindow } from './overlay/overlay-window';
import { SPACEWAR_APP_ID } from './steam/ffi-adapter';
import { createSteamAdapter } from './steam/steam';
import { AngelTray, appIconPath } from './tray';

/**
 * Spacewar until an App ID is reserved on the Steamworks partner site.
 *
 * Development against 480 needs no partner account and no fee, so this is the honest
 * default rather than a placeholder: it produces a working Steam connection today.
 * SCREEN_ANGEL_STEAM_APPID overrides it, and Steam's own SteamAppId beats both. See
 * STEAMWORKS.yml.
 */
const STEAM_APP_ID = SPACEWAR_APP_ID;

// Before anything reads it. The name decides the menu bar title, the About panel, and
// the userData directory, and a rename after those are read leaves them saying Electron.
app.setName('Screen Angel');

// Before ready, because a command line switch appended after the browser process has
// read its command line does nothing and says nothing about it.
enableRemoteDebugging();

const preload = join(__dirname, '../preload/index.js');
const devServerUrl = process.env.ELECTRON_RENDERER_URL;

const steam = createSteamAdapter();
const overlay = new OverlayWindow();
const consoleWindow = new ConsoleWindow();
const tray = new AngelTray();
const devTools = new DevTools();

let backend: ScreenAngelBackend | null = null;
let unsupportedReason: string | undefined;
let host: ModuleHost | null = null;
let control: ControlServer | null = null;
let images: ImageStore | null = null;
let capture: CaptureService | null = null;
let recognize: RecognizeService | null = null;

async function start(): Promise<void> {
	backend = getBackend();

	if (backend === null) {
		// Not a crash. The console window still opens and explains itself, because an app
		// that dies silently on an unsupported platform teaches the user nothing.
		unsupportedReason = new UnsupportedPlatformError(process.platform).message;
		console.warn(`[main] ${unsupportedReason}`);
	} else {
		await backend.init();
		const info = backend.getBackendInfo();
		console.log(`[main] backend: ${info.name}`);

		host = new ModuleHost(backend, requireCapture());
		await host.load(builtInModules());
		host.start();

		host.on('window-focus', (window) => {
			broadcast(IPC.windowFocusEvent, window);
			control?.broadcast({ event: 'window-focus', payload: window });
		});
		host.on('bridge-change', (bridgeId) => {
			broadcast(IPC.bridgeChangeEvent, bridgeId);
			control?.broadcast({ event: 'bridge-change', payload: bridgeId });
		});
	}

	// Under userData, so it follows the app's own conventions for where its files live
	// and gets removed with the app. init() also sweeps the cache directories of runs
	// that crashed, which is the only cleanup those will ever get.
	images = new ImageStore(join(app.getPath('userData'), 'captures'));
	await images.init();
	capture = new CaptureService(images, requireBackend, {
		query: (selector, options) => requireBackend().query(selector, options),
		tree: (options) => requireBackend().dumpTree(options),
		windows: () => requireBackend().getOpenWindows(),
		focusedWindow: () => requireBackend().getFocusedWindow()
	});
	recognize = new RecognizeService(capture);

	await steam.init(STEAM_APP_ID);

	registerHandlers();
	await startControlServer();

	devTools.install({
		console: () => consoleWindow.browserWindow,
		overlay: () => overlay.browserWindow
	});

	installApplicationMenu({
		toggleOverlay: () => overlay.toggle(),
		showConsole: () => consoleWindow.show(),
		toggleDevTools: (which) => void devTools.toggle(which),
		reload: () => BrowserWindow.getFocusedWindow()?.webContents.reload()
	});

	// Development runs the stock Electron binary, whose bundle supplies the Dock icon and
	// the Cmd-Tab entry. Setting it here is the only way to see the real icon before the
	// app is packaged; in a packaged build the bundle already has it.
	if (!app.isPackaged && process.platform === 'darwin') {
		const icon = nativeImage.createFromPath(appIconPath());
		if (!icon.isEmpty()) {
			app.dock?.setIcon(icon);
		}
	}

	tray.create({
		toggleOverlay: () => {
			overlay.toggle();
			return overlay.isVisible();
		},
		isOverlayVisible: () => overlay.isVisible(),
		showConsole: () => consoleWindow.show(),
		toggleDevTools: (which) => void devTools.toggle(which),
		describe: () => ({
			backend: backend?.getBackendInfo().name ?? null,
			accessibility: null,
			activeBridgeId: host?.activeBridgeId ?? null,
			controlSocket: control?.socketPath ?? null
		})
	});

	const consoleBrowser = await consoleWindow.create(preload, { devServerUrl, view: 'console' });
	devTools.bindShortcuts(consoleBrowser, 'console');

	if (backend !== null) {
		const overlayBrowser = await overlay.create(preload, { devServerUrl, view: 'overlay' });
		devTools.bindShortcuts(overlayBrowser, 'overlay');
		overlay.show();
		// Worth a line in the log, because every highlight is drawn relative to this and
		// a window manager that moved us is the difference between right and 36 low.
		console.log(`[overlay] ${overlay.describePlacement()}`);
	}
}

function broadcast(channel: string, payload: unknown): void {
	for (const window of BrowserWindow.getAllWindows()) {
		if (!window.isDestroyed()) {
			window.webContents.send(channel, payload);
		}
	}
}

/**
 * Handlers stay one line each on purpose. Anything that grows a body belongs in a
 * module or a service, not in the wiring.
 */
function registerHandlers(): void {
	ipcMain.handle(IPC.hostInfo, (): Promise<HostInfo> => hostInfo());

	ipcMain.handle(IPC.permissions, () => backend?.getPermissions() ?? null);
	ipcMain.handle(IPC.requestPermissions, () => backend?.requestPermissions());

	ipcMain.handle(IPC.query, (_event, selector: string, options?: QueryOptions) =>
		requireBackend().query(selector, options)
	);
	ipcMain.handle(IPC.dumpTree, (_event, options?: QueryOptions) =>
		requireBackend().dumpTree(options)
	);
	ipcMain.handle(IPC.elementAt, (_event, x: number, y: number) =>
		requireBackend().elementAt(x, y)
	);
	ipcMain.handle(IPC.focusedWindow, () => backend?.getFocusedWindow() ?? null);
	ipcMain.handle(IPC.openWindows, () => backend?.getOpenWindows() ?? []);

	ipcMain.handle(IPC.setClickThrough, (_event, enabled: boolean) =>
		overlay.setClickThrough(enabled)
	);
	ipcMain.handle(IPC.toggleOverlay, () => overlay.toggle());

	// Only the overlay draws. Broadcasting highlights to the console too would put boxes
	// over the inspector that produced them.
	ipcMain.handle(IPC.setHighlights, (_event, rects: Rect[]) =>
		sendToOverlay(IPC.highlightsEvent, overlay.toPageSpace(rects))
	);
	ipcMain.handle(IPC.say, (_event, utterance: Utterance) =>
		sendToOverlay(IPC.sayEvent, utterance)
	);

	// The renderer gets a path rather than bytes, and can display it directly: an
	// <img src="file:///..."> works here because these are our own files in our own
	// cache. No dir parameter, because a page choosing where to write on disk is a
	// bigger door than this one is allowed to be.
	ipcMain.handle(IPC.grab, (_event, params: GrabParams & { pid?: number }) => {
		const { pid, ...rest } = params;
		return requireCapture().grab(rest, ['file'], { pid });
	});
}

/**
 * The same verbs, offered to things that are not the renderer: a CLI, an MCP server, a
 * script. The table below is the entire remote surface, which is why it is written out
 * flat here rather than assembled somewhere clever.
 *
 * A failure to listen is not a failure to run. The socket is how an agent drives the
 * app; the app itself works without one, and refusing to start because a socket was
 * taken would be the tail wagging the dog.
 */
async function startControlServer(): Promise<void> {
	const handlers: ControlHandlers = {
		'angel.info': async () => ({ ...(await hostInfo()), protocolVersion: PROTOCOL_VERSION }),
		'angel.permissions': async () => (await backend?.getPermissions()) ?? null,

		'query.select': ({ selector, options }) => requireBackend().query(selector, options),
		'query.tree': ({ options }) => requireBackend().dumpTree(options),
		'query.at': ({ x, y }) => requireBackend().elementAt(x, y),
		'window.focused': async () => (await backend?.getFocusedWindow()) ?? null,
		'window.list': async () => (await backend?.getOpenWindows()) ?? [],

		// A socket client is on this machine — the socket's permissions are what make
		// that true — so it can read a path. base64 stays available for callers like MCP
		// whose own format gives them nowhere to put a file.
		'capture.grab': ({ dir, pid, maxDepth, maxNodes, ...params }) =>
			requireCapture().grab(params, ['file', 'base64'], { dir, pid, maxDepth, maxNodes }),
		'recognize.scan': ({ pid, ...params }) => requireRecognize().scan(params, pid),
		'image.fetch': ({ id }) => requireCapture().fetchBase64(id),
		'image.pin': ({ id }) => requireCapture().pin(id),
		'image.release': async ({ id }) => {
			await requireCapture().release(id);
			return null;
		},

		'overlay.highlight': ({ rects }) => {
			// Reporting a count regardless of whether anything drew would be the interface
			// lying: a caller told "9 outlined" with no overlay present has no way to find
			// out otherwise, and will believe the user can see something they cannot.
			if (!sendToOverlay(IPC.highlightsEvent, overlay.toPageSpace(rects))) {
				throw new Error('no overlay window to draw on');
			}
			return { count: rects.length };
		},
		'overlay.say': ({ text, ttlMs }) => {
			const utterance: Utterance = { text, ttlMs: ttlMs ?? 6000 };
			if (!sendToOverlay(IPC.sayEvent, utterance)) {
				throw new Error('no overlay window to speak through');
			}
			return null;
		},
		'window.console': async ({ action = 'show' }) => {
			const wanted = action === 'toggle' ? !consoleWindow.visible : action === 'show';
			if (wanted) {
				consoleWindow.show();
			} else {
				consoleWindow.hide();
			}
			return { visible: consoleWindow.visible };
		},

		'overlay.toggle': () => {
			overlay.toggle();
			return { visible: overlay.isVisible() };
		},

		'dev.devtools': async ({ window: which = 'console', action = 'toggle' }) => {
			// Read the state back rather than reporting what we asked for. These await
			// the window actually appearing, because isDevToolsOpened stays false for a
			// while after openDevTools returns.
			if (action === 'open') {
				await devTools.open(which);
			} else if (action === 'close') {
				await devTools.close(which);
			} else {
				await devTools.toggle(which);
			}
			return { window: which, open: devTools.isOpen(which) };
		},
		'dev.eval': async ({ code, window: which = 'console' }) => ({
			value: await devTools.evaluate(which, code)
		})
	};

	control = new ControlServer(handlers);

	try {
		await control.listen();
	} catch (error) {
		control = null;
		console.warn(`[control] not listening: ${(error as Error).message}`);
	}
}

async function hostInfo(): Promise<HostInfo> {
	return {
		appVersion: app.getVersion(),
		electronVersion: process.versions.electron,
		backend: backend?.getBackendInfo() ?? null,
		unsupportedReason,
		permissions: (await backend?.getPermissions()) ?? null,
		modules: host?.describe() ?? [],
		activeBridgeId: host?.activeBridgeId ?? null,
		steam: steam.status()
	};
}

/**
 * The overlay is the only window that draws over other applications, so it is the only
 * one that should receive things meant to appear there.
 *
 * Returns whether anything was actually delivered, so callers can tell the difference
 * between drawing and appearing to draw.
 */
function sendToOverlay(channel: string, payload: unknown): boolean {
	const window = overlay.browserWindow;
	if (window === null || window.isDestroyed()) {
		return false;
	}
	window.webContents.send(channel, payload);
	return true;
}

function requireBackend(): ScreenAngelBackend {
	if (backend === null) {
		throw new UnsupportedPlatformError(process.platform);
	}
	return backend;
}

function requireCapture(): CaptureService {
	if (capture === null) {
		throw new Error('Capture is not available: no backend started.');
	}
	return capture;
}

function requireRecognize(): RecognizeService {
	if (recognize === null) {
		throw new Error('Recognition is not available: no backend started.');
	}
	return recognize;
}

app.whenReady().then(start).catch((error) => {
	console.error('[main] failed to start:', error);
	app.quit();
});

app.on('window-all-closed', () => {
	// The overlay is not a document, and on macOS an overlay app that quits when its
	// settings window closes is an overlay app that keeps dying by accident.
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	consoleWindow.show();
});

app.on('before-quit', async () => {
	// Detached DevTools windows are windows. Left open, they keep the app alive on
	// platforms that quit when the last window closes, and reappear orphaned on macOS.
	devTools.closeAll();
	await control?.close();
	await images?.shutdown();
	await host?.unload();
	await backend?.deinit();
	await steam.shutdown();
	tray.destroy();
	overlay.destroy();
	consoleWindow.destroy();
});

/**
 * The menu bar item.
 *
 * An overlay utility has no document and often no visible window, so the menu bar is the
 * only place a user can reliably find it. Without this the app is a transparent
 * click-through window and a Dock icon, which is indistinguishable from nothing at all
 * when the overlay happens to be drawing nothing.
 *
 * It also answers the question the app cannot otherwise answer about itself: is the
 * overlay on, is accessibility granted, which bridge is attached.
 */

import { app, Menu, nativeImage, Tray, type MenuItemConstructorOptions } from 'electron';
import { join } from 'node:path';

export interface TrayActions {
	toggleOverlay: () => boolean;
	isOverlayVisible: () => boolean;
	showConsole: () => void;
	toggleDevTools: (which: 'console' | 'overlay') => void;
	describe: () => TrayStatus;
}

export interface TrayStatus {
	backend: string | null;
	accessibility: string | null;
	activeBridgeId: string | null;
	controlSocket: string | null;
}

export class AngelTray {
	private tray: Tray | null = null;

	public create(actions: TrayActions): void {
		const image = trayImage();

		// A tray with an empty image is an invisible tray: it occupies menu bar space and
		// shows nothing, which looks exactly like a missing feature. Better to have no
		// menu bar item and say so in the log.
		if (image.isEmpty()) {
			console.warn('[tray] icon missing, no menu bar item. Run tools/render-icons.sh');
			return;
		}

		this.tray = new Tray(image);
		this.tray.setToolTip('Screen Angel');
		this.rebuild(actions);

		// The menu is rebuilt on every open rather than kept in sync, because the things
		// it reports change constantly and a stale menu is worse than a slow one. This
		// costs a few milliseconds at the moment a human is already moving a mouse.
		this.tray.on('mouse-down', () => this.rebuild(actions));
	}

	private rebuild(actions: TrayActions): void {
		if (this.tray === null) {
			return;
		}

		const status = actions.describe();
		const overlayOn = actions.isOverlayVisible();

		const template: MenuItemConstructorOptions[] = [
			{ label: `Screen Angel ${app.getVersion()}`, enabled: false },
			{ type: 'separator' },
			{
				label: 'Overlay',
				type: 'checkbox',
				checked: overlayOn,
				accelerator: 'CommandOrControl+Alt+A',
				click: () => actions.toggleOverlay()
			},
			{ label: 'Open Console', click: () => actions.showConsole() },
			{
				// From the menu bar because the overlay cannot be focused, so there is no
				// window to aim a normal Inspect Element at.
				label: 'JavaScript Console',
				submenu: [
					{ label: 'Console Window', click: () => actions.toggleDevTools('console') },
					{ label: 'Overlay Window', click: () => actions.toggleDevTools('overlay') }
				]
			},
			{ type: 'separator' },
			{ label: `Backend: ${status.backend ?? 'none'}`, enabled: false },
			{ label: `Accessibility: ${status.accessibility ?? 'unknown'}`, enabled: false },
			{ label: `Bridge: ${status.activeBridgeId ?? 'none attached'}`, enabled: false },
			{
				label: status.controlSocket === null ? 'Control: not listening' : 'Control: listening',
				enabled: false
			},
			{ type: 'separator' },
			{ label: 'Quit Screen Angel', role: 'quit' }
		];

		this.tray.setContextMenu(Menu.buildFromTemplate(template));
	}

	public destroy(): void {
		this.tray?.destroy();
		this.tray = null;
	}
}

/**
 * macOS picks the @2x file up automatically from the 1x path, so only one path is named.
 *
 * setTemplateImage is what makes the mark follow the menu bar instead of fighting it:
 * black in light mode, white in dark mode, inverted while the menu is open. Skipping it
 * gives a permanently black icon that disappears against a dark menu bar.
 */
function trayImage() {
	const image = nativeImage.createFromPath(resourcePath('trayTemplate.png'));
	if (process.platform === 'darwin') {
		image.setTemplateImage(true);
	}
	return image;
}

export function appIconPath(): string {
	return resourcePath('icon.png');
}

/**
 * Resources sit beside the app in a packaged build and beside the source in development.
 * __dirname is out/main in both cases, so the relative path is the same either way and
 * only the root differs.
 */
function resourcePath(name: string): string {
	return app.isPackaged
		? join(process.resourcesPath, name)
		: join(__dirname, '../../resources', name);
}

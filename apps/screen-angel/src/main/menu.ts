/**
 * The application menu.
 *
 * Without one, Electron installs a default whose first menu is titled "Electron", which
 * is how an app ends up looking like somebody else's runtime in the menu bar. Building
 * even a minimal menu is what puts the real name there.
 *
 * It is also the only place standard editing keystrokes come from on macOS: Cmd-C and
 * Cmd-V in the console's text fields work because a menu item claims those accelerators,
 * not because the text field implements them.
 */

import { app, Menu, shell, type MenuItemConstructorOptions } from 'electron';

export interface MenuActions {
	toggleOverlay: () => void;
	showConsole: () => void;
	toggleDevTools: (which: 'console' | 'overlay') => void;
	reload: () => void;
}

export function installApplicationMenu(actions: MenuActions): void {
	const isMac = process.platform === 'darwin';

	const template: MenuItemConstructorOptions[] = [
		...(isMac
			? ([
					{
						label: app.getName(),
						submenu: [
							{ role: 'about' },
							{ type: 'separator' },
							{ role: 'services' },
							{ type: 'separator' },
							{ role: 'hide' },
							{ role: 'hideOthers' },
							{ role: 'unhide' },
							{ type: 'separator' },
							{ role: 'quit' }
						]
					}
				] as MenuItemConstructorOptions[])
			: []),
		{
			label: 'View',
			submenu: [
				{
					label: 'Toggle Overlay',
					accelerator: 'CommandOrControl+Alt+A',
					click: () => actions.toggleOverlay()
				},
				{ label: 'Console', accelerator: 'CommandOrControl+0', click: () => actions.showConsole() },
				{ type: 'separator' },
				{ role: 'resetZoom' },
				{ role: 'zoomIn' },
				{ role: 'zoomOut' }
			]
		},
		{
			// Named items rather than role: 'toggleDevTools', because that role acts on
			// the focused window and the overlay is never focused — so the transparent
			// layer, the one whose behaviour is hardest to reason about, would be the one
			// window you could not open a console on.
			label: 'Developer',
			submenu: [
				{
					label: 'JavaScript Console',
					accelerator: 'CommandOrControl+Alt+I',
					click: () => actions.toggleDevTools('console')
				},
				{
					label: 'Overlay Console',
					accelerator: 'CommandOrControl+Alt+Shift+I',
					click: () => actions.toggleDevTools('overlay')
				},
				{ type: 'separator' },
				{ label: 'Reload Window', accelerator: 'CommandOrControl+R', click: () => actions.reload() },
				{ role: 'forceReload' }
			]
		},
		{
			label: 'Edit',
			submenu: [
				{ role: 'undo' },
				{ role: 'redo' },
				{ type: 'separator' },
				{ role: 'cut' },
				{ role: 'copy' },
				{ role: 'paste' },
				{ role: 'selectAll' }
			]
		},
		{
			role: 'window',
			submenu: isMac
				? [{ role: 'minimize' }, { role: 'zoom' }, { type: 'separator' }, { role: 'front' }]
				: [{ role: 'minimize' }, { role: 'close' }]
		},
		{
			role: 'help',
			submenu: [
				{
					label: 'Screen Angel on GitHub',
					click: () =>
						void shell.openExternal(
							'https://github.com/SimHacker/MicropolisCore/tree/main/apps/screen-angel'
						)
				}
			]
		}
	];

	Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

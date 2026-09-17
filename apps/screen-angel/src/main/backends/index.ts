/**
 * Picks the backend for the machine we are on, and refuses clearly where there is none.
 *
 * Two platforms, and Linux deliberately absent. Kando carries seven Linux backends and
 * two native protocol addons to cover the X11 and Wayland split, and every capture and
 * accessibility path there needs its own portal negotiation. That is real work for the
 * smallest slice of the audience, so it waits. When it comes, it comes as a third
 * subdirectory here and two lines in this switch, which is the point of the shape.
 */

import { ScreenAngelBackend } from './backend';

export { ScreenAngelBackend };

export class UnsupportedPlatformError extends Error {
	constructor(platform: string) {
		super(
			`Screen Angel has no backend for ${platform}. Windows and macOS only for now — ` +
				`the accessibility and capture paths on Linux need their own portal work.`
		);
		this.name = 'UnsupportedPlatformError';
	}
}

export function getBackend(): ScreenAngelBackend | null {
	switch (process.platform) {
		case 'darwin': {
			const { MacosBackend } = require('./macos/backend') as typeof import('./macos/backend');
			return new MacosBackend();
		}
		case 'win32': {
			const { WindowsBackend } = require('./windows/backend') as typeof import('./windows/backend');
			return new WindowsBackend();
		}
		default:
			return null;
	}
}

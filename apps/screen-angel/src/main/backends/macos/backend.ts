import type { BackendInfo } from '@common/types';

import { ScreenAngelBackend } from '../backend';
import type { NativeAddon } from '../native-types';
import { native } from './native/index';

export class MacosBackend extends ScreenAngelBackend {
	protected readonly native: NativeAddon = native;

	public getBackendInfo(): BackendInfo {
		return {
			platform: 'darwin',
			name: 'macOS Accessibility (AXUIElement)',
			can: {
				queryTree: true,
				elementAtPoint: true,
				// Pattern subscriptions need AXObserver, which needs a run loop source
				// wired into Electron's. Not yet.
				subscribe: false,
				capture: true,
				inject: false
			}
		};
	}
}

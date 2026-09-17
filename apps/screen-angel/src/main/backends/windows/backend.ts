import type { BackendInfo } from '@common/types';

import { ScreenAngelBackend } from '../backend';
import type { NativeAddon, NativeCapture } from '../native-types';
import { native } from './native/index';

export class WindowsBackend extends ScreenAngelBackend {
	protected readonly native: NativeAddon = native;

	/**
	 * Refuse explicitly rather than calling into an addon that does not implement this
	 * yet. Without the override the call reaches `undefined` and reports that something
	 * is not a function, which sends the reader looking for a typo instead of a feature.
	 *
	 * The Windows answer is Windows.Graphics.Capture, with BitBlt or PrintWindow as the
	 * fallback for legacy windows that refuse it. See modules/soul-angel/ARCHITECTURE.yml.
	 */
	public override async capture(): Promise<NativeCapture> {
		throw new Error(
			'Screen capture is not implemented on Windows yet. The macOS backend uses ' +
				'ScreenCaptureKit; the Windows equivalent is Windows.Graphics.Capture and has ' +
				'not been written.'
		);
	}

	public getBackendInfo(): BackendInfo {
		return {
			platform: 'win32',
			name: 'Windows UI Automation',
			can: {
				queryTree: true,
				elementAtPoint: true,
				// AddAutomationEventHandler exists and is the right answer; it needs a
				// thread-safe function to get events back into JavaScript. Not yet.
				subscribe: false,
				capture: false,
				inject: false
			}
		};
	}
}

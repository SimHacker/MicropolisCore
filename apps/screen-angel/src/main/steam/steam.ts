/**
 * Steam, behind one seam.
 *
 * Steam is the first distribution channel, so it is load-bearing, and the Node bindings
 * for it are not. The state of play in September 2026:
 *
 *   steamworks.js       Rust/NAPI. The one everyone links to, and effectively dead:
 *                       last npm release 0.4.0 two years ago, 52 open issues, no
 *                       maintainer activity, and its Electron overlay support is
 *                       Windows-only. That last part is disqualifying for us, because
 *                       the Steam overlay and a transparent always-on-top window are
 *                       going to argue and we need to be able to debug the argument on
 *                       both platforms.
 *   steamworks-ffi-node Koffi FFI, so no native build step at all, which matters when
 *                       we already run cmake-js for our own addons. SDK 1.64, typed,
 *                       actively released through 2026, with experimental native
 *                       overlay support on Metal and OpenGL.
 *   steam-bridge        Prebuilt addons plus Valve's runtime libraries and a pair of
 *                       electron-builder packaging hooks, which is the nicest packaging
 *                       story of the three. Also brand new, with no dependents yet.
 *
 * None of them is safe to marry. So the app talks to this interface, one adapter
 * implements it, and swapping libraries is a one-file change rather than a refactor.
 *
 * steam-bridge is the one wired up, in bridge-adapter.ts, and steamworks-ffi-node remains
 * one environment variable away in ffi-adapter.ts. The deciding factor was not the API but
 * what ships in the box: steam-bridge carries the native addon and Valve's matching
 * library as a pair, so they cannot disagree. See STEAMWORKS.yml library_choice.
 */

import type { SteamStatus } from '@common/types';
import { createBridgeSteamAdapter } from './bridge-adapter';
import { createFfiSteamAdapter } from './ffi-adapter';

export type { SteamStatus };

export interface SteamAdapter {
	readonly implementation: string;
	init(appId: number): Promise<SteamStatus>;
	status(): SteamStatus;
	shutdown(): Promise<void>;
}

/**
 * The adapter that ships until a library is chosen. It reports honestly that Steam is
 * absent rather than pretending, which keeps every caller on the degraded path from day
 * one — the path that also has to work for people who buy the app anywhere else.
 */
class UnwiredSteamAdapter implements SteamAdapter {
	public readonly implementation = 'none (interface only)';
	private current: SteamStatus = {
		available: false,
		reason: 'No Steamworks library is wired up yet; see src/main/steam/steam.ts.'
	};

	public async init(appId: number): Promise<SteamStatus> {
		// SteamAppId in the environment is how Steam tells a process it launched it, and
		// it is worth reporting even with no library attached: it proves the app id
		// plumbing and the store page are configured before any binding is involved.
		const fromEnv = process.env.SteamAppId ?? process.env.SteamGameId;

		this.current = {
			available: false,
			reason: 'No Steamworks library is wired up yet; see src/main/steam/steam.ts.',
			appId,
			launchedBySteam: fromEnv !== undefined
		};
		return this.current;
	}

	public status(): SteamStatus {
		return this.current;
	}

	public async shutdown(): Promise<void> {}
}

/**
 * All three adapters stay reachable, by environment variable.
 *
 * steam-bridge is the default because it ships the native addon and the matching Valve
 * library as a pair, so the version skew that broke the FFI path cannot happen.
 *
 * SCREEN_ANGEL_STEAM_LIB=ffi selects steamworks-ffi-node, which needs SDK 1.64 in
 * steamworks_sdk/. Keeping it one variable away is the point of the seam: two independent
 * implementations of the same six-method interface is how a bug gets attributed to a
 * library rather than to Steam.
 *
 * SCREEN_ANGEL_NO_STEAM forces the unwired adapter, which is how the degraded path gets
 * exercised deliberately rather than only by accident on a machine without Steam. That
 * path is not a corner case: it is what everyone who buys the app anywhere else runs.
 */
export function createSteamAdapter(): SteamAdapter {
	if (process.env.SCREEN_ANGEL_NO_STEAM !== undefined) {
		return new UnwiredSteamAdapter();
	}
	if (process.env.SCREEN_ANGEL_STEAM_LIB === 'ffi') {
		return createFfiSteamAdapter();
	}
	return createBridgeSteamAdapter();
}

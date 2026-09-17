/**
 * Steam through steam-bridge.
 *
 * The reason this is the default rather than the FFI adapter has nothing to do with the
 * API, which is comparable, and everything to do with what ships in the box.
 *
 * steam-bridge carries a prebuilt native addon AND the matching Valve runtime library,
 * as a pair. Every SteamAPI_* symbol its addon imports exists in the dylib it ships —
 * checked, not assumed. That makes version skew structurally impossible, and version skew
 * is not a hypothetical: the FFI adapter works only against SDK 1.64, Valve's download
 * page serves 1.65, and 1.65 renamed SteamAPI_SteamUtils_v010 to _v011. The library
 * reports that as init() returning false, which is the same symptom as Steam not running
 * and as not owning the app — see STEAMWORKS.yml.
 *
 * It is also the more Electron-literate of the two, which matters for a transparent
 * always-on-top window that will eventually have to coexist with Steam's own overlay.
 *
 * What we give up: it is young, and it redistributes Valve binaries — including
 * libsdkencryptedappticket, which lives outside redistributable_bin and so is not covered
 * by the grant in the SDK Access Agreement. Nothing here uses it. Before shipping, the
 * bundled libraries should be replaced with the ones from the SDK we downloaded
 * ourselves, where the grant does apply.
 */

import type { SteamAdapter, SteamStatus } from './steam';

/** See ffi-adapter.ts for why 480 is the honest default rather than a placeholder. */
export { SPACEWAR_APP_ID } from './ffi-adapter';

type Application = import('steam-bridge').SteamApplication;

/**
 * Which app are we? Steam sets SteamAppId in the environment of anything it launches, and
 * that answer wins, because it is the truth about how this process actually started.
 */
function resolveAppId(requested: number): { appId: number; launchedBySteam: boolean } {
	const fromSteam = process.env.SteamAppId ?? process.env.SteamGameId;
	if (fromSteam !== undefined) {
		const parsed = Number.parseInt(fromSteam, 10);
		if (Number.isFinite(parsed) && parsed > 0) {
			return { appId: parsed, launchedBySteam: true };
		}
	}

	const override = process.env.SCREEN_ANGEL_STEAM_APPID;
	if (override !== undefined) {
		const parsed = Number.parseInt(override, 10);
		if (Number.isFinite(parsed) && parsed > 0) {
			return { appId: parsed, launchedBySteam: false };
		}
	}
	return { appId: requested, launchedBySteam: false };
}

class BridgeSteamAdapter implements SteamAdapter {
	public readonly implementation = 'steam-bridge';
	private application: Application | null = null;
	private current: SteamStatus = { available: false, reason: 'Steam has not been initialised.' };

	public async init(requestedAppId: number): Promise<SteamStatus> {
		const { appId, launchedBySteam } = resolveAppId(requestedAppId);

		// How Steam's API learns which app it is talking about when Steam did not launch
		// us. Set before the addon loads, because it reads the environment during init.
		if (!launchedBySteam) {
			process.env.SteamAppId = String(appId);
		}

		try {
			const { startSteam } = await import('steam-bridge');
			const application = startSteam({ appId });

			this.application = application;
			this.current = {
				available: true,
				appId: application.appId,
				launchedBySteam,
				steamId: String(application.localPlayer.getSteamId().steamId64),
				personaName: application.localPlayer.getName()
			};
			return this.current;
		} catch (error) {
			this.current = {
				available: false,
				appId,
				launchedBySteam,
				reason: explain(error, appId)
			};
			return this.current;
		}
	}

	public status(): SteamStatus {
		return this.current;
	}

	public async shutdown(): Promise<void> {
		if (this.application === null) {
			return;
		}
		try {
			if (!this.application.closed) {
				this.application.close();
			}
		} catch {
			// Closing a session whose client already went away is not worth reporting
			// during quit.
		}
		this.application = null;
		this.current = { available: false, reason: 'Steam was shut down.' };
	}
}

/**
 * Turn whatever came out of the addon into something a person can act on.
 *
 * This library throws rather than returning false, which is the better shape — but the
 * throw is still about a symbol or a return code, and the reader needs to know which of
 * four ordinary situations they are in.
 */
function explain(error: unknown, appId: number): string {
	const message = error instanceof Error ? error.message : String(error);

	// A packaged Electron app cannot dlopen a .node from inside the asar archive. It
	// presents as a module resolution failure at the first Steam call, long after the
	// packaging decision that caused it.
	if (/asar|MODULE_NOT_FOUND|Cannot find module/i.test(message)) {
		return (
			`Could not load the Steam addon: ${message}. If this is a packaged build, the ` +
			'native addon and Valve libraries have to sit OUTSIDE the asar archive — ' +
			'asarUnpack in the electron-builder config.'
		);
	}

	if (/dlopen|image not found|incompatible architecture|code signature/i.test(message)) {
		return (
			`Could not load the Steam addon: ${message}. Usually an architecture mismatch ` +
			`(this process is ${process.arch}) or macOS quarantine on a downloaded binary.`
		);
	}

	return (
		`Steam did not start: ${message}. In order of likelihood: the Steam client is not ` +
		`running or not signed in; this account does not own app ${appId}` +
		(appId === 480 ? ' (Spacewar is free: steam://install/480)' : '') +
		'; or the client is running as a different user.'
	);
}

export function createBridgeSteamAdapter(): SteamAdapter {
	return new BridgeSteamAdapter();
}

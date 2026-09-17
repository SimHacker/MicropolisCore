/**
 * Steam through steamworks-ffi-node.
 *
 * Chosen over the alternatives surveyed in steam.ts for one reason above the others: it
 * reaches Valve's C API through Koffi, so there is no native module to compile. We
 * already run cmake-js for our own addons on two platforms, and a second native build
 * step is a second thing that breaks on a machine we are not sitting at.
 *
 * Valve's redistributable cannot legally be bundled by an npm package, so the library
 * ships without it and every failure here is really the same failure: the SDK is not on
 * disk yet. That is why this file works hard at saying so in a sentence someone can act
 * on, instead of throwing whatever Koffi throws when a dlopen misses.
 */

import { existsSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { app } from 'electron';
import type { SteamworksSDK } from 'steamworks-ffi-node';
import type { SteamAdapter, SteamStatus } from './steam';

/**
 * Spacewar, Valve's example app, and the reason development can begin before any money
 * changes hands: any Steam account can accept the SDK Access Agreement, download the
 * SDK, and initialise against 480. The $100 Steam Direct fee buys an App ID to SHIP
 * under, and starts a 30-day clock, so it is worth paying deliberately and late rather
 * than as step one.
 */
export const SPACEWAR_APP_ID = 480;

/**
 * Where we look for `steamworks_sdk/`, in the order we look.
 *
 * The upward walk is not defensive padding. Launched as `electron out/main/index.js`,
 * app.getAppPath() is `out/main` — so a single join lands on `out/main/steamworks_sdk`,
 * a path nobody would ever put an SDK in, and the error names it with total confidence.
 * Walking up finds the app directory in development and is harmless when packaged.
 */
function sdkCandidates(): string[] {
	const candidates = [process.env.SCREEN_ANGEL_STEAM_SDK];

	let directory = app.getAppPath();
	for (let up = 0; up <= 3; up += 1) {
		candidates.push(join(directory, 'steamworks_sdk'));
		const parent = dirname(directory);
		if (parent === directory) {
			break;
		}
		directory = parent;
	}

	// A packaged build carries the SDK next to the app rather than inside the asar,
	// because Koffi has to hand a real filesystem path to dlopen.
	if (app.isPackaged) {
		candidates.push(join(process.resourcesPath, 'steamworks_sdk'));
	}
	return candidates.filter((path): path is string => path !== undefined);
}

function findSdk(): string | null {
	for (const path of sdkCandidates()) {
		try {
			if (existsSync(join(path, 'redistributable_bin')) && statSync(path).isDirectory()) {
				return path;
			}
		} catch {
			// An unreadable candidate is not a candidate. Keep looking.
		}
	}
	return null;
}

/**
 * Which app are we?
 *
 * Steam sets SteamAppId in the environment of anything it launches, and that answer wins
 * — it is the truth about how this process actually started. Everything after it is a
 * development hint.
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

/**
 * The library's own instance type, rather than a hand-written shape of the six methods we
 * call. It ships types, so borrowing them means an upgrade that moves the API fails at
 * the typecheck instead of at the first launch after shipping.
 */
type Steamworks = SteamworksSDK;

/**
 * Peel interop wrappers until something with getInstance appears.
 *
 * A CJS package reached by dynamic import arrives as the module, as module.default, or as
 * module.default.default, depending on which layer did the transpiling — and that answer
 * changes with bundler settings rather than with anything we wrote. Looking for the
 * method we need is shorter than reasoning about which of the three it is today, and it
 * keeps working when the answer changes.
 */
function findFactory(module: unknown): { getInstance(): Steamworks } {
	let candidate: unknown = module;
	for (let depth = 0; depth <= 2; depth += 1) {
		if (typeof (candidate as { getInstance?: unknown } | undefined)?.getInstance === 'function') {
			return candidate as { getInstance(): Steamworks };
		}
		candidate = (candidate as { default?: unknown } | undefined)?.default;
	}
	throw new Error('the module loaded but exposes no getInstance(), so its API has changed');
}

class FfiSteamAdapter implements SteamAdapter {
	public readonly implementation = 'steamworks-ffi-node';
	private steam: Steamworks | null = null;
	private current: SteamStatus = { available: false, reason: 'Steam has not been initialised.' };

	public async init(requestedAppId: number): Promise<SteamStatus> {
		const { appId, launchedBySteam } = resolveAppId(requestedAppId);
		const sdk = findSdk();

		if (sdk === null) {
			this.current = {
				available: false,
				appId,
				launchedBySteam,
				reason:
					'No Steamworks SDK on disk. Run tools/steam-setup.sh, which says where to get it ' +
					'and where to put it. Looked in: ' +
					sdkCandidates().join(', ')
			};
			return this.current;
		}

		try {
			const steam = findFactory(await import('steamworks-ffi-node')).getInstance();
			steam.setSdkPath(sdk);

			// Steam's own way of telling the API which app it is talking about, and the
			// reason no steam_appid.txt needs to exist in a working tree — a file that
			// would have to be gitignored, and would then be missing on every fresh
			// clone in exactly the way that wastes an afternoon.
			if (!launchedBySteam) {
				process.env.SteamAppId = String(appId);
			}

			// restartAppIfNecessary relaunches the process THROUGH Steam, which is right
			// for a shipped build and wrong twice over here: under 480 it launches
			// Spacewar instead of us, and in development it fights the terminal that
			// started us. So it is asked only when both of those are false.
			if (app.isPackaged && appId !== SPACEWAR_APP_ID && steam.restartAppIfNecessary(appId)) {
				this.current = {
					available: false,
					appId,
					launchedBySteam,
					reason: 'Relaunching through Steam.'
				};
				app.quit();
				return this.current;
			}

			if (!steam.init({ appId })) {
				// Everything that can go wrong here arrives as the same `false`, so the
				// list is ordered by how often it is the answer — with the one that looks
				// least likely and cost the most to find placed where it will be read.
				// The library prints its own detail to stdout on the way out; the app log
				// is where that lands.
				this.current = {
					available: false,
					appId,
					launchedBySteam,
					reason:
						'Steam refused to initialise, and reports only that. In order of likelihood: ' +
						'the Steam client is not running or not signed in; ' +
						`this account does not own app ${appId}` +
						(appId === SPACEWAR_APP_ID ? ' (Spacewar is free: steam://install/480)' : '') +
						'; the client is running as a different user; or the SDK on disk is a ' +
						'different version from the one the binding was built against, which fails ' +
						'as a missing SteamAPI_* symbol and looks like all of the above. ' +
						'tools/steam-setup.sh distinguishes them.'
				};
				return this.current;
			}

			this.steam = steam;

			// steamId stays unset. steamworks-ffi-node 0.11.2 documents steam.getSteamId()
			// in two JSDoc examples and declares it nowhere — the method does not exist.
			// Nothing needs it yet, so rather than reach around the library for a number no
			// caller has asked for, the field is left absent and this comment stands in
			// front of the next person who goes looking for it.
			this.current = {
				available: true,
				appId,
				launchedBySteam,
				personaName: steam.friends.getPersonaName()
			};
			return this.current;
		} catch (error) {
			// A throw from here is a load failure, not a logic error: wrong architecture,
			// missing dylib, quarantined download. The message is the only clue anyone
			// gets, so it survives rather than being flattened to 'Steam unavailable'.
			this.current = {
				available: false,
				appId,
				launchedBySteam,
				reason: `Could not load the Steamworks library from ${sdk}: ${describe(error)}`
			};
			return this.current;
		}
	}

	public status(): SteamStatus {
		return this.current;
	}

	public async shutdown(): Promise<void> {
		if (this.steam === null) {
			return;
		}
		try {
			this.steam.shutdown();
		} catch {
			// Shutting down a client that already went away is not a problem worth
			// reporting during quit.
		}
		this.steam = null;
		this.current = { available: false, reason: 'Steam was shut down.' };
	}
}

function describe(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

export function createFfiSteamAdapter(): SteamAdapter {
	return new FfiSteamAdapter();
}

/**
 * Finding and loading profile files.
 *
 * Separate from profiles.ts because that file is pure and this one touches a disk. The
 * pure half can run in the renderer and in a test; this half runs in the main process
 * and in the CLI, which is what src/node means.
 *
 * Precedence, weakest first: built-ins, then a file in the project, then the user's own
 * file, then the environment. Project before user is deliberate — a checked-in profile
 * describes the team's server, and a person overriding it locally should win.
 */

import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { parse } from 'yaml';

import {
	BUILT_IN_PROFILES,
	parseS3Url,
	ProfileError,
	resolveProfile,
	type Profile,
	type ResolvedProfile
} from '@common/profiles';

export const PROFILE_FILE_NAME = 'screen-angel.profiles.yml';

export interface ProfileFile {
	default?: string;
	profiles?: Record<string, Profile>;
}

export interface LoadOptions {
	/** Directory to look in for a project-level file. Defaults to the process cwd. */
	projectDir?: string;
	/** User-level file. Defaults to ~/.config/screen-angel/profiles.yml. */
	userFile?: string;
	env?: NodeJS.ProcessEnv;
}

export interface ProfileSet {
	profiles: Record<string, Profile>;
	defaultProfile: string;
	/** Files that were actually read, in the order applied. For a status line. */
	sources: string[];
}

export function userProfilePath(): string {
	const base =
		process.env.XDG_CONFIG_HOME ??
		(process.platform === 'win32'
			? (process.env.APPDATA ?? join(homedir(), 'AppData', 'Roaming'))
			: join(homedir(), '.config'));

	return join(base, 'screen-angel', 'profiles.yml');
}

export async function loadProfiles(options: LoadOptions = {}): Promise<ProfileSet> {
	const env = options.env ?? process.env;
	const candidates = [
		join(options.projectDir ?? process.cwd(), PROFILE_FILE_NAME),
		options.userFile ?? userProfilePath()
	];

	const profiles: Record<string, Profile> = { ...BUILT_IN_PROFILES };
	const sources: string[] = [];
	let defaultProfile = 'local';

	for (const path of candidates) {
		const file = await readProfileFile(path);
		if (file === null) {
			continue;
		}

		sources.push(path);
		for (const [name, profile] of Object.entries(file.profiles ?? {})) {
			// Replace rather than merge. A profile that half-inherits from a file the reader
			// has not opened is a profile nobody can predict; extends is the way to build on
			// another one, and it is visible in the text.
			profiles[name] = profile;
		}

		if (typeof file.default === 'string') {
			defaultProfile = file.default;
		}
	}

	const fromEnv = env.SCREEN_ANGEL_PROFILE;
	if (typeof fromEnv === 'string' && fromEnv.length > 0) {
		defaultProfile = fromEnv;
	}

	return { profiles, defaultProfile, sources };
}

async function readProfileFile(path: string): Promise<ProfileFile | null> {
	let text: string;

	try {
		text = await readFile(path, 'utf8');
	} catch (error) {
		// Absent is the normal case and says nothing. Present but unreadable is a real
		// problem and should not be swallowed alongside it.
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
			return null;
		}
		throw new ProfileError(`cannot read ${path}: ${(error as Error).message}`);
	}

	let parsed: unknown;
	try {
		parsed = parse(text);
	} catch (error) {
		throw new ProfileError(`${path} is not valid YAML: ${(error as Error).message}`);
	}

	if (parsed === null || typeof parsed !== 'object') {
		throw new ProfileError(`${path} should contain a mapping with a "profiles" key`);
	}

	return parsed as ProfileFile;
}

export interface SelectOptions extends LoadOptions {
	/** Profile name. Falls back to the file's default, then to the built-in 'local'. */
	name?: string;
	/** s3:// URL overriding the profile's bucket and prefix. */
	s3Url?: string;
	/** Chunk length override, in seconds. */
	durationSec?: number;
}

/**
 * Load, pick, and apply command-line overrides in one call, so that every caller
 * resolves a profile the same way and a flag means the same thing everywhere.
 */
export async function selectProfile(
	options: SelectOptions = {}
): Promise<{ profile: ResolvedProfile; sources: string[] }> {
	const set = await loadProfiles(options);
	const name = options.name ?? set.defaultProfile;
	const profile = resolveProfile(name, set.profiles);

	if (options.s3Url !== undefined) {
		const { bucket, prefix } = parseS3Url(options.s3Url);
		profile.s3 = { ...(profile.s3 ?? {}), bucket, prefix };
	}

	if (options.durationSec !== undefined) {
		profile.chunk = { ...profile.chunk, durationSec: options.durationSec };
	}

	return { profile, sources: set.sources };
}

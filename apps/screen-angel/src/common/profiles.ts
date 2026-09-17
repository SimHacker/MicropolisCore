/**
 * Named capture profiles.
 *
 * A profile is one answer to "where does the video go, how long is a chunk, and how
 * hard do we squeeze it". Naming those answers means the interesting settings get
 * written down once and referred to by name, and it means the difference between a
 * demo and a real deployment is a word on a command line rather than six flags.
 *
 * The one rule this file enforces: a profile names a credential, it never contains one.
 * Profiles are meant to be committed and shared; secrets are not. See resolveSecret.
 */

export interface S3Target {
	/**
	 * Host of an S3-compatible server. Omit for real AWS S3, where the region decides
	 * the endpoint. Set it for MinIO, Ceph, SeaweedFS, or anything else on-premises.
	 */
	endpoint?: string;
	port?: number;
	/** Off only for plaintext development servers, and it should look uncomfortable. */
	tls?: boolean;
	region?: string;
	bucket: string;
	/** Key prefix. Chunk names are appended to this. */
	prefix?: string;
	/**
	 * Path style addresses the bucket as endpoint/bucket/key instead of bucket.endpoint,
	 * which is what nearly every self-hosted server wants and what AWS deprecated.
	 * Defaults to true whenever an endpoint is set, because that is the case where it
	 * matters and getting it wrong produces a DNS error rather than a useful message.
	 */
	forcePathStyle?: boolean;
	/**
	 * Where the keys come from, as a reference: 'env:NAME' reads NAME_ACCESS_KEY_ID and
	 * NAME_SECRET_ACCESS_KEY, 'aws:profilename' defers to the AWS credential chain,
	 * 'anonymous' sends none. A literal key here is a committed key.
	 */
	credentials?: string;
}

export interface ChunkSettings {
	/**
	 * Seconds of video per uploaded file. Sixty is the default because it is the
	 * batch-friendly size: few enough files to be cheap, short enough that a session
	 * becomes analyzable within a minute of ending.
	 *
	 * Shorter is the interesting direction. Ten seconds is a conversation-latency loop;
	 * one second is closer to live, at the cost of one upload per second and a
	 * per-chunk encoder flush that shows up in the bitrate.
	 */
	durationSec: number;
	/** Cut chunks on wall-clock boundaries, so files from parallel sources line up. */
	alignToClock?: boolean;
	/**
	 * Repeat the tail of each chunk at the head of the next. Motion that straddles a
	 * boundary is otherwise split across two files and can be missed by both.
	 */
	overlapSec?: number;
}

export interface VideoSettings {
	container: 'mp4' | 'mkv' | 'ts';
	codec: 'h264' | 'hevc' | 'vp9' | 'av1';
	/** Kilobits per second, or 'crf' to let quality float and size vary. */
	bitrateKbps?: number;
	crf?: number;
	fps: number;
	/** Longest edge in pixels; aspect ratio is preserved. Omit for native resolution. */
	maxDimension?: number;
	/**
	 * Keyframe interval in frames. It must divide the chunk length evenly or chunks
	 * cannot be cut without re-encoding, which is why short chunks force it down.
	 */
	keyframeInterval?: number;
	/** Prefer the platform hardware encoder; fall back to software rather than fail. */
	hardware?: boolean;
	audio?: boolean;
}

/**
 * How chunk object keys are laid out.
 *
 * Not a cosmetic choice: a consumer that watches a bucket recognizes its own layout and
 * ignores everything else, so getting this wrong means uploads that succeed and are
 * never processed. Leela's shapes below are taken from its ingest code rather than from
 * its docs, which disagree.
 */
export type KeyLayout = 'sortable' | 'leela-edgebox' | 'leela-cloud';

export interface Profile {
	/** Inherit from another profile and override pieces of it. */
	extends?: string;
	description?: string;
	chunk?: Partial<ChunkSettings>;
	video?: Partial<VideoSettings>;
	s3?: Partial<S3Target> & { bucket?: string };
	/**
	 * What this screen presents itself as to the consumer.
	 *
	 * Leela's pipeline is organized around cameras, and a screen is a camera — it is a
	 * thing pointed at activity, producing timestamped clips. Adopting its noun rather
	 * than inventing one means no mapping layer and no explaining.
	 */
	camera?: string;
	layout?: KeyLayout;
	/** Write a metadata sidecar next to each chunk. Required by Leela's ingest. */
	sidecar?: boolean;
	/** Also keep chunks on disk. Useful when the upload is the part being debugged. */
	keepLocal?: boolean;
}

export interface ResolvedProfile {
	name: string;
	description?: string;
	chunk: ChunkSettings;
	video: VideoSettings;
	s3: S3Target | null;
	camera: string;
	layout: KeyLayout;
	sidecar: boolean;
	keepLocal: boolean;
}

export const DEFAULT_CHUNK: ChunkSettings = {
	durationSec: 60,
	alignToClock: true,
	overlapSec: 0
};

export const DEFAULT_VIDEO: VideoSettings = {
	container: 'mp4',
	codec: 'h264',
	crf: 23,
	fps: 30,
	maxDimension: 1920,
	keyframeInterval: 60,
	hardware: true,
	audio: false
};

/**
 * Profiles that ship with the app. They exist to be inherited from and to make the
 * shape obvious, and the three of them are the three real operating points.
 */
export const BUILT_IN_PROFILES: Record<string, Profile> = {
	local: {
		description: 'One-minute chunks to disk only. No server, no credentials, no network.',
		keepLocal: true
	},

	batch: {
		description: 'One-minute chunks to an S3 bucket. The default shape for analysis.',
		chunk: { durationSec: 60 },
		s3: { credentials: 'env:SCREEN_ANGEL_S3' }
	},

	realtime: {
		extends: 'batch',
		description: 'One-second chunks for live operation. Costs one upload per second.',
		chunk: { durationSec: 1, alignToClock: true },
		// A keyframe every frame: at one second per chunk every chunk must open with one,
		// and anything longer cannot be cut on the boundary.
		video: { keyframeInterval: 1, crf: 26 }
	},

	/**
	 * Leela's edgebox import path. The shallowest way in: an S3 PUT of a canonical mp4,
	 * which the edgebox conductor picks up by Postgres NOTIFY and moves into its own time
	 * tree. No GCS, no service-account key, no Pub/Sub payload to construct.
	 */
	leela: {
		description: 'One-minute mp4 chunks to a Leela edgebox over S3. The shallowest way in.',
		chunk: { durationSec: 60, alignToClock: true },
		video: { container: 'mp4', codec: 'h264', fps: 10, maxDimension: 1280, keyframeInterval: 30 },
		s3: { prefix: 'import', credentials: 'env:LEELA_S3', forcePathStyle: true },
		layout: 'leela-edgebox',
		sidecar: true
	},

	'leela-realtime': {
		extends: 'leela',
		description: 'Ten-second chunks to a Leela edgebox. Conversation-latency analytics.',
		chunk: { durationSec: 10 },
		video: { keyframeInterval: 10 }
	}
};

export class ProfileError extends Error {}

/**
 * Flatten an extends chain and fill in defaults.
 *
 * Merging is per-section rather than deep, so a profile that sets one video field
 * inherits the rest of the parent's video settings instead of resetting them.
 */
export function resolveProfile(
	name: string,
	profiles: Record<string, Profile>
): ResolvedProfile {
	const chain: Profile[] = [];
	const seen = new Set<string>();
	let current: string | undefined = name;

	while (current !== undefined) {
		if (seen.has(current)) {
			throw new ProfileError(
				`profile "${name}" has a circular extends chain through "${current}"`
			);
		}
		seen.add(current);

		// Annotated rather than inferred: `current` is reassigned from this value's own
		// `extends` field, and inference chases its own tail through the loop.
		const profile: Profile | undefined = profiles[current];
		if (profile === undefined) {
			const known = Object.keys(profiles).sort().join(', ');
			throw new ProfileError(`no such profile: "${current}" (known: ${known})`);
		}

		chain.unshift(profile);
		current = profile.extends;
	}

	const merged = chain.reduce<Profile>(
		(accumulator, profile) => ({
			description: profile.description ?? accumulator.description,
			chunk: { ...accumulator.chunk, ...profile.chunk },
			video: { ...accumulator.video, ...profile.video },
			s3: { ...accumulator.s3, ...profile.s3 },
			camera: profile.camera ?? accumulator.camera,
			layout: profile.layout ?? accumulator.layout,
			sidecar: profile.sidecar ?? accumulator.sidecar,
			keepLocal: profile.keepLocal ?? accumulator.keepLocal
		}),
		{}
	);

	const chunk: ChunkSettings = { ...DEFAULT_CHUNK, ...merged.chunk };
	const video: VideoSettings = { ...DEFAULT_VIDEO, ...merged.video };

	const s3 = merged.s3 ?? {};
	const target: S3Target | null =
		typeof s3.bucket === 'string' && s3.bucket.length > 0
			? {
					...s3,
					bucket: s3.bucket,
					tls: s3.tls ?? true,
					forcePathStyle: s3.forcePathStyle ?? s3.endpoint !== undefined
				}
			: null;

	const resolved: ResolvedProfile = {
		name,
		description: merged.description,
		chunk,
		video,
		s3: target,
		camera: merged.camera ?? 'screen',
		layout: merged.layout ?? 'sortable',
		sidecar: merged.sidecar ?? false,
		keepLocal: merged.keepLocal ?? target === null
	};

	validateProfile(resolved);
	return resolved;
}

/**
 * Catch the combinations that produce unplayable files or silent stalls, and say which
 * two settings disagree rather than which one is invalid.
 */
export function validateProfile(profile: ResolvedProfile): void {
	const { chunk, video } = profile;

	if (!(chunk.durationSec > 0)) {
		throw new ProfileError(`chunk.durationSec must be positive, got ${chunk.durationSec}`);
	}

	if (!(video.fps > 0)) {
		throw new ProfileError(`video.fps must be positive, got ${video.fps}`);
	}

	if (video.bitrateKbps !== undefined && video.crf !== undefined) {
		throw new ProfileError(
			'video.bitrateKbps and video.crf both set; pick a target size or a target quality'
		);
	}

	const framesPerChunk = chunk.durationSec * video.fps;
	const interval = video.keyframeInterval;

	if (interval !== undefined && interval > framesPerChunk) {
		throw new ProfileError(
			`video.keyframeInterval (${interval}) exceeds the ${framesPerChunk} frames in a ` +
				`${chunk.durationSec}s chunk at ${video.fps}fps, so no chunk can start on a ` +
				'keyframe. Lower the interval or lengthen the chunk.'
		);
	}

	if ((chunk.overlapSec ?? 0) >= chunk.durationSec) {
		throw new ProfileError(
			`chunk.overlapSec (${chunk.overlapSec}) must be less than chunk.durationSec ` +
				`(${chunk.durationSec})`
		);
	}

	if (profile.s3 !== null && profile.s3.tls === false && profile.s3.endpoint === undefined) {
		throw new ProfileError('s3.tls is off with no endpoint set; refusing plaintext to AWS');
	}
}

/**
 * Accept an s3:// URL as a shorthand for the bucket and prefix, because that is the form
 * people already have in a clipboard. Everything else stays in the profile.
 *
 * s3://bucket/some/prefix -> { bucket: 'bucket', prefix: 'some/prefix' }
 */
export function parseS3Url(url: string): { bucket: string; prefix?: string } {
	const match = /^s3:\/\/([^/]+)(?:\/(.*))?$/.exec(url.trim());
	if (match === null) {
		throw new ProfileError(`not an s3:// URL: "${url}"`);
	}

	const prefix = match[2]?.replace(/\/+$/, '');
	return { bucket: match[1], prefix: prefix !== undefined && prefix.length > 0 ? prefix : undefined };
}

/** The endpoint an S3 client should be pointed at, or undefined to let it decide. */
export function endpointUrl(target: S3Target): string | undefined {
	if (target.endpoint === undefined) {
		return undefined;
	}

	const scheme = target.tls === false ? 'http' : 'https';
	const port = target.port !== undefined ? `:${target.port}` : '';
	return `${scheme}://${target.endpoint}${port}`;
}

export interface S3Credentials {
	accessKeyId: string;
	secretAccessKey: string;
	sessionToken?: string;
}

/**
 * Turn a credential reference into actual keys, at the moment of use.
 *
 * Returning null is a valid outcome twice over: 'anonymous' means send nothing, and
 * 'aws:...' means the S3 client should run its own credential chain, which already
 * knows about instance roles and SSO in ways this function should not duplicate.
 */
export function resolveSecret(
	reference: string | undefined,
	env: NodeJS.ProcessEnv = process.env
): S3Credentials | null {
	if (reference === undefined || reference === 'anonymous') {
		return null;
	}

	if (reference.startsWith('aws:') || reference === 'aws') {
		return null;
	}

	if (reference.startsWith('env:')) {
		const name = reference.slice('env:'.length);
		const accessKeyId = env[`${name}_ACCESS_KEY_ID`];
		const secretAccessKey = env[`${name}_SECRET_ACCESS_KEY`];

		if (accessKeyId === undefined || secretAccessKey === undefined) {
			throw new ProfileError(
				`credentials "${reference}" need ${name}_ACCESS_KEY_ID and ` +
					`${name}_SECRET_ACCESS_KEY in the environment`
			);
		}

		return { accessKeyId, secretAccessKey, sessionToken: env[`${name}_SESSION_TOKEN`] };
	}

	throw new ProfileError(
		`unrecognized credential reference "${reference}"; use env:NAME, aws:PROFILE, or ` +
			'anonymous. Keys do not belong in a profile file.'
	);
}

/**
 * The timestamp that names a chunk: ISO-8601 UTC, with underscores in the time.
 *
 * Colons are what Leela's canonical form uses, and its filename parser accepts
 * underscores as well. Underscores are what we emit, because a colon is not a legal
 * character in a Windows filename and chunks are written to local disk before they are
 * uploaded. Choosing the form that survives both places costs nothing.
 */
export function chunkTimestamp(startedAt: Date): string {
	return startedAt.toISOString().replace(/:/g, '_');
}

/**
 * Object key for one chunk.
 *
 * Three layouts, because the consumer decides this and there is more than one consumer.
 * The Leela shapes are taken from its ingest code, not its documentation — its pipeline
 * README describes a third path that the deployed cloud function does not implement.
 */
export function chunkKey(options: {
	layout: KeyLayout;
	prefix?: string;
	camera: string;
	sequence: number;
	startedAt: Date;
	container: string;
}): string {
	const prefix = options.prefix?.replace(/^\/+|\/+$/g, '');
	const stamp = chunkTimestamp(options.startedAt);
	const iso = options.startedAt.toISOString();
	const file = `${stamp}.${options.container}`;

	const join = (...parts: (string | undefined)[]): string =>
		parts.filter((part): part is string => part !== undefined && part.length > 0).join('/');

	switch (options.layout) {
		case 'leela-edgebox':
			// import/cameras/{camera}/{timestamp}.mp4 — the edgebox conductor watches this
			// prefix and moves what lands into its own time tree, so we must NOT pre-sort
			// into date directories here.
			return join(prefix, 'cameras', options.camera, file);

		case 'leela-cloud':
			// videos/cameras/{camera}/{YYYY-MM-DD}/{HH}/{timestamp}.mp4 — the canonical
			// storage layout. Writing straight here bypasses the upload-and-remux function,
			// which also means nothing publishes the pipeline-run message on our behalf.
			return join(
				prefix ?? 'videos',
				'cameras',
				options.camera,
				iso.slice(0, 10),
				iso.slice(11, 13),
				file
			);

		case 'sortable':
		default:
			// Our own default, for a bucket nobody else has opinions about. Lexicographic
			// order equals time order, the date directory keeps any single listing small,
			// and the sequence number is the tiebreak when two chunks share a second —
			// which is exactly what happens in one-second mode.
			return join(
				prefix,
				iso.slice(0, 10),
				options.camera,
				`${stamp}-${String(options.sequence).padStart(6, '0')}.${options.container}`
			);
	}
}

/**
 * The sidecar Leela's ingest reads: `<basename>-metadata.json` beside the clip.
 *
 * Field names follow the canonical video-manifest schema, which requires startTime as
 * ISO-8601 UTC. Leela's own TypeScript uploader still writes an older shape with
 * `start: "0"` and no startTime; its pipeline rebuilds the manifest from ffprobe during
 * the prepare phase regardless, so emitting the canonical form is both correct and
 * forward-looking.
 */
export interface VideoManifest {
	width: number;
	height: number;
	frameRate: number;
	totalFrameCount: number;
	duration: number;
	startTime: string;
	codec?: string;
	size?: number;
	meta?: {
		source?: string;
		filePath?: string;
		sourceFile?: string;
	};
}

export function videoManifest(options: {
	profile: ResolvedProfile;
	/**
	 * Passed explicitly rather than read off the profile, because a recording session may
	 * override it and chunkKey takes it the same way. Reading the camera from two
	 * different places is how a manifest ends up describing a different camera than the
	 * key it sits beside.
	 */
	camera: string;
	startedAt: Date;
	durationSec: number;
	width: number;
	height: number;
	byteLength: number;
	key: string;
}): VideoManifest {
	const { video } = options.profile;

	return {
		width: options.width,
		height: options.height,
		frameRate: video.fps,
		totalFrameCount: Math.round(options.durationSec * video.fps),
		duration: options.durationSec,
		startTime: options.startedAt.toISOString(),
		codec: video.codec,
		size: options.byteLength,
		meta: {
			source: options.camera,
			filePath: options.key
		}
	};
}

/** `<basename>-metadata.json` for a chunk key, per Leela's sidecar naming convention. */
export function sidecarKey(chunkKeyValue: string): string {
	return `${chunkKeyValue.replace(/\.[^./]+$/, '')}-metadata.json`;
}

/**
 * Where captured bytes live, and who deletes them.
 *
 * The whole file follows one rule from PROTOCOL.yml images.lifetime:
 *
 *   WHOEVER NAMES THE LOCATION OWNS THE LIFETIME.
 *
 * If we chose the path, we reap it. If the caller passed a directory, we write there and
 * never touch it again. Ownership is recorded on every entry and reported in every
 * descriptor, because a path handed over without a stated lifetime is a trap: the holder
 * cannot tell a stable file from one about to vanish.
 */

import { createHash, randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { ImageFormat } from '@common/protocol';

export type Owner = 'ours' | 'caller';

export interface StoredImage {
	id: string;
	path: string;
	owner: Owner;
	format: ImageFormat;
	bytes: number;
	width: number;
	height: number;
	scale: number;
	/**
	 * Over the encoded bytes, not the pixels — a pixel hash would serve a PNG to a
	 * caller who asked for JPEG because the two happen to share an image.
	 */
	sha256: string;
	createdAt: number;
	/** Absent for caller-owned files, which have no expiry because we do not reap them. */
	expiresAt?: number;
	/** Pinned entries survive the reaper. Handing out a resource link sets this. */
	pinned: boolean;
}

export interface StoreLimits {
	maxAgeMs: number;
	maxBytes: number;
	maxCount: number;
	/**
	 * Pinned entries are exempt from the reaper, so without a separate ceiling a long
	 * agent session accumulates every screenshot it ever took.
	 */
	maxPinnedBytes: number;
}

export const DEFAULT_LIMITS: StoreLimits = {
	maxAgeMs: 30 * 60 * 1000,
	maxBytes: 512 * 1024 * 1024,
	maxCount: 500,
	maxPinnedBytes: 256 * 1024 * 1024
};

export class ImageStore {
	private readonly entries = new Map<string, StoredImage>();
	private readonly runDirectory: string;
	private readonly inFlight = new Set<string>();

	public constructor(
		private readonly root: string,
		private readonly limits: StoreLimits = DEFAULT_LIMITS
	) {
		// Named for the process, so a later run can tell our files from a dead run's.
		this.runDirectory = join(root, `run-${process.pid}`);
	}

	public async init(): Promise<void> {
		await mkdir(this.runDirectory, { recursive: true });
		await this.sweepDeadRuns();

		// On a timer as well as after each put, because otherwise an agent that grabs
		// fifty images and then stops leaves all fifty on disk until the app quits. The
		// expiry we reported in those descriptors would be a statement about nothing.
		this.timer = setInterval(() => {
			void this.reap();
		}, Math.min(this.limits.maxAgeMs, 5 * 60 * 1000));
		// Do not hold the process open on account of a cache.
		this.timer.unref();
	}

	private timer: NodeJS.Timeout | null = null;

	/**
	 * Remove the cache directories of runs that are no longer alive.
	 *
	 * This is the only thing that cleans up after a crash, which is exactly the case
	 * where nobody is watching and the cache would otherwise grow forever. Liveness is
	 * tested with signal 0, which checks for the process without touching it.
	 *
	 * Age is the second test, and it is there because the first one can be wrong. Process
	 * ids are recycled, so a long-uptime machine can hand our dead run's number to some
	 * unrelated process, and from then on every startup sees a live pid and spares the
	 * directory — forever, in the one situation where nothing else will ever clean it.
	 * A directory nothing has written to in a day is not in use by anybody.
	 */
	private async sweepDeadRuns(): Promise<void> {
		let names: string[];
		try {
			names = await readdir(this.root);
		} catch {
			return;
		}

		for (const name of names) {
			const match = /^run-(\d+)$/.exec(name);
			if (match === null) {
				continue;
			}
			const pid = Number(match[1]);
			if (pid === process.pid) {
				continue;
			}

			const path = join(this.root, name);
			const why = isAlive(pid) ? ((await isStale(path)) ? 'stale' : null) : 'dead';
			if (why === null) {
				continue;
			}

			await rm(path, { recursive: true, force: true }).catch(() => undefined);
			console.log(`[capture] removed cache from ${why} run ${pid}`);
		}
	}

	/**
	 * Write bytes and record who owns them.
	 *
	 * A caller-supplied directory must already exist. Creating one guesses at both intent
	 * and permissions, and a typo would silently produce a directory rather than an error.
	 */
	public async put(
		data: Buffer,
		meta: { format: ImageFormat; width: number; height: number; scale: number },
		callerDirectory?: string
	): Promise<StoredImage> {
		const id = `cap_${randomBytes(8).toString('hex')}`;
		const owner: Owner = callerDirectory === undefined ? 'ours' : 'caller';

		if (callerDirectory !== undefined) {
			const info = await stat(callerDirectory).catch(() => null);
			if (info === null) {
				throw new Error(`No such directory: ${callerDirectory}`);
			}
			if (!info.isDirectory()) {
				throw new Error(`Not a directory: ${callerDirectory}`);
			}
		}

		const directory = callerDirectory ?? this.runDirectory;
		const path = join(directory, `${id}.${meta.format}`);
		await writeFile(path, data);

		const now = Date.now();
		const entry: StoredImage = {
			id,
			path,
			owner,
			format: meta.format,
			bytes: data.byteLength,
			width: meta.width,
			height: meta.height,
			scale: meta.scale,
			sha256: createHash('sha256').update(data).digest('hex'),
			createdAt: now,
			expiresAt: owner === 'ours' ? now + this.limits.maxAgeMs : undefined,
			pinned: false
		};

		this.entries.set(id, entry);
		await this.reap();
		return entry;
	}

	public get(id: string): StoredImage | undefined {
		return this.entries.get(id);
	}

	/**
	 * Why an id is not readable, in words the caller can act on.
	 *
	 * "Reaped at 14:02" tells them to grab again; a bare not-found leaves them unable to
	 * tell a stale id from a wrong one.
	 */
	public explainMissing(id: string): string {
		const reaped = this.reapedAt.get(id);
		if (reaped !== undefined) {
			return `Capture ${id} was reaped at ${new Date(reaped).toISOString()}. Grab again.`;
		}
		return `No capture with id ${id}.`;
	}

	private readonly reapedAt = new Map<string, number>();

	/** Exempt from reaping until released. Handing out a resource link implies this. */
	public pin(id: string): StoredImage | undefined {
		const entry = this.entries.get(id);
		if (entry !== undefined) {
			entry.pinned = true;
			entry.expiresAt = undefined;
		}
		return entry;
	}

	public async release(id: string): Promise<void> {
		const entry = this.entries.get(id);
		if (entry === undefined) {
			return;
		}
		entry.pinned = false;
		await this.forget(entry);
	}

	/** Hold a file open across a fetch, so the reaper cannot delete it mid-read. */
	public async borrow<T>(id: string, read: (entry: StoredImage) => Promise<T>): Promise<T> {
		const entry = this.entries.get(id);
		if (entry === undefined) {
			throw new Error(this.explainMissing(id));
		}
		this.inFlight.add(id);
		try {
			return await read(entry);
		} finally {
			this.inFlight.delete(id);
		}
	}

	/**
	 * Age, then total bytes, then count. Oldest first within each pass.
	 *
	 * Caller-owned entries are dropped from the index but never deleted from disk: we
	 * stop tracking them, which is the most we are entitled to do to somebody else's file.
	 */
	public async reap(now = Date.now()): Promise<void> {
		const ours = [...this.entries.values()].filter((entry) => entry.owner === 'ours');
		const reapable = ours
			.filter((entry) => !entry.pinned && !this.inFlight.has(entry.id))
			.sort((a, b) => a.createdAt - b.createdAt);

		for (const entry of reapable) {
			if (entry.expiresAt !== undefined && entry.expiresAt <= now) {
				await this.forget(entry);
			}
		}

		await this.trim(
			() => sum(this.live('ours', false), (e) => e.bytes) > this.limits.maxBytes,
			this.live('ours', false)
		);
		await this.trim(() => this.live('ours', false).length > this.limits.maxCount, this.live('ours', false));

		// Pinned entries answer to their own ceiling, since the reaper above skips them.
		await this.trim(
			() => sum(this.live('ours', true), (e) => e.bytes) > this.limits.maxPinnedBytes,
			this.live('ours', true),
			'pinned'
		);
	}

	private live(owner: Owner, pinned: boolean): StoredImage[] {
		return [...this.entries.values()]
			.filter((e) => e.owner === owner && e.pinned === pinned && !this.inFlight.has(e.id))
			.sort((a, b) => a.createdAt - b.createdAt);
	}

	private async trim(
		overLimit: () => boolean,
		candidates: StoredImage[],
		what = 'cached'
	): Promise<void> {
		let removed = 0;
		for (const entry of candidates) {
			if (!overLimit()) {
				break;
			}
			await this.forget(entry);
			removed += 1;
		}
		if (removed > 0) {
			console.log(`[capture] evicted ${removed} ${what} image(s) to stay under the limit`);
		}
	}

	private async forget(entry: StoredImage): Promise<void> {
		this.entries.delete(entry.id);
		this.reapedAt.set(entry.id, Date.now());
		if (entry.owner === 'ours') {
			await rm(entry.path, { force: true }).catch(() => undefined);
		}
	}

	/** Everything this run wrote, at exit. Caller-owned files are left alone. */
	public async shutdown(): Promise<void> {
		if (this.timer !== null) {
			clearInterval(this.timer);
			this.timer = null;
		}
		if (existsSync(this.runDirectory)) {
			await rm(this.runDirectory, { recursive: true, force: true }).catch(() => undefined);
		}
		this.entries.clear();
	}
}

const STALE_AFTER_MS = 24 * 60 * 60 * 1000;

/** Nothing written here in a day, so whatever holds this pid now is not us. */
async function isStale(path: string): Promise<boolean> {
	const info = await stat(path).catch(() => null);
	return info !== null && Date.now() - info.mtimeMs > STALE_AFTER_MS;
}

function isAlive(pid: number): boolean {
	try {
		process.kill(pid, 0);
		return true;
	} catch (error) {
		// EPERM means it exists and belongs to somebody else, which still counts as alive.
		return (error as NodeJS.ErrnoException).code === 'EPERM';
	}
}

function sum<T>(items: T[], of: (item: T) => number): number {
	return items.reduce((total, item) => total + of(item), 0);
}

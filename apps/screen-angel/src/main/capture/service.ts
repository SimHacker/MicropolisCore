/**
 * capture.grab, end to end.
 *
 * Resolve a target to a rectangle, ask the platform for bytes, store them under the
 * lifetime rules, and answer with a descriptor rather than an image. The last part is
 * the one that matters: a caller who only wanted to know how big something is, or
 * whether it changed, never pays for the pixels. Fetching them is a second request over
 * whichever transport that particular connection can actually use.
 */

import { readFile } from 'node:fs/promises';

import type {
	GrabParams,
	GrabResult,
	ImageFormat,
	ImageTransport
} from '@common/protocol';
import type { Rect } from '@common/types';

import type { ScreenAngelBackend } from '../backends/backend';
import { ImageStore, type StoredImage } from './store';
import { resolveTarget, type TargetContext } from './targets';

/** What a model should get by default. Bigger buys detail it cannot use. */
const FIT_EDGE = 1024;

/**
 * A deeper walk than a plain query gets, because this one has a different shape.
 *
 * A query returns everything it found and a truncated flag, so a small budget costs the
 * caller a partial answer. Resolving a capture target is looking for one specific node,
 * where a small budget costs the whole operation — and the caller is already waiting on
 * a screenshot, so a few hundred more milliseconds of walking is the cheap side of the
 * trade.
 */
const RESOLVE_BUDGET = { maxDepth: 60, maxNodes: 20000 };

export interface GrabExtras {
	/** Where to write, taking over the lifetime. Local callers only. */
	dir?: string;
	/** Restrict element and selector resolution to one process. */
	pid?: number;
	/** Override the resolution budget when even RESOLVE_BUDGET is not enough. */
	maxDepth?: number;
	maxNodes?: number;
}

export class CaptureService {
	public constructor(
		private readonly store: ImageStore,
		private readonly backend: () => ScreenAngelBackend,
		private readonly context: TargetContext
	) {}

	public async grab(
		params: GrabParams,
		transports: ImageTransport[],
		extras: GrabExtras = {}
	): Promise<GrabResult> {
		if (params.marks !== undefined) {
			throw new Error(
				'Marks are not implemented yet. Query for the elements and use overlay.highlight, ' +
					'then grab.'
			);
		}
		if (params.layout === 'sheet') {
			throw new Error('Contact-sheet layout is not implemented yet. Grab one target at a time.');
		}

		const resolved = await resolveTarget(params.target, this.context, {
			region: params.region,
			pad: params.pad,
			query: {
				pid: extras.pid,
				maxDepth: extras.maxDepth ?? RESOLVE_BUDGET.maxDepth,
				maxNodes: extras.maxNodes ?? RESOLVE_BUDGET.maxNodes
			}
		});

		const chosen = chooseFormat(params, resolved.windowId !== undefined, params.target);
		const capture = await this.backend().capture({
			rect: resolved.rect,
			windowId: resolved.windowId,
			maxEdge: maxEdge(params.size),
			format: chosen.format,
			quality: params.quality === undefined ? undefined : params.quality / 100
		});

		const stored = await this.store.put(
			capture.data,
			{
				format: capture.format,
				width: capture.width,
				height: capture.height,
				scale: capture.scale
			},
			extras.dir
		);

		const allowed = transportsFor(stored, transports);
		return {
			...describe(stored, allowed),
			formatReason: chosen.reason,
			element: resolved.element
		};
	}

	/**
	 * The bytes, base64, for callers whose transport leaves no other option.
	 *
	 * Borrowed rather than read directly so the reaper cannot delete the file between
	 * the descriptor and the fetch — the one race this design actually has, because the
	 * two halves of getting an image are two round trips by design.
	 */
	public async fetchBase64(id: string): Promise<{ format: ImageFormat; data: string }> {
		return this.store.borrow(id, async (entry) => ({
			format: entry.format,
			data: (await readFile(entry.path)).toString('base64')
		}));
	}

	public async fetchBytes(id: string): Promise<{ entry: StoredImage; data: Buffer }> {
		return this.store.borrow(id, async (entry) => ({ entry, data: await readFile(entry.path) }));
	}

	/** Exempt from the reaper until released. Handing out a resource link implies this. */
	public pin(id: string): GrabResult {
		const entry = this.store.pin(id);
		if (entry === undefined) {
			throw new Error(this.store.explainMissing(id));
		}
		return describe(entry, transportsFor(entry, ['file', 'base64']));
	}

	public async release(id: string): Promise<void> {
		await this.store.release(id);
	}
}

function describe(entry: StoredImage, transports: ImageTransport[]): GrabResult {
	return {
		id: entry.id,
		width: entry.width,
		height: entry.height,
		format: entry.format,
		byteLength: entry.bytes,
		sha256: entry.sha256,
		scaleFactor: entry.scale,
		capturedAt: new Date(entry.createdAt).toISOString(),
		transports,
		path: transports.includes('file') ? entry.path : undefined,
		owner: entry.owner,
		expiresAt: entry.expiresAt === undefined ? undefined : new Date(entry.expiresAt).toISOString()
	};
}

/**
 * Which transports apply to these particular bytes.
 *
 * The connection says what it can accept and the listener decides what it may have; the
 * intersection is further narrowed here by what is true of this image. A caller-owned
 * file is always offered as a path, because the caller named the directory and already
 * knows where it is — withholding it would be theatre.
 */
function transportsFor(entry: StoredImage, connection: ImageTransport[]): ImageTransport[] {
	const allowed = connection.filter((transport) => transport !== 'url');
	if (entry.owner === 'caller' && !allowed.includes('file')) {
		return ['file', ...allowed];
	}
	return allowed;
}

/**
 * PNG for interfaces, JPEG for photographic frames.
 *
 * Screenshots of widgets are flat colour and sharp text, where PNG is both smaller and
 * lossless; a whole screen or a game frame is neither, and PNG on those is many
 * megabytes of nothing. The reason is reported in the descriptor so the rule stays
 * auditable rather than becoming folklore.
 */
function chooseFormat(
	params: GrabParams,
	isWindow: boolean,
	target: GrabParams['target']
): { format: 'png' | 'jpeg'; reason?: string } {
	if (params.format !== undefined && params.format !== 'auto') {
		if (params.format === 'raw-bgra') {
			throw new Error('raw-bgra is a frame-stream format and is not offered by capture.grab.');
		}
		return { format: params.format };
	}

	if ('screen' in target) {
		return { format: 'jpeg', reason: 'auto: a whole display is photographic in the large' };
	}
	if (isWindow || 'window' in target) {
		return { format: 'png', reason: 'auto: a window is mostly flat colour and text' };
	}
	return { format: 'png', reason: 'auto: a widget is flat colour and text' };
}

function maxEdge(size: GrabParams['size']): number | undefined {
	if (size === undefined || size === 'fit') {
		return FIT_EDGE;
	}
	if (size === 'full') {
		return undefined;
	}
	if (!Number.isFinite(size) || size <= 0) {
		throw new Error(`size must be 'fit', 'full', or a positive number of pixels, not ${size}.`);
	}
	return Math.round(size);
}

export type { Rect };

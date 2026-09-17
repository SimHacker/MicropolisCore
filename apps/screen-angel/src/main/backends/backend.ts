/**
 * The layer, as one class.
 *
 * Kando needs a fat abstract backend because its platforms disagree about almost
 * everything — seven Linux variants, three ways to bind a global shortcut. Ours does
 * not, because the two native addons were written to present the same six methods. So
 * everything platform-neutral lives here exactly once: role normalization, selector
 * parsing, matching, and the cost accounting. A platform backend supplies an addon and
 * a description of itself, and that is all.
 *
 * Note what is absent. There is no drawing, no window creation, no click-through
 * toggling — Electron does all of that, proven by Kando shipping it for years, so
 * putting it here would be inventing work.
 */

import { performance } from 'node:perf_hooks';

import { normalizeRole } from '@common/roles';
import { matchSelector, parseSelector } from '@common/selector';
import {
	DEFAULT_QUERY_OPTIONS,
	type BackendInfo,
	type Permissions,
	type QueryOptions,
	type QueryResult,
	type UIElement,
	type WindowInfo
} from '@common/types';

import type {
	NativeAddon,
	NativeCapture,
	NativeCaptureOptions,
	NativeElement
} from './native-types';

export abstract class ScreenAngelBackend {
	/** The compiled addon for this platform. */
	protected abstract readonly native: NativeAddon;

	public abstract getBackendInfo(): BackendInfo;

	/** Called once at startup. Platforms with nothing to set up need not override it. */
	public async init(): Promise<void> {}

	public async deinit(): Promise<void> {}

	public async getPermissions(): Promise<Permissions> {
		return this.native.checkPermissions();
	}

	public async requestPermissions(): Promise<void> {
		this.native.requestPermissions();
	}

	public async getFocusedWindow(): Promise<WindowInfo | null> {
		return this.native.getFocusedWindow();
	}

	public async getOpenWindows(): Promise<WindowInfo[]> {
		return this.native.getOpenWindows();
	}

	public async elementAt(x: number, y: number): Promise<UIElement | null> {
		const element = this.native.getElementAt(x, y);
		return element === null ? null : toElement(element);
	}

	/**
	 * Runs a selector against an application's interface.
	 *
	 * The walk happens natively and the match happens here, which is backwards from
	 * where it should end up: the design says push matching down so the tree never
	 * crosses the boundary. Doing that means giving the addon a compiled selector,
	 * which is why `Compound` is plain serializable data. Until then the budget in
	 * QueryOptions is what keeps this honest, and `truncated` tells the caller when the
	 * answer is incomplete rather than empty.
	 */
	public async query(selector: string, options: QueryOptions = {}): Promise<QueryResult> {
		const started = performance.now();
		const compiled = parseSelector(selector);

		const tree = this.native.queryTree({
			pid: options.pid,
			maxDepth: options.maxDepth ?? DEFAULT_QUERY_OPTIONS.maxDepth,
			maxNodes: options.maxNodes ?? DEFAULT_QUERY_OPTIONS.maxNodes
		});

		const elements = tree.elements.map(toElement);

		return {
			elements: matchSelector(compiled, elements),
			visited: tree.visited,
			truncated: tree.truncated,
			durationMs: performance.now() - started,
			selector
		};
	}

	/**
	 * One still frame of a rectangle or a window, encoded, as bytes.
	 *
	 * Deliberately the narrowest possible capture surface: a rectangle or a window id.
	 * Elements, selectors, symbolic regions and padding all resolve to one of those two
	 * before they reach here, in capture/targets.ts, where they can be resolved against
	 * the tree this class already knows how to walk.
	 */
	public async capture(options: NativeCaptureOptions): Promise<NativeCapture> {
		return this.native.captureImage(options);
	}

	/** The whole tree, unmatched. For the inspector, and for learning what an app exposes. */
	public async dumpTree(options: QueryOptions = {}): Promise<QueryResult> {
		const started = performance.now();
		const tree = this.native.queryTree({
			pid: options.pid,
			maxDepth: options.maxDepth ?? DEFAULT_QUERY_OPTIONS.maxDepth,
			maxNodes: options.maxNodes ?? DEFAULT_QUERY_OPTIONS.maxNodes
		});

		return {
			elements: tree.elements.map(toElement),
			visited: tree.visited,
			truncated: tree.truncated,
			durationMs: performance.now() - started
		};
	}
}

function toElement(element: NativeElement): UIElement {
	return { ...element, role: normalizeRole(element.nativeRole) };
}

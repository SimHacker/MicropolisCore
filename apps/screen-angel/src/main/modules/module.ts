/**
 * What a module is, and what the host promises it.
 *
 * The ladder is three rungs and this file is the joint between the first two. Screen
 * Angel is the layer: it knows about elements, windows and pixels and nothing about
 * games. A module is an application of the layer — soul-angel is the first. A module
 * owns bridges, which are the per-target adapters. Nothing in this file mentions a
 * game, and that is the test of whether the split is honest.
 *
 * Modules import this through the '@screen-angel/host-api' alias. When third-party
 * modules become real, that alias becomes a published package and nothing else moves.
 */

import type { BridgeMatcher } from '@common/bridge';
import { matchesWindow } from '@common/bridge';
import type { Permissions, QueryOptions, QueryResult, UIElement, WindowInfo } from '@common/types';

// Re-exported so a module has one import for everything it needs, and no reason to
// reach into @common — which is the host's business, not a module's.
export type { BridgeMatcher, Permissions, QueryOptions, QueryResult, UIElement, WindowInfo };
export { matchesWindow };

/**
 * The layer, as a module sees it. Deliberately smaller than what the main process can
 * do: a module gets to look, and to be told when things change. Every capability that
 * acts on the user's behalf — writing files, injecting input — arrives later, gated,
 * and named in the module's manifest so the user can read what was asked for.
 */
export interface AngelServices {
	getPermissions(): Promise<Permissions>;
	/** Runs a selector against the focused application, or against `options.pid`. */
	query(selector: string, options?: QueryOptions): Promise<QueryResult>;
	/**
	 * The whole tree, unmatched. How a bridge learns what its target actually exposes,
	 * which for a game is usually "almost nothing" and is worth knowing for certain
	 * rather than assuming.
	 */
	dumpTree(options?: QueryOptions): Promise<QueryResult>;
	elementAt(x: number, y: number): Promise<UIElement | null>;
	getFocusedWindow(): Promise<WindowInfo | null>;
	getOpenWindows(): Promise<WindowInfo[]>;
}

export interface HostEvents {
	/** The frontmost window changed. Bridges attach and detach off this. */
	'window-focus': (window: WindowInfo | null) => void;
	/** A bridge became active or inactive, so the overlay can change what it shows. */
	'bridge-change': (bridgeId: string | null) => void;
}

export interface ModuleContext {
	readonly angel: AngelServices;
	/** Prefixed with the module id, so a misbehaving module is identifiable in the log. */
	log(message: string, ...rest: unknown[]): void;
	on<K extends keyof HostEvents>(event: K, handler: HostEvents[K]): void;
	registerBridge(bridge: Bridge): void;
}

export interface Bridge {
	readonly id: string;
	/** What this bridge is a bridge to, in words a person would use. */
	readonly target: string;
	readonly matches: BridgeMatcher[];
	attach?(window: WindowInfo, angel: AngelServices): void | Promise<void>;
	detach?(): void | Promise<void>;
}

export interface ScreenAngelModule {
	readonly id: string;
	readonly name: string;
	activate(context: ModuleContext): void | Promise<void>;
	deactivate?(): void | Promise<void>;
}

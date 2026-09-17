/**
 * The vocabulary shared by the main process, the preload bridge, the renderer,
 * and every module. One definition of what an interface element is, so a module
 * written against Windows works unchanged on macOS.
 */

export type Platform = 'win32' | 'darwin';

export type PermissionState = 'granted' | 'denied' | 'unknown';

export interface Permissions {
	/** macOS: Accessibility, in System Settings > Privacy & Security. Windows: nothing to grant. */
	accessibility: PermissionState;
	/** macOS: Screen Recording, granted separately and needed before capture returns pixels. */
	screenCapture: PermissionState;
}

export interface BackendInfo {
	platform: Platform;
	/** Human name of the API family behind this backend, for the about screen and bug reports. */
	name: string;
	/** What this backend can do today, so callers degrade instead of throwing. */
	can: {
		queryTree: boolean;
		elementAtPoint: boolean;
		subscribe: boolean;
		capture: boolean;
		inject: boolean;
	};
}

export interface Rect {
	x: number;
	y: number;
	width: number;
	height: number;
}

/**
 * One node of some application's interface, flattened out of the platform's tree.
 *
 * `path` is the index route from the root the query started at. It addresses the
 * element again within the same interaction and nothing longer: the design rule is
 * to bind to patterns, not to paths, precisely because paths break on the next
 * release of the app you are augmenting. Treat it as a handle, never as identity.
 */
export interface UIElement {
	/** Normalized across platforms — 'button', 'window', 'textfield'. Match on this. */
	role: string;
	/** What the platform actually called it: 'AXButton', or a UIA control type id. */
	nativeRole: string;
	subrole?: string;
	name?: string;
	value?: string;
	enabled?: boolean;
	focused?: boolean;
	bounds?: Rect;
	childCount: number;
	depth: number;
	path: number[];
	pid?: number;
	app?: string;
}

export interface WindowInfo {
	app: string;
	title: string;
	pid: number;
	bounds?: Rect;
	/** The window server's identifier. Capture aims at this, not at the pid. */
	windowId?: number;
}

export interface QueryOptions {
	/** Restrict to one process. Omit to start from the focused application. */
	pid?: number;
	/**
	 * How deep to walk. A shape limit, not the cost control — see maxNodes for that.
	 *
	 * Worth setting deliberately, because a depth that is too small does not report a
	 * partial answer that looks partial. It reports window chrome and nothing else,
	 * which reads exactly like an application that exposes no accessibility at all.
	 */
	maxDepth?: number;
	/**
	 * How many nodes to visit. This is the real budget: a walk is expensive in
	 * proportion to nodes visited, and an unbounded walk of a browser window takes
	 * seconds.
	 */
	maxNodes?: number;
}

/**
 * Deep enough to reach content, bounded by nodes rather than by depth.
 *
 * Twelve was the earlier depth, and it could not see inside a single Electron
 * application: Chromium wraps web content in a dozen levels of group before the first
 * real widget, so Cursor's toolbar buttons sit at depth 18 and everything interesting
 * is deeper still. Since half the desktop is now Electron, a depth that cannot enter
 * one is not a conservative default, it is a broken one. Nodes is what actually bounds
 * the work, so that is what stayed tight.
 */
export const DEFAULT_QUERY_OPTIONS: Required<Pick<QueryOptions, 'maxDepth' | 'maxNodes'>> = {
	maxDepth: 40,
	maxNodes: 4000
};

export interface SteamStatus {
	/** True only when a real Steam client answered. */
	available: boolean;
	/** Why not, in words a user could act on. */
	reason?: string;
	appId?: number;
	steamId?: string;
	personaName?: string;
	/** True when Steam launched us, rather than a terminal. */
	launchedBySteam?: boolean;
}

/** What a query cost, so the UI can show the work instead of pretending it was free. */
export interface QueryResult {
	elements: UIElement[];
	/** Nodes the native walk visited, before selector matching. */
	visited: number;
	/** True if maxDepth or maxNodes stopped the walk early. */
	truncated: boolean;
	durationMs: number;
	selector?: string;
}

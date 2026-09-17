/**
 * The only door between the renderer and the machine.
 *
 * Every capability the web layer has arrives through this file, which makes it the
 * place to read if you want to know what the UI can actually do. Nothing here grants
 * filesystem access, and nothing here injects input: those are the two capabilities
 * that need consent per grant rather than a channel, and they are deliberately absent
 * until that consent machinery exists.
 */

import type { BridgeMatcher } from './bridge';
import type { GrabParams, GrabResult } from './protocol';
import type {
	BackendInfo,
	Permissions,
	QueryOptions,
	QueryResult,
	Rect,
	SteamStatus,
	UIElement,
	WindowInfo
} from './types';

export const IPC = {
	hostInfo: 'angel:host-info',
	permissions: 'angel:permissions',
	requestPermissions: 'angel:request-permissions',
	query: 'angel:query',
	dumpTree: 'angel:dump-tree',
	elementAt: 'angel:element-at',
	focusedWindow: 'angel:focused-window',
	openWindows: 'angel:open-windows',
	setClickThrough: 'angel:set-click-through',
	toggleOverlay: 'angel:toggle-overlay',
	setHighlights: 'angel:set-highlights',
	say: 'angel:say',
	grab: 'angel:grab',
	// Pushed from main to every renderer.
	windowFocusEvent: 'angel:event:window-focus',
	bridgeChangeEvent: 'angel:event:bridge-change',
	highlightsEvent: 'angel:event:highlights',
	sayEvent: 'angel:event:say',
	devToolsOpenedEvent: 'angel:event:devtools-opened'
} as const;

/**
 * A line of text for the overlay to show, and how long to leave it up.
 *
 * This is the channel an agent on the control socket speaks through, and it is
 * deliberately the narrowest one imaginable: text with an expiry. No markup, no
 * buttons, no persistence. An assistant that can draw arbitrary UI over every
 * application on the machine is a phishing kit.
 */
export interface Utterance {
	text: string;
	ttlMs: number;
}

export interface BridgeDescription {
	id: string;
	target: string;
	/** Shipped to the renderer so the console can show which bridge WOULD attach to each
	 *  open window, without the game being installed. */
	matches: BridgeMatcher[];
}

export interface ModuleDescription {
	id: string;
	name: string;
	bridges: BridgeDescription[];
}

export interface HostInfo {
	appVersion: string;
	electronVersion: string;
	/** Null when there is no backend for this platform, which is not an error state to crash on. */
	backend: BackendInfo | null;
	unsupportedReason?: string;
	permissions: Permissions | null;
	modules: ModuleDescription[];
	activeBridgeId: string | null;
	steam: SteamStatus;
}

export interface ScreenAngelApi {
	getHostInfo(): Promise<HostInfo>;
	getPermissions(): Promise<Permissions | null>;
	requestPermissions(): Promise<void>;
	query(selector: string, options?: QueryOptions): Promise<QueryResult>;
	dumpTree(options?: QueryOptions): Promise<QueryResult>;
	elementAt(x: number, y: number): Promise<UIElement | null>;
	getFocusedWindow(): Promise<WindowInfo | null>;
	getOpenWindows(): Promise<WindowInfo[]>;
	/**
	 * Lets clicks through to whatever is underneath, or takes them. The renderer owns
	 * this because the renderer is the only side that knows where its own widgets are.
	 */
	setClickThrough(enabled: boolean): Promise<void>;
	toggleOverlay(): Promise<void>;
	/**
	 * Asks the overlay to outline these screen rectangles. This is what makes the layer
	 * legible: you type a selector, and the things it matched light up on top of the real
	 * application. Showing the work is a design constraint here, not a debugging aid.
	 */
	setHighlights(rects: Rect[]): Promise<void>;
	/** One line on the overlay, expiring. The channel an agent speaks through. */
	say(utterance: Utterance): Promise<void>;
	/**
	 * A still of an element, window, display or rectangle. Returns a descriptor with a
	 * file path, never the bytes — the renderer can put that path in an img src.
	 */
	grab(params: GrabParams & { pid?: number }): Promise<GrabResult>;
	onWindowFocus(handler: (window: WindowInfo | null) => void): () => void;
	onBridgeChange(handler: (bridgeId: string | null) => void): () => void;
	onHighlights(handler: (rects: Rect[]) => void): () => void;
	onSay(handler: (utterance: Utterance) => void): () => void;
	/**
	 * Fires when a DevTools window attaches to this renderer.
	 *
	 * The console toolkit prints its own instructions on this rather than at load, for
	 * two reasons: a banner printed before anyone is looking is only visible in the main
	 * process log, where console.table and %c styling arrive as unreadable noise; and
	 * the moment you open a console is the moment you want to be told what is in it.
	 */
	onDevToolsOpened(handler: () => void): () => void;
}

declare global {
	interface Window {
		angel: ScreenAngelApi;
	}
}

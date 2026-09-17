/**
 * The local control protocol. One vocabulary, four callers.
 *
 * The renderer already talks to the main process over Electron IPC. This is the same
 * verb list spoken over a local socket, so that things which are not the renderer can
 * ask the same questions: a command line tool, an MCP server, a script, a skill.
 *
 * Why that matters more than it looks: the design has always named one missing piece,
 * and it was never the selector engine. SCREEN-ANGEL.yml puts it plainly — recognizing
 * what a widget is FOR, deciding which of five applications satisfies a request,
 * writing the per-application adapter. Understanding was the blocker. An agent on the
 * other end of this socket is that recognizer, and it does not sit beside the work
 * offering advice: it holds the selector, sees the tree, and acts through the
 * application's own widgets. That is the i-beam position rather than the Clippy one.
 *
 * Newline-delimited JSON, so the whole thing is debuggable with nc and readable in a
 * log. No framing cleverness, no schema negotiation.
 */

import type {
	Permissions,
	QueryOptions,
	QueryResult,
	Rect,
	UIElement,
	WindowInfo
} from './types';
import type { HostInfo } from './ipc';

export const PROTOCOL_VERSION = 1;

/**
 * Every method, and what it takes and returns.
 *
 * Split into two groups on purpose. Reading is safe and needs no ceremony. Acting
 * changes what is on the user's screen, and every one of those methods is listed
 * separately below so that a caller granting access can grant the halves separately —
 * an agent that may look is a different proposition from an agent that may click.
 */
export interface ControlMethods {
	/** Protocol version, app version, backend, permissions, modules. */
	'angel.info': { params: void; result: HostInfo & { protocolVersion: number } };
	'angel.permissions': { params: void; result: Permissions | null };

	// Reading.
	'query.select': { params: { selector: string; options?: QueryOptions }; result: QueryResult };
	'query.tree': { params: { options?: QueryOptions }; result: QueryResult };
	'query.at': { params: { x: number; y: number }; result: UIElement | null };
	'window.focused': { params: void; result: WindowInfo | null };
	'window.list': { params: void; result: WindowInfo[] };

	/**
	 * One still frame. Returns a descriptor and never the bytes, so a caller that only
	 * wanted the size or the hash pays nothing for pixels it will not look at.
	 *
	 * Counted as reading even though it needs Screen Recording, because it observes and
	 * changes nothing. The permission is a separate axis from the read/act split.
	 */
	'capture.grab': {
		params: GrabParams & { dir?: string; pid?: number; maxDepth?: number; maxNodes?: number };
		result: GrabResult;
	};
	/**
	 * One still frame, decoded rather than delivered: what codes are on screen, and where.
	 *
	 * Reading, by the same argument as capture.grab — it looks and changes nothing. The verb pairs
	 * a capture with a decode so that no client needs a decoder and no pixels cross a socket to be
	 * looked at once. QR today; egg band codes when the reader for them exists
	 * (apps/screen-angel/RECOGNIZER.yml).
	 */
	'recognize.scan': {
		params: RecognizeParams & { pid?: number };
		result: RecognizeResult;
	};
	/** The bytes, base64. The fallback for callers whose transport leaves no choice. */
	'image.fetch': { params: { id: string }; result: { format: ImageFormat; data: string } };
	/** Exempt from the reaper until released. Handing out a resource link implies this. */
	'image.pin': { params: { id: string }; result: ImageDescriptor };
	'image.release': { params: { id: string }; result: null };

	// Acting. Nothing here touches the target application yet — it draws on our own
	// overlay. Input injection is deliberately not in this list until consent is real.
	'overlay.highlight': { params: { rects: Rect[] }; result: { count: number } };
	'overlay.say': { params: { text: string; ttlMs?: number }; result: null };
	'overlay.toggle': { params: void; result: { visible: boolean } };
	/**
	 * Bring the console window up, from anywhere.
	 *
	 * Every other route to this window can be absent on a real desktop, and all of them
	 * were at once: the app takes no focus at launch, so macOS never promoted it to a
	 * foreground application and it appeared in neither the Dock nor Cmd-Tab; the Dock was
	 * set to auto-hide; and the menu bar was full enough that a new status item had nowhere
	 * to go. An app you cannot get back to is worse than one that interrupts you.
	 *
	 * The socket is the route with no such dependencies, which is the same reason
	 * dev.devtools exists.
	 */
	'window.console': {
		params: { action?: 'show' | 'hide' | 'toggle' };
		result: { visible: boolean };
	};

	/**
	 * A JavaScript console on either of our own windows, opened from anywhere.
	 *
	 * Here rather than only in the menu because the overlay is never focused, so no
	 * amount of clicking reaches it, and because scripted use needs it to work when the
	 * app is not frontmost.
	 */
	'dev.devtools': {
		params: { window?: DevWindow; action?: 'open' | 'close' | 'toggle' };
		result: { window: DevWindow; open: boolean };
	};
	/**
	 * Evaluate an expression in one of our windows and return its value.
	 *
	 * The same JavaScript you would type into DevTools, without a keyboard in front of
	 * the app. Adds no capability over this socket — a caller who can reach it can
	 * already drive every verb the renderer can — but it IS more than a read-only
	 * listener should have, so it is not in READ_ONLY_METHODS.
	 */
	'dev.eval': { params: { code: string; window?: DevWindow }; result: { value: unknown } };
}

/** Which of our two windows. The overlay is the transparent one. */
export type DevWindow = 'console' | 'overlay';

export type ControlMethod = keyof ControlMethods;

/**
 * What a capture returns. Never the pixels.
 *
 * The bytes are fetched in a second request, by whichever transport the connection can
 * actually use — a path for a local client, a counted binary frame for a remote one,
 * base64 only for callers like MCP whose format leaves no choice. The full reasoning,
 * including why counted rather than delimited and why downscaling belongs at the
 * source, is in PROTOCOL.yml#images. It is worth reading before adding a method here.
 *
 * These types exist ahead of the capture implementation on purpose. Writing the
 * descriptor down first is what stops the first capture method from returning a file
 * path and quietly making "every client shares a filesystem" load-bearing.
 */
/** What a caller may ask for. 'auto' is a request and never an answer. */
export type GrabFormat = 'auto' | ImageFormat;

/** What actually came back. A descriptor always names a concrete encoding. */
export type ImageFormat = 'png' | 'jpeg' | 'raw-bgra';

export interface ImageDescriptor {
	id: string;
	width: number;
	height: number;
	/** Concrete, even when 'auto' was requested, so the caller knows what it got. */
	format: ImageFormat;
	/** Present when 'auto' resolved this, so the rule is auditable rather than magic. */
	formatReason?: string;
	byteLength: number;
	/**
	 * Content address over the ENCODED bytes, not the pixels.
	 *
	 * Pixels would be the tempting choice, and it would be a cache that serves a PNG to a
	 * caller who asked for JPEG because the two share a hash.
	 */
	sha256: string;
	scaleFactor: number;
	capturedAt: string;
	/** What this connection may use, decided by the listener rather than by the client. */
	transports: ImageTransport[];
	/** Present only when 'file' is among the transports. */
	path?: string;
	/** Who deletes it. 'caller' when the request named a directory. See images.lifetime. */
	owner: 'ours' | 'caller';
	/**
	 * When the file stops existing, ISO 8601. Absent means nobody has scheduled its
	 * death: either the caller owns it, or it has been pinned.
	 *
	 * Reported rather than assumed, because a path with no stated lifetime is a trap.
	 * The holder cannot tell a stable file from one about to vanish, and finds out by
	 * having it vanish.
	 */
	expiresAt?: string;
}

export type ImageTransport = 'file' | 'frame' | 'base64' | 'url';

/**
 * What to grab. Exactly one field, and every one of them is a handle the caller already
 * holds from a JSON reply — an element path out of a query result, a pid out of the
 * window list, a selector it just wrote. Never a rectangle the caller had to derive by
 * first asking how big something is.
 */
export type GrabTarget =
	| { element: number[] }
	| { selector: string }
	| { window: number | 'focused' }
	| { screen: number | 'focused' }
	| { rect: Rect };

/**
 * Which part of the target, named rather than measured.
 *
 * Resolved against the target's bounds at capture time, so it cannot go stale between
 * the query and the grab the way a computed rectangle can.
 */
export type GrabRegion =
	| 'all'
	| 'top'
	| 'bottom'
	| 'left'
	| 'right'
	| 'top-third'
	| 'middle-third'
	| 'bottom-third'
	| 'left-third'
	| 'center-third'
	| 'right-third'
	| 'top-left'
	| 'top-center'
	| 'top-right'
	| 'center-left'
	| 'center'
	| 'center-right'
	| 'bottom-left'
	| 'bottom-center'
	| 'bottom-right'
	| 'title-bar'
	| 'status-bar';

/** 'fit' is a 1024px longest edge, which is what a model should get. See PROTOCOL.yml#capture.size. */
export type GrabSize = 'fit' | 'full' | number;

/** Context around the target. 'tight' clips focus rings; the default exists for that reason. */
export type GrabPad = 'tight' | 'snug' | 'loose' | number;

/** A capture target, narrowed to what recognition needs: where to look, and how closely. */
export interface RecognizeParams {
	target: GrabTarget;
	region?: GrabRegion;
	size?: GrabSize;
	pad?: GrabPad;
}

export interface RecognizedCode {
	text: string;
	/** QRCode or MicroQRCode. Present so a caller can tell which without parsing the payload. */
	format: string;
	/** Screen points, like every other rectangle in this protocol. */
	box: Rect;
}

export interface RecognizeResult {
	/** The frame this was read from, so a caller can fetch or pin the pixels behind a finding. */
	image: { id: string; width: number; height: number; scale: number };
	qr: RecognizedCode[];
	/** Empty until the egg reader lands, rather than absent, so callers are written once. */
	eggs: never[];
	/** Split, because the two halves fail and slow down for entirely different reasons. */
	timing: { grabMs: number; decodeMs: number };
}

export interface GrabParams {
	target: GrabTarget;
	region?: GrabRegion;
	size?: GrabSize;
	pad?: GrabPad;
	/** Defaults to 'auto': PNG for widgets and windows, JPEG for screens and game frames. */
	format?: GrabFormat;
	/** JPEG only. Defaults to 82. Below 70, artifacts on UI text stop being worth the bytes. */
	quality?: number;
	/** Draw numbered markers on matching elements first, and return the legend. */
	marks?: string | string[];
	/** Composite multiple matches into one image instead of returning several. */
	layout?: 'separate' | 'sheet';
}

/** One entry in the legend that accompanies a marked capture. */
export interface Mark {
	n: number;
	path: number[];
	role: string;
	name: string;
	bounds: Rect;
}

export interface GrabResult extends ImageDescriptor {
	/** Present when the target was a selector or an element, so the image is traceable. */
	element?: number[];
	/** Present when marks were requested. The shared vocabulary between image and JSON. */
	marks?: Mark[];
}

/**
 * The header line that precedes a counted binary frame. Read this, then read exactly
 * `length` bytes. Nothing is scanned for a terminator, so no byte value is special.
 */
export interface BinaryFrameHeader {
	binary: {
		requestId: number;
		id: string;
		length: number;
		format: ImageDescriptor['format'];
		sha256: string;
	};
}

/** What a client may declare at connect time. Absent means 'file if you can, base64 if you must'. */
export interface HelloParams {
	accept?: ImageTransport[];
	maxInlineBytes?: number;
}

/** Methods that only observe. A caller restricted to these cannot change anything. */
export const READ_ONLY_METHODS: ControlMethod[] = [
	'angel.info',
	'angel.permissions',
	'query.select',
	'query.tree',
	'query.at',
	'window.focused',
	'window.list',
	'capture.grab',
	'recognize.scan',
	// Pin and release only move our own cache entries around. A read-only caller needs
	// them anyway: handing out a resource link and later letting go of it is how the
	// deferred-fetch transports work, and withholding them would make the cheapest
	// transport unusable by exactly the callers it was designed for.
	'image.fetch',
	'image.pin',
	'image.release'
];

export interface ControlRequest<M extends ControlMethod = ControlMethod> {
	id: number;
	method: M;
	params?: ControlMethods[M]['params'];
}

export interface ControlSuccess {
	id: number;
	ok: true;
	result: unknown;
}

export interface ControlFailure {
	id: number;
	ok: false;
	error: { message: string; code?: string };
}

export type ControlResponse = ControlSuccess | ControlFailure;

/** Pushed without being asked. Same names as the renderer's events. */
export interface ControlEvent {
	event: 'window-focus' | 'bridge-change';
	payload: unknown;
}

export type ControlMessage = ControlResponse | ControlEvent;

export function isEvent(message: ControlMessage): message is ControlEvent {
	return 'event' in message;
}

/**
 * Where the socket lives.
 *
 * A named pipe on Windows and a Unix domain socket elsewhere, rather than a localhost
 * port. A port is reachable by every process on the machine and by anything that can
 * talk to the loopback interface; a socket in the user's own runtime directory is
 * governed by filesystem permissions. For a service whose whole job is reading and
 * acting on the user's screen, that difference is the difference.
 */
export function controlSocketPath(): string {
	if (process.platform === 'win32') {
		const user = process.env.USERNAME ?? 'user';
		return `\\\\.\\pipe\\screen-angel-${user}`;
	}

	const runtime = process.env.XDG_RUNTIME_DIR ?? process.env.TMPDIR ?? '/tmp';
	const uid = typeof process.getuid === 'function' ? process.getuid() : 0;
	return `${runtime.replace(/\/$/, '')}/screen-angel-${uid}.sock`;
}

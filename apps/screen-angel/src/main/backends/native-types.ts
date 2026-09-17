/**
 * The contract every native addon implements.
 *
 * One declaration, two implementations, no generator keeping them honest — so changing
 * this file means changing Native.mm and Native.cpp with it. That the two platforms
 * present exactly the same six methods is the whole reason the backends above them are
 * thin enough to read in one sitting.
 */

import type { PermissionState } from '@common/types';

export interface NativeRect {
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface NativeElement {
	/** 'AXButton' on macOS; a UI Automation control type id, as a decimal string, on Windows. */
	nativeRole: string;
	subrole?: string;
	name?: string;
	value?: string;
	enabled?: boolean;
	focused?: boolean;
	bounds?: NativeRect;
	childCount: number;
	depth: number;
	path: number[];
	pid?: number;
	app?: string;
}

export interface NativeWindow {
	app: string;
	title: string;
	pid: number;
	bounds?: NativeRect;
	/**
	 * The window server's own identifier, which is what capture aims at.
	 *
	 * A pid is not enough: an application with four windows has one pid and four of
	 * these, and no platform offers "capture the application".
	 */
	windowId?: number;
}

export interface NativeCaptureOptions {
	/** Global screen coordinates, in points. Ignored when windowId is given. */
	rect?: NativeRect;
	/** Capture one window, cropped to it, with other windows excluded. */
	windowId?: number;
	/** Which display the rect lives on. Defaults to the first. */
	displayId?: number;
	/** Longest edge in PIXELS. Applied before encoding, or the saving is imaginary. */
	maxEdge?: number;
	format?: 'png' | 'jpeg';
	/** 0..1, JPEG only. */
	quality?: number;
}

export interface NativeCapture {
	data: Buffer;
	/** Pixels actually produced, after maxEdge. Not the points that were requested. */
	width: number;
	height: number;
	/** Pixels per point on the captured display. 2 on Retina. */
	scale: number;
	format: 'png' | 'jpeg';
}

export interface NativeQueryResult {
	elements: NativeElement[];
	/** Nodes the walk actually visited. The honest cost of the query. */
	visited: number;
	/** True when maxDepth or maxNodes stopped the walk before it finished. */
	truncated: boolean;
}

export interface NativeQueryOptions {
	pid?: number;
	maxDepth?: number;
	maxNodes?: number;
}

export interface NativeAddon {
	checkPermissions(): { accessibility: PermissionState; screenCapture: PermissionState };
	/**
	 * Opens whatever system UI grants the missing permissions, and returns immediately.
	 * On macOS, Accessibility cannot be granted in-process at all: this adds the app to
	 * the list, and the user must tick the box and relaunch. So callers poll
	 * checkPermissions rather than awaiting anything.
	 */
	requestPermissions(): void;
	getFocusedWindow(): NativeWindow | null;
	getOpenWindows(): NativeWindow[];
	/**
	 * Walks the interface tree and returns it flat, with an index path per node.
	 *
	 * Rooted at the focused application on macOS and at the focused top-level window on
	 * Windows, because UIA's own root is the desktop and starting there would mean
	 * walking every running application at once.
	 *
	 * Throws on macOS when Accessibility has not been granted, and on Windows when the
	 * target is elevated and the caller is not.
	 */
	queryTree(options?: NativeQueryOptions): NativeQueryResult;
	getElementAt(x: number, y: number): NativeElement | null;

	/**
	 * One still frame, encoded, as bytes.
	 *
	 * Downscaling happens before encoding so the bytes for unwanted pixels are never
	 * produced. Nothing here decides about files, caches or lifetimes; this returns
	 * bytes and the layer that asked decides who owns them.
	 *
	 * Throws when Screen Recording has not been granted, rather than returning an empty
	 * image that looks like a black screen.
	 */
	captureImage(options: NativeCaptureOptions): NativeCapture;
}

/**
 * Turning a target into a rectangle.
 *
 * Everything a caller can name — an element path, a selector, a window, a display, a
 * raw rectangle — collapses here into either a screen rectangle in points or a window
 * id. Those are the only two things the native layer accepts, and keeping the fan-out
 * on this side is what stops each platform addon from reimplementing selectors.
 *
 * Symbolic regions are resolved against the target's CURRENT bounds rather than bounds
 * the caller fetched earlier, which is the reason they exist: "top-right of the window"
 * survives a resize and a rectangle computed a moment ago does not.
 */

import { screen } from 'electron';

import type { GrabPad, GrabRegion, GrabTarget } from '@common/protocol';
import type { QueryOptions, Rect, UIElement, WindowInfo } from '@common/types';

export interface Resolved {
	/** Present unless the target was a whole window, which captures by id instead. */
	rect?: Rect;
	windowId?: number;
	/** What the target itself resolved to, before region and pad. */
	target: Rect;
	/** How the target was found, so an error or a log says something useful. */
	via: string;
	/** Present when the target was an element or a selector, making the image traceable. */
	element?: number[];
}

export interface Walk {
	elements: UIElement[];
	/** Whether the budget stopped the walk. A miss under truncation is not a real miss. */
	truncated: boolean;
}

export interface TargetContext {
	query: (selector: string, options: QueryOptions) => Promise<Walk>;
	tree: (options: QueryOptions) => Promise<Walk>;
	windows: () => Promise<WindowInfo[]>;
	focusedWindow: () => Promise<WindowInfo | null>;
}

const NAMED_PAD: Record<string, number> = { tight: 0, snug: 8, loose: 32 };

/** Deep enough for a macOS title bar and most application toolbars, in points. */
const BAR_POINTS = 38;

export async function resolveTarget(
	target: GrabTarget,
	context: TargetContext,
	options: { region?: GrabRegion; pad?: GrabPad; query?: QueryOptions } = {}
): Promise<Resolved> {
	const named = Object.keys(target).filter(
		(key) => (target as Record<string, unknown>)[key] !== undefined
	);
	if (named.length === 0) {
		throw new Error('No capture target. Name one of: element, selector, window, screen, rect.');
	}
	if (named.length > 1) {
		throw new Error(`Name one capture target, not ${named.length}: ${named.join(', ')}.`);
	}

	const region = options.region ?? 'all';
	const pad = padPoints(options.pad);

	if ('rect' in target) {
		// An explicit rectangle is taken at its word. The caller who computed it is the
		// only one who knows what it means, so padding it would be second-guessing.
		return { rect: round(target.rect), target: round(target.rect), via: 'rect' };
	}

	if ('window' in target) {
		const window = await findWindow(target.window, context);
		const bounds = window.bounds ?? { x: 0, y: 0, width: 0, height: 0 };
		const via = `window "${window.title}" (${window.app})`;

		// A whole window captures by id, which crops precisely and excludes every other
		// window — including our own overlay. Asking for a region of one means falling
		// back to a screen rectangle, where anything in front of it will appear.
		if (region === 'all' && window.windowId !== undefined) {
			return { windowId: window.windowId, target: bounds, via };
		}
		return { rect: applyRegion(grow(bounds, pad), region), target: bounds, via };
	}

	if ('screen' in target) {
		const display = findDisplay(target.screen);
		return {
			rect: applyRegion(display.bounds, region),
			target: display.bounds,
			via: `display ${display.id}`
		};
	}

	const element = await findElement(target, context, options.query ?? {});
	if (element.bounds === undefined) {
		throw new Error(
			'That element has no bounds, so there is nothing to capture. Elements without a ' +
				'frame are usually containers, offscreen, or in a collapsed section.'
		);
	}

	return {
		rect: applyRegion(grow(element.bounds, pad), region),
		target: element.bounds,
		via: describe(element),
		element: element.path
	};
}

async function findElement(
	target: GrabTarget,
	context: TargetContext,
	query: QueryOptions
): Promise<UIElement> {
	if ('selector' in target) {
		const walk = await context.query(target.selector, query);
		if (walk.elements.length === 0) {
			throw new Error(`Nothing matched ${target.selector}.${truncationHint(walk.truncated)}`);
		}
		// First match in walk order. A selector matching several things when the caller
		// wanted one is a selector problem, and narrowing it is the skill the selector
		// language exists to reward.
		return walk.elements[0];
	}

	const wanted = 'element' in target ? target.element : [];
	const walk = await context.tree(query);
	const found = walk.elements.find((element) => samePath(element.path, wanted));
	if (found === undefined) {
		throw new Error(
			`No element at path [${wanted.join(', ')}].${truncationHint(walk.truncated)} Paths stay ` +
				'valid only until the tree changes, so query again and use the new one.'
		);
	}
	return found;
}

/**
 * Say when the walk stopped early.
 *
 * A budget-truncated miss and a genuine miss are the same empty list, and reporting
 * both as "nothing matched" sends the caller off rewriting a selector that was right.
 */
function truncationHint(truncated: boolean): string {
	return truncated
		? ' The walk hit its budget before finishing, so it may be there — raise maxNodes or maxDepth.'
		: '';
}

async function findWindow(
	wanted: number | 'focused',
	context: TargetContext
): Promise<WindowInfo> {
	const windows = await context.windows();

	if (wanted === 'focused') {
		const focused = await context.focusedWindow();
		if (focused === null) {
			throw new Error('Nothing is focused.');
		}
		// The focused-window report carries no window id, so match it against the window
		// list by pid and take the largest. See largest() for why not the first.
		return largest(windows.filter((window) => window.pid === focused.pid)) ?? focused;
	}

	const found = windows.find((window) => window.windowId === wanted);
	if (found === undefined) {
		throw new Error(`No on-screen window with id ${wanted}.`);
	}
	return found;
}

/**
 * The biggest window a process owns, which is very nearly always the one a human means.
 *
 * Applications keep auxiliary windows on screen — toolbars, popovers, a one-line title
 * accessory — and they come back from the window server ahead of the real one often
 * enough that taking the first match reliably captures furniture. Observed directly:
 * asking for Cursor returned a 44-point strip.
 */
export function largest(windows: WindowInfo[]): WindowInfo | undefined {
	let best: WindowInfo | undefined;
	let bestArea = -1;
	for (const window of windows) {
		const area = (window.bounds?.width ?? 0) * (window.bounds?.height ?? 0);
		if (area > bestArea) {
			bestArea = area;
			best = window;
		}
	}
	return best;
}

function findDisplay(wanted: number | 'focused') {
	if (wanted === 'focused') {
		return screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
	}
	const displays = screen.getAllDisplays();
	const found = displays.find((display) => display.id === wanted);
	if (found === undefined) {
		throw new Error(`No display with id ${wanted}. Have: ${displays.map((d) => d.id).join(', ')}.`);
	}
	return found;
}

/** Halves, thirds and bars of a rectangle, in that rectangle's own coordinate space. */
export function applyRegion(rect: Rect, region: GrabRegion): Rect {
	if (region === 'all') {
		return round(rect);
	}

	switch (region) {
		case 'top':
			return round({ ...rect, height: rect.height / 2 });
		case 'bottom':
			return round({ ...rect, y: rect.y + rect.height / 2, height: rect.height / 2 });
		case 'left':
			return round({ ...rect, width: rect.width / 2 });
		case 'right':
			return round({ ...rect, x: rect.x + rect.width / 2, width: rect.width / 2 });

		// Bars are a fixed depth rather than a fraction, because a title bar is the same
		// height on a tall window as on a short one. A fraction would make the strip grow
		// with the window, which is exactly wrong.
		case 'title-bar':
			return round({ ...rect, height: Math.min(BAR_POINTS, rect.height) });
		case 'status-bar': {
			const height = Math.min(BAR_POINTS, rect.height);
			return round({ ...rect, y: rect.y + rect.height - height, height });
		}

		case 'top-third':
			return horizontalThird(rect, 0);
		case 'middle-third':
			return horizontalThird(rect, 1);
		case 'bottom-third':
			return horizontalThird(rect, 2);
		case 'left-third':
			return verticalThird(rect, 0);
		case 'center-third':
			return verticalThird(rect, 1);
		case 'right-third':
			return verticalThird(rect, 2);
		default:
			return ninth(rect, region);
	}
}

/** A full-width horizontal band. */
function horizontalThird(rect: Rect, index: number): Rect {
	const height = rect.height / 3;
	return round({ ...rect, y: rect.y + index * height, height });
}

/** A full-height vertical band. */
function verticalThird(rect: Rect, index: number): Rect {
	const width = rect.width / 3;
	return round({ ...rect, x: rect.x + index * width, width });
}

/** One cell of the three-by-three grid, named row-column. */
function ninth(rect: Rect, region: string): Rect {
	const rows = ['top', 'center', 'bottom'];
	const columns = ['left', 'center', 'right'];
	const [row, column] = region.split('-');
	const rowIndex = rows.indexOf(row);
	const columnIndex = columns.indexOf(column);
	if (rowIndex < 0 || columnIndex < 0) {
		throw new Error(`Unknown region ${region}.`);
	}
	const width = rect.width / 3;
	const height = rect.height / 3;
	return round({
		x: rect.x + columnIndex * width,
		y: rect.y + rowIndex * height,
		width,
		height
	});
}

function padPoints(pad: GrabPad | undefined): number {
	if (pad === undefined) {
		return NAMED_PAD.snug;
	}
	if (typeof pad === 'number') {
		return pad;
	}
	const points = NAMED_PAD[pad];
	if (points === undefined) {
		throw new Error(`Unknown pad ${pad}. Use tight, snug, loose, or a number of points.`);
	}
	return points;
}

function grow(rect: Rect, by: number): Rect {
	return {
		x: rect.x - by,
		y: rect.y - by,
		width: rect.width + by * 2,
		height: rect.height + by * 2
	};
}

function round(rect: Rect): Rect {
	return {
		x: Math.round(rect.x),
		y: Math.round(rect.y),
		width: Math.round(rect.width),
		height: Math.round(rect.height)
	};
}

function samePath(a: number[], b: number[]): boolean {
	return a.length === b.length && a.every((value, index) => value === b[index]);
}

function describe(element: UIElement): string {
	const name = element.name !== undefined ? ` "${element.name}"` : '';
	return `${element.role}${name}`;
}

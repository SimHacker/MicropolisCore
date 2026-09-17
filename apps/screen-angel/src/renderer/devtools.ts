/**
 * The console toolkit: what you find waiting when you open DevTools.
 *
 * A JavaScript console on an app whose whole subject is other applications' interfaces
 * is not a debugging aid, it is the fastest way to use the thing. Typing a selector and
 * seeing the boxes appear on the real screen is a shorter loop than any UI could be, so
 * this file's job is to make that one line long.
 *
 * Three parts, in increasing order of how underused they are:
 *
 *   1. Short globals, so nothing needs an await-wrapped IIFE. Top-level await works in
 *      the console, which is why `await $q('button')` reads like a REPL.
 *   2. console.table for element results, because a list of thirty widgets is a table
 *      and printing it as thirty collapsed objects wastes the one thing a console has.
 *   3. A custom object formatter, so an element prints as `button "Save" 320,185 16x16`
 *      instead of a grey Object you have to open. Chrome has supported these since 2015
 *      and almost nobody installs one; for a tree of near-identical nodes it is the
 *      difference between reading and clicking.
 */

import type { GrabParams, GrabResult } from '@common/protocol';
import type { QueryOptions, Rect, UIElement } from '@common/types';

interface Toolkit {
	q: (selector: string, options?: QueryOptions) => Promise<UIElement[]>;
	tree: (options?: QueryOptions) => Promise<UIElement[]>;
	at: (x: number, y: number) => Promise<UIElement | null>;
	show: (selector: string, options?: QueryOptions) => Promise<UIElement[]>;
	hi: (what: Rect | Rect[] | UIElement | UIElement[]) => Promise<number>;
	clear: () => Promise<void>;
	say: (text: string, ttlMs?: number) => Promise<void>;
	grab: (params: GrabParams & { pid?: number }) => Promise<GrabResult>;
	look: (params?: GrabParams & { pid?: number }) => Promise<GrabResult>;
	windows: () => Promise<unknown>;
	info: () => Promise<unknown>;
	/** The last query's elements, so a follow-up needs no variable. */
	last: UIElement[];
	help: () => void;
}

export function installConsoleToolkit(view: 'overlay' | 'console'): void {
	const angel = window.angel;
	const toolkit: Toolkit = {
		last: [],

		q: async (selector, options) => {
			// A named measure rather than a timer, because these show up as bars in the
			// Performance panel next to the paint they caused. A tree walk is the
			// expensive thing here and it is worth seeing where it lands.
			performance.mark('angel:query:start');
			const result = await angel.query(selector, options);
			performance.measure(`angel:query ${selector}`, 'angel:query:start');

			toolkit.last = result.elements;
			describe(result.elements, result.truncated);
			return result.elements;
		},

		tree: async (options) => {
			const result = await angel.dumpTree(options);
			toolkit.last = result.elements;
			describe(result.elements, result.truncated);
			return result.elements;
		},

		at: (x, y) => angel.elementAt(x, y),

		show: async (selector, options) => {
			const elements = await toolkit.q(selector, options);
			await toolkit.hi(elements);
			return elements;
		},

		hi: async (what) => {
			const rects = toRects(what);
			await angel.setHighlights(rects);
			return rects.length;
		},

		clear: () => angel.setHighlights([]),

		say: (text, ttlMs = 6000) => angel.say({ text, ttlMs }),

		grab: (params) => angel.grab(params),

		look: async (params) => {
			const shot = await angel.grab(params ?? { target: { screen: 'focused' } });
			// The console renders an image from a background-image on an empty string,
			// which is the one way to get a picture into a log line. Worth it: a
			// screenshot you have to go and open is a screenshot you do not look at.
			preview(shot);
			return shot;
		},

		windows: () => angel.getOpenWindows(),
		info: () => angel.getHostInfo(),

		help: () => printHelp(view)
	};

	// Both names, because $-prefixed globals are the console convention and DevTools
	// already owns $, $$, $x and $0. `angel` alone would collide with nothing, but a
	// person typing $ and waiting for autocomplete should find these.
	const scope = window as unknown as Record<string, unknown>;
	scope.$a = toolkit;
	for (const [name, value] of Object.entries(toolkit)) {
		if (typeof value === 'function') {
			scope[`$${name}`] = value;
		}
	}

	installFormatters();

	// Not now. Printing at load puts a styled banner and a table into the main process
	// log, where %c and console.table arrive as unreadable noise, and where nobody was
	// asking. When a console attaches, that is somebody asking.
	angel.onDevToolsOpened(() => printHelp(view));
}

function toRects(what: Rect | Rect[] | UIElement | UIElement[]): Rect[] {
	const items = Array.isArray(what) ? what : [what];
	return items
		.map((item) => ('bounds' in item ? (item as UIElement).bounds : (item as Rect)))
		.filter((rect): rect is Rect => rect !== undefined);
}

/**
 * A table when there are several, the object itself when there is one.
 *
 * console.table on a single row is worse than the object: it costs three lines of
 * chrome to show one row of data.
 */
function describe(elements: UIElement[], truncated: boolean): void {
	if (truncated) {
		console.warn('%cbudget ran out — this is not the whole tree', 'color:#b45309');
	}
	if (elements.length === 0) {
		console.log('%cnothing matched', 'color:#6b7280');
		return;
	}
	if (elements.length === 1) {
		console.log(elements[0]);
		return;
	}
	console.table(
		elements.map((element) => ({
			role: element.role,
			name: element.name ?? '',
			value: element.value ?? '',
			at: element.bounds ? `${element.bounds.x},${element.bounds.y}` : '',
			size: element.bounds ? `${element.bounds.width}x${element.bounds.height}` : '',
			path: element.path.join('.')
		}))
	);
}

/** An actual picture in the console, sized to the log line. */
function preview(shot: GrabResult): void {
	if (shot.path === undefined) {
		console.log(shot);
		return;
	}
	const height = Math.min(240, shot.height);
	const width = Math.round((shot.width / shot.height) * height);
	console.log(
		'%c ',
		`font-size:0;padding:${height / 2}px ${width / 2}px;` +
			`background:url("file://${encodeURI(shot.path)}") no-repeat;background-size:contain;`
	);
	console.log(`${shot.width}x${shot.height} ${shot.format} — ${shot.path}`);
}

/**
 * Custom object formatters, the DevTools feature that pays off most here.
 *
 * An accessibility tree is hundreds of objects with the same six keys, and the default
 * rendering makes every one of them look identical until expanded. A header line that
 * says role, name and geometry turns scrolling the log into reading it.
 *
 * Requires "Enable custom formatters" in DevTools settings, which is off by default and
 * is the reason so few projects ship these. Said out loud in help() rather than left as
 * a mystery about why the nice output is missing.
 */
function installFormatters(): void {
	const scope = window as unknown as { devtoolsFormatters?: unknown[] };
	const style = (color: string) => ({ style: `color:${color}` });

	const elementFormatter = {
		header(value: unknown) {
			if (!isElement(value)) {
				return null;
			}
			const parts: unknown[] = ['span', style('#111827'), ['span', style('#7c3aed'), value.role]];
			if (value.name) {
				parts.push(['span', style('#111827'), ` "${value.name}"`]);
			}
			if (value.bounds) {
				const { x, y, width, height } = value.bounds;
				parts.push(['span', style('#6b7280'), ` ${x},${y} ${width}x${height}`]);
			}
			if (value.focused) {
				parts.push(['span', style('#059669'), ' focused']);
			}
			if (value.enabled === false) {
				parts.push(['span', style('#b91c1c'), ' disabled']);
			}
			return parts;
		},
		hasBody(value: unknown) {
			return isElement(value);
		},
		body(value: unknown) {
			if (!isElement(value)) {
				return null;
			}
			const rows = Object.entries(value).map(([key, entry]) => [
				'div',
				{},
				['span', style('#6b7280'), `${key}: `],
				['object', { object: entry }]
			]);
			return ['div', { style: 'margin-left:12px' }, ...rows];
		}
	};

	const rectFormatter = {
		header(value: unknown) {
			if (!isRect(value)) {
				return null;
			}
			return [
				'span',
				style('#6b7280'),
				`${value.x},${value.y} ${value.width}x${value.height}`
			];
		},
		hasBody() {
			return false;
		}
	};

	scope.devtoolsFormatters = [...(scope.devtoolsFormatters ?? []), elementFormatter, rectFormatter];
}

function isElement(value: unknown): value is UIElement {
	if (typeof value !== 'object' || value === null) {
		return false;
	}
	const candidate = value as Partial<UIElement>;
	return typeof candidate.nativeRole === 'string' && Array.isArray(candidate.path);
}

function isRect(value: unknown): value is Rect {
	if (typeof value !== 'object' || value === null) {
		return false;
	}
	const candidate = value as Record<string, unknown>;
	return (
		Object.keys(candidate).length === 4 &&
		typeof candidate.x === 'number' &&
		typeof candidate.y === 'number' &&
		typeof candidate.width === 'number' &&
		typeof candidate.height === 'number'
	);
}

/**
 * Text rather than console.table, deliberately.
 *
 * This runs the moment DevTools attaches, which means the message is replayed out of the
 * backend's log rather than arriving live — and a replayed console.table degrades to a
 * collapsed Array(11). Styled text renders identically either way. console.table is
 * still right for query results, which are always typed while the console is open.
 */
function printHelp(view: 'overlay' | 'console'): void {
	const heading = 'font-weight:600;color:#7c3aed';
	const dim = 'color:#6b7280';
	const code = 'color:#7c3aed;font-family:ui-monospace,monospace';

	const lines: Array<[string, string]> = [
		["await $q('button')", 'query the focused app, table it, keep it as $a.last'],
		["await $show('button[name*=Save]')", 'query AND outline the matches on the real screen'],
		['await $hi($a.last)', 'outline elements or rects — takes either'],
		['await $clear()', 'remove the outlines'],
		['await $tree({ pid: 1234 })', 'the whole tree of one process'],
		['await $at(400, 300)', 'the element under a screen point'],
		['await $look()', 'screenshot the display, shown INLINE right here'],
		["await $look({ target: { selector: 'button' } })", 'screenshot one widget'],
		["await $say('hello')", 'one line on the overlay'],
		['await $windows()', 'every on-screen window, with ids capture can aim at'],
		['$help()', 'this again']
	];

	const width = Math.max(...lines.map(([call]) => call.length));
	const body = lines.map(([call, does]) => `${call.padEnd(width)}  ${does}`).join('\n');

	console.log(
		`%cScreen Angel — ${view} window\n` +
			'%cEverything is awaitable at the prompt. $a holds all of it; the $-prefixed names\n' +
			'are the same functions. Selectors are a CSS subset: space, >, comma,\n' +
			'[name=X] [name*=X] [name^=X] [name$=X], and :focused :enabled :disabled.\n\n' +
			`%c${body}\n\n` +
			'%cFor element objects to print as `button "Save" 320,185 16x16` instead of grey\n' +
			'Objects, turn on Settings > Console > Enable custom formatters.',
		heading,
		dim,
		code,
		dim
	);
}

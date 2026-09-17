/**
 * How a bridge recognizes its target.
 *
 * Patterns, not paths — the same rule the selector language enforces, one level up. A
 * bridge that matches an exact executable path breaks when the user installs the game
 * somewhere else, and a bridge that matches a window handle breaks when the game opens
 * a second window.
 *
 * This lives in common rather than in the host because the console needs it too: with
 * the matcher shared, the UI can show which bridge *would* attach to each open window
 * without the game being installed at all.
 */

import type { WindowInfo } from './types';

export interface BridgeMatcher {
	/** Substring of the application name, case-insensitive. */
	app?: string;
	/** Substring of the window title, case-insensitive. */
	title?: string;
}

export function matchesWindow(matcher: BridgeMatcher, window: WindowInfo): boolean {
	const contains = (haystack: string, needle: string) =>
		haystack.toLowerCase().includes(needle.toLowerCase());

	if (matcher.app !== undefined && !contains(window.app, matcher.app)) {
		return false;
	}
	if (matcher.title !== undefined && !contains(window.title, matcher.title)) {
		return false;
	}
	// An empty matcher would match everything, which is never what anyone meant.
	return matcher.app !== undefined || matcher.title !== undefined;
}

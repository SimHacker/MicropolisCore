/**
 * The Sims 1 Soul Bridge.
 *
 * The beachhead: a twenty-six-year-old game with a live community, a known file format,
 * an owner who has stopped maintaining it, and characters people still care about.
 * Everything Soul Angel claims has to be true here before it is claimed anywhere else.
 *
 * On attach, this does one thing, and what it finds is the argument for the whole
 * architecture. It asks the accessibility tree what the game exposes. The Sims 1 draws
 * its entire interface itself and exposes essentially nothing — a window, and inside it
 * a void. That is not a bug to work around later; it is the reason the pixel path is
 * the general path and the accessibility path is the bonus. The spec says so in prose;
 * this makes the machine say it out loud on every attach.
 */

import type { AngelServices, Bridge, WindowInfo } from '@screen-angel/host-api';

/** Roles you could actually click or type into, as opposed to structural containers. */
const INTERACTIVE_ROLES = new Set([
	'button',
	'checkbox',
	'combobox',
	'hyperlink',
	'listitem',
	'menuitem',
	'radiobutton',
	'slider',
	'splitbutton',
	'tabitem',
	'textfield',
	'treeitem'
]);

export function sims1Bridge(): Bridge {
	let attachedTo: WindowInfo | null = null;

	return {
		id: 'sims1',
		target: 'The Sims 1',

		// The Legacy re-release, the original disc build, and the community launchers all
		// present differently, so match loosely and on more than one thing.
		matches: [{ app: 'Sims' }, { title: 'The Sims' }, { app: 'SimsLegacy' }],

		async attach(window: WindowInfo, angel: AngelServices) {
			attachedTo = window;

			let tree;
			try {
				tree = await angel.dumpTree({ pid: window.pid, maxDepth: 6, maxNodes: 500 });
			} catch (error) {
				// Unreadable is a legitimate answer, not a failure to recover from: it is
				// what an elevated process or a revoked permission looks like from here.
				console.log(
					`[sims1] attached to ${window.app}; its interface tree is unreadable ` +
						`(${(error as Error).message})`
				);
				return;
			}

			const interactive = tree.elements.filter((element) =>
				INTERACTIVE_ROLES.has(element.role)
			).length;

			console.log(
				`[sims1] attached to ${window.app}: ${tree.elements.length} elements exposed, ` +
					`${interactive} of them interactive, in ${tree.durationMs.toFixed(0)}ms. ` +
					(interactive === 0
						? 'As expected — the game draws its own interface, so recognition has to come from pixels.'
						: 'More than expected; worth looking at what those are.')
			);
		},

		async detach() {
			if (attachedTo !== null) {
				console.log(`[sims1] detached from ${attachedTo.app}`);
				attachedTo = null;
			}
		}
	};
}

export default sims1Bridge;

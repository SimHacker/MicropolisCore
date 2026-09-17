/**
 * The Sims 1 Soul Bridge.
 *
 * The beachhead: a twenty-six-year-old game with a live community, a known file format,
 * an owner who has stopped maintaining it, and characters people still care about.
 * Everything Soul Angel claims has to be true here before it is claimed anywhere else.
 *
 * On attach, this does two things, and what it finds is the argument for the whole
 * architecture. It asks the accessibility tree what the game exposes: The Sims 1 draws
 * its entire interface itself and exposes essentially nothing — a window, and inside it
 * a void. Then it reads the interface anyway, off the pixels, with the game's own font.
 * That pairing is the point. The empty tree is not a bug to work around later; it is the
 * reason the pixel path is the general path and the accessibility path is the bonus, and
 * this makes the machine say both halves out loud on every attach.
 */

import type { AngelServices, Bridge, WindowInfo } from '@screen-angel/host-api';

import { createPanelReader, type PanelReader } from './text/analysis';

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
	let reader: PanelReader | null = null;

	return {
		id: 'sims1',
		target: 'The Sims 1',

		// The Legacy re-release, the original disc build, and the community launchers all
		// present differently, so match loosely and on more than one thing.
		matches: [{ app: 'Sims' }, { title: 'The Sims' }, { app: 'SimsLegacy' }],

		async attach(window: WindowInfo, angel: AngelServices) {
			attachedTo = window;
			reader = createPanelReader(angel);

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

			await reportPanel(window);
		},

		async detach() {
			if (attachedTo !== null) {
				console.log(`[sims1] detached from ${attachedTo.app}`);
				attachedTo = null;
				reader = null;
			}
		}
	};

	/**
	 * Read the control panel once and say what happened, either way.
	 *
	 * One frame on attach, not a polling loop. It answers the question a person actually has when
	 * they start this up — can it read the game or not — and it answers it in the log rather than
	 * requiring somebody to go and call a function.
	 */
	async function reportPanel(window: WindowInfo): Promise<void> {
		if (reader === null) return;
		try {
			const reading = await reader.read(window);
			if (reading.panel === null) {
				console.log(`[sims1] no panel text: ${reading.because}`);
				return;
			}
			const lines = reading.panel.description.split('\n');
			console.log(
				`[sims1] read the panel at ${(reading.panel.confidence * 100).toFixed(0)}% ink match, ` +
					`${lines.length} line(s): ${JSON.stringify(reading.panel.description)}`
			);
		} catch (error) {
			// Screen Recording may be unapproved, or the window may have gone. Neither is a reason
			// to take the bridge down; the tree report above still stands on its own.
			console.log(`[sims1] could not read the screen (${(error as Error).message})`);
		}
	}
}

export default sims1Bridge;

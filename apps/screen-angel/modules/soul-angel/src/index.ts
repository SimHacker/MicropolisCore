/**
 * Soul Angel — Screen Angel's first module.
 *
 * The specs for what this becomes are the eight YAML files beside this directory:
 * ARCHITECTURE.yml for the shell-and-web split, SOUL-ALBUM.yml for the card schema,
 * DVR.yml for the ring buffer, SOUL-BRIDGE-SDK.yml for the bridge interface,
 * GAME-BRIDGES.yml for the roster, SOUL-EMIGRATION.yml for the leaving ritual.
 *
 * What exists here today is the joint: the module registers its bridges and gets told
 * when the focus moves. Everything above that is unwritten, and the specs are the
 * backlog rather than a description of code.
 */

import type { ModuleContext, ScreenAngelModule } from '@screen-angel/host-api';
import { sims1Bridge } from '@screen-angel/soul-bridge-sims1';

export function soulAngel(): ScreenAngelModule {
	return {
		id: 'soul-angel',
		name: 'Soul Angel',

		activate(context: ModuleContext) {
			context.registerBridge(sims1Bridge());

			context.on('window-focus', (window) => {
				if (window === null) {
					context.log('nothing is focused');
					return;
				}
				context.log(`focus: ${window.app} — ${window.title || '(untitled)'}`);
			});

			context.log('activated; the album, DVR and emigration paths are still specs');
		}
	};
}

export default soulAngel;

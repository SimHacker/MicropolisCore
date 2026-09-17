/**
 * Which modules the app ships with.
 *
 * A static list, imported at build time, which is the right amount of machinery for
 * however many modules we write ourselves. Third-party modules need real discovery:
 * a manifest, a signature, a permission prompt naming what the module asked for, and a
 * sandbox to run it in. All of that is the module *host's* problem rather than this
 * file's, and none of it should be built before there is a third party asking.
 */

import { soulAngel } from '@screen-angel/soul-angel';

import type { ScreenAngelModule } from './module';

export function builtInModules(): ScreenAngelModule[] {
	return [soulAngel()];
}

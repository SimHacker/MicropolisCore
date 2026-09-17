/**
 * The game's own font, loaded once.
 *
 * Read from disk rather than imported, because the compiled font is a generated asset next to the
 * BMP it came from and importing JSON differs between the bundler, the test runner and Node. One
 * readFileSync at first use is cheaper than three configurations that have to agree.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadBitmapFont, type BitmapFont } from '@micropolis/optical-codec';

let cached: BitmapFont | null = null;

export function sims1UIFont(): BitmapFont {
	if (cached === null) {
		const here = dirname(fileURLToPath(import.meta.url));
		const path = join(here, '..', '..', 'assets', 'ui-font.json');
		cached = loadBitmapFont(JSON.parse(readFileSync(path, 'utf8')));
	}
	return cached;
}

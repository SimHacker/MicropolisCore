/**
 * Lift the interface font out of a Sims 1 installation and pack it for the recogniser.
 *
 *   pnpm --filter @screen-angel/soul-bridge-sims1 gzfont -- --from <UIGraphics/Fonts> [--sizes 09,12,48]
 *
 * Writes one packed binary per size into assets/fonts, plus a manifest naming the sizes, their line
 * heights, their byte counts and a hash of each. The manifest is metadata; the fonts are binary. A
 * JSON font would be 1.3 MB of coordinates for the family and would have to be parsed before the
 * first character could be read.
 *
 * The game's own files stay where they are. They belong to whoever owns the installation, they are
 * on the machine already, and a build step that reads them is a citation where a copy would be a
 * fork. Point --from at UIGraphics/Fonts and this reads VariableSans_NN.bmp + .fot; see gzfont.ts
 * for what those two files are.
 */

import { readdirSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { packCoverageFont, unpackCoverageFont } from '@micropolis/optical-codec';

import { readGZFont } from './gzfont';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '..', 'assets', 'fonts');

const args = new Map<string, string>();
for (let i = 2; i < process.argv.length; i++) {
	const arg = process.argv[i];
	if (!arg.startsWith('--')) continue;
	args.set(arg.slice(2), process.argv[i + 1]?.startsWith('--') ? '' : (process.argv[++i] ?? ''));
}

const from = args.get('from') ?? process.env.SIMS_FONTS_DIR;
if (!from || !existsSync(from)) {
	console.error('point --from at a Sims 1 UIGraphics/Fonts directory, or set SIMS_FONTS_DIR');
	console.error('it holds VariableSans_07.bmp/.fot through VariableSans_48.bmp/.fot');
	process.exit(1);
}

const wanted = args.get('sizes')?.split(',').filter(Boolean);
const available = readdirSync(from)
	.filter((f) => /^VariableSans_(\d+)\.bmp$/i.test(f))
	.map((f) => f.replace(/\.bmp$/i, ''))
	.sort();

const chosen = available.filter((name) => {
	if (!wanted) return true;
	const size = name.split('_')[1];
	return wanted.some((w) => w.padStart(2, '0') === size);
});

if (chosen.length === 0) {
	console.error(`no matching fonts in ${from}; found ${available.join(', ') || 'nothing'}`);
	process.exit(1);
}

mkdirSync(outDir, { recursive: true });

interface Entry {
	size: number;
	file: string;
	lineHeight: number;
	spaceWidth: number;
	glyphs: number;
	inkPixels: number;
	bytes: number;
	sha256: string;
}

const entries: Entry[] = [];

for (const name of chosen) {
	const { font, metrics, problems } = readGZFont(join(from, `${name}.bmp`), join(from, `${name}.fot`), name);
	for (const problem of problems) console.warn(`${name}: ${problem}`);

	const packed = packCoverageFont(font);

	// Unpack what was just written and compare, because a font that is silently one pixel off does
	// not fail here, it fails as unreadable text months later.
	const roundTrip = unpackCoverageFont(packed);
	for (const glyph of font.glyphs) {
		const other = roundTrip.glyphs.find((g) => g.code === glyph.code);
		const same = other !== undefined && other.width === glyph.width && other.cov.length === glyph.cov.length && other.cov.every((v, i) => v === glyph.cov[i]);
		if (!same) throw new Error(`${name}: glyph ${glyph.code} did not survive packing`);
	}

	const file = `${name}.gzf`;
	writeFileSync(join(outDir, file), packed);

	const inkPixels = font.glyphs.reduce((n, g) => n + g.cov.length / 3, 0);
	entries.push({
		size: font.size,
		file,
		lineHeight: font.height,
		spaceWidth: font.spaceWidth,
		glyphs: font.glyphs.filter((g) => g.cov.length > 0).length,
		inkPixels,
		bytes: packed.length,
		sha256: createHash('sha256').update(packed).digest('hex')
	});

	console.log(
		`${name}: size ${font.size}, line height ${font.height}, ${entries[entries.length - 1].glyphs} glyphs, ` +
			`${inkPixels} ink pixels, ${packed.length} bytes` +
			(metrics.fontType === 5 ? '' : ` (font type ${metrics.fontType}, expected 5 for kVariableSans)`)
	);
}

const manifest = {
	family: 'VariableSans',
	face: 'Comic Sans MS',
	source: 'The Sims 1, UIGraphics/Fonts (VariableSans_NN.bmp + .fot)',
	levels: 15,
	note: 'Coverage masks, not colour: the game supplies colour at blit time. See gzfont.ts for the file format and FONT-RECOGNITION.yml for what reads them.',
	fonts: entries.sort((a, b) => a.size - b.size)
};

writeFileSync(join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, '\t')}\n`);

const total = entries.reduce((n, e) => n + e.bytes, 0);
console.log(`\n${entries.length} fonts, ${total} bytes in ${outDir}`);

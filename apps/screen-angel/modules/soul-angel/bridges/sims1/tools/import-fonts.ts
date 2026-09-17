/**
 * Build assets/interface.fontpack: every face the reader can use, in our own format.
 *
 *   pnpm --filter @screen-angel/soul-bridge-sims1 import-fonts -- --from <UIGraphics/Fonts>
 *
 * Two importers, one file out.
 *
 *   The game's faces      VariableSans_07 through _20 and _48, read from the .bmp atlas and .fot
 *                         metrics an installation ships (gzfont.ts). Coverage kept exactly, advances
 *                         kept exactly, atlas position thrown away because nothing downstream cares
 *                         where in a sheet a letter used to live.
 *
 *   A face as JSON        Whatever tools/export-fonts.ts wrote, which closes the loop: a face can
 *                         leave the pack as text and PNG and come back in. This is how the 2004
 *                         Simplifier capture arrived — a BMP and three arrays of hand-measured
 *                         numbers that used to live in a source file, imported once, its captured
 *                         colours divided back into the coverage they always were. A screenshot of
 *                         anti-aliased text IS coverage, already multiplied by a colour.
 *
 * The pack carries its provenance in a META chunk, because a binary asset that cannot say where it
 * came from is how repositories end up with files nobody dares delete.
 *
 * Faces already in the pack are carried forward when their source is not to hand, which is the
 * ordinary case for the 2004 capture: its BMP and its three arrays of hand-measured numbers were
 * imported once and are not in the repository any more. Run this over a game installation and the
 * game faces are rebuilt while that one is kept.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { readFontPack, writeFontPack } from '@micropolis/optical-codec/node/pack';
import { deriveBaseline, loadCoverageFont, type CoverageFont } from '@micropolis/optical-codec';

import { readGZFont } from './gzfont';

const here = dirname(fileURLToPath(import.meta.url));
const assets = join(here, '..', 'assets');
const out = join(assets, 'interface.fontpack');

const args = new Map<string, string>();
for (let i = 2; i < process.argv.length; i++) {
	const arg = process.argv[i];
	if (!arg.startsWith('--')) continue;
	args.set(arg.slice(2), process.argv[i + 1]?.startsWith('--') ? '' : (process.argv[++i] ?? ''));
}

const from = args.get('from') ?? process.env.SIMS_FONTS_DIR;
const fromJSON = (args.get('from-json') ?? '').split(',').filter(Boolean);

/**
 * Curated provenance, kept as text in the repository rather than only inside the binary, so that a
 * rebuild cannot lose what only a person knows. Measured facts are computed below and win over it.
 */
const curatedPath = join(assets, 'font-provenance.json');
const curated: Record<string, Record<string, unknown>> = existsSync(curatedPath) ? JSON.parse(readFileSync(curatedPath, 'utf8')) : {};
const curatedFor = (name: string): Record<string, unknown> => {
	const family = /^([A-Za-z]+)_\d+$/.exec(name)?.[1];
	const { _applies_to: _skip, ...shared } = (family ? curated[family] : undefined) ?? {};
	const { _: _alsoSkip, ...own } = curated[name] ?? {};
	return { ...shared, ...own };
};

// What is already in the pack, so anything whose source is gone survives a rebuild.
const existing = existsSync(out) ? readFontPack(out) : { faces: [], meta: undefined };
const existingProvenance = new Map<string, Record<string, unknown>>();
for (const entry of ((existing.meta as { faces?: Record<string, unknown>[] } | undefined)?.faces ?? [])) {
	if (typeof entry.face === 'string') existingProvenance.set(entry.face, entry);
}

const faces: CoverageFont[] = [];
const provenance: Record<string, unknown>[] = [];

const carry = (face: CoverageFont) => {
	faces.push(face);
	provenance.push({ ...(existingProvenance.get(face.name) ?? { face: face.name, size: face.size }), ...curatedFor(face.name) });
};

if (!from || !existsSync(from)) {
	if (existing.faces.length === 0) {
		console.error('point --from at a Sims 1 UIGraphics/Fonts directory, or set SIMS_FONTS_DIR');
		process.exit(1);
	}
	console.log('no installation given; keeping the faces already in the pack');
}

const installation = from !== undefined && existsSync(from) ? from : null;

if (installation !== null) {
	for (const file of readdirSync(installation).sort()) {
		if (!/^VariableSans_\d+\.bmp$/i.test(file)) continue;
		const name = file.replace(/\.bmp$/i, '');
		const { font, metrics, problems } = readGZFont(join(installation, `${name}.bmp`), join(installation, `${name}.fot`), name);
		for (const problem of problems) console.warn(`${name}: ${problem}`);
		font.baseline = deriveBaseline(font);
		faces.push(font);
		provenance.push({
			...curatedFor(font.name),
			face: font.name,
			size: font.size,
			lineHeight: font.height,
			baseline: font.baseline,
			glyphs: font.glyphs.filter((g) => g.cov.length > 0).length,
			inkPixels: font.glyphs.reduce((n, g) => n + g.cov.length / 3, 0),
			source: `UIGraphics/Fonts/${name}.bmp + .fot`,
			fontType: metrics.fontType,
			typeface: 'Comic Sans MS'
		});
	}
}

for (const face of existing.faces) {
	// Anything the installation did not just supply, and that is not being re-imported below.
	if (faces.some((f) => f.name === face.name)) continue;
	carry(face);
}

if (faces.length === 0) {
	console.error(`nothing to pack: no VariableSans_NN.bmp in ${from} and no existing pack to carry forward`);
	process.exit(1);
}

for (const path of fromJSON) {
	const face = loadCoverageFont(JSON.parse(readFileSync(path, 'utf8')));
	if (face.baseline === undefined) face.baseline = deriveBaseline(face);
	const at = faces.findIndex((f) => f.name === face.name);
	if (at >= 0) faces.splice(at, 1);
	faces.push(face);
	provenance.push({
		...curatedFor(face.name),
		face: face.name,
		size: face.size,
		lineHeight: face.height,
		baseline: face.baseline,
		glyphs: face.glyphs.filter((g) => g.cov.length > 0).length,
		imported_from: path
	});
}

faces.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
provenance.sort((a, b) => (String(a.face) < String(b.face) ? -1 : String(a.face) > String(b.face) ? 1 : 0));

mkdirSync(assets, { recursive: true });
const bytes = writeFontPack(out, {
	faces,
	meta: {
		what: 'Interface faces for reading and drawing The Sims 1 text, in the pack format of packages/optical-codec.',
		format: 'FNTP v1: chunk list, faces in the nibble-packed coverage form, raw deflate per chunk.',
		coverage: 'Four bits, 0 to 15. Not colour: colour is applied when text is drawn, which is why one face serves every panel.',
		who_reads_it: 'apps/screen-angel/modules/soul-angel/bridges/sims1/src/text',
		exporters: 'tools/export-fonts.ts writes PNG contact sheets and JSON metrics, so nothing here is one-way.',
		typeface_rights:
			'Glyph shapes are Comic Sans MS as rendered by Maxis into the game files, and the 2004 face is a ' +
			'screenshot of the same. Compressed and packed for this application, not relicensed by being so: ' +
			'regenerate from your own installation with tools/import-fonts.ts if that matters to you.',
		curated_provenance: 'assets/font-provenance.json, merged in at import time.',
		faces: provenance
	}
});

const inkTotal = faces.reduce((n, face) => n + face.glyphs.reduce((m, g) => m + g.cov.length / 3, 0), 0);
console.log(`${faces.length} faces, ${inkTotal} ink pixels`);
for (const face of faces) console.log(`  ${face.name.padEnd(16)} size ${String(face.size).padStart(2)} line ${String(face.height).padStart(2)} baseline ${face.baseline}`);
console.log(`\nwrote ${out} (${bytes} bytes)`);

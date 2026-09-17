/**
 * Take the pack apart again: contact sheets, metrics, provenance.
 *
 *   pnpm --filter @screen-angel/soul-bridge-sims1 export-fonts -- [--out exports] [--face VariableSans_08]
 *
 * A binary asset with no exporter is a hostage. This writes, per face, a PNG contact sheet of every
 * glyph with its coverage rendered as grey, and a JSON file of the metrics — advance, offsets, size,
 * line height, baseline, and the coverage of each glyph as levels. Between them, everything the pack
 * knows is legible without this code, and the importer can build a face back from the JSON.
 *
 * The contact sheet is for eyes: it is how you see that a glyph is one pixel low, or that a size has
 * arrived with its accents mangled, without writing an assertion about it first.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

import { readFontPack } from '@micropolis/optical-codec/node/pack';
import { createFontContext, createRaster, fillRect, setPixel, toPNG, type CoverageFont } from '@micropolis/optical-codec';

const here = dirname(fileURLToPath(import.meta.url));
const packPath = join(here, '..', 'assets', 'interface.fontpack');

const args = new Map<string, string>();
for (let i = 2; i < process.argv.length; i++) {
	const arg = process.argv[i];
	if (!arg.startsWith('--')) continue;
	args.set(arg.slice(2), process.argv[i + 1]?.startsWith('--') ? '' : (process.argv[++i] ?? ''));
}

const outDir = join(here, '..', args.get('out') || 'exports');
const only = args.get('face');

const pack = readFontPack(packPath);
mkdirSync(outDir, { recursive: true });

writeFileSync(join(outDir, 'provenance.json'), `${JSON.stringify(pack.meta, null, '\t')}\n`);

/** Every glyph in a grid, coverage as grey, with a sample line of text underneath. */
function contactSheet(face: CoverageFont): Uint8Array {
	const glyphs = face.glyphs.filter((g) => g.cov.length > 0);
	const columns = 16;
	const cellW = Math.max(...glyphs.map((g) => g.width)) + 6;
	const cellH = face.height + 6;
	const rows = Math.ceil(glyphs.length / columns);
	const sample = 'Handgloves 0123 $1,250';
	const context = createFontContext(face, { textBaseline: 'top' });
	const sampleWidth = context.measureText(sample).width + 8;

	const width = Math.max(columns * cellW, sampleWidth);
	const height = rows * cellH + cellH * 2;
	const sheet = createRaster(width, height, [18, 18, 22]);

	glyphs.forEach((glyph, i) => {
		const col = i % columns;
		const row = Math.floor(i / columns);
		const originX = col * cellW + 3;
		const originY = row * cellH + 3;
		// A back panel per cell, so a glyph that overhangs its advance is visible as overhang.
		fillRect(sheet, col * cellW, row * cellH, cellW - 1, cellH - 1, (col + row) % 2 ? [30, 30, 36] : [24, 24, 30]);
		// The baseline, drawn dim, because a wrong baseline is the error you cannot see otherwise.
		fillRect(sheet, col * cellW, originY + (face.baseline ?? face.height), glyph.width + 1, 1, [60, 50, 40]);
		for (let i2 = 0; i2 < glyph.cov.length; i2 += 3) {
			const level = Math.round((glyph.cov[i2 + 2] * 255) / face.levels);
			setPixel(sheet, originX + glyph.cov[i2], originY + glyph.cov[i2 + 1], [level, level, level]);
		}
	});

	context.fillText(sheet, sample, 4, rows * cellH + 4, [235, 235, 245]);
	return toPNG(sheet, deflateSync);
}

let sheets = 0;
for (const face of pack.faces) {
	if (only !== undefined && only !== '' && face.name !== only) continue;

	writeFileSync(join(outDir, `${face.name}.png`), contactSheet(face));
	writeFileSync(
		join(outDir, `${face.name}.json`),
		`${JSON.stringify(
			{
				name: face.name,
				size: face.size,
				lineHeight: face.height,
				levels: face.levels,
				spaceWidth: face.spaceWidth,
				baseline: face.baseline,
				glyphs: face.glyphs.map((glyph) => ({ char: glyph.char, code: glyph.code, advance: glyph.width, cov: glyph.cov }))
			},
			null,
			'\t'
		)}\n`
	);
	sheets++;
	const context = createFontContext(face);
	const metrics = context.measureText('Handgloves');
	console.log(
		`${face.name.padEnd(16)} size ${String(face.size).padStart(2)} line ${String(face.height).padStart(2)} ` +
			`baseline ${String(face.baseline).padStart(2)} ` +
			`"Handgloves" ${metrics.width}px wide, ${metrics.actualBoundingBoxAscent} above the baseline and ${metrics.actualBoundingBoxDescent} below`
	);
}

console.log(`\nwrote ${sheets} contact sheets and metrics files to ${outDir}`);

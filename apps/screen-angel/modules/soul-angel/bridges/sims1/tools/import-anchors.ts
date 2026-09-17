/**
 * Build assets/interface.anchors: pieces of the game's own panel art, to find the panel by.
 *
 *   pnpm --filter @screen-angel/soul-bridge-sims1 import-anchors -- --from <UIGraphics/cpanel>
 *
 * The 2004 reader found the panel by sampling four pixels at coordinates measured against an 800x600
 * window, two of them nearly black. It worked, and it is the wrong instrument: it cannot survive a
 * different window size, a modded background, or a screenshot that has been scaled. The game draws
 * fixed art at fixed offsets from the edges of its window, so the art itself is the landmark.
 *
 * What the game does, from its own source (SimsApp.cpp WindowSetup, WinCPanel.cpp):
 *
 *   cWinCPanel        the whole HUD. area.top = area.bottom - 150, full width. Bottom-anchored, and
 *                     never scaled: the art is blitted at native size at both supported resolutions.
 *   cWinViewControl   the left column, 220x183, at x 0, its own height up from the bottom.
 *   the subpanels     at x 220, 100 tall, sitting 100 up from the bottom, width = screen width - 220.
 *                     PanelBack.bmp is 804 wide because 1024 - 220 is 804; at 800 it is clipped.
 *
 * So a piece of PanelBack's top-left corner pins both axes at once: 220 from the left, 100 up from
 * the bottom. UniversalBack pins the left column, and BackPatch pins the seam between them. Any one
 * of the three is enough; agreement between them is the check that it is really the panel.
 *
 * Crops rather than whole bitmaps: a corner is enough to correlate against, costs a few hundred
 * bytes, and cannot be spoiled by whatever the game drew over the middle of the art.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { decodeBMP } from '@micropolis/optical-codec/node/bmp';
import { readFontPack, writeFontPack } from '@micropolis/optical-codec/node/pack';
import { templateFrom, type Template } from '@micropolis/optical-codec';

const here = dirname(fileURLToPath(import.meta.url));
const assets = join(here, '..', 'assets');
const out = join(assets, 'interface.anchors');

const args = new Map<string, string>();
for (let i = 2; i < process.argv.length; i++) {
	const arg = process.argv[i];
	if (!arg.startsWith('--')) continue;
	args.set(arg.slice(2), process.argv[i + 1]?.startsWith('--') ? '' : (process.argv[++i] ?? ''));
}

const from = args.get('from') ?? process.env.SIMS_CPANEL_DIR;

/**
 * Which art, which corner of it, and where the game puts that corner.
 *
 * y is negative because it is measured up from the bottom of the window, which is how the game
 * places the panel and the only reason any of this works at another resolution.
 */
const WANTED: { file: string; crop: { x: number; y: number; width: number; height: number }; anchor: Template['anchor']; what: string }[] = [
	{
		file: 'Backgrounds/PanelBack.bmp',
		crop: { x: 0, y: 0, width: 64, height: 32 },
		anchor: { x: 220, y: -100, fromBottom: true },
		what: 'Top-left corner of the subpanel background, which every mode draws behind its own art.'
	},
	{
		file: 'Backgrounds/UniversalBack.bmp',
		crop: { x: 0, y: 0, width: 64, height: 32 },
		anchor: { x: 0, y: -183, fromBottom: true },
		what: 'Top-left corner of the left column, the one control that is present in every mode.'
	},
	{
		file: 'Backgrounds/BackPatch.bmp',
		crop: { x: 0, y: 0, width: 48, height: 32 },
		anchor: { x: 168, y: -100, fromBottom: true },
		what: 'The seam patch between the left column and the subpanel, drawn at 219 - 51.'
	}
];

const templates: Template[] = [];
const provenance: Record<string, unknown>[] = [];

if (from !== undefined && existsSync(from)) {
	for (const wanted of WANTED) {
		const path = join(from, wanted.file);
		if (!existsSync(path)) {
			console.warn(`missing ${wanted.file}, skipping`);
			continue;
		}
		const bmp = decodeBMP(readFileSync(path));
		if (wanted.crop.x + wanted.crop.width > bmp.width || wanted.crop.y + wanted.crop.height > bmp.height) {
			console.warn(`${wanted.file} is ${bmp.width}x${bmp.height}, too small for the crop, skipping`);
			continue;
		}
		const name = wanted.file.replace(/^.*\//, '').replace(/\.bmp$/i, '');
		const template = templateFrom(bmp.raster, name, wanted.crop, wanted.anchor);
		templates.push(template);
		provenance.push({
			anchor: name,
			source: `UIGraphics/cpanel/${wanted.file}`,
			art_size: `${bmp.width}x${bmp.height}`,
			crop: `${wanted.crop.width}x${wanted.crop.height} at ${wanted.crop.x},${wanted.crop.y}`,
			sits_at: `${wanted.anchor?.x} from the left, ${Math.abs(wanted.anchor?.y ?? 0)} up from the bottom`,
			what: wanted.what
		});
	}
} else {
	console.log('no installation given; keeping whatever is already in the pack');
}

const existing = existsSync(out) ? readFontPack(out) : { faces: [], templates: [], meta: undefined };
const existingProvenance = new Map<string, Record<string, unknown>>();
for (const entry of ((existing.meta as { anchors?: Record<string, unknown>[] } | undefined)?.anchors ?? [])) {
	if (typeof entry.anchor === 'string') existingProvenance.set(entry.anchor, entry);
}
for (const template of existing.templates ?? []) {
	if (templates.some((t) => t.name === template.name)) continue;
	templates.push(template);
	provenance.push(existingProvenance.get(template.name) ?? { anchor: template.name, source: 'carried forward from the previous pack' });
}

if (templates.length === 0) {
	console.error('nothing to pack: point --from at a Sims 1 UIGraphics/cpanel directory, or set SIMS_CPANEL_DIR');
	process.exit(1);
}

templates.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
provenance.sort((a, b) => (String(a.anchor) < String(b.anchor) ? -1 : String(a.anchor) > String(b.anchor) ? 1 : 0));

const bytes = writeFontPack(out, {
	faces: [],
	templates,
	meta: {
		what: 'Crops of The Sims 1 control panel art, for locating the panel in a frame at any window size.',
		format: 'The pack container of packages/optical-codec (FNTP), TMPL chunks only.',
		greyscale: 'Structure is what survives a mod or a re-release; hue is the first thing either changes.',
		the_layout_they_pin:
			'cWinCPanel is bottom-anchored and 150 tall at full width (SimsApp.cpp: area.top = area.bottom - 150). ' +
			'The left column is 220 wide; the subpanels sit at x 220 and are 100 tall. None of it is ever scaled by ' +
			'the game, so an anchor found at scale 1 means a native capture and any other scale means somebody ' +
			'stretched the window.',
		who_reads_it: 'src/text/panel.ts, which derives every other rectangle from whichever anchor is found.',
		art_rights:
			'Small greyscale crops of Maxis interface art, kept as landmarks rather than for display. Rebuild from ' +
			'your own installation with tools/import-anchors.ts.',
		anchors: provenance
	}
});

for (const entry of provenance) console.log(`  ${String(entry.anchor).padEnd(16)} ${entry.crop ?? ''} ${entry.sits_at ?? ''}`);
console.log(`\nwrote ${out} (${bytes} bytes)`);

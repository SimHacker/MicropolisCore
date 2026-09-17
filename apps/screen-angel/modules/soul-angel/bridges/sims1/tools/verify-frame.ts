/**
 * Check a real frame, and say plainly which claims it confirms.
 *
 *   pnpm --filter @screen-angel/soul-bridge-sims1 verify path/to/screenshot.png
 *
 * Every number this repository publishes about reading The Sims 1 was measured on pixels this
 * repository drew: the font came out of the game, the panel geometry came out of the game's source, and
 * the eggs were rendered by the same code that reads them. That is a floor, not a fact. One capture the
 * game itself produced turns the whole set of claims from plausible into checked, and this is the thing
 * that does the turning.
 *
 * It refuses in specifics. "Panel not found" is useless; "found the window at scale 1.5, which means
 * the capture was stretched, and decimating it left the description strip 2 rows short" is a lead.
 */

import { readFileSync } from 'node:fs';
import { basename } from 'node:path';

import { decodePNG } from '@micropolis/optical-codec/node/png';
import { readEggs, type EggReading } from '@micropolis/optical-codec';

import { sims1Anchors, sims1PanelFont } from '../src/text/font';
import { findGameWindowByArt, findGameWindowByColours, findPanel, readPanelText } from '../src/text/panel';

const path = process.argv[2];
if (path === undefined) {
	console.error('usage: verify-frame <screenshot.png>\n\nSee fixtures/README.md for what capture to take.');
	process.exit(2);
}

const frame = decodePNG(readFileSync(path));
console.log(`${basename(path)}: ${frame.width}x${frame.height}\n`);

// FINDING THE WINDOW
//
// Both ways, always, even when the first one answers — a disagreement between the art and the four
// corner colours is the most informative thing this tool can find, and it is silent if only one runs.

const anchors = sims1Anchors();
if (anchors.length === 0) {
	console.log('No anchors built in this checkout, so only the four corner colours can find the window.');
	console.log('Build them with: pnpm --filter @screen-angel/soul-bridge-sims1 import-anchors\n');
}
const byArt = findGameWindowByArt(frame, anchors);
const byColours = findGameWindowByColours(frame);

console.log('the window');
if (byArt === null) {
	console.log('  art      not found. Either this is not The Sims, or the panel art has been reskinned.');
} else {
	console.log(`  art      left ${byArt.left}, right ${byArt.right}, bottom row ${byArt.bottomRow}, scale ${byArt.scale.toFixed(3)} (correlation ${byArt.score.toFixed(3)}, anchor ${byArt.anchor ?? 'unnamed'})`);
	if (Math.abs(byArt.scale - 1) > 0.01) {
		console.log(`           STRETCHED. Decimated back to native pixels before reading; a smooth upscale cannot be undone, so expect lower text confidence.`);
	}
}
console.log(byColours === null ? '  colours  not found.' : `  colours  left ${byColours.left}, right ${byColours.right}, bottom row ${byColours.bottomRow}`);

if (byArt !== null && byColours !== null) {
	const agree = byArt.left === byColours.left && byArt.bottomRow === byColours.bottomRow;
	console.log(agree ? '  BOTH AGREE, which is the result worth having.' : '  THEY DISAGREE. One of the two is wrong and the tests cannot tell you which; look at the frame.');
}

const window = byArt ?? byColours;
if (window === null) {
	console.log('\nNothing further can be checked without a window. Not a failed read — a refused one.');
	process.exit(1);
}

// THE PANEL AND ITS TEXT

const region = findPanel(frame, window);
console.log(`\nthe description strip\n  ${region === null ? 'not found inside the window' : `x ${region.x}, y ${region.y}, ${region.width}x${region.height}`}`);

const font = sims1PanelFont();
const text = readPanelText(frame, font, anchors);
if (text === null) {
	console.log('  no text read.');
} else {
	console.log(`  pixels explained: ${(text.confidence * 100).toFixed(1)}%`);
	console.log(`  found by: ${text.window.found}`);
	console.log('  read back:');
	for (const line of text.description.split('\n')) console.log(`    | ${line}`);
	if (text.confidence < 0.9) {
		console.log('  LOW. Below about 90% the reading is a guess dressed as a string: check the font size against');
		console.log('  the sizes the game ships (tools/identify-font.ts) before believing any of it.');
	}
}

// EGGS
//
// There are none in the game yet, so finding none is the expected result and finding one is news.

const eggs = readEggs(frame);
console.log(`\neggs\n  ${eggs.length === 0 ? 'none, which is correct until an egg object exists' : `${eggs.length} found`}`);
for (const egg of eggs) describe(egg);

function describe(egg: EggReading): void {
	const where = `(${egg.box.x},${egg.box.y}) ${egg.box.width}x${egg.box.height}`;
	const bands = `band ${egg.bandHeight.toFixed(1)}px, digits [${egg.digits.join(' ')}]`;
	const verdict =
		egg.code === null
			? `refused: ${egg.refused}`
			: `kind ${egg.code.kind}, ${egg.code.groups} of 3 groups verified${egg.code.id === null ? '' : `, id ${egg.code.id}`}${egg.code.value === null ? '' : `, value ${egg.code.value}`}`;
	console.log(`  ${where}  ${bands}  margin ${egg.margin.toFixed(0)}  ${verdict}`);
}

// WHAT A PASS MEANS

console.log(`
what this run settles
  The window was found on real pixels, or it was not. Everything else in RECOGNIZER.yml and
  FONT-RECOGNITION.yml stands on that one question, and it is the only one a synthetic frame cannot
  answer. A pass here does not make the egg numbers real: those need an egg the game drew.`);

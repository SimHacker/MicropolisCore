/**
 * QR in and out, over zxing-wasm.
 *
 * One decoder for every surface we have — Electron main, the renderer, a phone browser — because
 * it is WebAssembly rather than a platform service. The native BarcodeDetector was the tempting
 * alternative and is not usable: it exists on Android and in Safari, and on desktop Chrome it is
 * either absent or refuses QR (RECOGNIZER.yml, why_not_the_native_detector).
 *
 * Writing is here for the same reason the renderer is: a test that generates its own targets can
 * be run ten thousand times, and one that needs a photograph cannot.
 *
 * What the library already handles, and we therefore do not: finding the three finder patterns,
 * solving the perspective transform from them, sampling the module grid through it, rotation,
 * inversion, and retries at reduced scale. A phone held at an angle to a monitor is the ordinary
 * case for this decoder rather than a hard one.
 */

import { readBarcodes, type ReadResult } from 'zxing-wasm/reader';
import { writeBarcode } from 'zxing-wasm/writer';

import { createRaster, setPixel, type Raster } from './raster';

export interface QRFinding {
	text: string;
	/** Axis-aligned bounds of the four corners zxing reported. */
	box: { x: number; y: number; width: number; height: number };
	format: string;
}

/** Anything zxing can take, plus our own raster. */
export type QRInput = Raster | Blob | ArrayBuffer | Uint8Array;

/**
 * Find every QR code in one frame.
 *
 * `tryHarder` is on. The alternative saves a few milliseconds on a frame that has nothing in it
 * and loses codes on the frames that matter, which is the wrong trade for a channel whose whole
 * job is to be readable off a screen someone is pointing a phone at.
 */
export async function findQRCodes(input: QRInput): Promise<QRFinding[]> {
	const results = await readBarcodes(toZXingInput(input), {
		formats: ['QRCode', 'MicroQRCode'],
		tryHarder: true,
		tryInvert: true,
		// A code drawn larger than the decoder wants can fail where the same code at half size
		// reads, so the reduced-scale attempts matter. They are the library's own, not ours.
		tryDownscale: true,
		maxNumberOfSymbols: 16
	});
	return results.filter((r) => r.isValid).map(toFinding);
}

function toFinding(r: ReadResult): QRFinding {
	const points = [r.position.topLeft, r.position.topRight, r.position.bottomRight, r.position.bottomLeft];
	const xs = points.map((p) => p.x);
	const ys = points.map((p) => p.y);
	const x = Math.min(...xs);
	const y = Math.min(...ys);
	return {
		text: r.text,
		format: r.format,
		box: { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y }
	};
}

function toZXingInput(input: QRInput): Blob | ArrayBuffer | Uint8Array | ImageData {
	if (isRaster(input)) {
		// Structurally an ImageData; the DOM class is not available in Node and is not needed.
		return { data: input.data, width: input.width, height: input.height, colorSpace: 'srgb' } as ImageData;
	}
	return input;
}

function isRaster(input: QRInput): input is Raster {
	return typeof input === 'object' && input !== null && 'data' in input && 'width' in input && 'height' in input;
}

/**
 * Render a QR code as a raster, one module per `scale` pixels, with an explicit quiet zone.
 *
 * The writer hands back a one-byte-per-module bitmap alongside its SVG and PNG, and that bitmap is
 * the thing to use: scaling it by an integer gives pixel-exact modules, so a fixture that fails
 * fails because of the codec rather than because of somebody's resampling. `scale` is the number
 * that matters in practice — it is how many screen pixels one module gets, and therefore how small
 * the About dialog is allowed to draw its code.
 */
export async function renderQRCode(text: string, scale = 4, quietZone = 4): Promise<Raster> {
	const written = await writeBarcode(text, { format: 'QRCode', ecLevel: 'M', withQuietZones: false });
	const symbol = written.symbol;
	if (!symbol) throw new Error(`zxing wrote no symbol: ${written.error || 'unknown reason'}`);
	const side = (symbol.width + quietZone * 2) * scale;
	const out = createRaster(side, side, [255, 255, 255]);
	for (let my = 0; my < symbol.height; my++) {
		for (let mx = 0; mx < symbol.width; mx++) {
			// Zint's convention: 0 is ink, 255 is paper.
			if (symbol.data[my * symbol.width + mx] !== 0) continue;
			const px = (mx + quietZone) * scale;
			const py = (my + quietZone) * scale;
			for (let y = 0; y < scale; y++) {
				for (let x = 0; x < scale; x++) setPixel(out, px + x, py + y, [0, 0, 0]);
			}
		}
	}
	return out;
}

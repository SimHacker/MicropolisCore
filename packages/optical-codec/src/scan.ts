/**
 * One frame in, findings out.
 *
 * This is the whole recognition layer as it stands: QR first, because QR is a solved problem with a
 * maintained decoder, and because the About dialog's code is the path that has to work before any of
 * the clever channels are worth building. Egg reading arrives next round and slots in beside it
 * (RECOGNIZER.yml).
 *
 * The scan is a function of a frame, deliberately. It holds no capture handle, no timer and no
 * device, so the same code runs over a live grab, a saved PNG and a synthetic fixture — which is
 * what makes the fixtures worth anything.
 *
 * Thin, because zxing already does the work that would otherwise live here: locating symbols,
 * solving the perspective, and retrying at reduced scale. Reimplementing any of that would mean
 * maintaining a worse version of it.
 */

import { findQRCodes, type QRFinding, type QRInput } from './qr';

export interface ScanOptions {
	/** Wall-clock ceiling. A recognizer that makes a game stutter gets turned off, so it must not. */
	budgetMs?: number;
}

export interface ScanResult {
	qr: QRFinding[];
	/** Reserved for the next round; empty rather than absent, so callers can be written once. */
	eggs: never[];
	elapsedMs: number;
	/** True when the scan came back over budget, which is a reason to look less often. */
	overBudget: boolean;
}

export async function scanFrame(input: QRInput, options: ScanOptions = {}): Promise<ScanResult> {
	const started = now();
	const qr = await findQRCodes(input);
	const elapsedMs = now() - started;
	return { qr, eggs: [], elapsedMs, overBudget: elapsedMs > (options.budgetMs ?? 250) };
}

function now(): number {
	return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

/**
 * recognize.scan: grab a frame, and answer with what was written on it.
 *
 * The whole verb is a capture followed by a decode, and it exists as one verb rather than two
 * because the alternative — hand the caller an image and let it do the reading — puts a decoder in
 * every client and moves pixels across a socket for no reason.
 *
 * PNG, always. The capture service prefers JPEG for screens and it is right to, but a small QR code
 * is precisely the content JPEG damages worst: hard edges, tiny features, and every artifact landing
 * on the modules. A caller who wants a cheap picture should use capture.grab; this one is here to
 * read something.
 */

import type { CaptureService } from '../capture/service';
import { findQRCodes, type QRFinding } from '@micropolis/optical-codec';
import { useLocalZXingWasm } from '@micropolis/optical-codec/node';
import type { RecognizeParams, RecognizeResult } from '@common/protocol';

export class RecognizeService {
	public constructor(private readonly capture: CaptureService) {}

	public async scan(params: RecognizeParams, pid?: number): Promise<RecognizeResult> {
		useLocalZXingWasm();
		const started = Date.now();

		const grabbed = await this.capture.grab(
			{
				target: params.target,
				region: params.region,
				size: params.size,
				pad: params.pad,
				format: 'png'
			},
			['file'],
			{ pid }
		);
		const grabMs = Date.now() - started;

		// zxing decodes the container itself, so the encoded bytes go straight in. Decoding the PNG
		// here first would mean carrying an image decoder to hand the wasm module something it
		// already knows how to read.
		const { data, entry } = await this.capture.fetchBytes(grabbed.id);
		const decodeStarted = Date.now();
		const qr = await findQRCodes(new Uint8Array(data));

		return {
			image: { id: entry.id, width: entry.width, height: entry.height, scale: entry.scale },
			qr: qr.map(withScale(entry.scale)),
			// Empty until the egg reader lands. Present now so callers are written once
			// (RECOGNIZER.yml, the_two_readers).
			eggs: [],
			timing: { grabMs, decodeMs: Date.now() - decodeStarted }
		};
	}
}

/**
 * Boxes in screen points, not capture pixels.
 *
 * Everything else in the protocol speaks points, and a caller that wants to outline what was found
 * — which is the first thing anyone does with this — would otherwise draw a rectangle at twice the
 * coordinates on any retina display.
 */
function withScale(scale: number) {
	return (finding: QRFinding) => ({
		text: finding.text,
		format: finding.format,
		box: {
			x: finding.box.x / scale,
			y: finding.box.y / scale,
			width: finding.box.width / scale,
			height: finding.box.height / scale
		}
	});
}

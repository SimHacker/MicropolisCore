import type { FrameNineSliceLayout, FrameRect, FrameRimPx } from './types.js';

export function frameRectWidth(r: FrameRect): number {
	return r.right - r.left;
}

export function frameRectHeight(r: FrameRect): number {
	return r.bottom - r.top;
}

/** Expand `inner` outward by per-side rim thickness → `outer`. */
export function outerFromInner(inner: FrameRect, rim: FrameRimPx): FrameRect {
	return {
		left: inner.left - rim.left,
		top: inner.top - rim.top,
		right: inner.right + rim.right,
		bottom: inner.bottom + rim.bottom,
	};
}

/** Shrink `outer` inward by rim → `inner` (inverse of {@link outerFromInner}). */
export function innerFromOuter(outer: FrameRect, rim: FrameRimPx): FrameRect {
	return {
		left: outer.left + rim.left,
		top: outer.top + rim.top,
		right: outer.right - rim.right,
		bottom: outer.bottom - rim.bottom,
	};
}

/**
 * Split destination `outer` into nine regions using source slice insets scaled to
 * destination corner/edge sizes. Edges stretch along one axis; corners keep aspect.
 *
 * @param outer Destination rectangle (screen px).
 * @param slice Source insets in atlas pixels.
 * @param sourceSize Source image dimensions.
 * @param scale Uniform scale applied to corner/edge thickness in destination.
 */
export function layoutNineSlice(
	outer: FrameRect,
	slice: { top: number; right: number; bottom: number; left: number },
	sourceSize: { width: number; height: number },
	scale = 1,
	hollow = true,
): FrameNineSliceLayout {
	const w = frameRectWidth(outer);
	const h = frameRectHeight(outer);
	const sx = scale;
	const cwL = (slice.left / sourceSize.width) * w * sx;
	const cwR = (slice.right / sourceSize.width) * w * sx;
	const chT = (slice.top / sourceSize.height) * h * sx;
	const chB = (slice.bottom / sourceSize.height) * h * sx;

	const clampedCwL = Math.min(cwL, w * 0.5);
	const clampedCwR = Math.min(cwR, w * 0.5);
	const clampedChT = Math.min(chT, h * 0.5);
	const clampedChB = Math.min(chB, h * 0.5);

	const x0 = outer.left;
	const x1 = outer.left + clampedCwL;
	const x2 = outer.right - clampedCwR;
	const x3 = outer.right;
	const y0 = outer.top;
	const y1 = outer.top + clampedChT;
	const y2 = outer.bottom - clampedChB;
	const y3 = outer.bottom;

	const corners = {
		topLeft: { left: x0, top: y0, right: x1, bottom: y1 },
		topRight: { left: x2, top: y0, right: x3, bottom: y1 },
		bottomLeft: { left: x0, top: y2, right: x1, bottom: y3 },
		bottomRight: { left: x2, top: y2, right: x3, bottom: y3 },
	};

	const edges = {
		top: { left: x1, top: y0, right: x2, bottom: y1 },
		bottom: { left: x1, top: y2, right: x2, bottom: y3 },
		left: { left: x0, top: y1, right: x1, bottom: y2 },
		right: { left: x2, top: y1, right: x3, bottom: y2 },
	};

	const center = hollow
		? undefined
		: { left: x1, top: y1, right: x2, bottom: y2 };

	return { corners, edges, center };
}

/** Apply uniform scale to all sides of a rim policy. */
export function scaleRimPx(rim: FrameRimPx, factor: number): FrameRimPx {
	return {
		top: rim.top * factor,
		right: rim.right * factor,
		bottom: rim.bottom * factor,
		left: rim.left * factor,
	};
}

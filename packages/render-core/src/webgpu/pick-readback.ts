/// <reference types="@webgpu/types" />

import { HolodeckIdType } from '../holodeck/types.js';
import type { PickResult } from '../pick/types.js';
import { PICK_READ_BYTES_PER_ROW } from '../pick/types.js';
import type { PickAttachments } from './attachments.js';

export interface GpuViewportRect {
	x: number;
	y: number;
	w: number;
	h: number;
}

/**
 * Read pick triple at canvas buffer pixel (origin top-left, within viewport rect).
 */
export async function readObjectIdAt(
	device: GPUDevice,
	queue: GPUQueue,
	pick: PickAttachments | null,
	viewport: GpuViewportRect,
	screenX: number,
	screenY: number,
): Promise<PickResult> {
	if (!pick) {
		return { type: HolodeckIdType.NONE, objectId: 0, subObjectId: 0 };
	}

	const w = viewport.w;
	const h = viewport.h;
	const x = Math.max(0, Math.min(w - 1, Math.floor(screenX) - viewport.x));
	const y = Math.max(0, Math.min(h - 1, Math.floor(screenY) - viewport.y));

	const bytesPerRow = PICK_READ_BYTES_PER_ROW;
	const buffer = device.createBuffer({
		size: bytesPerRow * 3,
		usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
	});

	const encoder = device.createCommandEncoder();
	const extent: GPUExtent3D = [1, 1, 1];
	const origin: GPUOrigin3D = [x, y, 0];

	encoder.copyTextureToBuffer(
		{ texture: pick.idType, origin },
		{ buffer, offset: 0, bytesPerRow, rowsPerImage: 1 },
		extent,
	);
	encoder.copyTextureToBuffer(
		{ texture: pick.objectId, origin },
		{ buffer, offset: bytesPerRow, bytesPerRow, rowsPerImage: 1 },
		extent,
	);
	encoder.copyTextureToBuffer(
		{ texture: pick.subObjectId, origin },
		{ buffer, offset: bytesPerRow * 2, bytesPerRow, rowsPerImage: 1 },
		extent,
	);

	queue.submit([encoder.finish()]);
	await buffer.mapAsync(GPUMapMode.READ);

	const mapped = buffer.getMappedRange();
	const dv = new DataView(mapped);
	const type = dv.getUint32(0, true);
	const objectId = dv.getUint32(bytesPerRow, true);
	const subObjectId = dv.getUint32(bytesPerRow * 2, true);

	buffer.unmap();
	buffer.destroy();

	return { type, objectId, subObjectId };
}

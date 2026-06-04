/// <reference types="@webgpu/types" />

/** Three r32uint pick targets + swapchain color (vitamoo layout). */
export type PickAttachments = {
	idType: GPUTexture;
	objectId: GPUTexture;
	subObjectId: GPUTexture;
	width: number;
	height: number;
};

export function createPickAttachments(
	device: GPUDevice,
	width: number,
	height: number,
): PickAttachments {
	const w = Math.max(1, width);
	const h = Math.max(1, height);
	const size: GPUExtent3D = [w, h, 1];
	const usage = GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC;
	const format: GPUTextureFormat = 'r32uint';

	const idType = device.createTexture({ size, format, usage });
	const objectId = device.createTexture({ size, format, usage });
	const subObjectId = device.createTexture({ size, format, usage });

	return { idType, objectId, subObjectId, width: w, height: h };
}

export function destroyPickAttachments(pick: PickAttachments | null): void {
	if (!pick) return;
	pick.idType.destroy();
	pick.objectId.destroy();
	pick.subObjectId.destroy();
}

export function createDepthTexture(
	device: GPUDevice,
	width: number,
	height: number,
): GPUTexture {
	return device.createTexture({
		size: [Math.max(1, width), Math.max(1, height), 1],
		format: 'depth24plus',
		usage: GPUTextureUsage.RENDER_ATTACHMENT,
	});
}

export interface HolodeckColorAttachmentOptions {
	pick: PickAttachments | null;
	swapchainView: GPUTextureView;
	clearColor?: GPUColor;
	loadSwapchain?: 'clear' | 'load';
}

/** Build color attachments for one holodeck render pass (pick MRT + swapchain). */
export function buildHolodeckColorAttachments(
	options: HolodeckColorAttachmentOptions,
): GPURenderPassColorAttachment[] {
	const clearVal: GPUColor = options.clearColor ?? { r: 0, g: 0, b: 0, a: 1 };
	const uintClear: GPUColor = { r: 0, g: 0, b: 0, a: 0 };
	const loadSwap = options.loadSwapchain ?? 'clear';

	if (options.pick) {
		return [
			{
				view: options.pick.idType.createView(),
				clearValue: uintClear,
				loadOp: 'clear',
				storeOp: 'store',
			},
			{
				view: options.pick.objectId.createView(),
				clearValue: uintClear,
				loadOp: 'clear',
				storeOp: 'store',
			},
			{
				view: options.pick.subObjectId.createView(),
				clearValue: uintClear,
				loadOp: 'clear',
				storeOp: 'store',
			},
			{
				view: options.swapchainView,
				clearValue: clearVal,
				loadOp: loadSwap === 'load' ? 'load' : 'clear',
				storeOp: 'store',
			},
		];
	}

	return [
		{
			view: options.swapchainView,
			clearValue: clearVal,
			loadOp: loadSwap === 'load' ? 'load' : 'clear',
			storeOp: 'store',
		},
	];
}

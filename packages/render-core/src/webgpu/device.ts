/// <reference types="@webgpu/types" />

export interface GpuCanvasContext {
	canvas: HTMLCanvasElement;
	device: GPUDevice;
	queue: GPUQueue;
	context: GPUCanvasContext;
	format: GPUTextureFormat;
}

export interface CreateGpuCanvasOptions {
	/** Require maxColorAttachments >= 4 for holodeck pick MRT. Default true. */
	requirePickMrt?: boolean;
}

/**
 * Create WebGPU device + configured canvas context (client GPU — browser only).
 */
export async function createGpuCanvas(
	canvas: HTMLCanvasElement,
	options: CreateGpuCanvasOptions = {},
): Promise<GpuCanvasContext> {
	const requirePickMrt = options.requirePickMrt !== false;
	const gpu = navigator.gpu;
	if (!gpu) {
		throw new Error(
			'WebGPU is not available. Use a supported browser with hardware acceleration enabled.',
		);
	}

	const adapter = await gpu.requestAdapter();
	if (!adapter) {
		throw new Error('WebGPU adapter unavailable.');
	}

	const device = await adapter.requestDevice();
	if (requirePickMrt && device.limits.maxColorAttachments < 4) {
		throw new Error(
			`WebGPU: need maxColorAttachments >= 4 for holodeck pick MRT (got ${device.limits.maxColorAttachments}).`,
		);
	}

	const context = canvas.getContext('webgpu');
	if (!context) {
		throw new Error('WebGPU canvas context not available.');
	}

	const format = gpu.getPreferredCanvasFormat();
	context.configure({
		device,
		format,
		alphaMode: 'opaque',
	});

	return {
		canvas,
		device,
		queue: device.queue,
		context,
		format,
	};
}

/// <reference types="@webgpu/types" />

import type { HolodeckPlugin, HolodeckPluginContext } from '../holodeck/types.js';
import {
	parseMeasureRef,
	resolveMeasureRef,
	encodeMeasureRef,
	type MeasurePatch,
	type MeasureQuery,
	type MeasureReadRequest,
	type MeasureReadResponse,
	type MeasureRef,
	type MeasureValue,
	type MeasureWriteRequest,
	type MeasureWriteResponse,
} from '../measure/index.js';
import { diffMeasureValue } from '../measure/properties.js';
import { MapViewport } from '../viewport/MapViewport.js';
import type { PickResult } from '../pick/types.js';
import type { MapSceneBaseLayer } from '../scene/MapScene.js';
import {
	buildHolodeckColorAttachments,
	createDepthTexture,
	createPickAttachments,
	destroyPickAttachments,
	type PickAttachments,
} from './attachments.js';
import { createGpuCanvas, type GpuCanvasContext } from './device.js';
import { readObjectIdAt, type GpuViewportRect } from './pick-readback.js';

export interface HolodeckStageOptions {
	enablePick?: boolean;
}

/**
 * WebGPU-native holodeck compositor: shared {@link MapViewport}, sorted plugins, optional pick MRT.
 */
export class HolodeckStage {
	readonly viewport: MapViewport;
	readonly gpu: GpuCanvasContext;

	baseLayer: MapSceneBaseLayer | null = null;

	private readonly enablePick: boolean;
	private readonly plugins = new Map<string, HolodeckPlugin>();
	private pick: PickAttachments | null = null;
	private depthTexture: GPUTexture | null = null;
	private gpuViewport: GpuViewportRect = { x: 0, y: 0, w: 0, h: 0 };
	private frame = 0;
	private lastMeasureCache: Record<MeasureRef, MeasureValue> = {};

	private constructor(gpu: GpuCanvasContext, enablePick: boolean) {
		this.gpu = gpu;
		this.viewport = new MapViewport();
		this.enablePick = enablePick;
	}

	static async create(
		canvas: HTMLCanvasElement,
		options: HolodeckStageOptions = {},
	): Promise<HolodeckStage> {
		const enablePick = options.enablePick !== false;
		const gpu = await createGpuCanvas(canvas, { requirePickMrt: enablePick });
		const stage = new HolodeckStage(gpu, enablePick);
		stage.syncViewportFromCanvas();
		return stage;
	}

	addPlugin(plugin: HolodeckPlugin): void {
		this.plugins.set(plugin.id, plugin);
	}

	removePlugin(id: string): void {
		const plugin = this.plugins.get(id);
		plugin?.dispose?.();
		this.plugins.delete(id);
	}

	getPlugin(id: string): HolodeckPlugin | undefined {
		return this.plugins.get(id);
	}

	async initializePlugins(): Promise<void> {
		const ctx = this.makePluginContext(0);
		for (const plugin of this.sortedPlugins()) {
			await plugin.initialize?.(ctx);
		}
	}

	/** Match canvas backing store and CSS size to {@link MapViewport}. */
	syncViewportFromCanvas(): void {
		const canvas = this.gpu.canvas;
		const dpr = globalThis.devicePixelRatio ?? 1;
		const displayWidth = canvas.clientWidth || canvas.width;
		const displayHeight = canvas.clientHeight || canvas.height;
		const bufferWidth = Math.max(1, Math.round(displayWidth * dpr));
		const bufferHeight = Math.max(1, Math.round(displayHeight * dpr));

		if (canvas.width !== bufferWidth || canvas.height !== bufferHeight) {
			canvas.width = bufferWidth;
			canvas.height = bufferHeight;
		}

		this.viewport.setScreenSize(displayWidth, displayHeight);
		this.gpuViewport = { x: 0, y: 0, w: bufferWidth, h: bufferHeight };

		destroyPickAttachments(this.pick);
		this.pick = null;
		if (this.depthTexture) {
			this.depthTexture.destroy();
			this.depthTexture = null;
		}

		if (this.enablePick && bufferWidth > 0 && bufferHeight > 0) {
			this.pick = createPickAttachments(this.gpu.device, bufferWidth, bufferHeight);
		}
		this.depthTexture = createDepthTexture(this.gpu.device, bufferWidth, bufferHeight);

		const ctx = this.makePluginContext(0);
		for (const plugin of this.sortedPlugins()) {
			plugin.resize?.(ctx);
		}
	}

	beginFrame(clearColor: GPUColor = { r: 0, g: 0, b: 0, a: 1 }): GPURenderPassEncoder {
		this.syncViewportFromCanvas();
		const tex = this.gpu.context.getCurrentTexture();
		const encoder = this.gpu.device.createCommandEncoder();
		const pass = encoder.beginRenderPass({
			colorAttachments: buildHolodeckColorAttachments({
				pick: this.pick,
				swapchainView: tex.createView(),
				clearColor,
			}),
			depthStencilAttachment: this.depthTexture
				? {
						view: this.depthTexture.createView(),
						depthClearValue: 1,
						depthLoadOp: 'clear',
						depthStoreOp: 'store',
					}
				: undefined,
		});
		pass.setViewport(
			this.gpuViewport.x,
			this.gpuViewport.y,
			this.gpuViewport.w,
			this.gpuViewport.h,
			0,
			1,
		);
		(this as HolodeckStage & { _encoder?: GPUCommandEncoder })._encoder = encoder;
		(this as HolodeckStage & { _pass?: GPURenderPassEncoder })._pass = pass;
		return pass;
	}

	endFrame(): void {
		const internal = this as HolodeckStage & {
			_encoder?: GPUCommandEncoder;
			_pass?: GPURenderPassEncoder;
		};
		internal._pass?.end();
		internal._pass = undefined;
		if (internal._encoder) {
			this.gpu.queue.submit([internal._encoder.finish()]);
			internal._encoder = undefined;
		}
	}

	render(time = performance.now()): void {
		this.syncViewportFromCanvas();
		this.baseLayer?.render();
		const ctx = this.makePluginContext(time);
		for (const plugin of this.sortedPlugins()) {
			if (plugin.enabled === false) continue;
			plugin.render(ctx);
		}
		this.frame += 1;
	}

	async readObjectIdAt(screenX: number, screenY: number): Promise<PickResult> {
		return readObjectIdAt(
			this.gpu.device,
			this.gpu.queue,
			this.pick,
			this.gpuViewport,
			screenX,
			screenY,
		);
	}

	/** Monotonic frame counter — coherency token for measure read/patch. */
	getFrame(): number {
		return this.frame;
	}

	/**
	 * Sparse read: resolve many refs in one JSON-friendly round trip.
	 * @see documentation/designs/map-compositing-and-measurement.md §3.4
	 */
	measureRead(request: MeasureReadRequest, time = performance.now()): MeasureReadResponse {
		const { values, missing } = this.resolveRefs(request.refs, time);
		for (const [ref, value] of Object.entries(values)) {
			this.lastMeasureCache[ref] = value;
		}
		for (const ref of missing) {
			delete this.lastMeasureCache[ref];
		}
		return {
			schema_version: 1,
			frame: this.frame,
			values,
			...(missing.length > 0 ? { missing } : {}),
		};
	}

	/**
	 * Sparse write: push JSON patches into plugins before the next render.
	 */
	measureWrite(request: MeasureWriteRequest, time = performance.now()): MeasureWriteResponse {
		const ctx = this.makePluginContext(time);
		const applied: MeasureRef[] = [];
		const rejected: Array<{ ref: MeasureRef; reason: string }> = [];

		for (const [ref, patch] of Object.entries(request.patches)) {
			const { layerId } = parseMeasureRef(ref);
			const plugin = this.plugins.get(layerId);
			if (!plugin?.applyMeasure) {
				rejected.push({ ref, reason: 'plugin does not accept measure writes' });
				continue;
			}
			if (plugin.applyMeasure(ref, patch, ctx)) {
				applied.push(ref);
			} else {
				rejected.push({ ref, reason: 'applyMeasure returned false' });
			}
		}

		return {
			schema_version: 1,
			frame: this.frame,
			applied,
			...(rejected.length > 0 ? { rejected } : {}),
		};
	}

	/**
	 * Sparse patch: resolve refs, return only values that changed since last emit.
	 * Call after `render()`; pass client's last known `baseFrame` for coherency.
	 */
	measurePatch(refs: MeasureRef[], baseFrame: number, time = performance.now()): MeasurePatch {
		const { values, missing } = this.resolveRefs(refs, time);
		const updates: Record<MeasureRef, MeasureValue> = {};
		const propUpdates: Record<MeasureRef, Record<string, unknown>> = {};
		const propRemoved: Record<MeasureRef, string[]> = {};
		const removed: MeasureRef[] = [];
		const catchUp = baseFrame < this.frame;

		for (const ref of refs) {
			const next = values[ref];
			const prev = this.lastMeasureCache[ref];
			if (!next) {
				if (prev) removed.push(ref);
				delete this.lastMeasureCache[ref];
				continue;
			}
			const diff = diffMeasureValue(prev, next, catchUp);
			if (diff.replace) {
				updates[ref] = diff.replace;
			}
			if (diff.propUpdates) {
				propUpdates[ref] = diff.propUpdates;
			}
			if (diff.propRemoved) {
				propRemoved[ref] = diff.propRemoved;
			}
			this.lastMeasureCache[ref] = next;
		}

		return {
			op: 'patch',
			schema_version: 1,
			baseFrame,
			frame: this.frame,
			...(Object.keys(updates).length > 0 ? { updates } : {}),
			...(Object.keys(propUpdates).length > 0 ? { propUpdates } : {}),
			...(Object.keys(propRemoved).length > 0 ? { propRemoved } : {}),
			...(removed.length > 0 ? { removed } : {}),
		};
	}

	/** Single-ref read (convenience). */
	measure(query: MeasureQuery, time = performance.now()): MeasureValue | null {
		return resolveMeasureRef(
			encodeMeasureRef({
				layerId: query.layerId,
				objectId: query.objectId,
				attachmentId: query.attachmentId,
				kind: query.kind,
				space: query.space,
			}),
			this.makeResolver(time),
		);
	}

	measureBatch(queries: MeasureQuery[], time = performance.now()): MeasureValue[] {
		return queries.map((q) => this.measure(q, time)).filter((r): r is MeasureValue => r != null);
	}

	dispose(): void {
		for (const plugin of this.plugins.values()) {
			plugin.dispose?.();
		}
		this.plugins.clear();
		this.baseLayer = null;
		destroyPickAttachments(this.pick);
		this.pick = null;
		if (this.depthTexture) {
			this.depthTexture.destroy();
			this.depthTexture = null;
		}
	}

	private sortedPlugins(): HolodeckPlugin[] {
		return [...this.plugins.values()].sort((a, b) => a.layer - b.layer);
	}

	private makePluginContext(time: number): HolodeckPluginContext {
		return {
			viewport: this.viewport,
			canvas: this.gpu.canvas,
			devicePixelRatio: globalThis.devicePixelRatio ?? 1,
			time,
		};
	}

	private makeResolver(time: number) {
		return {
			viewport: this.viewport,
			plugins: this.plugins,
			time,
			canvas: this.gpu.canvas,
		};
	}

	private resolveRefs(refs: MeasureRef[], time: number) {
		const resolver = this.makeResolver(time);
		const values: Record<MeasureRef, MeasureValue> = {};
		const missing: MeasureRef[] = [];
		for (const ref of refs) {
			const value = resolveMeasureRef(ref, resolver);
			if (value) values[ref] = value;
			else missing.push(ref);
		}
		return { values, missing };
	}
}

/// <reference types="@webgpu/types" />

import { TileRenderer, type ResolvedTileLayerSpec, type TileLayerSource } from './TileRenderer';

type TileLayerGpu = {
	layer: ResolvedTileLayerSpec;
	texture: GPUTexture;
	view: GPUTextureView;
	width: number;
	height: number;
	info: TileSetInfo;
};

type TileSetInfo = {
	tilesPerRow: number;
	tilesPerSet: number;
	rowsPerSet: number;
	setsPerTexture: number;
	tileCount: number;
};

function tileSetInfoForLayer(layer: ResolvedTileLayerSpec, textureWidth: number, textureHeight: number): TileSetInfo {
	const atlasWidth = layer.atlasWidth ?? textureWidth - layer.atlasX;
	const atlasHeight = layer.atlasHeight ?? textureHeight - layer.atlasY;
	const tilesPerRow = Math.max(1, Math.floor(atlasWidth / layer.strideX));
	const defaultRowsPerSet = Math.max(1, Math.floor(atlasHeight / layer.strideY));
	const maxTilesInAtlas = tilesPerRow * defaultRowsPerSet;
	const tileCount = layer.tileCount ?? maxTilesInAtlas;
	const tilesPerSet = layer.tilesPerSet ?? tileCount;
	const rowsPerSet = Math.max(1, Math.ceil(tilesPerSet / tilesPerRow));
	const setsPerTexture = Math.max(1, Math.floor(atlasHeight / (rowsPerSet * layer.strideY)));
	return { tilesPerRow, tilesPerSet, rowsPerSet, setsPerTexture, tileCount };
}

class WebGPUTileRenderer extends TileRenderer<GPUCanvasContext> {
	private device?: GPUDevice;
	private pipeline?: GPURenderPipeline;
	private sampler?: GPUSampler;
	private uniformBuffer?: GPUBuffer;
	private mapTexture?: GPUTexture;
	private mopTexture?: GPUTexture;
	private tileLayersGpu: Array<TileLayerGpu | null> = [];
	private presentationFormat: GPUTextureFormat = 'bgra8unorm';

	async initialize(
		canvas: HTMLCanvasElement,
		context: GPUCanvasContext,
		mapData: Uint16Array,
		mopData: Uint16Array,
		mapWidth: number,
		mapHeight: number,
		tileWidth: number,
		tileHeight: number,
		tileTextureURLs: TileLayerSource[]
	): Promise<void> {
		await super.initialize(canvas, context, mapData, mopData, mapWidth, mapHeight, tileWidth, tileHeight, tileTextureURLs);
		this.zoom = 1;

		const gpu = navigator.gpu;
		if (!gpu) throw new Error('WebGPU is not available in this browser.');

		const adapter = await gpu.requestAdapter();
		if (!adapter) throw new Error('WebGPU adapter unavailable.');

		this.device = await adapter.requestDevice();
		this.presentationFormat = gpu.getPreferredCanvasFormat();
		this.context = context;
		this.context.configure({
			device: this.device,
			format: this.presentationFormat,
			alphaMode: 'opaque'
		});

		this.uniformBuffer = this.device.createBuffer({
			size: 7 * 16,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
		});
		this.mapTexture = this.createUint16Texture(this.mapHeight, this.mapWidth);
		this.mopTexture = this.createUint16Texture(this.mapHeight, this.mapWidth);
		this.pipeline = this.createPipeline();
		this.tileLayersGpu = await Promise.all(this.tileLayers.map((layer) => (layer.url ? this.loadTileLayer(layer) : null)));
	}

	render(): void {
		if (!this.canvas || !this.context || !this.device || !this.pipeline || !this.uniformBuffer || !this.mapTexture || !this.mopTexture) {
			throw new Error('WebGPUTileRenderer is not initialized.');
		}

		const tileLayerGpu = this.tileLayersGpu[this.tileLayer] ?? this.tileLayersGpu.find((layer): layer is TileLayerGpu => layer !== null);
		if (!tileLayerGpu) throw new Error('WebGPUTileRenderer requires at least one tile texture.');
		const sampler = this.device.createSampler({
			magFilter: tileLayerGpu.layer.sampling === 'linear' ? 'linear' : 'nearest',
			minFilter: tileLayerGpu.layer.sampling === 'linear' ? 'linear' : 'nearest'
		});

		this.setScreenSize(this.canvas.width, this.canvas.height);
		this.uploadUint16Texture(this.mapTexture, this.mapData, this.mapHeight, this.mapWidth);
		this.uploadUint16Texture(this.mopTexture, this.mopData, this.mapHeight, this.mapWidth);
		this.writeUniforms(tileLayerGpu);

		const bindGroup = this.device.createBindGroup({
			layout: this.pipeline.getBindGroupLayout(0),
			entries: [
				{ binding: 0, resource: this.mapTexture.createView() },
				{ binding: 1, resource: this.mopTexture.createView() },
				{ binding: 2, resource: tileLayerGpu.view },
				{ binding: 3, resource: sampler },
				{ binding: 4, resource: { buffer: this.uniformBuffer } }
			]
		});

		const encoder = this.device.createCommandEncoder();
		const pass = encoder.beginRenderPass({
			colorAttachments: [
				{
					view: this.context.getCurrentTexture().createView(),
					clearValue: { r: 0, g: 0, b: 0, a: 1 },
					loadOp: 'clear',
					storeOp: 'store'
				}
			]
		});
		pass.setPipeline(this.pipeline);
		pass.setBindGroup(0, bindGroup);
		pass.draw(6);
		pass.end();
		this.device.queue.submit([encoder.finish()]);
	}

	private createUint16Texture(width: number, height: number): GPUTexture {
		return this.device!.createTexture({
			size: [width, height, 1],
			format: 'r16uint',
			usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
		});
	}

	private uploadUint16Texture(texture: GPUTexture, data: Uint16Array, width: number, height: number): void {
		const bytesPerRow = alignBytes(width * 2, 256);
		const bytes = new Uint8Array(bytesPerRow * height);
		const source = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
		for (let row = 0; row < height; row += 1) {
			bytes.set(source.subarray(row * width * 2, (row + 1) * width * 2), row * bytesPerRow);
		}
		this.device!.queue.writeTexture({ texture }, bytes, { bytesPerRow, rowsPerImage: height }, [width, height, 1]);
	}

	private async loadTileLayer(layer: ResolvedTileLayerSpec): Promise<TileLayerGpu> {
		const image = await loadImageBitmap(layer.url!);
		const texture = this.device!.createTexture({
			size: [image.width, image.height, 1],
			format: 'rgba8unorm',
			usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
		});
		this.device!.queue.copyExternalImageToTexture({ source: image }, { texture }, [image.width, image.height, 1]);
		return {
			layer,
			texture,
			view: texture.createView(),
			width: image.width,
			height: image.height,
			info: tileSetInfoForLayer(layer, image.width, image.height)
		};
	}

	private writeUniforms(tileLayer: TileLayerGpu): void {
		const uniformData = new Float32Array([
			this.screenWidth, this.screenHeight, this.panX, this.panY,
			this.mapWidth, this.mapHeight, this.tileWidth, this.tileHeight,
			tileLayer.layer.tileWidth, tileLayer.layer.tileHeight, tileLayer.layer.strideX, tileLayer.layer.strideY,
			tileLayer.info.tilesPerRow, tileLayer.info.tilesPerSet, tileLayer.info.rowsPerSet, tileLayer.info.setsPerTexture,
			tileLayer.layer.atlasX, tileLayer.layer.atlasY, tileLayer.layer.atlasWidth ?? tileLayer.width - tileLayer.layer.atlasX, tileLayer.layer.atlasHeight ?? tileLayer.height - tileLayer.layer.atlasY,
			tileLayer.info.tileCount, tileLayer.layer.wrap === 'repeat' ? 1 : 0, tileLayer.layer.opacity, 0,
			4 * this.zoom, this.tileRotate, 0, 0
		]);
		this.device!.queue.writeBuffer(this.uniformBuffer!, 0, uniformData);
	}

	private createPipeline(): GPURenderPipeline {
		const shader = this.device!.createShaderModule({
			code: `
struct Uniforms {
	screen: vec4<f32>,
	map: vec4<f32>,
	atlas: vec4<f32>,
	sets: vec4<f32>,
	atlasRect: vec4<f32>,
	policy: vec4<f32>,
	params: vec4<f32>,
};

@group(0) @binding(0) var mapTexture: texture_2d<u32>;
@group(0) @binding(1) var mopTexture: texture_2d<u32>;
@group(0) @binding(2) var tilesTexture: texture_2d<f32>;
@group(0) @binding(3) var tilesSampler: sampler;
@group(0) @binding(4) var<uniform> uniforms: Uniforms;

struct VertexOut {
	@builtin(position) position: vec4<f32>,
	@location(0) screenTile: vec2<f32>,
};

@vertex
fn vs(@builtin(vertex_index) vertexIndex: u32) -> VertexOut {
	var positions = array<vec2<f32>, 6>(
		vec2<f32>(-1.0,  1.0),
		vec2<f32>( 1.0,  1.0),
		vec2<f32>(-1.0, -1.0),
		vec2<f32>( 1.0,  1.0),
		vec2<f32>(-1.0, -1.0),
		vec2<f32>( 1.0, -1.0)
	);
	let position = positions[vertexIndex];
	let screen = uniforms.screen;
	let map = uniforms.map;
	let params = uniforms.params;
	let px = screen.z * map.z;
	let py = screen.w * map.w;
	let z = params.x;
	let worldX = (px + (position.x * screen.x / z)) / map.z;
	let worldY = (py - (position.y * screen.y / z)) / map.w;
	var out: VertexOut;
	out.position = vec4<f32>(position, 0.0, 1.0);
	out.screenTile = vec2<f32>(worldX, worldY);
	return out;
}

@fragment
fn fs(input: VertexOut) -> @location(0) vec4<f32> {
	let map = uniforms.map;
	let atlas = uniforms.atlas;
	let sets = uniforms.sets;
	let atlasRect = uniforms.atlasRect;
	let policy = uniforms.policy;
	let params = uniforms.params;
	let tileCoord = floor(input.screenTile);
	if (tileCoord.x < 0.0 || tileCoord.y < 0.0 || tileCoord.x >= map.x || tileCoord.y >= map.y) {
		return vec4<f32>(0.0, 0.0, 0.0, 1.0);
	}

	let mapCoord = vec2<i32>(i32(tileCoord.y), i32(tileCoord.x));
	let cellValue = i32(textureLoad(mapTexture, mapCoord, 0).x);
	let mopValue = i32(textureLoad(mopTexture, mapCoord, 0).x);
	let tileSet = mopValue & 0xff;
	let tilesPerRow = i32(sets.x);
	let tilesPerSet = i32(sets.y);
	let rowsPerSet = i32(sets.z);
	let setsPerTexture = i32(sets.w);
	let tileCount = i32(policy.x);
	let wrapTiles = policy.y > 0.5;
	let rawTileValue = ((cellValue & 0x03ff) + i32(params.y) + (10 * tilesPerSet)) % tilesPerSet;
	let tileValue = select(clamp(rawTileValue, 0, tileCount - 1), rawTileValue % tileCount, wrapTiles);
	let tileCol = tileValue % tilesPerRow;
	let tileRow = (tileValue / tilesPerRow) + ((tileSet % setsPerTexture) * rowsPerSet);
	let positionInTile = fract(input.screenTile);
	let tilePixel = atlasRect.xy + vec2<f32>(f32(tileCol), f32(tileRow)) * atlas.zw + positionInTile * atlas.xy;
	let tileUv = tilePixel / vec2<f32>(textureDimensions(tilesTexture));
	return textureSample(tilesTexture, tilesSampler, tileUv);
}`
		});

		return this.device!.createRenderPipeline({
			layout: 'auto',
			vertex: { module: shader, entryPoint: 'vs' },
			fragment: { module: shader, entryPoint: 'fs', targets: [{ format: this.presentationFormat }] },
			primitive: { topology: 'triangle-list' }
		});
	}
}

function alignBytes(value: number, alignment: number): number {
	return Math.ceil(value / alignment) * alignment;
}

async function loadImageBitmap(url: string): Promise<ImageBitmap> {
	const image = await new Promise<HTMLImageElement>((resolve, reject) => {
		const element = new Image();
		element.onload = () => resolve(element);
		element.onerror = () => reject(new Error(`Failed to load tile texture: ${url}`));
		element.src = url;
	});
	return createImageBitmap(image);
}

export { TileRenderer, WebGPUTileRenderer };

import { CanvasTileRenderer } from './CanvasTileRenderer';
import { TileRenderer } from './TileRenderer';
import { WebGLTileRenderer } from './WebGLTileRenderer';
import { WebGPUTileRenderer } from './WebGPUTileRenderer';

export type MapTileRendererBackend = 'webgpu' | 'webgl' | 'canvas';

export interface CreateMapTileRendererOptions {
	/** Try backends in order; default `['webgpu', 'canvas']`. Legacy WebGL: opt-in only. */
	prefer?: MapTileRendererBackend[];
}

export interface CreatedMapTileRenderer {
	backend: MapTileRendererBackend;
	renderer: TileRenderer<unknown>;
	context: unknown;
	webglContext: WebGL2RenderingContext | null;
}

const DEFAULT_PREFER: MapTileRendererBackend[] = ['webgpu', 'canvas'];

/**
 * Create a map tile renderer for a canvas, preferring WebGPU when available.
 * Default chain: webgpu → canvas (software pixels). WebGL is **not** in the default
 * chain — frozen legacy; opt in with `prefer: ['webgl', …]` only for the TileView bridge.
 * @see documentation/designs/map-compositing-and-measurement.md §1.1
 */
export function createMapTileRenderer(
	canvas: HTMLCanvasElement,
	options: CreateMapTileRendererOptions = {},
): CreatedMapTileRenderer | null {
	const order = options.prefer ?? DEFAULT_PREFER;

	for (const backend of order) {
		if (backend === 'webgpu' && typeof navigator !== 'undefined' && navigator.gpu) {
			const ctx = canvas.getContext('webgpu');
			if (ctx) {
				return {
					backend: 'webgpu',
					renderer: new WebGPUTileRenderer(),
					context: ctx,
					webglContext: null,
				};
			}
		}
		if (backend === 'webgl') {
			const gl = canvas.getContext('webgl2');
			if (gl) {
				return {
					backend: 'webgl',
					renderer: new WebGLTileRenderer(),
					context: gl,
					webglContext: gl,
				};
			}
		}
		if (backend === 'canvas') {
			const ctx2d = canvas.getContext('2d');
			if (ctx2d) {
				return {
					backend: 'canvas',
					renderer: new CanvasTileRenderer(),
					context: ctx2d,
					webglContext: null,
				};
			}
		}
	}

	return null;
}

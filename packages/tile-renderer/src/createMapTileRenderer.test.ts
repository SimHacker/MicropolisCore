import { describe, expect, it, vi } from 'vitest';
import { CanvasTileRenderer } from './CanvasTileRenderer';
import { createMapTileRenderer } from './createMapTileRenderer.js';
import { WebGLTileRenderer } from './WebGLTileRenderer';
import { WebGPUTileRenderer } from './WebGPUTileRenderer';

describe('createMapTileRenderer', () => {
	it('prefers WebGPU when navigator.gpu and webgpu context exist', () => {
		const canvas = {
			getContext: vi.fn((kind: string) => (kind === 'webgpu' ? { configure: vi.fn() } : null)),
		} as unknown as HTMLCanvasElement;

		vi.stubGlobal('navigator', { gpu: {} });

		const created = createMapTileRenderer(canvas);
		expect(created?.backend).toBe('webgpu');
		expect(created?.renderer).toBeInstanceOf(WebGPUTileRenderer);

		vi.unstubAllGlobals();
	});

	it('falls back to Canvas when WebGPU is unavailable (default chain)', () => {
		const ctx2d = {} as CanvasRenderingContext2D;
		const canvas = {
			getContext: vi.fn((kind: string) => (kind === '2d' ? ctx2d : null)),
		} as unknown as HTMLCanvasElement;

		vi.stubGlobal('navigator', {});

		const created = createMapTileRenderer(canvas);
		expect(created?.backend).toBe('canvas');
		expect(created?.renderer).toBeInstanceOf(CanvasTileRenderer);

		vi.unstubAllGlobals();
	});

	it('supports legacy WebGL when explicitly requested', () => {
		const gl = {} as WebGL2RenderingContext;
		const canvas = {
			getContext: vi.fn((kind: string) => (kind === 'webgl2' ? gl : null)),
		} as unknown as HTMLCanvasElement;

		vi.stubGlobal('navigator', {});

		const created = createMapTileRenderer(canvas, { prefer: ['webgl'] });
		expect(created?.backend).toBe('webgl');
		expect(created?.renderer).toBeInstanceOf(WebGLTileRenderer);
		expect(created?.webglContext).toBe(gl);

		vi.unstubAllGlobals();
	});

	it('can select Canvas when requested', () => {
		const ctx2d = {} as CanvasRenderingContext2D;
		const canvas = {
			getContext: vi.fn((kind: string) => (kind === '2d' ? ctx2d : null)),
		} as unknown as HTMLCanvasElement;

		const created = createMapTileRenderer(canvas, { prefer: ['canvas'] });
		expect(created?.backend).toBe('canvas');
		expect(created?.renderer).toBeInstanceOf(CanvasTileRenderer);

		vi.unstubAllGlobals();
	});
});

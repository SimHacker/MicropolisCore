import { MapViewport } from '../viewport/MapViewport.js';
import type { HolodeckPlugin, HolodeckPluginContext } from '../holodeck/types.js';

/** Base map or world pass drawn before holodeck plugins. */
export interface MapSceneBaseLayer {
	render(): void;
}

/**
 * Staging compositor: one {@link MapViewport}, optional base layer, holodeck plugins by `layer`.
 * Prefer {@link HolodeckStage} from `@micropolis/render-core/webgpu` when using WebGPU.
 */
export class MapScene {
	readonly viewport: MapViewport;
	baseLayer: MapSceneBaseLayer | null = null;

	private readonly plugins = new Map<string, HolodeckPlugin>();

	constructor(viewport?: MapViewport) {
		this.viewport = viewport ?? new MapViewport();
	}

	addPlugin(plugin: HolodeckPlugin): void {
		this.plugins.set(plugin.id, plugin);
	}

	/** @deprecated Use {@link addPlugin}. */
	addOverlay(plugin: HolodeckPlugin): void {
		this.addPlugin(plugin);
	}

	removePlugin(id: string): void {
		const plugin = this.plugins.get(id);
		plugin?.dispose?.();
		this.plugins.delete(id);
	}

	getPlugin(id: string): HolodeckPlugin | undefined {
		return this.plugins.get(id);
	}

	async initializePlugins(
		canvas: HTMLCanvasElement,
		devicePixelRatio = globalThis.devicePixelRatio ?? 1,
	): Promise<void> {
		const ctx = this.makeContext(canvas, devicePixelRatio, 0);
		for (const plugin of this.sortedPlugins()) {
			await plugin.initialize?.(ctx);
		}
	}

	resize(canvas: HTMLCanvasElement, devicePixelRatio = globalThis.devicePixelRatio ?? 1): void {
		const ctx = this.makeContext(canvas, devicePixelRatio, 0);
		for (const plugin of this.sortedPlugins()) {
			plugin.resize?.(ctx);
		}
	}

	render(canvas: HTMLCanvasElement, time = performance.now()): void {
		this.baseLayer?.render();
		const ctx = this.makeContext(canvas, globalThis.devicePixelRatio ?? 1, time);
		for (const plugin of this.sortedPlugins()) {
			if (plugin.enabled === false) continue;
			plugin.render(ctx);
		}
	}

	dispose(): void {
		for (const plugin of this.plugins.values()) {
			plugin.dispose?.();
		}
		this.plugins.clear();
		this.baseLayer = null;
	}

	private sortedPlugins(): HolodeckPlugin[] {
		return [...this.plugins.values()].sort((a, b) => a.layer - b.layer);
	}

	private makeContext(
		canvas: HTMLCanvasElement,
		devicePixelRatio: number,
		time: number,
	): HolodeckPluginContext {
		return { viewport: this.viewport, canvas, devicePixelRatio, time };
	}
}

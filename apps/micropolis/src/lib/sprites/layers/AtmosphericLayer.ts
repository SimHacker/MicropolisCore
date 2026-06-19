/**
 * World-aligned RGBA raster overlay — smoke, chalk, MOP heat maps, pollution viz.
 * Two update modes:
 *   deposit + step()  — atmospheric pigment (smoke, chalk) with CA diffusion + fade
 *   fillFromTileGrid + smooth() — scalar fields (pollution, pop, crime) as stretched low-res heat images
 */

export interface AtmosphericLayerOptions {
	/** World pixels spanned (e.g. WORLD_W * tileWidth). */
	worldWidth: number;
	worldHeight: number;
	/** Internal buffer is 1/scale of world pixels (2 = half res). */
	scale?: number;
	/** Neighbor blend per step (0..1). */
	flow?: number;
	/** Retention per step (0..1). */
	fade?: number;
}

export type ColormapFn = (normalized: number) => [r: number, g: number, b: number, a: number];

export class AtmosphericLayer {
	readonly id: string;
	readonly worldWidth: number;
	readonly worldHeight: number;
	readonly scale: number;
	readonly width: number;
	readonly height: number;
	readonly flow: number;
	readonly fade: number;

	private data: Uint8ClampedArray;
	private scratch: Uint8ClampedArray;
	private canvas: HTMLCanvasElement | null = null;
	private ctx: CanvasRenderingContext2D | null = null;

	constructor(id: string, options: AtmosphericLayerOptions) {
		this.id = id;
		this.worldWidth = options.worldWidth;
		this.worldHeight = options.worldHeight;
		this.scale = options.scale ?? 2;
		this.width = Math.ceil(this.worldWidth / this.scale);
		this.height = Math.ceil(this.worldHeight / this.scale);
		this.flow = options.flow ?? 0.35;
		this.fade = options.fade ?? 0.992;
		this.data = new Uint8ClampedArray(this.width * this.height * 4);
		this.scratch = new Uint8ClampedArray(this.data.length);
	}

	private worldToLayer(x: number, y: number): [number, number] {
		return [x / this.scale, y / this.scale];
	}

	/** Deposit colored pigment at world-pixel coordinates. */
	deposit(
		worldX: number,
		worldY: number,
		r: number,
		g: number,
		b: number,
		alpha: number,
		radiusWorld = 6,
	): void {
		const [cx, cy] = this.worldToLayer(worldX, worldY);
		const rLayer = Math.max(1, radiusWorld / this.scale);
		const r2 = rLayer * rLayer;
		const x0 = Math.max(0, Math.floor(cx - rLayer));
		const x1 = Math.min(this.width - 1, Math.ceil(cx + rLayer));
		const y0 = Math.max(0, Math.floor(cy - rLayer));
		const y1 = Math.min(this.height - 1, Math.ceil(cy + rLayer));

		for (let y = y0; y <= y1; y++) {
			for (let x = x0; x <= x1; x++) {
				const dx = x - cx;
				const dy = y - cy;
				if (dx * dx + dy * dy > r2) continue;
				const falloff = 1 - Math.sqrt(dx * dx + dy * dy) / rLayer;
				const i = (y * this.width + x) * 4;
				const a = alpha * falloff;
				this.data[i] = Math.min(255, this.data[i] + r * a);
				this.data[i + 1] = Math.min(255, this.data[i + 1] + g * a);
				this.data[i + 2] = Math.min(255, this.data[i + 2] + b * a);
				this.data[i + 3] = Math.min(255, this.data[i + 3] + a * 255);
			}
		}
	}

	depositHex(worldX: number, worldY: number, hex: string, alpha: number, radiusWorld?: number): void {
		const rgb = parseHex(hex);
		this.deposit(worldX, worldY, rgb[0], rgb[1], rgb[2], alpha, radiusWorld);
	}

	/**
	 * Fill layer from a per-tile scalar grid (pollution, population, crime, …).
	 * Each layer pixel samples the nearest tile; viewport blit stretches smoothly over the map.
	 */
	fillFromTileGrid(
		values: ArrayLike<number>,
		mapWidth: number,
		mapHeight: number,
		colorize: ColormapFn,
		tileWidth = 16,
		tileHeight = 16,
	): void {
		const max = maxInGrid(values, mapWidth * mapHeight);
		for (let ly = 0; ly < this.height; ly++) {
			for (let lx = 0; lx < this.width; lx++) {
				const wx = ((lx + 0.5) * this.scale) / tileWidth;
				const wy = ((ly + 0.5) * this.scale) / tileHeight;
				const tx = Math.min(mapWidth - 1, Math.max(0, Math.floor(wx)));
				const ty = Math.min(mapHeight - 1, Math.max(0, Math.floor(wy)));
				const v = values[ty * mapWidth + tx] ?? 0;
				const t = max > 0 ? v / max : 0;
				const [r, g, b, a] = colorize(t);
				const i = (ly * this.width + lx) * 4;
				this.data[i] = r;
				this.data[i + 1] = g;
				this.data[i + 2] = b;
				this.data[i + 3] = a;
			}
		}
	}

	/** Diffusion without fade — softens blocky tile samples into a heat-map look. */
	smooth(steps = 1): void {
		for (let s = 0; s < steps; s++) this.diffuse(1);
	}

	/** Diffusion + fade one CA step. */
	step(): void {
		this.diffuse(this.fade);
	}

	private diffuse(retention: number): void {
		const { data, scratch, width: w, height: h, flow } = this;
		for (let y = 1; y < h - 1; y++) {
			for (let x = 1; x < w - 1; x++) {
				const i = (y * w + x) * 4;
				for (let c = 0; c < 4; c++) {
					const o = i + c;
					const n =
						(data[o - 4] +
							data[o + 4] +
							data[o - w * 4] +
							data[o + w * 4] +
							data[o]) /
						5;
					scratch[o] = Math.min(255, n * flow + data[o] * (1 - flow) * retention);
				}
			}
		}
		data.set(scratch);
	}

	getCanvas(): HTMLCanvasElement {
		if (!this.canvas) {
			this.canvas = document.createElement('canvas');
			this.canvas.width = this.width;
			this.canvas.height = this.height;
			this.ctx = this.canvas.getContext('2d');
		}
		if (this.ctx) {
			this.ctx.putImageData(new ImageData(this.data, this.width, this.height), 0, 0);
		}
		return this.canvas!;
	}

	getPixelAlpha(layerX: number, layerY: number): number {
		const x = Math.floor(layerX);
		const y = Math.floor(layerY);
		if (x < 0 || y < 0 || x >= this.width || y >= this.height) return 0;
		return this.data[(y * this.width + x) * 4 + 3];
	}

	getImageData(): ImageData {
		return new ImageData(this.data, this.width, this.height);
	}
}

function parseHex(hex: string): [number, number, number] {
	const h = hex.replace('#', '');
	const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
	return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function maxInGrid(values: ArrayLike<number>, count: number): number {
	let max = 0;
	for (let i = 0; i < count; i++) {
		const v = values[i] ?? 0;
		if (v > max) max = v;
	}
	return max;
}

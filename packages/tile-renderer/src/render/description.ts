export type RendererBackend = 'auto' | 'webgpu' | 'webgl' | 'canvas';

export type RenderOutputFormat = 'png' | 'webp' | 'rgba8';

export interface RenderViewport {
	width: number;
	height: number;
	centerX: number;
	centerY: number;
	zoom: number;
}

export interface MicropolisMapRenderDescription {
	schema_version: 1;
	render_type: 'micropolis.map';
	renderer?: RendererBackend;
	output: {
		format: RenderOutputFormat;
		width: number;
		height: number;
	};
	source: {
		kind: 'city-file' | 'wasm-snapshot' | 'inline';
		path?: string;
		city_id?: string;
	};
	map: {
		width: number;
		height: number;
		tile_width: number;
		tile_height: number;
		tileset_url?: string;
	};
	tile_layers?: Array<{
		id?: string;
		url?: string;
		atlas_x?: number;
		atlas_y?: number;
		atlas_width?: number;
		atlas_height?: number;
		tile_width: number;
		tile_height: number;
		stride_x: number;
		stride_y: number;
		tile_count?: number;
		tiles_per_set?: number;
		pixel_aspect_x?: number;
		pixel_aspect_y?: number;
		wrap?: 'repeat' | 'clamp';
		sampling?: 'pixel' | 'nearest' | 'linear' | 'area' | 'mipmap';
		mipmaps?: false | 'gpu' | 'tile-aware';
		gutter_x?: number;
		gutter_y?: number;
		blend?: 'replace' | 'alpha' | 'multiply' | 'screen' | 'add' | 'tint';
		opacity?: number;
		color_space?: 'srgb' | 'linear';
		premultiplied_alpha?: boolean;
	}>;
	viewport: RenderViewport;
	layers?: Array<'map' | 'mop' | 'overlay'>;
	filters?: Record<string, unknown>;
}

export type RenderDescription = MicropolisMapRenderDescription;

export type RenderDescriptionValidation =
	| { ok: true; value: RenderDescription }
	| { ok: false; errors: string[] };

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function positiveNumber(value: unknown): value is number {
	return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function nonNegativeNumber(value: unknown): value is number {
	return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

export function defaultMicropolisMapRenderDescription(
	overrides: Partial<MicropolisMapRenderDescription> = {}
): MicropolisMapRenderDescription {
	const output = overrides.output ?? { format: 'png', width: 512, height: 512 };
	const map = overrides.map ?? { width: 120, height: 100, tile_width: 16, tile_height: 16 };
	const viewport = overrides.viewport ?? {
		width: output.width,
		height: output.height,
		centerX: map.width / 2,
		centerY: map.height / 2,
		zoom: 1
	};

	return {
		schema_version: 1,
		render_type: 'micropolis.map',
		renderer: 'auto',
		source: { kind: 'city-file' },
		layers: ['map'],
		...overrides,
		output,
		map,
		viewport
	};
}

export function validateRenderDescription(input: unknown): RenderDescriptionValidation {
	const errors: string[] = [];

	if (!isRecord(input)) {
		return { ok: false, errors: ['description must be an object'] };
	}

	if (input.schema_version !== 1) errors.push('schema_version must be 1');
	if (input.render_type !== 'micropolis.map') errors.push('render_type must be micropolis.map');

	if (!isRecord(input.output)) {
		errors.push('output must be an object');
	} else {
		if (!['png', 'webp', 'rgba8'].includes(String(input.output.format))) errors.push('output.format must be png, webp, or rgba8');
		if (!positiveNumber(input.output.width)) errors.push('output.width must be a positive number');
		if (!positiveNumber(input.output.height)) errors.push('output.height must be a positive number');
	}

	if (!isRecord(input.source)) {
		errors.push('source must be an object');
	} else if (!['city-file', 'wasm-snapshot', 'inline'].includes(String(input.source.kind))) {
		errors.push('source.kind must be city-file, wasm-snapshot, or inline');
	}

	if (!isRecord(input.map)) {
		errors.push('map must be an object');
	} else {
		if (!positiveNumber(input.map.width)) errors.push('map.width must be a positive number');
		if (!positiveNumber(input.map.height)) errors.push('map.height must be a positive number');
		if (!positiveNumber(input.map.tile_width)) errors.push('map.tile_width must be a positive number');
		if (!positiveNumber(input.map.tile_height)) errors.push('map.tile_height must be a positive number');
	}

	if (input.tile_layers !== undefined) {
		if (!Array.isArray(input.tile_layers)) {
			errors.push('tile_layers must be an array');
		} else {
			input.tile_layers.forEach((layer, index) => {
				if (!isRecord(layer)) {
					errors.push(`tile_layers[${index}] must be an object`);
					return;
				}
				if (!positiveNumber(layer.tile_width)) errors.push(`tile_layers[${index}].tile_width must be a positive number`);
				if (!positiveNumber(layer.tile_height)) errors.push(`tile_layers[${index}].tile_height must be a positive number`);
				if (!positiveNumber(layer.stride_x)) errors.push(`tile_layers[${index}].stride_x must be a positive number`);
				if (!positiveNumber(layer.stride_y)) errors.push(`tile_layers[${index}].stride_y must be a positive number`);
				if (layer.atlas_x !== undefined && !nonNegativeNumber(layer.atlas_x)) errors.push(`tile_layers[${index}].atlas_x must be non-negative`);
				if (layer.atlas_y !== undefined && !nonNegativeNumber(layer.atlas_y)) errors.push(`tile_layers[${index}].atlas_y must be non-negative`);
				if (layer.atlas_width !== undefined && !positiveNumber(layer.atlas_width)) errors.push(`tile_layers[${index}].atlas_width must be a positive number`);
				if (layer.atlas_height !== undefined && !positiveNumber(layer.atlas_height)) errors.push(`tile_layers[${index}].atlas_height must be a positive number`);
				if (layer.tile_count !== undefined && !positiveNumber(layer.tile_count)) errors.push(`tile_layers[${index}].tile_count must be a positive number`);
				if (layer.tiles_per_set !== undefined && !positiveNumber(layer.tiles_per_set)) {
					errors.push(`tile_layers[${index}].tiles_per_set must be a positive number`);
				}
				if (layer.pixel_aspect_x !== undefined && !positiveNumber(layer.pixel_aspect_x)) errors.push(`tile_layers[${index}].pixel_aspect_x must be a positive number`);
				if (layer.pixel_aspect_y !== undefined && !positiveNumber(layer.pixel_aspect_y)) errors.push(`tile_layers[${index}].pixel_aspect_y must be a positive number`);
				if (layer.wrap !== undefined && !['repeat', 'clamp'].includes(String(layer.wrap))) errors.push(`tile_layers[${index}].wrap must be repeat or clamp`);
				if (layer.sampling !== undefined && !['pixel', 'nearest', 'linear', 'area', 'mipmap'].includes(String(layer.sampling))) {
					errors.push(`tile_layers[${index}].sampling must be pixel, nearest, linear, area, or mipmap`);
				}
				if (layer.mipmaps !== undefined && ![false, 'gpu', 'tile-aware'].includes(layer.mipmaps as false | string)) errors.push(`tile_layers[${index}].mipmaps must be false, gpu, or tile-aware`);
				if (layer.gutter_x !== undefined && !nonNegativeNumber(layer.gutter_x)) errors.push(`tile_layers[${index}].gutter_x must be non-negative`);
				if (layer.gutter_y !== undefined && !nonNegativeNumber(layer.gutter_y)) errors.push(`tile_layers[${index}].gutter_y must be non-negative`);
				if (layer.blend !== undefined && !['replace', 'alpha', 'multiply', 'screen', 'add', 'tint'].includes(String(layer.blend))) {
					errors.push(`tile_layers[${index}].blend must be replace, alpha, multiply, screen, add, or tint`);
				}
				if (layer.opacity !== undefined && !nonNegativeNumber(layer.opacity)) errors.push(`tile_layers[${index}].opacity must be non-negative`);
				if (layer.color_space !== undefined && !['srgb', 'linear'].includes(String(layer.color_space))) errors.push(`tile_layers[${index}].color_space must be srgb or linear`);
			});
		}
	}

	if (!isRecord(input.viewport)) {
		errors.push('viewport must be an object');
	} else {
		if (!positiveNumber(input.viewport.width)) errors.push('viewport.width must be a positive number');
		if (!positiveNumber(input.viewport.height)) errors.push('viewport.height must be a positive number');
		if (!nonNegativeNumber(input.viewport.centerX)) errors.push('viewport.centerX must be a non-negative number');
		if (!nonNegativeNumber(input.viewport.centerY)) errors.push('viewport.centerY must be a non-negative number');
		if (!positiveNumber(input.viewport.zoom)) errors.push('viewport.zoom must be a positive number');
	}

	if (errors.length > 0) return { ok: false, errors };
	return { ok: true, value: input as unknown as RenderDescription };
}

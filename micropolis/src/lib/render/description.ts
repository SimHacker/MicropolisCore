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

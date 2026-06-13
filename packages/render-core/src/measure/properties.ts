import type { MeasureRect, MeasureValue, MeasurePropertyConstraint, MeasureJson, MeasureScalar } from './protocol.js';

/** Re-export constraint type from protocol for convenience. */
export type { MeasurePropertyConstraint, MeasureJson, MeasureScalar };

/** Reserved top-level keys — not shader/CSS bind targets. */
export const MEASURE_RESERVED_KEYS = [
	'ok',
	'space',
	'bounds',
	'points',
	'_constraints',
	'_meta',
] as const;

/** Known CSS-aligned property names (camelCase). Usual CSS meaning when applicable. */
export const CSS_MEASURE_PROPS = [
	'left',
	'top',
	'right',
	'bottom',
	'width',
	'height',
	'marginTop',
	'marginRight',
	'marginBottom',
	'marginLeft',
	'paddingTop',
	'paddingRight',
	'paddingBottom',
	'paddingLeft',
	'opacity',
	'color',
	'backgroundColor',
	'borderWidth',
	'borderColor',
	'borderRadius',
	'lineWidth',
	'strokeWidth',
	'strokeColor',
	'fill',
	'fillOpacity',
	'strokeOpacity',
	'fontSize',
	'letterSpacing',
	'zIndex',
	'transform',
	'filter',
	'backdropFilter',
] as const;

export type CssMeasureProp = (typeof CSS_MEASURE_PROPS)[number];

const BOUNDS_ALIASES: Record<string, keyof MeasureRect> = {
	left: 'x',
	top: 'y',
	width: 'w',
	height: 'h',
	x: 'x',
	y: 'y',
	w: 'w',
	h: 'h',
};

export type MeasureReservedKey = (typeof MEASURE_RESERVED_KEYS)[number];

export function isReservedMeasureKey(key: string): boolean {
	return (MEASURE_RESERVED_KEYS as readonly string[]).includes(key);
}

export function normalizeMeasureKey(key: string): string {
	return key.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

/** Bindable keys on a measure value (geometry, CSS, shader uniforms, …). */
export function getBindableKeys(value: MeasureValue | undefined): string[] {
	if (!value) return [];
	return Object.keys(value).filter((k) => !isReservedMeasureKey(k));
}

/** Read one property — resolves bounds aliases (left/top/width/height). */
export function getMeasureProp(value: MeasureValue | undefined, key: string): MeasureJson | undefined {
	if (!value) return undefined;
	const k = normalizeMeasureKey(key);
	if (k in value && !isReservedMeasureKey(k)) {
		return value[k] as MeasureJson;
	}
	const boundsKey = BOUNDS_ALIASES[k];
	if (boundsKey && value.bounds) {
		return value.bounds[boundsKey];
	}
	return undefined;
}

/** Write one property onto a partial patch object. */
export function setMeasureProp(
	target: Record<string, unknown>,
	key: string,
	val: MeasureJson,
): Record<string, unknown> {
	const k = normalizeMeasureKey(key);
	target[k] = val;
	return target;
}

/** Sync bounds ↔ left/top/width/height on a value clone. */
export function normalizeMeasureValue(value: MeasureValue): MeasureValue {
	const out = { ...value } as MeasureValue;

	if (out.bounds) {
		if (!('left' in out)) out.left = out.bounds.x;
		if (!('top' in out)) out.top = out.bounds.y;
		if (!('width' in out)) out.width = out.bounds.w;
		if (!('height' in out)) out.height = out.bounds.h;
	} else if (
		typeof out.left === 'number' &&
		typeof out.top === 'number' &&
		typeof out.width === 'number' &&
		typeof out.height === 'number'
	) {
		out.bounds = { x: out.left, y: out.top, w: out.width, h: out.height };
	}

	if (typeof out.lineWidth === 'number' && !('strokeWidth' in out)) {
		out.strokeWidth = out.lineWidth;
	}

	return out;
}

export function mergeMeasurePropUpdates(
	base: MeasureValue | undefined,
	props: Record<string, unknown>,
): MeasureValue {
	const merged = normalizeMeasureValue({
		ok: base?.ok ?? true,
		space: base?.space ?? 'screen',
		bounds: base?.bounds,
		points: base?.points,
		_constraints: base?._constraints,
		_meta: base?._meta,
		...flattenBindableProps(base),
		...props,
	} as MeasureValue);
	return merged;
}

function flattenBindableProps(value: MeasureValue | undefined): Record<string, unknown> {
	if (!value) return {};
	const out: Record<string, unknown> = {};
	for (const k of getBindableKeys(value)) {
		out[k] = value[k];
	}
	return out;
}

function jsonEqual(a: unknown, b: unknown): boolean {
	return JSON.stringify(a) === JSON.stringify(b);
}

export function diffMeasureValue(
	prev: MeasureValue | undefined,
	next: MeasureValue,
	catchUp: boolean,
): {
	replace?: MeasureValue;
	propUpdates?: Record<string, unknown>;
	propRemoved?: string[];
} {
	if (!prev || catchUp) {
		return { replace: normalizeMeasureValue(next) };
	}

	const propUpdates: Record<string, unknown> = {};
	const propRemoved: string[] = [];
	const prevNorm = normalizeMeasureValue(prev);
	const nextNorm = normalizeMeasureValue(next);

	for (const k of getBindableKeys(nextNorm)) {
		if (!jsonEqual(prevNorm[k], nextNorm[k])) {
			propUpdates[k] = nextNorm[k];
		}
	}
	for (const k of getBindableKeys(prevNorm)) {
		if (!(k in nextNorm) || nextNorm[k] === undefined) {
			propRemoved.push(k);
		}
	}

	const coreChanged =
		prevNorm.ok !== nextNorm.ok ||
		prevNorm.space !== nextNorm.space ||
		!jsonEqual(prevNorm.bounds, nextNorm.bounds) ||
		!jsonEqual(prevNorm.points, nextNorm.points) ||
		!jsonEqual(prevNorm._constraints, nextNorm._constraints);

	if (coreChanged) {
		return { replace: nextNorm };
	}
	if (Object.keys(propUpdates).length === 0 && propRemoved.length === 0) {
		return {};
	}
	return { propUpdates, propRemoved };
}

/** JSON clone + normalize bounds ↔ CSS geometry aliases. */
export function toMeasureValue(value: MeasureValue): MeasureValue {
	return normalizeMeasureValue(JSON.parse(JSON.stringify(value)) as MeasureValue);
}

import { CSS_MEASURE_PROPS, normalizeMeasureKey, type MeasureJson, type MeasurePropertyConstraint } from './properties.js';

/** Apply constraint to an incoming value (UI write or holodeck read). */
export function applyMeasureConstraint(
	value: MeasureJson | undefined,
	constraint: MeasurePropertyConstraint = {},
): MeasureJson | undefined {
	if (value === undefined) {
		return constraint.default;
	}

	let out = value;

	if (constraint.type === 'number' || typeof out === 'number') {
		let n = Number(out);
		if (!Number.isFinite(n)) {
			return constraint.default;
		}
		if (constraint.step !== undefined && constraint.step > 0) {
			n = Math.round(n / constraint.step) * constraint.step;
		}
		if (constraint.min !== undefined) n = Math.max(constraint.min, n);
		if (constraint.max !== undefined) n = Math.min(constraint.max, n);
		out = n;
	}

	if (constraint.enum !== undefined && constraint.enum.length > 0) {
		if (!constraint.enum.some((e) => jsonEqual(e, out))) {
			return constraint.default ?? constraint.enum[0];
		}
	}

	return out;
}

/** Resolve constraint for a key: explicit schema, then holodeck `_constraints`, then defaults for CSS props. */
export function resolveMeasureConstraint(
	key: string,
	explicit?: MeasurePropertyConstraint,
	value?: { _constraints?: Record<string, MeasurePropertyConstraint> },
): MeasurePropertyConstraint {
	const k = normalizeMeasureKey(key);
	if (explicit) return explicit;
	if (value?._constraints?.[k]) return value._constraints[k]!;
	if ((CSS_MEASURE_PROPS as readonly string[]).includes(k)) {
		return { css: kebabCase(k) };
	}
	return {};
}

/** True if UI may write this property. */
export function isMeasurePropWritable(
	key: string,
	constraint: MeasurePropertyConstraint,
	value?: { _meta?: { readonly?: string[] } },
): boolean {
	const k = normalizeMeasureKey(key);
	if (constraint.readonly === true) return false;
	if (value?._meta?.readonly?.includes(k)) return false;
	return true;
}

function jsonEqual(a: unknown, b: unknown): boolean {
	return JSON.stringify(a) === JSON.stringify(b);
}

function kebabCase(camel: string): string {
	return camel.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

/**
 * JSON-friendly holodeck measurement protocol.
 * @see documentation/designs/map-compositing-and-measurement.md §3.4–§3.5
 *
 * Bindable properties (geometry, CSS, shader uniforms) support two-way reactive UI.
 * FUTURE: multi-player shared tools, vehicles, blueprint params — same protocol; §3.5.
 */

export const MEASURE_SCHEMA_VERSION = 1 as const;

export type MeasureKind = 'bounds' | 'point' | 'polygon' | 'attachment';

export type MeasureSpace = 'screen' | 'world-tile' | 'world-pixel';

/** Structured query — canonical form before encoding as {@link MeasureRef}. */
export interface MeasureQuery {
	layerId: string;
	objectId?: string;
	attachmentId?: string;
	kind: MeasureKind;
	space?: MeasureSpace;
}

/** Axis-aligned rect in CSS screen pixels (top-left origin). */
export interface MeasureRect {
	x: number;
	y: number;
	w: number;
	h: number;
}

export interface MeasurePoint {
	x: number;
	y: number;
	id?: string;
}

/** JSON-safe scalar for bindable measure properties. */
export type MeasureScalar = string | number | boolean | null;

export type MeasureJson =
	| MeasureScalar
	| MeasureJson[]
	| { [key: string]: MeasureJson };

/**
 * Constraint for two-way reactive binding (UI ↔ holodeck).
 * Standard CSS names use usual semantics when `css` is set.
 */
export interface MeasurePropertyConstraint {
	type?: 'number' | 'string' | 'boolean' | 'color';
	min?: number;
	max?: number;
	step?: number;
	enum?: readonly MeasureScalar[];
	default?: MeasureScalar;
	/** Holodeck-driven only — UI may not write. */
	readonly?: boolean;
	/** Mirror to DOM style (kebab-case). */
	css?: string;
}

/**
 * Holodeck ↔ UI record: geometry, CSS-aligned paint/layout, shader uniforms.
 * Any JSON-serializable top-level key (except reserved) is a bindable property.
 */
export interface MeasureValue {
	ok: boolean;
	space: MeasureSpace;
	bounds?: MeasureRect;
	points?: MeasurePoint[];
	/** Per-key constraints for reactive two-way bind. */
	_constraints?: Record<string, MeasurePropertyConstraint>;
	/** Holodeck metadata — e.g. read-only property keys. */
	_meta?: { readonly?: string[] };
	/** Geometry, CSS, lineWidth, margins, opacity, shader params, … */
	[key: string]: unknown;
}

/** Structured address — canonical form before encoding as `ref`. */
export interface MeasureAddress {
	layerId: string;
	objectId?: string;
	attachmentId?: string;
	kind?: MeasureKind;
	space?: MeasureSpace;
}

/**
 * Stable string key for sparse maps and reactive subscriptions.
 * Format: `layerId[/objectId[/attachmentId[/kind]]]`
 */
export type MeasureRef = string;

export interface MeasureReadRequest {
	op: 'read';
	schema_version: typeof MEASURE_SCHEMA_VERSION;
	/** Sparse list of refs to resolve this frame. */
	refs: MeasureRef[];
}

export interface MeasureReadResponse {
	schema_version: typeof MEASURE_SCHEMA_VERSION;
	/** Monotonic holodeck frame id (for coherency / patch base). */
	frame: number;
	values: Record<MeasureRef, MeasureValue>;
	/** Refs that could not be resolved (plugin missing, object gone, etc.). */
	missing?: MeasureRef[];
}

/**
 * Sparse write: publish input/layout state into plugins before render.
 * Only plugins that implement `applyMeasure` accept writes.
 */
export interface MeasureWriteRequest {
	op: 'write';
	schema_version: typeof MEASURE_SCHEMA_VERSION;
	patches: Record<MeasureRef, Record<string, unknown>>;
}

export interface MeasureWriteResponse {
	schema_version: typeof MEASURE_SCHEMA_VERSION;
	frame: number;
	applied: MeasureRef[];
	rejected?: Array<{ ref: MeasureRef; reason: string }>;
}

/**
 * Incremental update after a read — whole values and/or sparse property keys.
 * Prefer `propUpdates` for reactive two-way bindings (lineWidth, opacity, …).
 */
export interface MeasurePatch {
	op: 'patch';
	schema_version: typeof MEASURE_SCHEMA_VERSION;
	baseFrame: number;
	frame: number;
	/** Full value replacement when core structure changed or catch-up. */
	updates?: Record<MeasureRef, MeasureValue>;
	/** Sparse per-property merge — layout, CSS, shader uniforms. */
	propUpdates?: Record<MeasureRef, Record<string, unknown>>;
	removed?: MeasureRef[];
	/** Keys cleared by holodeck since last patch. */
	propRemoved?: Record<MeasureRef, string[]>;
}

export type MeasureProtocolMessage =
	| MeasureReadRequest
	| MeasureReadResponse
	| MeasureWriteRequest
	| MeasureWriteResponse
	| MeasurePatch;

/** Encode structured address → ref string. */
export function encodeMeasureRef(address: MeasureAddress): MeasureRef {
	const parts = [address.layerId];
	if (address.objectId !== undefined) parts.push(address.objectId);
	if (address.attachmentId !== undefined) parts.push(address.attachmentId);
	if (address.kind !== undefined) parts.push(address.kind);
	return parts.join('/');
}

/** Parse ref string → structured address (best-effort). */
export function parseMeasureRef(ref: MeasureRef): MeasureAddress {
	const parts = ref.split('/');
	const layerId = parts[0] ?? ref;
	const address: MeasureAddress = { layerId };

	if (parts.length >= 4) {
		address.objectId = parts[1];
		address.attachmentId = parts[2];
		const kind = parts[3];
		if (kind && isMeasureKind(kind)) address.kind = kind;
	} else if (parts.length === 3) {
		address.objectId = parts[1];
		const third = parts[2];
		if (third && isMeasureKind(third)) {
			address.kind = third;
		} else if (third) {
			address.attachmentId = third;
		}
	} else if (parts.length === 2) {
		address.objectId = parts[1];
	}

	return address;
}

function isMeasureKind(value: string): value is MeasureKind {
	return value === 'bounds' || value === 'point' || value === 'polygon' || value === 'attachment';
}

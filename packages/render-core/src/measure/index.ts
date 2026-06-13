export {
	MEASURE_SCHEMA_VERSION,
	encodeMeasureRef,
	parseMeasureRef,
	type MeasureAddress,
	type MeasureJson,
	type MeasureKind,
	type MeasurePatch,
	type MeasurePoint,
	type MeasurePropertyConstraint,
	type MeasureProtocolMessage,
	type MeasureQuery,
	type MeasureReadRequest,
	type MeasureReadResponse,
	type MeasureRect,
	type MeasureRef,
	type MeasureScalar,
	type MeasureSpace,
	type MeasureValue,
	type MeasureWriteRequest,
	type MeasureWriteResponse,
} from './protocol.js';

export {
	CSS_MEASURE_PROPS,
	MEASURE_RESERVED_KEYS,
	diffMeasureValue,
	getBindableKeys,
	getMeasureProp,
	mergeMeasurePropUpdates,
	normalizeMeasureKey,
	normalizeMeasureValue,
	setMeasureProp,
	toMeasureValue,
	type CssMeasureProp,
} from './properties.js';

export {
	applyMeasureConstraint,
	isMeasurePropWritable,
	resolveMeasureConstraint,
} from './constraints.js';

export { resolveMeasureRef, type MeasureResolverContext } from './resolve.js';

export {
	applyMeasurePatch,
	createMeasureSnapshot,
	syncMeasureRefs,
	type MeasureSnapshot,
} from './sync.js';

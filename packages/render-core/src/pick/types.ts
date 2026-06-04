import { HolodeckIdType, type HolodeckIdTypeId } from '../holodeck/types.js';

export { HolodeckIdType, type HolodeckIdTypeId };

/** One texel from the holodeck pick MRT (type / objectId / subObjectId). */
export interface PickResult {
	type: number;
	objectId: number;
	subObjectId: number;
}

export const PICK_READ_BYTES_PER_ROW = 256;

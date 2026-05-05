import type { MainModule, Micropolis } from '../../types/micropolisengine.d.js';
import { heapU16FromEmscriptenModule } from './heap';

export type MapMopViews = {
	mapData: Uint16Array;
	mopData: Uint16Array;
};

export function createMapMopViews(engine: MainModule, micropolis: Micropolis): MapMopViews | null {
	const heapU16 = heapU16FromEmscriptenModule(engine);
	if (!heapU16) return null;

	const mapStartAddress = micropolis.getMapAddress() / 2;
	const mapEndAddress = mapStartAddress + micropolis.getMapSize() / 2;
	const mapData = heapU16.subarray(mapStartAddress, mapEndAddress);

	const mopStartAddress = micropolis.getMopAddress() / 2;
	const mopEndAddress = mopStartAddress + micropolis.getMopSize() / 2;
	const mopData = heapU16.subarray(mopStartAddress, mopEndAddress);

	return { mapData, mopData };
}

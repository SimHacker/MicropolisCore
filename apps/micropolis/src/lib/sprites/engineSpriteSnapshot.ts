/** Plain snapshot from Micropolis.getActiveSprites() — not Embind class handles. */
export interface EngineSpriteSnapshot {
	type: number;
	frame: number;
	x: number;
	y: number;
	xHot: number;
	yHot: number;
}

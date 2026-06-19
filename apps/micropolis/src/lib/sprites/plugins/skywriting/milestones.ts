/** Population thresholds that trigger skywriting celebrations. */
export const SKYWRITING_POP_MILESTONES: Array<{ pop: number; message: string; color: string }> = [
	{ pop: 10_000, message: 'POP 10K', color: '#ff6688' },
	{ pop: 50_000, message: 'POP 50K', color: '#66ccff' },
	{ pop: 100_000, message: 'POP 100K', color: '#ffcc44' },
	{ pop: 500_000, message: 'POP 500K', color: '#aa88ff' },
];

/** Advisory strings mirrored from micropolis-engine message indices (see emscripten.cpp). */
export const ENGINE_MESSAGES: Record<number, string> = {
	1: 'More residential zones needed.',
	2: 'More commercial zones needed.',
	3: 'More industrial zones needed.',
	4: 'More roads required.',
	5: 'Inadequate rail system.',
	6: 'Build a power plant.',
	10: 'Pollution very high.',
	11: 'Crime very high.',
	12: 'Frequent traffic jams reported.',
	20: 'Fire reported!',
	21: 'A monster has been sighted!',
	22: 'Tornado reported!',
	23: 'Major earthquake reported!',
	24: 'A plane has crashed!',
	25: 'Shipwreck reported!',
	26: 'A train crashed!',
	27: 'A helicopter crashed!',
	29: 'Your city has gone broke!'
};

export function messageText(index: number): string {
	if (index < 0) return '';
	return ENGINE_MESSAGES[index] ?? `City message #${index}`;
}

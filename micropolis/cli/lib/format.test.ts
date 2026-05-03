import { describe, expect, it } from 'vitest';
import { cityExportToCsv, normalizeStructuredFormat, recordsToCsv, stringifyStructured } from './format';

describe('CLI format helpers', () => {
	it('normalizes yaml alias', () => {
		expect(normalizeStructuredFormat('yml')).toBe('yaml');
	});

	it('serializes structured yaml', () => {
		expect(stringifyStructured({ city: 'haight', funds: 1000 }, 'yaml')).toContain('city: haight');
	});

	it('escapes CSV records', () => {
		expect(recordsToCsv([{ name: 'New, City', note: 'He said "hi"' }])).toBe('name,note\n"New, City","He said ""hi"""');
	});

	it('exports map payloads as tile-grid CSV', () => {
		const csv = cityExportToCsv({
			region: { startRow: 10, startCol: 20 },
			map: [
				[1, 2],
				[3, 4]
			]
		});

		expect(csv).toBe('row,col,tile\n10,20,1\n10,21,2\n11,20,3\n11,21,4');
	});
});

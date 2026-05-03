/**
 * Structured and tabular serialization for CLI stdout.
 *
 * API:
 * - `normalizeStructuredFormat(name)` → canonical `json` | `yaml` | `csv` | `text`
 * - `isStructuredFormat(name)` → true for json/yaml
 * - `stringifyStructured(data, format)` → string (json or yaml)
 * - `recordsToCsv(rows)` → CSV text
 * - `cityExportToCsv(exportPayload)` → CSV from `CityFile.toJSONForRegion` shape
 */

import { stringify as yamlStringify } from 'yaml';

const FORMAT_ALIASES: Record<string, string> = { yml: 'yaml' };

export type NormalizedFormat = 'json' | 'yaml' | 'csv' | 'text';

export function normalizeStructuredFormat(format?: string): NormalizedFormat {
	const f = String(format ?? 'json').toLowerCase();
	return (FORMAT_ALIASES[f] ?? f) as NormalizedFormat;
}

export function isYamlFormat(format?: string): boolean {
	return normalizeStructuredFormat(format) === 'yaml';
}

export function isStructuredFormat(format?: string): boolean {
	const f = normalizeStructuredFormat(format);
	return f === 'json' || f === 'yaml';
}

export function stringifyStructured(data: unknown, format = 'json'): string {
	const f = normalizeStructuredFormat(format);
	if (f === 'json') {
		return JSON.stringify(data, null, 2);
	}
	if (f === 'yaml') {
		return yamlStringify(data, { indent: 2, lineWidth: 0 });
	}
	throw new Error(`Unsupported structured format: ${format}. Use json or yaml.`);
}

function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
	const out: Record<string, unknown> = {};
	if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
		if (prefix) out[prefix] = obj;
		return out;
	}
	for (const [k, v] of Object.entries(obj)) {
		const key = prefix ? `${prefix}_${k}` : k;
		if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
			Object.assign(out, flattenObject(v as Record<string, unknown>, key));
		} else {
			out[key] = v;
		}
	}
	return out;
}

export function recordsToCsv(records: Record<string, unknown>[]): string {
	if (!records.length) return '';
	const keys = Object.keys(records[0]);
	const esc = (v: unknown) => {
		if (v === null || v === undefined) return '';
		const s = String(v);
		if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
		return s;
	};
	const lines = [keys.join(',')];
	for (const row of records) {
		lines.push(keys.map((k) => esc(row[k])).join(','));
	}
	return lines.join('\n');
}

export function cityExportToCsv(data: Record<string, unknown>): string {
	const map = data.map;
	const region = data.region;
	const hasMap =
		map && Array.isArray(map) && (map as unknown[]).length > 0 && region && typeof region === 'object';

	if (hasMap) {
		const sr = (region as { startRow: number }).startRow;
		const sc = (region as { startCol: number }).startCol;
		const rows: Record<string, unknown>[] = [];
		for (let r = 0; r < (map as unknown[][]).length; r++) {
			const row = (map as unknown[][])[r];
			if (!Array.isArray(row)) continue;
			for (let c = 0; c < row.length; c++) {
				rows.push({ row: sr + r, col: sc + c, tile: row[c] });
			}
		}
		return recordsToCsv(rows);
	}

	const flat: Record<string, unknown> = {
		...flattenObject((data.metadata as Record<string, unknown>) || {}, 'metadata'),
		...flattenObject((data.region as Record<string, unknown>) || {}, 'region'),
		...flattenObject((data.zones as Record<string, unknown>) || {}, 'zones')
	};
	if (data.poweredBuildings !== undefined) flat.poweredBuildings = data.poweredBuildings;
	if (data.conductiveBuildings !== undefined) flat.conductiveBuildings = data.conductiveBuildings;
	if (data.flammableBuildings !== undefined) flat.flammableBuildings = data.flammableBuildings;
	if (data.zoneCount !== undefined) flat.zoneCount = data.zoneCount;
	return recordsToCsv([flat]);
}

import { describe, expect, it } from 'vitest';
import { defaultMicropolisMapRenderDescription, validateRenderDescription } from './description';

describe('RenderDescription', () => {
	it('creates a valid default Micropolis map render description', () => {
		const description = defaultMicropolisMapRenderDescription();
		const result = validateRenderDescription(description);

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.render_type).toBe('micropolis.map');
			expect(result.value.output.format).toBe('png');
			expect(result.value.renderer).toBe('auto');
		}
	});

	it('reports missing required fields', () => {
		const result = validateRenderDescription({ render_type: 'micropolis.map' });

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.errors).toContain('schema_version must be 1');
			expect(result.errors).toContain('output must be an object');
			expect(result.errors).toContain('map must be an object');
			expect(result.errors).toContain('viewport must be an object');
		}
	});
});

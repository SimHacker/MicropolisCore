import { defaultMicropolisMapRenderDescription, validateRenderDescription, type RenderDescription } from '$lib/render/description';
import type { PageLoad } from './$types';

export const ssr = false;

function decodeJobParam(job: string | null): RenderDescription {
	if (!job) return defaultMicropolisMapRenderDescription();
	try {
		const parsed = JSON.parse(atob(job));
		const validation = validateRenderDescription(parsed);
		if (validation.ok) return validation.value;
		return defaultMicropolisMapRenderDescription({
			filters: { validation_errors: validation.errors }
		});
	} catch (error) {
		return defaultMicropolisMapRenderDescription({
			filters: { parse_error: error instanceof Error ? error.message : String(error) }
		});
	}
}

export const load: PageLoad = ({ url }) => {
	return {
		renderDescription: decodeJobParam(url.searchParams.get('job'))
	};
};

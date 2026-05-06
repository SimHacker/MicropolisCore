import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { regrantRootPermission } from '$lib/server/files-inventory';

export const prerender = false;

export const POST: RequestHandler = async ({ params }) => {
	try {
		const rootId = params.id;
		if (!rootId) {
			return json({ error: 'Root id is required' }, { status: 400 });
		}
		const root = regrantRootPermission(rootId);
		return json({ root });
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		const status = message.startsWith('Unknown root id:') ? 404 : 400;
		return json({ error: message }, { status });
	}
};

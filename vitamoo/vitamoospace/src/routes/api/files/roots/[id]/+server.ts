import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { removeRoot, updateRoot } from '$lib/server/files-inventory';

export const prerender = false;

export const PATCH: RequestHandler = async ({ params, request }) => {
	try {
		const body = (await request.json()) as Record<string, unknown>;
		const root = updateRoot(params.id, {
			enabled: body.enabled,
			rootType: body.rootType,
			rootMetadata: body.rootMetadata,
			name: body.name,
			description: body.description,
			contentSelection: body.contentSelection,
			permissionProvider: body.permissionProvider,
			permissionTokenId: body.permissionTokenId,
			permissionStatus: body.permissionStatus
		});
		return json({ root });
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		const status = message.startsWith('Unknown root id:') ? 404 : 400;
		return json({ error: message }, { status });
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
	const removed = removeRoot(params.id);
	if (!removed) {
		return json({ error: 'Root not found' }, { status: 404 });
	}
	return json({ ok: true });
};

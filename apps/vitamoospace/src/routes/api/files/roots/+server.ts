import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { addRoot, listRoots } from '$lib/server/files-inventory';

export const prerender = false;

export const GET: RequestHandler = async () => {
	return json({ roots: listRoots() });
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = (await request.json()) as Record<string, unknown>;
		const rawPath = body.path;
		if (typeof rawPath !== 'string' || !rawPath.trim()) {
			return json({ error: 'path is required' }, { status: 400 });
		}
		const root = addRoot({
			path: rawPath,
			rootType: body.rootType,
			rootMetadata: body.rootMetadata,
			name: body.name,
			description: body.description,
			contentSelection: body.contentSelection,
			permissionProvider: body.permissionProvider,
			permissionTokenId: body.permissionTokenId,
			permissionStatus: body.permissionStatus
		});
		return json({ root }, { status: 201 });
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		return json({ error: message }, { status: 400 });
	}
};

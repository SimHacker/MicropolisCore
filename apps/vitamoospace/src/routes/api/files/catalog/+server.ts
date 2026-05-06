import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { queryCatalog } from '$lib/server/files-inventory';

export const prerender = false;

export const GET: RequestHandler = async ({ url }) => {
	const rootId = url.searchParams.get('rootId') ?? 'all';
	const kind = (url.searchParams.get('kind') ?? 'all') as
		| 'all'
		| 'file'
		| 'container'
		| 'object'
		| 'chunk'
		| 'issue';
	const objectKind = url.searchParams.get('objectKind') ?? '';
	const text = url.searchParams.get('text') ?? '';
	const offsetRaw = Number.parseInt(url.searchParams.get('offset') ?? '0', 10);
	const limitRaw = Number.parseInt(url.searchParams.get('limit') ?? '100', 10);
	const offset = Number.isNaN(offsetRaw) ? 0 : offsetRaw;
	const limit = Number.isNaN(limitRaw) ? 100 : limitRaw;
	const result = queryCatalog({ rootId, kind, objectKind, text, offset, limit });
	return json(result);
};

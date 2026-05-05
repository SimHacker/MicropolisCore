import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listRuns, startScan } from '$lib/server/files-inventory';

export const prerender = false;

export const GET: RequestHandler = async () => {
	return json({ runs: listRuns() });
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = (await request.json()) as Record<string, unknown>;
		const rawRootIds = body.rootIds;
		const rootIds =
			Array.isArray(rawRootIds) && rawRootIds.every((row) => typeof row === 'string')
				? (rawRootIds as string[])
				: undefined;
		const run = await startScan(rootIds);
		return json({ run }, { status: 201 });
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		return json({ error: message }, { status: 400 });
	}
};

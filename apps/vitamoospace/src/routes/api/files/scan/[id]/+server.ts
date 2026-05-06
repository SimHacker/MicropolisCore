import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getRun } from '$lib/server/files-inventory';

export const prerender = false;

export const GET: RequestHandler = async ({ params }) => {
	const run = getRun(params.id);
	if (!run) return json({ error: 'Scan run not found' }, { status: 404 });
	return json({ run });
};

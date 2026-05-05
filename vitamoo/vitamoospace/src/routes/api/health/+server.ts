import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const prerender = false;

export const GET: RequestHandler = async () => {
	return json({
		status: 'ok',
		service: 'vitamoospace',
		version: '0.1.0',
		timestamp: new Date().toISOString()
	});
};

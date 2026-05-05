import { error } from '@sveltejs/kit';
import { findNodeByUrl } from '$lib/navigationTree';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async () => {
	const requestedUrl = '/play/micropolis';
	const foundData = findNodeByUrl(requestedUrl);

	if (!foundData) {
		error(500, 'Site configuration error: /play/micropolis not found in siteStructure');
	}

	const { node, fullPath } = foundData;

	return {
		node,
		fullPath
	};
};

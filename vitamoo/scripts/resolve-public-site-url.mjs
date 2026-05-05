/**
 * Derives SvelteKit paths.base (BASE_PATH) and optional GitHub Pages CNAME host
 * from a public site URL. Used by CI and by vitamoo/scripts/build-vitamoospace-static.mjs.
 *
 * Env (when run as main): PAGES_SITE_URL, optional GITHUB_OUTPUT for Actions.
 */

import { appendFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Hosts that must never get a GitHub Pages CNAME file (and match local Vite-style dev URLs).
 */
function isLocalOrNonCnameHost(host) {
	const h = host.toLowerCase();
	if (h === 'localhost' || h === '127.0.0.1' || h === '[::1]' || h === '::1' || h === '0.0.0.0') {
		return true;
	}
	if (h === 'github.io' || h.endsWith('.github.io')) {
		return true;
	}
	if (h === 'local' || h.endsWith('.local')) {
		return true;
	}
	if (h.endsWith('.localhost')) {
		return true;
	}
	return false;
}

/**
 * @param {string} raw
 * @returns {{ basePath: string, cnameHost: string } | null} null if URL is invalid (non-empty but bad)
 */
export function resolvePublicSiteUrl(raw) {
	const trimmed = (raw || '').trim();
	if (!trimmed) {
		return { basePath: '', cnameHost: '' };
	}

	let urlString = trimmed;
	if (!/^https?:\/\//i.test(urlString)) {
		urlString = `https://${urlString}`;
	}

	let u;
	try {
		u = new URL(urlString);
	} catch {
		return null;
	}

	let path = u.pathname.replace(/\/+$/, '') || '';
	if (path === '/') {
		path = '';
	}
	const basePath = path === '' ? '' : path.startsWith('/') ? path : `/${path}`;
	const host = u.hostname.toLowerCase();
	const cnameHost = isLocalOrNonCnameHost(host) ? '' : host;

	return { basePath, cnameHost };
}

function main() {
	const raw = (process.env.PAGES_SITE_URL || '').trim();
	const out = process.env.GITHUB_OUTPUT;

	if (!raw) {
		if (out) {
			console.error('PAGES_SITE_URL is empty');
			process.exit(1);
		}
		console.log(JSON.stringify({ basePath: '', cnameHost: '' }, null, 2));
		process.exit(0);
	}

	const resolved = resolvePublicSiteUrl(raw);
	if (!resolved) {
		console.error('Invalid PAGES_SITE_URL');
		process.exit(1);
	}

	const { basePath, cnameHost } = resolved;
	if (!out) {
		console.log(JSON.stringify({ basePath, cnameHost }, null, 2));
		process.exit(0);
	}

	appendFileSync(out, `base_path=${basePath}\n`);
	appendFileSync(out, `cname_host=${cnameHost}\n`);
}

const isMain =
	process.argv[1] &&
	path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
	main();
}

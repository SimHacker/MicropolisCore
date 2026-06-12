// Markdown content loader — renders .md → HTML in Node at (pre)render time.
// Replaces the old Jekyll/Ruby build. Same remark/rehype stack as donhopkins.com,
// so kramdown-style `{#id}` heading anchors and GFM render identically.
//
// Convention: a content slug maps to a DIRECTORY containing README.md
//   slug "about/will-wright"  ->  website/pages/about/will-wright/README.md
// Legacy flat `website/pages/<slug>.md` is still supported as a fallback.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { error } from '@sveltejs/kit';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
// remark-heading-id ships no type declarations.
// @ts-expect-error - no types for remark-heading-id
import remarkHeadingId from 'remark-heading-id';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';

// Markdown source lives in the SvelteKit app (no Jekyll build output anymore).
const pagesDir = path.resolve(process.cwd(), './website/pages');

const processor = unified()
	.use(remarkParse)
	.use(remarkGfm)
	.use(remarkHeadingId, { defaults: false }) // only explicit `## Heading {#custom-id}`
	.use(remarkRehype, { allowDangerousHtml: true }) // keep inline HTML in content
	.use(rehypeSlug) // auto-id the rest via github-slugger ("SimCity" -> "simcity")
	.use(rehypeStringify, { allowDangerousHtml: true });

/**
 * Absolute path to a slug's primary content file (slug-as-directory + README.md).
 * @param {string} slug
 * @returns {string}
 */
export function getContentFilePath(slug) {
	return path.join(pagesDir, slug, 'README.md');
}

/** @param {string} raw @returns {Promise<string>} */
async function renderMarkdown(raw) {
	const { content } = matter(raw); // strip YAML frontmatter
	const file = await processor.process(content);
	return String(file);
}

/**
 * Reads a markdown content file and returns rendered HTML.
 * Tries `<slug>/README.md` first, then legacy flat `<slug>.md`.
 * @param {string} filePath - primary candidate (from getContentFilePath)
 * @param {string} slug
 * @returns {Promise<string>} rendered HTML
 */
export async function readContentFile(filePath, slug) {
	const fallback = path.join(pagesDir, `${slug}.md`);
	const candidates = filePath === fallback ? [filePath] : [filePath, fallback];
	for (const candidate of candidates) {
		let raw;
		try {
			raw = await fs.readFile(candidate, 'utf-8');
		} catch (err) {
			const isMissing = err && typeof err === 'object' && 'code' in err && err.code === 'ENOENT';
			if (isMissing) continue; // try next candidate
			console.error(`Error reading content file for slug '${slug}': ${candidate}`, err);
			error(500, 'Internal server error');
		}
		try {
			return await renderMarkdown(raw);
		} catch (err) {
			console.error(`Error rendering markdown for slug '${slug}': ${candidate}`, err);
			error(500, 'Internal server error');
		}
	}
	console.error(`Content file not found for slug '${slug}' (tried README dir and flat .md).`);
	error(404, `Content not found for ${slug}`);
}

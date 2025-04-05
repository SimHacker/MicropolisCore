import { promises as fs } from 'node:fs';
import path from 'node:path';
import { error } from '@sveltejs/kit';

const contentDir = path.resolve(process.cwd(), './_jekyll_content_build/pages');

// Regex to find and capture the component marker
const componentMarkerRegex = /(<!-- SVELTE_COMPONENT:([a-zA-Z0-9_]+) -->)/g;

/**
 * Reads the raw content of a Jekyll-generated HTML file.
 * @param {string} filePath - The absolute path to the HTML file.
 * @param {string} slug - The slug corresponding to the file (for error messages).
 * @returns {Promise<string>} The raw HTML content of the file.
 * @throws {Error} SvelteKit error (404 or 500) if the file cannot be read.
 */
export async function readContentFile(filePath, slug) {
    console.log(`Reading content file: ${filePath}`);
    try {
        const contentHtml = await fs.readFile(filePath, 'utf-8');
        return contentHtml;
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.error(`Content file not found for slug '${slug}': ${filePath}`);
            error(404, `Content not found for ${slug}`);
        } else {
            console.error(`Error reading content file for slug '${slug}': ${filePath}`, err);
            error(500, 'Internal server error');
        }
    }
}

/**
 * Parses HTML content for component markers and splits it into parts.
 * @param {string} htmlString - The raw HTML content.
 * @returns {Array<{type: 'html' | 'component', content?: string, name?: string}>} An array of parts.
 */
function parseContentForSlots(htmlString) {
    const parts = htmlString.split(componentMarkerRegex);
    const result = [];

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (i % 3 === 0) { // HTML segments
            if (part.trim()) {
                result.push({ type: 'html', content: part });
            }
        } else if (i % 3 === 2) { // Component names
             if (part) {
                 result.push({ type: 'component', name: part.trim() });
             }
        } // Ignore i % 3 === 1 (the full marker)
    }
    // Handle case where there were no markers
    if (result.length === 0 && htmlString.trim()) {
        return [{ type: 'html', content: htmlString }];
    }
    return result;
}

/**
 * Reads and parses a Jekyll-generated HTML file for component slots.
 * @param {string} filePath - The absolute path to the HTML file.
 * @param {string} slug - The slug corresponding to the file (for error messages).
 * @returns {Promise<Array<{type: 'html' | 'component', content?: string, name?: string}>>} The array of content parts.
 */
export async function readAndParseContentFile(filePath, slug) {
    const contentHtml = await readContentFile(filePath, slug); // Reuse raw reading
    const contentParts = parseContentForSlots(contentHtml);
    return contentParts;
}

/**
 * Helper to get the absolute path for a content file based on slug.
 * @param {string} slug - The slug of the content (e.g., 'about', 'will-wright').
 * @returns {string} The absolute file path.
 */
export function getContentFilePath(slug) {
    // Assuming a flat structure in the build output directory
    return path.join(contentDir, `${slug}.html`);
} 
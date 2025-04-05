import { promises as fs } from 'node:fs';
import path from 'node:path';
import { error } from '@sveltejs/kit';

// Base directory where Jekyll outputs the HTML pages
const contentDir = path.resolve(process.cwd(), './_jekyll_content_build/pages');

/**
 * Reads the content of a Jekyll-generated HTML file.
 * @param {string} filePath - The absolute path to the HTML file.
 * @param {string} slug - The slug corresponding to the file (for error messages).
 * @returns {Promise<string>} The HTML content of the file.
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
 * Helper to get the absolute path for a content file based on slug.
 * @param {string} slug - The slug of the content.
 * @returns {string} The absolute file path.
 */
export function getContentFilePath(slug) {
    // Assuming a flat structure in the build output directory
    return path.join(contentDir, `${slug}.html`);
} 
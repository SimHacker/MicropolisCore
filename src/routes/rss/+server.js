import { navigationTree } from '$lib/navigationTree.js';

export const prerender = true;

// Basic XML escaping
function escapeXml(unsafe) {
    if (!unsafe) return '';
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

// Function to build the RSS feed XML
async function buildRssFeed(origin) {
    const channelTitle = 'Micropolis Content';
    const channelLink = origin + '/pages'; // Link to the base content page
    const channelDescription = 'Updates and information from the Micropolis project content pages.';
    const pubDate = new Date().toUTCString(); // Use build time

    let itemsXml = '';
    const visited = new Set(); // Prevent infinite loops if tree is malformed

    function traverse(node, pathSegments) {
        if (!node || visited.has(node)) return;
        visited.add(node);

        // Check if node should be excluded
        if (!node.excludeFromRss && node.slug && node.contentSlug) {
            const itemPath = pathSegments.join('/');
            const itemLink = `${origin}/pages/${itemPath}`;
            const itemTitle = escapeXml(node.header || node.title); // Use node.header for RSS title, node.description for RSS description
            const itemDescription = escapeXml(node.description || '');

            itemsXml += `
    <item>
      <title>${itemTitle}</title>
      <link>${itemLink}</link>
      <guid isPermaLink="true">${itemLink}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${itemDescription}</description>
    </item>`;
        }

        // Traverse children
        if (node.children) {
            for (const child of node.children) {
                traverse(child, [...pathSegments, child.slug]);
            }
        }
    }

    // Start traversal from the children of the conceptual root
    if (navigationTree.children) {
        for (const child of navigationTree.children) {
            traverse(child, [child.slug]);
        }
    }

    // Construct the full RSS XML
    return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${escapeXml(channelTitle)}</title>
  <link>${channelLink}</link>
  <description>${escapeXml(channelDescription)}</description>
  <lastBuildDate>${pubDate}</lastBuildDate>
  <atom:link href="${origin}/rss" rel="self" type="application/rss+xml" />
  ${itemsXml}
</channel>
</rss>`;
}

// GET handler
/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
    console.log('[GET /rss] Generating RSS feed...');
    try {
        const rssXml = await buildRssFeed(url.origin);
        return new Response(rssXml, {
            headers: {
                'Cache-Control': 'max-age=0, s-maxage=3600', // Cache for 1 hour on CDN
                'Content-Type': 'application/rss+xml'
            }
        });
    } catch (e) {
        console.error('[GET /rss] Error generating RSS feed:', e);
        return new Response('Internal Server Error generating RSS feed', { status: 500 });
    }
} 
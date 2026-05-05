import { siteStructure } from '$lib/navigationTree';

export const prerender = true;

// Basic XML escaping
function escapeXml(unsafe: string | undefined): string {
    if (!unsafe) return '';
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
}

// Interface for node entries (should match the one in all/+page.server.ts)
interface NavigationNode {
    url?: string;
    title: string;
    header?: string;
    contentSlug?: string;
    description?: string;
    children?: NavigationNode[];
    excludeFromAll?: boolean;
    excludeFromRss?: boolean;
    hideFromNav?: boolean;
    external?: boolean;
}

// Function to build the RSS feed XML
async function buildRssFeed(origin: string): Promise<string> {
    const channelTitle = 'Micropolis Content';
    const channelLink = `${origin}`; // Link to the site root
    const channelDescription = 'Updates and information from the Micropolis project.';
    const pubDate = new Date().toUTCString(); // Use build time

    let itemsXml = '';
    const visited = new Set<NavigationNode>(); // Prevent infinite loops if tree is malformed

    function traverse(node: NavigationNode): void {
        if (!node || visited.has(node)) return;
        visited.add(node);

        // Check if node should be excluded and has a URL and content
        if (!node.excludeFromRss && node.url && node.contentSlug) {
            // Use the actual site URL as defined in navigation structure
            // Create fully absolute URL with origin
            const itemLink = `${origin}${node.url}`;
            const itemTitle = escapeXml(node.header || node.title); 
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
                traverse(child);
            }
        }
    }

    // Start traversal from all top-level nodes
    for (const node of siteStructure) {
        traverse(node);
    }

    // Construct the full RSS XML - using absolute URLs everywhere
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
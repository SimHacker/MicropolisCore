# Historical documents

Long-form writing that predates or sits beside the current MicropolisCore tree: blog posts, migration-era exports, talks, and snapshots that are worth keeping but are **not** active engineering specs (those stay under **`designs/`**).

## Layout

| Pattern | Use |
|---------|-----|
| **`drupal-blog/`** | Posts migrated from the old Drupal site — one topic per **`*.md`** file; see **`drupal-blog/README.md`** for an indexed list. |
| **`drupal-blog/images/`** | Figures referenced from those posts (prefer descriptive names: `olpc-pie-menu-discussion.png`). |

Add other buckets as needed (e.g. **`talks/`**, **`newsletters/`**) using the same rule: **one document per file**, filename = slug (`micropolis-news-client-notes.md`).

## Markdown conventions

- Title as `#` at top; optional date line under it.
- Relative image links: `![caption](images/foo.png)` from each post’s `.md` file.
- External URLs only when an asset must stay remote (prefer local **`images/`** for longevity).

## Images

- **You paste image URLs** → we can fetch them into **`documentation/historical/.../images/`** and wire them into the Markdown (requires network + permission to store binaries in git).
- **You paste images in chat** → depending on the client, we may only get a preview; if there’s no downloadable URL or file path, the reliable approach is: you upload the file into the repo or share a URL.

Say which subdirectory the next batch belongs in (`drupal-blog`, etc.), paste or link the source text, list image URLs in order, and we’ll split into named `.md` files and pull assets.

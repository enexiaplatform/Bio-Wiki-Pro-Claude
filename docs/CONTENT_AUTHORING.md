# Authoring content (Academy / Blog / Toolkits)

Content is MDX-in-repo (English-only), with server-side gating. To add a lesson
or post, drop one file — no code changes needed.

## 1. Create the file

```
content/<collection>/<slug>.en.mdx
```

- `<collection>`: `academy`, `blog`, or `toolkits`
- `<slug>`: lowercase, hyphens only (`[a-z0-9-]+`)
- The product is English-only; files use the `.en.mdx` suffix.

## 2. Frontmatter (required)

```yaml
---
title: "Sterility Testing — Foundations"
slug: "sterility-testing-basics"      # must equal the filename slug
lang: "en"                            # must equal the filename lang
tier: "free"                          # free | pro | paid
category: "Microbiology QC"
seoDescription: "One-sentence teaser (REQUIRED for pro/paid — shown on the paywall)."
updatedAt: "2026-05-30"
---
```

Body is plain Markdown/MDX (GFM tables, **bold**, lists, headings all supported).

## 3. Gating

- `tier: free` → full body served to everyone.
- `tier: pro` → full body only to Pro users; others get `seoDescription` as a
  teaser + an upgrade CTA. The body is **never** sent to unentitled clients
  (enforced server-side in `/api/content/:collection/:slug`).
- `tier: paid` → requires a completed purchase (optionally a `productId`
  frontmatter field).

## 4. Where it shows up

- **Academy lessons** appear in the "In-depth library" section on `/academy` and
  read at `/library/<slug>` (bilingual, gated).
- **Blog posts** appear on `/blog` and read at `/blog/<slug>`, with RSS.

## 5. Validate & seed

```bash
npm run validate:content   # checks frontmatter, slugs, missing translations, teasers, links
npm run seed:content       # syncs frontmatter → content_entries (publish/sort) in the DB
```

`validate:content` flags pro/paid entries missing a `seoDescription` teaser and
unescaped `<` before a digit (e.g. write `USP &lt;85&gt;`, not `USP <85>`, since
MDX would parse it as JSX).

## Migration note (48 legacy Academy entries)

The legacy structured Academy entries still live in `client/src/data` and render
via the old `AcademyEntryPage`. Migrating them to MDX is the remaining content
task — each becomes a `content/academy/<slug>.en.mdx` file using this format.

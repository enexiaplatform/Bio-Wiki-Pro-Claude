# Authoring bilingual content (Academy / Blog / Toolkits)

Content is MDX-in-repo, bilingual, with server-side gating. To add a lesson or
post, drop two files — no code changes needed.

## 1. Create the files

```
content/<collection>/<slug>.en.mdx   ← English (primary)
content/<collection>/<slug>.vi.mdx   ← Vietnamese
```

- `<collection>`: `academy`, `blog`, or `toolkits`
- `<slug>`: lowercase, hyphens only (`[a-z0-9-]+`) — must match in both files
- English is the primary language. If the `.vi.mdx` is missing, the app falls
  back to English; if `.en.mdx` is missing it falls back to Vietnamese.

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

`validate:content` will list any slug missing its EN or VI translation, any
pro/paid entry missing a `seoDescription` teaser, and internal links that don't
carry a `/en` or `/vi` prefix.

## Migration note (48 legacy Academy entries)

The legacy structured Academy entries still live in `client/src/data` and render
via the old `AcademyEntryPage`. Migrating them to bilingual MDX is the remaining
content task — each becomes a `content/academy/<slug>.{en,vi}.mdx` pair using
this format. The mechanism above is the target; professional GMP/microbiology
translations are needed for the body content.

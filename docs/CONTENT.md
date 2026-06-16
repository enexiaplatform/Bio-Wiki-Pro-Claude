# Adding content (lessons & blog posts)

The repeatable workflow so content ships regularly without breaking SEO, gating,
or the build. Content is **MDX-in-repo** + a generated metadata manifest; see
`docs/adr/0001-content-mdx-postgres.md` for the architecture.

## Add a library lesson (academy)

1. Create `content/academy/<slug>.en.mdx` with YAML frontmatter:
   ```yaml
   ---
   title: "Bacterial Endotoxins — LAL Testing"
   slug: "endotoxin-lal-testing"      # must equal the filename slug
   lang: "en"
   tier: "free" | "pro" | "paid"      # gating; pro/paid bodies are server-gated
   category: "Microbiology QC"
   seoDescription: "≤ ~155 chars, unique per lesson."
   updatedAt: "2026-06-13"
   quiz:                               # optional, 3 Qs recommended
     - q: "…"
       options: ["…","…","…","…"]
       answer: 1                       # 0-based index of the correct option
   ---
   ```
2. Write the body in MDX. **Escape `<` before a digit** (`USP &lt;71&gt;`, `&lt;0.25`)
   or `validate:content` fails (it's read as JSX).
3. **Add the slug to exactly one path** in `client/src/data/learningPaths.ts`
   (`lessonSlugs`) — `validate:paths` enforces every academy lesson is in one path.
4. Keep claims accurate + appropriately hedged (regulated audience). The
   educational-use disclaimer renders automatically on every reader.

## Add a blog post

1. Create `content/blog/<slug>.en.mdx` with the same frontmatter (no path needed —
   blog posts aren't in learning paths). Blog is always free; bodies render
   client-side.
2. `tier` is effectively free for blog.

## After adding/editing any content

```bash
npm run gen:content     # regenerate client/src/data/content-manifest.json
npm run validate        # content + paths + links + typecheck (all CI guards)
```

- The manifest also regenerates automatically on `npm run dev` and in the build,
  so locally you mostly just restart dev. Commit the regenerated manifest.
- `npm run seed:content` (optional) syncs frontmatter → the `content_entries` DB
  table for publish flags / sort / view counts. Not required to serve.

## What ships where (don't regress)

- **Metadata** (title, tier, readMinutes, quiz) → `content-manifest.json` (in the
  bundle; no bodies).
- **Free blog bodies** → bundled (rendered by `BlogPost`).
- **Academy/toolkit bodies** → NEVER bundled; served per-request by
  `GET /api/content/:collection/:slug` and gated by tier in `GatedContent`.
- The dynamic `/sitemap.xml` + JSON-LD pick up new slugs automatically.

## Guardrails (run before pushing content)

| Check | Catches |
|---|---|
| `validate:content` | bad frontmatter, unescaped `<digit` in MDX |
| `validate:paths` | an academy lesson not in exactly one path |
| `validate:links` | a hard-coded `/library|paths|blog|academy/<slug>` that doesn't resolve |

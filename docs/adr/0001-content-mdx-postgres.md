# ADR 0001 — Content layer: MDX-in-repo + Postgres metadata hybrid

- **Status:** Accepted (2026-05-29)
- **Supersedes:** the placeholder `0001-content-layer-mdx-postgres-hybrid.md`

## Context

Content (academy lessons, blog, toolkits) was hard-coded as static arrays in
`client/src/data/mockData.ts` and `data/lessons/*`. This made authoring,
review, versioning, i18n, and gating awkward — every edit was a code change,
and there was no notion of publish state or per-entry entitlement.

We need: authorable long-form content, bilingual (vi/en), per-entry gating
(free/pro/paid), SEO metadata, and a publish/sort/analytics surface — without
running a separate CMS.

## Decision

**MDX files live in the repo; Postgres holds operational metadata.**

- **Files:** `content/{academy,blog,toolkits}/{slug}.{vi|en}.mdx`.
- **Format (hybrid):** YAML frontmatter for metadata
  (`title, slug, lang, tier, category, seoDescription, updatedAt`) + MDX prose
  body. This is the canonical format for new content.
- **Build-time loader** (`client/src/lib/content.ts`): `import.meta.glob` over
  `content/**/*.mdx` (via `@mdx-js/rollup` + `remark-mdx-frontmatter`) exposes
  `listContent()` / `getContentBySlug()` filtered by collection/lang/tier.
  Adding a file makes it appear automatically — no component edits.
- **Postgres (`content_entries`)** stores publish state, sort order, and view
  counts keyed by `(slug, lang)`; a seed script syncs frontmatter → DB. The
  MDX file remains the source of truth for *content*; the DB is the source of
  truth for *operational state*.
- **Gating is enforced server-side** for paid/pro content: the protected body
  is served by an authenticated endpoint, never shipped in the public client
  bundle (see ADR 0003 / Sprint 3.2).

### Note on migrating the existing 48 Academy entries

Those entries are **structured objects** (`AcademyEntry`: `workflow_steps`,
`content_full_outline`, `regulatory_refs`, …) with a dedicated render contract,
not prose. When migrated (separate pass), they will use a **frontmatter-heavy**
MDX variant that preserves the structured fields in YAML so the existing
renderer keeps working — rather than rewriting them as free prose.

## Consequences

- ✅ Authoring is plain MDX; git is the review/version trail.
- ✅ i18n is filename-based (`.vi.mdx` / `.en.mdx`); fits Sprint 2 routing.
- ✅ New content needs zero code changes.
- ⚠️ Free content is bundled client-side (public by design). Pro/paid bodies
  must NOT be bundled — they are server-gated.
- ⚠️ `content/` sits outside the Vite `client/` root, so `server.fs.allow` and a
  relative glob are required; the server bundle needs `content/**` shipped on
  Vercel for runtime gating.
- ⚠️ DB and frontmatter can drift; the seed script must run on content changes.

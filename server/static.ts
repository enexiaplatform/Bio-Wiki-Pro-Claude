import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const SLUG_RE = /^[a-z0-9-]+$/;
const SITE_URL = (process.env.BASE_URL ?? "https://bio-wiki-pro-claude.vercel.app").replace(/\/$/, "");

// Per-tool social/SEO meta for the standalone /tools/:slug pages. Most crawlers
// and social-card scrapers don't run the client JS that sets these, so we inject
// them server-side. Keep in sync with client/src/data/tools/catalog.ts.
const TOOL_META: Record<string, { title: string; description: string }> = {
  "audit-readiness-scorecard": {
    title: "GMP Audit Readiness Scorecard",
    description:
      "Free GMP audit readiness self-assessment — rate your quality system across six areas and get a prioritized list of the gaps to close before an inspection.",
  },
  "lab-water-type-selector": {
    title: "Lab Water Type Selector",
    description:
      "Free pharmaceutical water grade selector — pick your use case (Water for Injection, Purified Water, reagent grade) and see the key controls and pitfalls for each.",
  },
  "culture-media-selection-helper": {
    title: "Culture Media Selection Helper",
    description:
      "Free culture media selector for pharmaceutical microbiology — match your test (bioburden, sterility, environmental monitoring, growth promotion) to the right media.",
  },
  "sterility-test-method-selector": {
    title: "Sterility Test Method Selector",
    description:
      "Free sterility test method selector — choose between membrane filtration and direct inoculation based on your product type and volume, with the key method controls.",
  },
  "microbial-count-calculator": {
    title: "Microbial Count (CFU) Calculator",
    description:
      "Free microbial count (CFU) calculator — convert colonies on a pour plate, spread plate, or membrane back to CFU/mL accounting for dilution and volume plated.",
  },
  "sterilization-f0-calculator": {
    title: "F0 Sterilization Lethality Calculator",
    description:
      "Free F0 sterilization calculator — compute the lethal rate and the equivalent time at 121.1 C (F0) for a moist-heat hold from temperature, time, and z-value.",
  },
  "endotoxin-limit-calculator": {
    title: "Endotoxin Limit & MVD Calculator",
    description:
      "Free bacterial endotoxin limit and MVD calculator — apply the compendial formulas (endotoxin limit = K/M, Maximum Valid Dilution) for your LAL / bacterial endotoxin test.",
  },
  "cleaning-validation-maco-calculator": {
    title: "Cleaning Validation MACO Calculator",
    description:
      "Free cleaning validation MACO calculator — dose-based, HBEL/PDE, and 10 ppm maximum allowable carryover limits, with surface and recovery-corrected swab limits.",
  },
  "process-capability-calculator": {
    title: "Process Capability Calculator",
    description:
      "Free process capability calculator — Cp, Cpu, Cpl, Cpk and the estimated out-of-spec PPM from spec limits and process data, with raw-data paste support.",
  },
  "system-suitability-calculator": {
    title: "System Suitability %RSD Calculator",
    description:
      "Free system suitability %RSD calculator — compute the relative standard deviation of replicate chromatographic injections and check it against a %RSD limit and minimum injection count (USP 621 / Ph. Eur. 2.2.46 style).",
  },
  "oos-investigation-decision-tree": {
    title: "OOS Investigation Decision Tree",
    description:
      "Free OOS investigation decision tree — walk the phased FDA out-of-specification process (Phase I laboratory investigation, Phase II) and see the appropriate next step.",
  },
  "em-scenario-decision-tree": {
    title: "EM Scenario Decision Tree",
    description:
      "Free environmental monitoring decision tree — work through common EM excursion scenarios (alert and action limits, investigations) and the appropriate response.",
  },
  "contamination-control-strategy-builder": {
    title: "CCS Builder Lite",
    description:
      "Free contamination control strategy (CCS) builder — outline your Annex 1 contamination controls across the key elements and spot the gaps.",
  },
  "investigation-template-viewer": {
    title: "Investigation Template Viewer",
    description:
      "Free QC investigation template viewer — preview a structured deviation/OOS investigation outline you can adapt to your quality system.",
  },
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Rewrite the document title + description/OG/Twitter/canonical tags in the
 * static index.html so a shared or crawled content URL shows ITS OWN preview
 * (most social/SEO crawlers don't run the JS that sets these client-side).
 * Replacement is by tag identity, so it's resilient to value changes.
 */
function injectMeta(
  html: string,
  meta: { title: string; description: string; url: string; type: string },
): string {
  const title = escapeHtml(`${meta.title} | Life Science Atlas`);
  const desc = escapeHtml(meta.description);
  const url = escapeHtml(meta.url);
  const type = escapeHtml(meta.type);
  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${desc}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${desc}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta property="og:type" content=")[^"]*(")/, `$1${type}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${title}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${desc}$2`);
}

async function readFrontmatter(
  collection: "academy" | "blog",
  slug: string,
): Promise<{ title: string; description: string } | null> {
  // SLUG_RE + fixed dir prevent path traversal.
  const filePath = path.resolve(process.cwd(), "content", collection, `${slug}.en.mdx`);
  try {
    const raw = await fs.promises.readFile(filePath, "utf-8");
    const { data } = matter(raw);
    return {
      title: (data.title as string) ?? slug,
      description: (data.seoDescription as string) ?? "",
    };
  } catch {
    return null;
  }
}

export function serveStatic(app: Express) {
  const candidatePaths = [
    path.resolve(process.cwd(), "dist", "public"),
    path.resolve(process.cwd(), "server", "public"),
  ];
  const distPath = candidatePaths.find((p) => fs.existsSync(p));

  if (!distPath) {
    throw new Error(
      `Could not find the build directory in: ${candidatePaths.join(", ")}`,
    );
  }

  const indexPath = path.resolve(distPath, "index.html");

  app.use(express.static(distPath));

  // Per-page social/SEO meta for content URLs. Title + seoDescription are
  // public teaser fields (the gated body is never touched), so this is safe
  // for Pro/paid lessons too. Any miss falls through to the default index.
  const contentMeta = (collection: "academy" | "blog", prefix: string) =>
    app.get(`${prefix}/:slug`, async (req, res, next) => {
      const slug = String(req.params.slug ?? "");
      if (!SLUG_RE.test(slug)) return next();
      try {
        const fm = await readFrontmatter(collection, slug);
        if (!fm) return next();
        const html = await fs.promises.readFile(indexPath, "utf-8");
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        return res.send(
          injectMeta(html, {
            title: fm.title,
            description: fm.description,
            url: `${SITE_URL}${prefix}/${slug}`,
            type: "article",
          }),
        );
      } catch {
        return next();
      }
    });

  contentMeta("blog", "/blog");
  contentMeta("academy", "/library");

  // Per-tool social/SEO meta for the standalone tool pages (from the in-memory
  // TOOL_META map, no file read). Any miss falls through to the default index.
  app.get("/tools/:slug", async (req, res, next) => {
    const slug = String(req.params.slug ?? "");
    if (!SLUG_RE.test(slug)) return next();
    const meta = TOOL_META[slug];
    if (!meta) return next();
    try {
      const html = await fs.promises.readFile(indexPath, "utf-8");
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.send(
        injectMeta(html, {
          title: meta.title,
          description: meta.description,
          url: `${SITE_URL}/tools/${slug}`,
          type: "website",
        }),
      );
    } catch {
      return next();
    }
  });

  // SPA fallback for everything else.
  app.use("/{*path}", (_req, res) => {
    res.sendFile(indexPath);
  });
}

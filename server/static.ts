import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const SLUG_RE = /^[a-z0-9-]+$/;
const SITE_URL = (process.env.BASE_URL ?? "https://lifescienceatlas.com").replace(/\/$/, "");

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
  "sterile-filtration-readiness-planner": {
    title: "Sterile Filtration Readiness Planner",
    description:
      "Free sterile filtration readiness planner - check bacterial-retention validation, integrity-test limits, PUPSIT or CCS/QRM rationale, validated process parameters, post-use integrity, and batch-impact assessment.",
  },
  "gowning-qualification-readiness-planner": {
    title: "Gowning Qualification Readiness Planner",
    description:
      "Free gowning qualification readiness planner - check aseptic gowning training, assessor observation, consecutive successful sessions, gown monitoring counts, APS coverage, routine monitoring, and requalification controls.",
  },
  "media-fill-aps-readiness-planner": {
    title: "Media Fill APS Readiness Planner",
    description:
      "Free media fill APS readiness planner - check aseptic process simulation protocol, intervention matrix, operator coverage, growth promotion, worst-case run design, incubation, EM linkage, and positive-unit investigation controls.",
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
  "equipment-qualification-readiness-planner": {
    title: "Equipment Qualification Readiness Planner",
    description:
      "Free equipment qualification readiness planner - check URS, risk assessment, DQ, IQ, OQ, PQ, deviations, and qualified-state controls before QA release.",
  },
  "system-suitability-calculator": {
    title: "System Suitability %RSD Calculator",
    description:
      "Free system suitability %RSD calculator — compute the relative standard deviation of replicate chromatographic injections and check it against a %RSD limit and minimum injection count (USP 621 / Ph. Eur. 2.2.46 style).",
  },
  "dilution-calculator": {
    title: "Dilution & Standard Prep Calculator",
    description:
      "Free dilution calculator — solve C1V1 = C2V2 for the stock and diluent volumes to hit a target concentration, or build a serial (fold) dilution table for standard preparation.",
  },
  "dissolution-acceptance-checker": {
    title: "Dissolution S1/S2/S3 Acceptance Checker",
    description:
      "Free dissolution acceptance checker - paste 6, 12, or 24 unit results, enter the Q value, and evaluate immediate-release S1/S2/S3 staged acceptance criteria.",
  },
  "stability-trend-shelf-life-planner": {
    title: "Stability Trend & Shelf-Life Planner",
    description:
      "Free stability trend and shelf-life planner - enter long-term stability points, specifications, proposed retest period or shelf life, and get a Q1A/Q1E-style triage note for trend, headroom, extrapolation, and impact review.",
  },
  "cell-based-potency-readiness-planner": {
    title: "Cell-Based Potency Readiness Planner",
    description:
      "Free cell-based potency readiness planner - check reference standard, cell system, plate controls, curve fit, parallelism, precision, and assay-vs-sample investigation before reporting relative potency.",
  },
  "hcp-testing-readiness-planner": {
    title: "HCP Testing Readiness Planner",
    description:
      "Free HCP testing readiness planner - check method validity, antibody coverage, dilutional linearity, assay range, plate controls, orthogonal support, clearance trend, and assay-vs-process impact before reporting host-cell protein results.",
  },
  "viral-safety-readiness-planner": {
    title: "Viral Safety Readiness Planner",
    description:
      "Free viral safety readiness planner - check ICH Q5A(R2) source control, raw-material risk, stage-appropriate viral testing, assay controls, representative clearance, orthogonal LRV margin, prior knowledge, and adventitious-agent response before relying on a biologics viral-safety package.",
  },
  "oot-trend-triage-planner": {
    title: "OOT Trend Triage Planner",
    description:
      "Free OOT trend triage planner - compare a current result to historical mean, standard deviation, and specification limits to decide whether it is routine noise, an OOT signal, or an OOS event.",
  },
  "audit-trail-review-triage": {
    title: "Audit Trail Review Triage",
    description:
      "Free audit trail review triage tool - risk-rank GMP audit-trail exceptions, identify evidence to capture, and build a reviewer note for ALCOA+ data integrity review.",
  },
  "batch-release-readiness-checklist": {
    title: "Batch Release Readiness Checklist",
    description:
      "Free batch release readiness checklist - check batch record completion, QC testing, deviations, audit trails, reconciliation, and authorized QA/QP disposition before release.",
  },
  "change-control-impact-triage": {
    title: "Change Control Impact Triage",
    description:
      "Free change control impact triage tool - classify a proposed GMP change, identify approval blockers, and build an impact-assessment note before implementation.",
  },
  "supplier-qualification-risk-triage": {
    title: "Supplier Qualification Risk Triage",
    description:
      "Free supplier qualification risk triage tool - score material criticality, supplier history, substitutability, regulatory status, and control gaps to choose audit depth, quality agreement, incoming verification, and monitoring.",
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
  "capa-effectiveness-check-planner": {
    title: "CAPA Effectiveness Check Planner",
    description:
      "Free CAPA effectiveness check planner - score whether your CAPA is ready for closure, define a verification window, and build evidence that the root cause is controlled.",
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
  meta: { title: string; description: string; url: string; type: string; image?: string },
): string {
  const title = escapeHtml(`${meta.title} | Life Science Atlas`);
  const desc = escapeHtml(meta.description);
  const url = escapeHtml(meta.url);
  const type = escapeHtml(meta.type);
  const withCoreMeta = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${desc}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${desc}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta property="og:type" content=")[^"]*(")/, `$1${type}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${title}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${desc}$2`);
  if (!meta.image) return withCoreMeta;
  const image = escapeHtml(meta.image);
  return withCoreMeta
    .replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${image}$2`)
    .replace(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${image}$2`);
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

  app.use(
    express.static(distPath, {
      setHeaders(res, filePath) {
        // The HTML document references content-hashed assets. Never retain an
        // old document across a deployment, otherwise it can request asset
        // names that no longer exist and leave the React root blank.
        if (path.basename(filePath) === "index.html") {
          res.setHeader("Cache-Control", "no-store, max-age=0");
        }
      },
    }),
  );

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

  app.get("/quality-lab", async (_req, res, next) => {
    try {
      const html = await fs.promises.readFile(indexPath, "utf-8");
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.send(
        injectMeta(html, {
          title: "Atlas Quality Lab Blueprint",
          description: "Turn product portfolio, production demand and microbiology testing scope into a vendor-neutral QC laboratory operating blueprint.",
          url: `${SITE_URL}/quality-lab`,
          type: "website",
          image: `${SITE_URL}/quality-lab-og.png`,
        }),
      );
    } catch {
      return next();
    }
  });

  app.get("/quality-lab/review", async (_req, res, next) => {
    try {
      const html = await fs.promises.readFile(indexPath, "utf-8");
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("X-Robots-Tag", "noindex, nofollow");
      return res.send(
        injectMeta(html, {
          title: "Request Expert Blueprint Review",
          description: "Request a scoped expert review of Atlas Quality Lab Blueprint assumptions, gaps and operating scenarios.",
          url: `${SITE_URL}/quality-lab/review`,
          type: "website",
          image: `${SITE_URL}/quality-lab-og.png`,
        }),
      );
    } catch {
      return next();
    }
  });

  app.get("/quality-lab/sample", async (_req, res, next) => {
    try {
      const html = await fs.promises.readFile(indexPath, "utf-8");
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.send(
        injectMeta(html, {
          title: "Illustrative Quality Lab Blueprint Sample",
          description: "See the decision brief, evidence register, controlled deliverables and boundaries in an illustrative Atlas Quality Lab Blueprint.",
          url: `${SITE_URL}/quality-lab/sample`,
          type: "website",
          image: `${SITE_URL}/quality-lab-og.png`,
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

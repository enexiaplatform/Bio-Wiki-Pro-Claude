import { z } from "zod";

export const regulatoryDomainValues = [
  "nonsterile-microbiology",
  "water-environmental-monitoring",
  "sterile-biologics",
  "analytical-chemistry",
  "quality-systems",
  "data-integrity",
] as const;

export type RegulatoryDomain = typeof regulatoryDomainValues[number];
export const regulatorySourceIdValues = ["fda-drugs", "fda-biologics", "ema-regulatory", "ema-scientific", "ema-inspections"] as const;
export type RegulatorySourceId = typeof regulatorySourceIdValues[number];
export type RegulatoryCadence = "off" | "weekly" | "daily";

export interface RegulatorySource {
  id: RegulatorySourceId;
  publisher: string;
  label: string;
  market: string;
  feedUrl: string;
  landingUrl: string;
}

export const REGULATORY_SOURCES: RegulatorySource[] = [
  { id: "fda-drugs", publisher: "FDA", label: "What's New: Drugs", market: "United States", feedUrl: "https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/drugs/rss.xml", landingUrl: "https://www.fda.gov/news-events-1" },
  { id: "fda-biologics", publisher: "FDA", label: "What's New: Vaccines, Blood and Biologics", market: "United States", feedUrl: "https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/biologics/rss.xml", landingUrl: "https://www.fda.gov/vaccines-blood-biologics/news-events-biologics" },
  { id: "ema-regulatory", publisher: "EMA", label: "Regulatory and procedural guidelines", market: "European Union", feedUrl: "https://www.ema.europa.eu/en/regulatory-and-procedural-guideline.xml", landingUrl: "https://www.ema.europa.eu/en/news-events/rss-feeds" },
  { id: "ema-scientific", publisher: "EMA", label: "Scientific guidelines", market: "European Union", feedUrl: "https://www.ema.europa.eu/en/scientific-guidelines.xml", landingUrl: "https://www.ema.europa.eu/en/news-events/rss-feeds" },
  { id: "ema-inspections", publisher: "EMA", label: "Inspections", market: "European Union", feedUrl: "https://www.ema.europa.eu/en/inspections.xml", landingUrl: "https://www.ema.europa.eu/en/news-events/rss-feeds" },
];

export interface RawRegulatoryItem {
  sourceId: RegulatorySourceId;
  title: string;
  url: string;
  publishedAt: string;
  sourceSummary?: string;
}

export interface RegulatoryUpdate extends RawRegulatoryItem {
  id: string;
  publisher: string;
  sourceLabel: string;
  market: string;
  domains: RegulatoryDomain[];
  documentStatus: "consultation" | "draft" | "final-or-current" | "unknown";
  impactLevel: "watch" | "review" | "priority-review";
  impactNote: string;
  triageStatus: "machine-triaged";
}

export const regulatoryDigestPreferenceSchema = z.object({
  cadence: z.enum(["off", "weekly", "daily"]),
  domains: z.array(z.enum(regulatoryDomainValues)).max(regulatoryDomainValues.length),
  sources: z.array(z.enum(regulatorySourceIdValues)).max(regulatorySourceIdValues.length),
});

export type RegulatoryDigestPreferenceInput = z.infer<typeof regulatoryDigestPreferenceSchema>;

const DOMAIN_KEYWORDS: Array<{ domain: RegulatoryDomain; keywords: string[] }> = [
  { domain: "nonsterile-microbiology", keywords: ["microbiolog", "microbial", "bioburden", "endotoxin", "growth promotion", "specified microorgan", "non-sterile", "nonsterile"] },
  { domain: "water-environmental-monitoring", keywords: ["water", "environmental monitoring", "contamination", "cleanroom", "aseptic environment"] },
  { domain: "sterile-biologics", keywords: ["sterile", "aseptic", "biologic", "vaccine", "blood", "cell therapy", "gene therapy", "annex 1"] },
  { domain: "analytical-chemistry", keywords: ["analytical", "chromatograph", "spectroscop", "impurit", "stability", "dissolution", "reference standard"] },
  { domain: "quality-systems", keywords: ["gmp", "quality system", "inspection", "validation", "qualification", "manufactur", "compliance", "recall", "shortage"] },
  { domain: "data-integrity", keywords: ["data integrity", "computerised", "computerized", "electronic record", "artificial intelligence", "digital"] },
];

function stableId(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `reg_${(hash >>> 0).toString(36)}`;
}

export function triageRegulatoryUpdate(raw: RawRegulatoryItem): RegulatoryUpdate {
  const source = REGULATORY_SOURCES.find((candidate) => candidate.id === raw.sourceId);
  if (!source) throw new Error(`Unknown regulatory source: ${raw.sourceId}`);
  const text = `${raw.title} ${raw.sourceSummary ?? ""}`.toLowerCase();
  const domains = DOMAIN_KEYWORDS.filter((candidate) => candidate.keywords.some((keyword) => text.includes(keyword))).map((candidate) => candidate.domain);
  if (domains.length === 0) domains.push("quality-systems");
  const documentStatus = text.includes("consultation") ? "consultation" : text.includes("draft") ? "draft" : /(final|adopted|effective|published|revision|updated)/.test(text) ? "final-or-current" : "unknown";
  const highSignal = /(gmp|inspection|steril|microbiolog|contamination|data integrity|validation|withdraw|recall)/.test(text);
  const impactLevel = highSignal && documentStatus === "final-or-current" ? "priority-review" : highSignal || documentStatus === "consultation" || documentStatus === "draft" ? "review" : "watch";
  const impactNote = impactLevel === "priority-review"
    ? "Potentially affects a regulated-quality control or method dependency. Confirm the official text, effective status and applicable Method Graph nodes before changing a Blueprint or site process."
    : impactLevel === "review"
      ? "Review scope and applicability against the relevant market, method family and current Blueprint assumptions; no impact is inferred automatically."
      : "Source update retained for watchlist review. It is not currently mapped to a specific Atlas method decision without additional applicability evidence.";
  return {
    ...raw,
    id: stableId(`${raw.sourceId}:${raw.url || raw.title}:${raw.publishedAt}`),
    publisher: source.publisher,
    sourceLabel: source.label,
    market: source.market,
    domains,
    documentStatus,
    impactLevel,
    impactNote,
    triageStatus: "machine-triaged",
  };
}

export function filterRegulatoryUpdates(items: RegulatoryUpdate[], preference: Pick<RegulatoryDigestPreferenceInput, "domains" | "sources">) {
  return items.filter((item) => (preference.sources.length === 0 || preference.sources.includes(item.sourceId))
    && (preference.domains.length === 0 || item.domains.some((domain) => preference.domains.includes(domain))));
}

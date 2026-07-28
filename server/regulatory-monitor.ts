import { REGULATORY_SOURCES, triageRegulatoryUpdate, type RawRegulatoryItem, type RegulatorySourceId, type RegulatoryUpdate } from "../shared/regulatory-monitor.js";

const CACHE_MS = 15 * 60 * 1000;
let cache: { expiresAt: number; value: RegulatoryMonitorResult } | undefined;

export interface RegulatoryMonitorResult {
  generatedAt: string;
  items: RegulatoryUpdate[];
  sources: Array<{ id: RegulatorySourceId; ok: boolean; itemCount: number; error?: string }>;
}

function decodeXml(value: string) {
  return value
    .replace(/^<!\[CDATA\[|\]\]>$/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .trim();
}

function stripMarkup(value: string) {
  return decodeXml(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")).slice(0, 500);
}

function tag(block: string, names: string[]) {
  for (const name of names) {
    const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i"));
    if (match?.[1]) return decodeXml(match[1]);
  }
  return "";
}

function linkFrom(block: string) {
  const textLink = tag(block, ["link"]);
  if (textLink && !textLink.includes("<")) return textLink;
  const href = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i)?.[1];
  return href ? decodeXml(href) : "";
}

export function parseRegulatoryFeed(xml: string, sourceId: RegulatorySourceId): RawRegulatoryItem[] {
  const blocks = xml.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item>/gi) ?? xml.match(/<entry(?:\s[^>]*)?>[\s\S]*?<\/entry>/gi) ?? [];
  return blocks.flatMap((block) => {
    const title = stripMarkup(tag(block, ["title"]));
    const url = linkFrom(block) || tag(block, ["guid", "id"]);
    const dateValue = tag(block, ["pubDate", "published", "updated", "dc:date"]);
    const parsedDate = new Date(dateValue);
    if (!title || !url || Number.isNaN(parsedDate.getTime())) return [];
    return [{
      sourceId,
      title,
      url,
      publishedAt: parsedDate.toISOString(),
      sourceSummary: stripMarkup(tag(block, ["description", "summary", "content:encoded", "content"])),
    }];
  });
}

async function fetchSource(sourceId: RegulatorySourceId) {
  const source = REGULATORY_SOURCES.find((candidate) => candidate.id === sourceId)!;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch(source.feedUrl, { signal: controller.signal, headers: { "User-Agent": "LifeScienceAtlas-RegulatoryMonitor/1.0" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return parseRegulatoryFeed(await response.text(), sourceId).map(triageRegulatoryUpdate);
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchRegulatoryMonitor(force = false): Promise<RegulatoryMonitorResult> {
  if (!force && cache && cache.expiresAt > Date.now()) return cache.value;
  const settled = await Promise.allSettled(REGULATORY_SOURCES.map((source) => fetchSource(source.id)));
  const items = settled.flatMap((result) => result.status === "fulfilled" ? result.value : [])
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const deduped = Array.from(new Map(items.map((item) => [item.url, item])).values()).slice(0, 120);
  const value: RegulatoryMonitorResult = {
    generatedAt: new Date().toISOString(),
    items: deduped,
    sources: settled.map((result, index) => ({
      id: REGULATORY_SOURCES[index].id,
      ok: result.status === "fulfilled",
      itemCount: result.status === "fulfilled" ? result.value.length : 0,
      ...(result.status === "rejected" ? { error: result.reason instanceof Error ? result.reason.message : "Feed unavailable" } : {}),
    })),
  };
  cache = { expiresAt: Date.now() + CACHE_MS, value };
  return value;
}

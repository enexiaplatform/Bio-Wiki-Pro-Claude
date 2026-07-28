import { describe, expect, it } from "vitest";
import { parseRegulatoryFeed } from "./regulatory-monitor";

describe("regulatory feed parser", () => {
  it("parses RSS items and normalizes dates", () => {
    const items = parseRegulatoryFeed(`<?xml version="1.0"?><rss><channel><item><title><![CDATA[Draft microbiology guidance]]></title><link>https://example.test/guidance</link><pubDate>Mon, 20 Jul 2026 12:00:00 GMT</pubDate><description>Consultation text</description></item></channel></rss>`, "fda-drugs");
    expect(items).toEqual([expect.objectContaining({ title: "Draft microbiology guidance", url: "https://example.test/guidance", publishedAt: "2026-07-20T12:00:00.000Z" })]);
  });

  it("drops entries without a reliable date or locator", () => {
    expect(parseRegulatoryFeed(`<rss><channel><item><title>No date</title><link>https://example.test</link></item></channel></rss>`, "fda-drugs")).toEqual([]);
  });
});

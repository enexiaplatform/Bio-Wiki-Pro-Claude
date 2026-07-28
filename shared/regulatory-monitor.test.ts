import { describe, expect, it } from "vitest";
import { filterRegulatoryUpdates, triageRegulatoryUpdate } from "./regulatory-monitor";

describe("regulatory monitor triage", () => {
  it("labels automated mappings without implying human review", () => {
    const item = triageRegulatoryUpdate({ sourceId: "ema-inspections", title: "Final GMP inspection guidance for sterile manufacturing", url: "https://example.test/item", publishedAt: "2026-07-20T00:00:00.000Z" });
    expect(item.domains).toEqual(expect.arrayContaining(["sterile-biologics", "quality-systems"]));
    expect(item.impactLevel).toBe("priority-review");
    expect(item.triageStatus).toBe("machine-triaged");
  });

  it("filters by explicit watchlist", () => {
    const sterile = triageRegulatoryUpdate({ sourceId: "fda-biologics", title: "Updated sterile biologics guidance", url: "https://example.test/sterile", publishedAt: "2026-07-20T00:00:00.000Z" });
    const chemistry = triageRegulatoryUpdate({ sourceId: "fda-drugs", title: "Draft analytical stability guidance", url: "https://example.test/chem", publishedAt: "2026-07-21T00:00:00.000Z" });
    expect(filterRegulatoryUpdates([sterile, chemistry], { sources: [], domains: ["analytical-chemistry"] }).map((item) => item.id)).toEqual([chemistry.id]);
  });
});

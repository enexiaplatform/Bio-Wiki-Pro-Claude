import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const packages = [
  {
    slug: "drug-product-formulation-material-attributes",
    sources: ["ICH-Q8-R2", "ICH-Q9-R1", "ICH-Q10"],
    phrase: "OSD",
  },
  {
    slug: "drug-product-unit-operations-scale-up",
    sources: ["ICH-Q8-R2", "ICH-Q9-R1", "ICH-Q10", "FDA-PROCESS-VALIDATION-2011"],
    phrase: "scale-up",
  },
  {
    slug: "drug-product-analytical-release-stability",
    sources: ["ICH-Q1A-R2", "ICH-Q2-R2", "ICH-Q6A", "ICH-Q14", "FDA-CONTAINER-CLOSURE-1999"],
    phrase: "release",
  },
  {
    slug: "drug-product-validation-transfer-lifecycle",
    sources: ["WHO-TRS-1044-ANNEX4", "ICH-Q9-R1", "ICH-Q10", "FDA-PROCESS-VALIDATION-2011"],
    phrase: "transfer",
  },
] as const;

describe("drug-product decision content quality", () => {
  it("keeps each deep lesson evidence-led and bounded", () => {
    for (const item of packages) {
      const lesson = readFileSync(path.resolve(root, "content", "academy", `${item.slug}.en.mdx`), "utf8");
      for (const section of ["## Decision question", "## Applicability and do-not-use boundary", "## Controlled source map", "## Evidence chain", "## Discovery questions", "## Decision table", "## Worked example", "## Working asset", "## Limitations"]) expect(lesson).toContain(section);
      expect(lesson.toLowerCase()).toContain(item.phrase.toLowerCase());
      expect(lesson).toContain("synthetic");
      expect(lesson.toLowerCase()).toContain("under review");
      expect(lesson).toMatch(/ICH Q|FDA|WHO/);
      expect(lesson.trim().split(/\s+/).length).toBeGreaterThanOrEqual(1_100);
      expect(lesson).toContain("## Evidence and study architecture");
      expect(lesson).toContain("## Common failure modes");
    }
  });

  it("ships a dedicated cross-product signal-to-change deep lesson", () => {
    const lesson = readFileSync(path.resolve(root, "content", "academy", "cross-product-evidence-investigation-change-governance.en.mdx"), "utf8");
    for (const section of ["## Decision question", "## Controlled source map", "## Separate eleven governance objects", "## Run the signal-to-decision workflow", "## Evidence and study activities", "## Evidence and study architecture", "## Decision table", "## Worked example: fictional cross-product evidence loop", "## Working asset", "## Completion standard", "## Limitations"]) expect(lesson).toContain(section);
    expect(lesson.trim().split(/\s+/).length).toBeGreaterThanOrEqual(1_400);
    expect(lesson).toContain("specialist-review-required");
  });

  it("keeps every public guide connected to discovery, sources and the next lifecycle handoff", () => {
    for (const item of packages) {
      const guide = readFileSync(path.resolve(root, "content", "deliverables", item.slug, `${item.slug}-guide.md`), "utf8");
      for (const section of ["Decision question", "Discovery questions", "Controlled source map", "Next handoff"]) expect(guide).toContain(section);
      expect(guide.toLowerCase()).toContain("boundary");
      expect(guide.toLowerCase()).toContain("qualified");
      for (const source of item.sources) expect(guide).toContain(source);
    }
  });
});

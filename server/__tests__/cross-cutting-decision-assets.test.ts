import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const assets = [
  {
    slug: "analytical-lifecycle-evidence-map",
    sources: ["ICH-Q2-R2", "ICH-Q14", "ICH-Q9-R1", "ICH-Q10"],
    requiredHeaders: ["intended_use", "analytical_target_profile", "evidence_status", "lifecycle_trigger", "reviewer_role"],
  },
  {
    slug: "decision-led-statistics-evidence-map",
    sources: ["ICH-Q8-R2", "ICH-Q9-R1", "ICH-Q10", "FDA-DI-2018", "FDA-PROCESS-VALIDATION-2011"],
    requiredHeaders: ["dataset_version", "measurement_system_evidence", "assumption", "uncertainty", "model_use_boundary"],
  },
] as const;

describe("cross-cutting decision assets", () => {
  it("keeps each guide evidence-led, bounded and connected to accountable review", () => {
    for (const asset of assets) {
      const dir = path.resolve(root, "content", "deliverables", asset.slug);
      const guide = readFileSync(path.join(dir, `${asset.slug}-guide.md`), "utf8");
      const readme = readFileSync(path.join(dir, "README.md"), "utf8");
      const fictional = readFileSync(path.join(dir, `${asset.slug}-fictional-example.md`), "utf8");
      for (const section of ["## Decision question", "## Applicability and do-not-use boundary", "## Controlled source map", "## Workflow", "## Discovery questions", "## Limitations"]) expect(guide).toContain(section);
      for (const source of asset.sources) expect(`${readme}\n${guide}`).toContain(source);
      expect(readme).toContain("editorial-reviewed");
      expect(readme.toLowerCase()).toMatch(/does not\s+constitute sme approval/);
      expect(fictional.toLowerCase()).toContain("fictional");
      expect(fictional.toLowerCase()).toContain("evidence required");
    }
  });

  it("ships blank registers with the fields needed to preserve decision lineage", () => {
    for (const asset of assets) {
      const csv = readFileSync(path.resolve(root, "content", "deliverables", asset.slug, `${asset.slug}-blank.csv`), "utf8");
      for (const header of asset.requiredHeaders) expect(csv.split(/\r?\n/, 1)[0]).toContain(header);
    }
  });
});

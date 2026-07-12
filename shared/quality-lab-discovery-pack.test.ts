import { describe, expect, it } from "vitest";
import { blueprintDiscoveryTemplates } from "../client/src/data/qualityLabDiscoveryTemplates";

describe("Quality Lab Discovery Pack templates", () => {
  it("ships a coherent discovery-to-validation working set", () => {
    expect(blueprintDiscoveryTemplates.map((template) => template.filename)).toEqual([
      "atlas-blueprint-project-intake.csv",
      "atlas-requirement-capability-map.csv",
      "atlas-assumptions-evidence-decision-log.csv",
      "atlas-domain-pack-validation-case.csv",
      "atlas-rule-change-impact-assessment.csv",
    ]);
    expect(new Set(blueprintDiscoveryTemplates.map((template) => template.filename)).size).toBe(blueprintDiscoveryTemplates.length);
  });

  it("keeps every CSV data row aligned to its header", () => {
    for (const template of blueprintDiscoveryTemplates) {
      const width = template.rows[0].length;
      expect(width, template.filename).toBeGreaterThan(5);
      for (const row of template.rows) expect(row.length, template.filename).toBe(width);
    }
  });
});

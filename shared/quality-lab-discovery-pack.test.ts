import { describe, expect, it } from "vitest";
import { blueprintDiscoveryTemplates } from "../client/src/data/qualityLabDiscoveryTemplates";

describe("Quality Lab Discovery Pack templates", () => {
  it("ships a coherent discovery-to-validation working set", () => {
    expect(blueprintDiscoveryTemplates.map((template) => template.filename)).toEqual([
      "atlas-blueprint-project-intake.csv",
      "atlas-requirement-capability-map.csv",
      "atlas-assumptions-evidence-decision-log.csv",
      "atlas-space-flow-engineering-basis.csv",
      "atlas-turnaround-queue-calendar-basis.csv",
      "atlas-qc-lab-cost-basis.csv",
      "atlas-test-method-application-matrix.csv",
      "atlas-application-evidence-readiness-register.csv",
      "atlas-method-execution-observation.csv",
      "atlas-domain-pack-validation-case.csv",
      "atlas-rule-change-impact-assessment.csv",
    ]);
    expect(new Set(blueprintDiscoveryTemplates.map((template) => template.filename)).size).toBe(blueprintDiscoveryTemplates.length);
  });

  it("captures application readiness and observed method execution without promoting unreviewed evidence", () => {
    const readiness = blueprintDiscoveryTemplates.find((template) => template.filename === "atlas-application-evidence-readiness-register.csv");
    const observation = blueprintDiscoveryTemplates.find((template) => template.filename === "atlas-method-execution-observation.csv");
    expect(readiness?.rows[0]).toEqual(expect.arrayContaining(["dimension", "blocking_gap", "method_graph_eligibility", "eligibility_rationale"]));
    expect(observation?.rows[0]).toEqual(expect.arrayContaining(["touch_minutes", "equipment_occupancy_minutes", "queue_minutes", "actual_quantity", "variance_driver"]));
    expect(observation?.rows[1]).toContain("draft / reviewed / accepted-for-case");
  });

  it("keeps every CSV data row aligned to its header", () => {
    for (const template of blueprintDiscoveryTemplates) {
      const width = template.rows[0].length;
      expect(width, template.filename).toBeGreaterThan(5);
      for (const row of template.rows) expect(row.length, template.filename).toBe(width);
    }
  });
});

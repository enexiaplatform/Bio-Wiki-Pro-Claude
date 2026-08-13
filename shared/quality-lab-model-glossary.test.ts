import { describe, expect, it } from "vitest";
import { createQualityLabProject, defaultQualityLabInput } from "./quality-lab";
import { createQualityLabModelControls, QUALITY_LAB_MODEL_CONTROL_VERSION, QUALITY_LAB_MODEL_GLOSSARY, QUALITY_LAB_MODEL_GLOSSARY_VERSION } from "./quality-lab-model-glossary";
import { MICROBIOLOGY_WORKFLOW_RULES } from "./quality-lab-microbiology-pack";

describe("Quality Lab model glossary and coefficient controls", () => {
  it("defines the decision terms that prevent semantic drift", () => {
    expect(QUALITY_LAB_MODEL_GLOSSARY_VERSION).toBe("quality-lab-model-glossary/v1");
    expect(QUALITY_LAB_MODEL_GLOSSARY.map((item) => item.id)).toEqual(expect.arrayContaining(["planning-horizon-growth", "workflow-unit", "available-capacity", "fte", "evidence-maturity", "operational-risk", "uncertainty-range"]));
    expect(QUALITY_LAB_MODEL_GLOSSARY.find((item) => item.id === "planning-horizon-growth")?.definition).toMatch(/not annual CAGR/i);
  });

  it("gives every material coefficient an owner, unit, range, applicability and calibration plan", () => {
    const controls = createQualityLabModelControls(defaultQualityLabInput);
    expect(QUALITY_LAB_MODEL_CONTROL_VERSION).toBe("quality-lab-model-controls/v1");
    expect(new Set(controls.map((item) => item.id)).size).toBe(controls.length);
    for (const control of controls) {
      expect(control.ownerRole.length).toBeGreaterThan(0);
      expect(control.unit.length).toBeGreaterThan(0);
      expect(control.stressRange.low).toBeLessThanOrEqual(control.baseValue);
      expect(control.stressRange.high).toBeGreaterThanOrEqual(control.baseValue);
      expect(control.applicability.length).toBeGreaterThanOrEqual(20);
      expect(control.calibrationPlan.length).toBeGreaterThanOrEqual(20);
      expect(control.evidenceIds.length).toBeGreaterThan(0);
      expect(control.ruleIds.length).toBeGreaterThan(0);
    }
    expect(controls).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "core.capacity.manipulation-share", baseValue: 0.46 }),
      expect.objectContaining({ id: "core.capacity.planned-utilization", baseValue: 0.75 }),
      expect.objectContaining({ id: "core.capacity.reviewer-ratio", baseValue: 8 }),
      expect.objectContaining({ id: "core.space.support-allowance", baseValue: 0.35 }),
    ]));
  });

  it("registers hours, plate-days and media coefficients for every microbiology workflow rule", () => {
    const controls = createQualityLabModelControls(defaultQualityLabInput);
    for (const rule of Object.values(MICROBIOLOGY_WORKFLOW_RULES)) {
      expect(controls.filter((item) => item.id.startsWith(`${rule.ruleId}.`))).toHaveLength(3);
    }
  });

  it("carries the versioned glossary and controls into every compiled Blueprint", () => {
    const blueprint = createQualityLabProject(defaultQualityLabInput, "glossary-project").blueprint;
    expect(blueprint.modelGlossaryVersion).toBe(QUALITY_LAB_MODEL_GLOSSARY_VERSION);
    expect(blueprint.modelControlVersion).toBe(QUALITY_LAB_MODEL_CONTROL_VERSION);
    expect(blueprint.modelGlossary).toHaveLength(QUALITY_LAB_MODEL_GLOSSARY.length);
    expect(blueprint.modelControls.length).toBeGreaterThan(30);
  });
});

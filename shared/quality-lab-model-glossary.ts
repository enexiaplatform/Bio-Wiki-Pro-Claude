import { z } from "zod";
import { MICROBIOLOGY_WORKFLOW_RULES } from "./quality-lab-microbiology-pack.js";

export const QUALITY_LAB_MODEL_GLOSSARY_VERSION = "quality-lab-model-glossary/v1" as const;
export const QUALITY_LAB_MODEL_CONTROL_VERSION = "quality-lab-model-controls/v1" as const;

export const qualityLabModelGlossaryTermSchema = z.object({
  id: z.string().min(1),
  term: z.string().min(1),
  definition: z.string().min(20),
  decisionBoundary: z.string().min(20),
});

export const qualityLabModelControlSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  ownerRole: z.string().min(1),
  ruleIds: z.array(z.string().min(1)).min(1),
  unit: z.string().min(1),
  baseValue: z.number(),
  stressRange: z.object({ low: z.number(), high: z.number(), interpretation: z.literal("uncalibrated-stress-bounds") }),
  rationale: z.string().min(20),
  applicability: z.string().min(20),
  evidenceIds: z.array(z.string().min(1)).min(1),
  calibrationPlan: z.string().min(20),
  maturity: z.enum(["user-supplied", "uncalibrated-concept", "calibrated-project", "controlled-pack"]),
});

export type QualityLabModelGlossaryTerm = z.infer<typeof qualityLabModelGlossaryTermSchema>;
export type QualityLabModelControl = z.infer<typeof qualityLabModelControlSchema>;

export const QUALITY_LAB_MODEL_GLOSSARY: QualityLabModelGlossaryTerm[] = [
  { id: "planning-horizon-growth", term: "Growth over planning horizon", definition: "A single percentage applied once between current demand and the selected future year; it is not annual CAGR.", decisionBoundary: "Changing the horizon does not compound this value. Replace it with a dated forecast when one exists." },
  { id: "workflow-unit", term: "Workflow unit", definition: "The demand event used by a workflow rule, such as a lot, batch, point-round, location-round, sample or media lot.", decisionBoundary: "A unit is not automatically one test execution; sample counts, replicates, controls and repeats remain method-specific." },
  { id: "hands-on-hours", term: "Hands-on hours", definition: "Modeled analyst touch time for preparation, execution, handling, reading or related routine work represented by the rule.", decisionBoundary: "It excludes unmodeled queues and non-routine work unless those loads are separately added and evidenced." },
  { id: "plate-days", term: "Plate-days", definition: "One occupied plate position for one day, used as a natural demand unit for incubation capacity planning.", decisionBoundary: "It does not establish usable rack geometry, temperature segregation, incubation schedule or qualified chamber capacity." },
  { id: "available-capacity", term: "Available capacity", definition: "Nominal resource capacity reduced by the modeled operating calendar, planned utilization and downtime assumptions.", decisionBoundary: "Available capacity is a planning allowance, not proof of schedule feasibility, qualification or backup coverage." },
  { id: "utilization", term: "Utilization", definition: "Modeled demand divided by modeled available capacity for the same resource, period and natural unit.", decisionBoundary: "Average utilization does not prove that peaks, queues, cutoffs, weekends or simultaneous work can be served." },
  { id: "fte", term: "Full-time-equivalent allowance", definition: "Modeled monthly labor demand divided by productive hours, with separately identified resilience and review allowances.", decisionBoundary: "FTE is not a roster, named qualification, shift-feasibility result or authorization to execute or review a method." },
  { id: "evidence-maturity", term: "Evidence maturity", definition: "The recorded state of support for an input, rule or output: project input, concept, calibrated project evidence or controlled pack evidence.", decisionBoundary: "Traceable or structured evidence must not be described as reviewed, controlled or verified without the corresponding record." },
  { id: "operational-risk", term: "Modeled operational flag", definition: "A rule-triggered signal derived from the inputs and behaviors currently represented by the Compiler.", decisionBoundary: "Zero high flags never overrides missing evidence, excluded loads or unresolved controlled-use blockers." },
  { id: "uncertainty-range", term: "Uncertainty range", definition: "A low-to-high stress interval around a point estimate used to expose sensitivity before project calibration.", decisionBoundary: "The interval is not a confidence interval, probability distribution, tolerance or approved design range." },
];

type ModelInputBasis = {
  productiveHoursPerShift: number;
  workingDaysPerMonth: number;
  shifts: number;
  equipmentDowntimePercent: number;
};

function range(baseValue: number, low: number, high: number) {
  return { baseValue, stressRange: { low, high, interpretation: "uncalibrated-stress-bounds" as const } };
}

const fixedControls: QualityLabModelControl[] = [
  { id: "core.capacity.planned-utilization", label: "General planned resource utilization", ownerRole: "Laboratory operations and capacity reviewer", ruleIds: ["core.capacity.equipment"], unit: "fraction of scheduled capacity", ...range(0.75, 0.6, 0.85), rationale: "Reserves scheduled time for setup, cleaning, handoff and ordinary operating variability before downtime is applied.", applicability: "BSC and general time-based resource allowances in the concept capacity model.", evidenceIds: ["atlas-microbiology-benchmarks-v1", "vendor-budget-evidence"], calibrationPlan: "Compare scheduled, available and occupied hours by resource across each paid engagement and replace the factor by resource class.", maturity: "uncalibrated-concept" },
  { id: "core.capacity.manipulation-share", label: "Workflow time assigned to cabinet manipulation", ownerRole: "Laboratory operations and capacity reviewer", ruleIds: ["core.capacity.equipment", "core.capacity.people"], unit: "fraction of workflow hands-on hours", ...range(0.46, 0.3, 0.65), rationale: "Translates aggregate workflow touch time into a first-pass BSC occupancy allowance where step-level timing is unavailable.", applicability: "Conventional microbiology workflows that require cabinet manipulation; not every workflow step or method uses a BSC.", evidenceIds: ["atlas-microbiology-benchmarks-v1", "site-approved-methods"], calibrationPlan: "Time preparation and cabinet-occupied steps separately by method, product family and batch pattern in three engagements.", maturity: "uncalibrated-concept" },
  { id: "core.capacity.reviewer-ratio", label: "Execution-to-review FTE ratio", ownerRole: "Quality governance reviewer", ruleIds: ["core.capacity.people"], unit: "execution FTE per reviewer FTE", ...range(8, 4, 12), rationale: "Creates a visible technical-review allowance when review minutes, queues and authorization coverage are not yet observed.", applicability: "Portfolio-level routine technical review support only; it excludes QA release authority and specialist investigation demand.", evidenceIds: ["atlas-microbiology-benchmarks-v1", "project-inputs"], calibrationPlan: "Capture review minutes, first-pass yield, exception volume, authorization constraints and review queues per method and shift.", maturity: "uncalibrated-concept" },
  { id: "core.space.support-allowance", label: "Support and circulation space allowance", ownerRole: "Laboratory engineering and cost reviewer", ruleIds: ["core.space.concept"], unit: "fraction added to net functional area", ...range(0.35, 0.2, 0.6), rationale: "Provides a concept allowance for circulation, partitions and shared support before an adjacency and engineering basis exists.", applicability: "Early laboratory space planning only; it does not size HVAC, utilities, egress, structure or code-required space.", evidenceIds: ["atlas-microbiology-benchmarks-v1", "vendor-budget-evidence"], calibrationPlan: "Reconcile net-to-gross area against a qualified room data sheet, adjacency plan and issued engineering basis for each project.", maturity: "uncalibrated-concept" },
  { id: "core.capacity.incubator-usable-positions", label: "Incubator usable plate positions", ownerRole: "Laboratory engineering and cost reviewer", ruleIds: ["core.capacity.equipment"], unit: "plate positions per chamber", ...range(300, 200, 400), rationale: "Converts plate-day demand into a chamber count before qualified rack geometry and segregation are known.", applicability: "Concept conventional plate incubation at each temperature band, with separate downtime and 70% planned occupancy factors.", evidenceIds: ["vendor-budget-evidence", "site-approved-methods"], calibrationPlan: "Replace with mapped usable rack positions, plate formats, segregation rules, loading patterns and observed occupancy by chamber.", maturity: "uncalibrated-concept" },
  { id: "core.capacity.autoclave-usable-cycle", label: "Autoclave usable load per cycle", ownerRole: "Laboratory engineering and cost reviewer", ruleIds: ["core.capacity.equipment"], unit: "media liters per usable cycle", ...range(50, 25, 100), rationale: "Converts modeled media volume into a first-pass daily cycle requirement before load families and validated geometry exist.", applicability: "Concept media sterilization capacity only; waste, decontamination and clean-side loads may require separate equipment or cycles.", evidenceIds: ["vendor-budget-evidence", "site-approved-methods"], calibrationPlan: "Capture validated load families, usable volume, cycle duration, turnaround, rework, maintenance and clean/dirty segregation.", maturity: "uncalibrated-concept" },
  { id: "core.capacity.filtration-throughput", label: "Membrane filtration manifold throughput", ownerRole: "Laboratory operations and capacity reviewer", ruleIds: ["core.capacity.equipment"], unit: "sample equivalents per shift", ...range(18, 10, 30), rationale: "Provides a first-pass filtration capacity threshold with a cleaning and setup allowance.", applicability: "Water and bioburden workflows represented as filtration sample equivalents; configuration and method steps remain open.", evidenceIds: ["site-approved-methods", "vendor-budget-evidence"], calibrationPlan: "Observe setup, filtration, rinse, cleaning, changeover and exception time by manifold configuration and sample matrix.", maturity: "uncalibrated-concept" },
  { id: "core.capacity.air-sampler-route", label: "Active-air sampling route allowance", ownerRole: "Laboratory operations and capacity reviewer", ruleIds: ["core.capacity.equipment", "micro.workflow.environmental-monitoring"], unit: "locations per sampler per round", ...range(15, 8, 25), rationale: "Relates an EM location count to a portable sampler count before route timing and simultaneous monitoring needs are known.", applicability: "Concept active-air routes only; grade, activity, interventions, disinfection, battery, calibration and simultaneous coverage can change demand.", evidenceIds: ["site-approved-methods", "usp-1116-context", "eu-gmp-annex-1-2022"], calibrationPlan: "Time approved routes by area, state and shift and record simultaneous coverage, disinfection, transport and exception demand.", maturity: "uncalibrated-concept" },
  { id: "core.capacity.colony-reading-throughput", label: "Colony reading throughput", ownerRole: "Laboratory operations and capacity reviewer", ruleIds: ["core.capacity.equipment"], unit: "result equivalents per shift", ...range(60, 30, 100), rationale: "Creates a concept threshold for manual or semi-automated result reading before plate mix and review steps are observed.", applicability: "Routine colony-counting demand only; morphology review, repeats, audit trail and second-person verification can reduce throughput.", evidenceIds: ["site-approved-methods", "vendor-budget-evidence"], calibrationPlan: "Measure reading and verification time by plate type, count range, automation state, exception rate and data-review workflow.", maturity: "uncalibrated-concept" },
  { id: "core.capacity.bet-batch-throughput", label: "BET platform sample throughput", ownerRole: "Microbiology Domain Pack owner", ruleIds: ["core.capacity.equipment", "micro.workflow.endotoxin"], unit: "sample equivalents per shift", ...range(24, 12, 48), rationale: "Provides a batched concept throughput before method, replicates, controls and matrix interference are confirmed.", applicability: "Selected endotoxin workload only; this does not select a method, platform, dilution or valid assay design.", evidenceIds: ["site-approved-methods", "vendor-budget-evidence"], calibrationPlan: "Capture approved method layout, controls, replicates, interference work, run failures, review and instrument occupancy.", maturity: "uncalibrated-concept" },
];

export function createQualityLabModelControls(input: ModelInputBasis): QualityLabModelControl[] {
  const userControls: QualityLabModelControl[] = [
    { id: "project.productive-hours", label: "Productive analyst hours per shift", ownerRole: "Project source owner", ruleIds: ["core.capacity.people", "core.capacity.equipment"], unit: "hours per analyst shift", ...range(input.productiveHoursPerShift, Math.max(2, input.productiveHoursPerShift - 1), Math.min(12, input.productiveHoursPerShift + 1)), rationale: "The same user-supplied productive-time basis drives labor capacity and time-based BSC capacity.", applicability: `${input.workingDaysPerMonth} working days per month and ${input.shifts} shift(s), before task-specific qualification and schedule constraints.`, evidenceIds: ["project-inputs"], calibrationPlan: "Replace with an approved operating calendar and time study separating routine work, documentation, training and non-routine demand.", maturity: "user-supplied" },
    { id: "project.equipment-downtime", label: "Equipment downtime allowance", ownerRole: "Project source owner", ruleIds: ["core.capacity.equipment"], unit: "percent unavailable", ...range(input.equipmentDowntimePercent, Math.max(0, input.equipmentDowntimePercent - 10), Math.min(50, input.equipmentDowntimePercent + 10)), rationale: "Reduces nominal capacity for qualification, calibration, maintenance and unplanned unavailability.", applicability: "Applied uniformly in the concept model until resource-class maintenance and failure evidence exists.", evidenceIds: ["project-inputs", "vendor-budget-evidence"], calibrationPlan: "Replace with observed planned and unplanned downtime by equipment class, including qualification and maintenance calendars.", maturity: "user-supplied" },
  ];
  const workflowControls = Object.values(MICROBIOLOGY_WORKFLOW_RULES).flatMap((rule) => ([
    { suffix: "hands-on", label: "hands-on time", unit: "hands-on hours per workflow unit", baseValue: rule.hours },
    { suffix: "plate-days", label: "incubation occupancy", unit: "plate-days per workflow unit", baseValue: rule.plateDays },
    { suffix: "media", label: "media demand", unit: "media liters per workflow unit", baseValue: rule.media },
  ] as const).map((metric) => {
    const spread = rule.uncertaintyPercent / 100;
    return qualityLabModelControlSchema.parse({
      id: `${rule.ruleId}.${metric.suffix}`,
      label: `${rule.label}: ${metric.label}`,
      ownerRole: "Microbiology Domain Pack owner",
      ruleIds: [rule.ruleId],
      unit: metric.unit,
      baseValue: metric.baseValue,
      stressRange: { low: Math.max(0, metric.baseValue * (1 - spread)), high: metric.baseValue * (1 + spread), interpretation: "uncalibrated-stress-bounds" },
      rationale: `${rule.applicability} ${rule.limitations}`,
      applicability: rule.applicability,
      evidenceIds: rule.evidenceIds,
      calibrationPlan: `${rule.rangeBasis} Capture estimate-to-actual observations using the same workflow-unit definition before changing the rule.`,
      maturity: "uncalibrated-concept",
    });
  }));
  return z.array(qualityLabModelControlSchema).parse([...userControls, ...fixedControls, ...workflowControls]);
}

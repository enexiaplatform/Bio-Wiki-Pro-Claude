import { z } from "zod";
import type { RuleTrace } from "./quality-lab-contract";

export const QUALITY_LAB_EXPERT_OWNERSHIP_VERSION = "expert-ownership/v1.0" as const;

export const expertOwnerAppointmentSchema = z.object({
  reviewerName: z.string().trim().nullable(),
  organization: z.string().trim().nullable(),
  competenceBasis: z.string().trim().nullable(),
  competenceEvidenceRefs: z.array(z.string().trim().min(1)),
  conflictDeclaration: z.string().trim().nullable(),
  scopeAccepted: z.boolean(),
  appointmentStatus: z.enum(["not-appointed", "appointed-outside-atlas"]),
  appointmentEvidenceRef: z.string().trim().nullable(),
  appointedAt: z.string().datetime().nullable(),
  appointmentExpiresAt: z.string().datetime().nullable(),
  changeControlResponsibility: z.string().trim().nullable(),
});

export type ExpertOwnerAppointment = z.infer<typeof expertOwnerAppointmentSchema>;

export interface ExpertOwnerRole {
  id: string;
  title: string;
  accountability: string;
  requiredCompetence: string[];
  ruleIds: string[];
  appointment: ExpertOwnerAppointment;
}

export interface ExpertOwnerRoleAssessment extends ExpertOwnerRole {
  ownershipEstablished: boolean;
  missingControls: string[];
}

export interface ExpertOwnershipAssessment {
  assessmentVersion: typeof QUALITY_LAB_EXPERT_OWNERSHIP_VERSION;
  generatedAt: string;
  domainPackId: string;
  domainPackVersion: string;
  ownershipGateSatisfied: boolean;
  roles: ExpertOwnerRoleAssessment[];
  metrics: {
    requiredRoleCount: number;
    ownershipEstablishedCount: number;
    ruleCount: number;
    rulesInReviewScopeCount: number;
    uncoveredRuleCount: number;
    unknownScopedRuleCount: number;
    duplicateRoleIdCount: number;
  };
  uncoveredRuleIds: string[];
  unknownScopedRuleIds: string[];
  blockers: string[];
  notice: string;
}

const emptyAppointment = (): ExpertOwnerAppointment => ({
  reviewerName: null,
  organization: null,
  competenceBasis: null,
  competenceEvidenceRefs: [],
  conflictDeclaration: null,
  scopeAccepted: false,
  appointmentStatus: "not-appointed",
  appointmentEvidenceRef: null,
  appointedAt: null,
  appointmentExpiresAt: null,
  changeControlResponsibility: null,
});

export function createMicrobiologyExpertOwnerRoles(ruleTrace: RuleTrace[]): ExpertOwnerRole[] {
  const workflowRuleIds = ruleTrace.filter((rule) => rule.ruleId.startsWith("micro.workflow.")).map((rule) => rule.ruleId);
  const ruleIds = new Set(ruleTrace.map((rule) => rule.ruleId));
  const existing = (candidates: string[]) => candidates.filter((ruleId) => ruleIds.has(ruleId));
  return [
    {
      id: "microbiology-domain-owner",
      title: "Microbiology Domain Pack owner",
      accountability: "Own method applicability, microbiology rule interpretation, evidence boundaries, specialist escalation, and controlled rule changes.",
      requiredCompetence: ["Non-sterile pharmaceutical microbiology", "Method suitability and specified microorganisms", "GMP method lifecycle and technical review"],
      ruleIds: [...workflowRuleIds, ...existing(["core.turnaround.feasibility"])],
      appointment: emptyAppointment(),
    },
    {
      id: "quality-governance-owner",
      title: "Quality governance reviewer",
      accountability: "Own approval boundaries, quality-system alignment, evidence acceptance, deviation handling, and approval outside Atlas.",
      requiredCompetence: ["Pharmaceutical quality systems", "Document and change control", "Risk-based review and approval governance"],
      ruleIds: existing(["core.turnaround.feasibility", "core.capacity.people", "core.capacity.equipment", "core.supply.consumables", "core.cost.concept", "core.space.concept"]),
      appointment: emptyAppointment(),
    },
    {
      id: "laboratory-operations-owner",
      title: "Laboratory operations and capacity reviewer",
      accountability: "Own workload, staffing, shift, turnaround, consumable, downtime, resilience, and operating-model assumptions.",
      requiredCompetence: ["QC laboratory operations", "Capacity and workforce planning", "Operational resilience and review workload"],
      ruleIds: existing(["core.turnaround.feasibility", "core.capacity.people", "core.supply.consumables"]),
      appointment: emptyAppointment(),
    },
    {
      id: "laboratory-engineering-owner",
      title: "Laboratory engineering and cost reviewer",
      accountability: "Own equipment, utilities, space, installed-cost, qualification, maintainability, and engineering handoff boundaries.",
      requiredCompetence: ["GMP laboratory engineering", "Equipment lifecycle and utilities", "Concept cost and space basis review"],
      ruleIds: existing(["core.capacity.equipment", "core.cost.concept", "core.space.concept"]),
      appointment: emptyAppointment(),
    },
  ];
}

function assessRole(role: ExpertOwnerRole, generatedAt: string): ExpertOwnerRoleAssessment {
  const appointment = expertOwnerAppointmentSchema.parse(role.appointment);
  const missingControls: string[] = [];
  if (!appointment.reviewerName) missingControls.push("Named reviewer");
  if (!appointment.competenceBasis || appointment.competenceBasis.length < 20) missingControls.push("Competence basis");
  if (appointment.competenceEvidenceRefs.length === 0) missingControls.push("Competence evidence reference");
  if (!appointment.conflictDeclaration) missingControls.push("Conflict declaration");
  if (!appointment.scopeAccepted) missingControls.push("Accepted review scope");
  if (appointment.appointmentStatus !== "appointed-outside-atlas") missingControls.push("External appointment status");
  if (!appointment.appointmentEvidenceRef) missingControls.push("Appointment evidence reference");
  if (!appointment.appointedAt) missingControls.push("Appointment date");
  if (appointment.appointedAt && Date.parse(appointment.appointedAt) > Date.parse(generatedAt)) missingControls.push("Effective appointment date");
  if (appointment.appointmentExpiresAt && Date.parse(appointment.appointmentExpiresAt) <= Date.parse(generatedAt)) missingControls.push("Current appointment period");
  if (!appointment.changeControlResponsibility || appointment.changeControlResponsibility.length < 20) missingControls.push("Change-control responsibility");
  return { ...role, appointment, ownershipEstablished: missingControls.length === 0, missingControls };
}

export function assessExpertOwnership(args: {
  domainPack: { id: string; version: string };
  ruleTrace: RuleTrace[];
  roles: ExpertOwnerRole[];
  generatedAt?: string;
}): ExpertOwnershipAssessment {
  const generatedAt = args.generatedAt ?? new Date().toISOString();
  const ruleIds = new Set(args.ruleTrace.map((rule) => rule.ruleId));
  const scopedRuleIds = new Set(args.roles.flatMap((role) => role.ruleIds));
  const uncoveredRuleIds = Array.from(ruleIds).filter((ruleId) => !scopedRuleIds.has(ruleId));
  const unknownScopedRuleIds = Array.from(scopedRuleIds).filter((ruleId) => !ruleIds.has(ruleId));
  const duplicateRoleIdCount = args.roles.length - new Set(args.roles.map((role) => role.id)).size;
  const roles = args.roles.map((role) => assessRole(role, generatedAt));
  const ownershipEstablishedCount = roles.filter((role) => role.ownershipEstablished).length;
  const blockers: string[] = [];
  if (duplicateRoleIdCount > 0) blockers.push(`${duplicateRoleIdCount} duplicate ownership role ID(s) must be resolved.`);
  if (uncoveredRuleIds.length > 0) blockers.push(`${uncoveredRuleIds.length} material rule(s) have no assigned review scope.`);
  if (unknownScopedRuleIds.length > 0) blockers.push(`${unknownScopedRuleIds.length} scoped rule ID(s) do not exist in the current rule registry.`);
  for (const role of roles.filter((item) => !item.ownershipEstablished)) blockers.push(`${role.title}: ${role.missingControls.join(", ")}.`);
  return {
    assessmentVersion: QUALITY_LAB_EXPERT_OWNERSHIP_VERSION,
    generatedAt,
    domainPackId: args.domainPack.id,
    domainPackVersion: args.domainPack.version,
    ownershipGateSatisfied: blockers.length === 0,
    roles,
    metrics: {
      requiredRoleCount: roles.length,
      ownershipEstablishedCount,
      ruleCount: ruleIds.size,
      rulesInReviewScopeCount: ruleIds.size - uncoveredRuleIds.length,
      uncoveredRuleCount: uncoveredRuleIds.length,
      unknownScopedRuleCount: unknownScopedRuleIds.length,
      duplicateRoleIdCount,
    },
    uncoveredRuleIds,
    unknownScopedRuleIds,
    blockers,
    notice: "This register controls accountability evidence only. Atlas does not certify competence, appoint reviewers, or convert a working record into QA approval.",
  };
}

function csvCell(value: string | number | boolean | null) {
  const text = value === null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export function createExpertOwnershipCsv(assessment: ExpertOwnershipAssessment) {
  const headers = ["role_id", "role_title", "accountability", "required_competence", "rule_ids", "reviewer_name", "organization", "competence_basis", "competence_evidence_refs", "conflict_declaration", "scope_accepted", "appointment_status", "appointment_evidence_ref", "appointed_at", "appointment_expires_at", "change_control_responsibility", "ownership_established", "missing_controls"];
  const rows = assessment.roles.map((role) => [role.id, role.title, role.accountability, role.requiredCompetence.join(" | "), role.ruleIds.join(" | "), role.appointment.reviewerName, role.appointment.organization, role.appointment.competenceBasis, role.appointment.competenceEvidenceRefs.join(" | "), role.appointment.conflictDeclaration, role.appointment.scopeAccepted, role.appointment.appointmentStatus, role.appointment.appointmentEvidenceRef, role.appointment.appointedAt, role.appointment.appointmentExpiresAt, role.appointment.changeControlResponsibility, role.ownershipEstablished, role.missingControls.join(" | ")]);
  return [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
}

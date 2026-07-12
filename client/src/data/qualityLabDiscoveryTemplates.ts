export const blueprintDiscoveryTemplates = [
  {
    filename: "atlas-blueprint-project-intake.csv",
    title: "Project intake",
    description: "Capture the site, portfolio, markets, workload, turnaround, execution model and decision boundary.",
    rows: [
      ["section", "field", "value", "source_or_owner", "confidence", "open_question", "impact_if_wrong"],
      ["project", "decision_to_support", "", "Project sponsor", "", "", ""],
      ["project", "site_and_country", "", "Project sponsor", "", "", ""],
      ["portfolio", "product_or_material_family", "", "Regulatory / QC", "", "", ""],
      ["portfolio", "dosage_form_or_modality", "", "Regulatory / QC", "", "", ""],
      ["portfolio", "target_markets", "", "Regulatory", "", "", ""],
      ["demand", "batches_lots_or_campaigns_per_month", "", "Planning / Production", "", "", ""],
      ["demand", "samples_per_batch_or_event", "", "QC / Production", "", "", ""],
      ["operations", "target_turnaround", "", "QC / Supply", "", "", ""],
      ["operations", "in_house_outsource_or_hybrid", "", "QC / QA", "", "", ""],
      ["growth", "planning_horizon_and_growth", "", "Business / Planning", "", "", ""],
    ],
  },
  {
    filename: "atlas-requirement-capability-map.csv",
    title: "Requirement-to-capability map",
    description: "Trace each quality decision through requirement, method architecture, physical execution and resource dependencies.",
    rows: [
      ["requirement_id", "product_process_or_system", "market", "quality_decision", "requirement_or_attribute", "method_id", "method_status", "physical_execution_allocation", "execution_owner", "turnaround", "people", "equipment", "materials", "space_utilities", "data_review", "evidence_reference", "applicability", "unresolved_input"],
      ["REQ-001", "", "", "", "", "", "proposed / transferred / verified / validated", "shared / separate / unresolved", "in-house / outsourced / hybrid", "", "", "", "", "", "", "", "", ""],
    ],
  },
  {
    filename: "atlas-assumptions-evidence-decision-log.csv",
    title: "Assumptions, evidence and decisions",
    description: "Keep planning assumptions, evidence gaps, corrections and owner decisions visible through expert review.",
    rows: [
      ["record_id", "record_type", "domain", "statement_or_question", "current_value", "source_reference", "source_version_or_date", "confidence", "status", "owner", "due_date", "dependency", "impact", "reviewer_note"],
      ["LOG-001", "fact / assumption / evidence-gap / correction / decision", "", "", "", "", "", "high / medium / indicative", "open / in-review / resolved", "", "", "", "", ""],
    ],
  },
  {
    filename: "atlas-space-flow-engineering-basis.csv",
    title: "Space, flow and utility basis",
    description: "Translate capabilities into activities, zones, adjacencies, segregations, flow paths, equipment envelopes and engineering evidence.",
    rows: [
      ["record_id", "capability_or_workflow", "activity", "functional_zone", "input_state", "output_state", "people_concurrent", "equipment_and_working_envelope", "storage_state_and_condition", "personnel_flow", "sample_flow", "material_flow", "waste_flow", "adjacency_requirement", "segregation_requirement_and_reason", "utility_classes", "peak_or_downtime_scenario", "evidence_reference", "owner", "status", "engineering_question"],
      ["SPC-001", "", "", "", "", "", "", "", "", "", "", "", "", "direct / near / neutral / separate", "", "power / water / drain / steam / gas / exhaust / data", "", "", "QC / QA / Engineering / EHS", "concept / confirmed / blocked", ""],
    ],
  },
  {
    filename: "atlas-domain-pack-validation-case.csv",
    title: "Domain Pack validation case",
    description: "Compare a frozen estimate with qualified actuals, classify variance and decide whether learning remains project-only or enters controlled review.",
    rows: [
      ["case_id", "project_id", "confidentiality_class", "baseline_generated_at", "input_contract_version", "output_contract_version", "compiler_core_version", "domain_pack_version", "metric", "metric_definition", "estimate", "actual", "unit", "observed_period_start", "observed_period_end", "data_owner", "controlled_evidence_reference", "scope_aligned", "variance_percent", "variance_driver", "reviewer_interpretation", "learning_disposition", "applicable_rule_ids", "reviewed_by_role", "reviewed_at", "eligibility", "eligibility_blockers"],
      ["VAL-001", "", "client-confidential / internal-anonymized / shareable", "", "", "", "", "", "monthlyTests / teamFte / areaSqm / capexLowUsd / capexHighUsd", "", "", "", "", "", "", "", "", "yes / no / partial", "", "input-quality / scope-change / rule-assumption / site-performance / market-price / implementation-choice / mixed", "", "hold / project-only / candidate-rule-update / candidate-benchmark", "", "", "", "blocked / eligible-for-learning-review", ""],
    ],
  },
  {
    filename: "atlas-rule-change-impact-assessment.csv",
    title: "Rule-change impact assessment",
    description: "Review a proposed rule version against candidate evidence, applicability, representative projects and downstream Blueprint outputs before release.",
    rows: [
      ["change_id", "domain_pack_id", "rule_id", "previous_rule_version", "proposed_rule_version", "change_type", "previous_logic_or_value", "proposed_logic_or_value", "candidate_record_ids", "cohort_definition", "inclusion_exclusion_rationale", "applicability_before", "applicability_after", "affected_output_types", "representative_project_id", "comparison_metric", "before", "after", "delta", "unresolved_input_behavior_change", "confidence_before", "confidence_after", "risk_or_unintended_effect", "reviewer_roles", "decision", "decision_rationale", "effective_date", "rollback_trigger"],
      ["RCH-001", "", "", "", "", "retain / applicability / scenario-factor / parameter / benchmark-range", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "draft / needs-evidence / approved-for-release / rejected", "", "", ""],
    ],
  },
] as const;

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
    filename: "atlas-turnaround-queue-calendar-basis.csv",
    title: "Turnaround, queue and calendar basis",
    description: "Capture arrival and deadline definitions, step timing, resource calendars, queues, batching, handoffs, failures and service-level evidence.",
    rows: [
      ["record_id", "workflow_or_method", "sample_or_event_class", "priority", "arrival_event", "deadline_event", "clock_basis", "target_service_level", "step", "predecessor", "touch_time", "equipment_time", "hold_or_incubation_time", "resource_or_skill", "operating_calendar", "batch_rule", "queue_limit", "handoff_or_cutoff", "earliest_action", "latest_action", "failure_repeat_or_investigation_path", "observed_period", "evidence_reference", "owner", "confidence", "simulation_required", "open_question"],
      ["TAT-001", "", "routine / urgent / release / stability / investigation", "", "", "", "calendar days / business days / operating hours", "average / P90 / P95 / maximum", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "high / medium / indicative", "yes / no / review", ""],
    ],
  },
  {
    filename: "atlas-qc-lab-cost-basis.csv",
    title: "QC laboratory cost basis",
    description: "Reconcile each cost element to technical scope, evidence, timing, estimate maturity, uncertainty and approval ownership.",
    rows: [
      ["cost_id", "cost_breakdown_category", "technical_scope_reference", "description", "quantity", "unit", "unit_rate", "currency", "base_date", "source_or_quote_reference", "supplier_or_estimator", "inclusions", "exclusions", "freight_duty_tax_basis", "installation_basis", "qualification_validation_basis", "schedule_or_cashflow_period", "escalation_basis", "contingency_or_risk_basis", "low", "most_likely", "high", "capex_opex_or_lifecycle", "estimate_maturity", "confidence", "owner", "review_status", "variance_or_change_reference"],
      ["CST-001", "equipment / facility / utility / installation / validation / staffing / supply / service / software / decommissioning", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "CAPEX / OPEX / lifecycle", "concept / budgetary / procurement / controlled-baseline", "high / medium / indicative", "", "open / reviewed / approved", ""],
    ],
  },
  {
    filename: "atlas-test-method-application-matrix.csv",
    title: "Test method application matrix",
    description: "Define intended use, matrix, sampling, method architecture, suitability, controls, decisions, resources and lifecycle evidence before a test becomes an executable Atlas node.",
    rows: [
      ["application_id", "domain", "product_process_system_or_location", "market_or_site_basis", "intended_use", "quality_decision", "sample_or_matrix", "sampling_and_representativeness", "container_transport_hold", "method_id_and_version", "preparation_and_dilution", "interference_or_suitability", "media_reagents_and_critical_materials", "equipment_and_software", "incubation_run_or_hold_conditions", "controls_and_system_suitability", "calculation_and_reporting_unit", "specification_alert_action_or_acceptance", "review_and_investigation_path", "bom_and_capacity_basis", "analyst_reviewer_skill", "transfer_verification_validation_status", "performance_monitoring", "change_control_dependencies", "source_references", "owner", "confidence", "status", "blocking_evidence"],
      ["APP-001", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "proposed / transferred / verified / validated", "", "", "", "", "high / medium / indicative", "content-foundation / application-development / executable-review", ""],
    ],
  },
  {
    filename: "atlas-application-evidence-readiness-register.csv",
    title: "Application evidence readiness register",
    description: "Assess each application dimension against controlled evidence, ownership and exit criteria without overstating executable Method Graph maturity.",
    rows: [
      ["readiness_id", "application_id", "application_pack", "dimension", "current_status", "claim_or_decision_supported", "required_evidence", "available_evidence_reference", "evidence_version_or_date", "applicability_scope", "evidence_owner", "reviewer_role", "review_status", "confidence", "blocking_gap", "gap_impact", "resolution_action", "due_date", "dependency", "method_graph_eligibility", "eligibility_rationale", "last_reviewed_at"],
      ["RDY-001", "", "water-microbiology / growth-promotion-media-qc / bioburden-filtration / bet-lal / environmental-monitoring / microbial-identification", "intended-use / matrix / method / decision / resources / lifecycle", "structured / partial / evidence-required", "", "", "", "", "", "", "QC / QA / Regulatory / Engineering / SME", "open / in-review / accepted / rejected / superseded", "high / medium / indicative", "", "", "", "", "", "not-executable / workflow-only / eligible-for-controlled-review", "", ""],
    ],
  },
  {
    filename: "atlas-method-execution-observation.csv",
    title: "Method execution observation",
    description: "Capture observed method steps, BOM, equipment occupancy, queues, exceptions and review effort for estimate-to-actual calibration.",
    rows: [
      ["observation_id", "project_id", "application_id", "method_id_and_version", "sample_or_event_class", "matrix_or_location", "execution_date", "shift_or_calendar", "observer", "analyst_skill", "step", "step_sequence", "predecessor", "touch_minutes", "equipment_id_or_class", "equipment_occupancy_minutes", "hold_incubation_or_run_minutes", "queue_minutes", "material_or_consumable", "planned_quantity", "actual_quantity", "unit", "control_or_sample_use", "repeat_invalid_or_exception", "exception_reason", "review_minutes", "identification_or_investigation_minutes", "result_turnaround_minutes", "controlled_evidence_reference", "confidentiality_class", "scope_aligned_to_estimate", "variance_driver", "review_status", "reviewer_note"],
      ["OBS-001", "", "", "", "routine / urgent / suitability / qualification / investigation", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "sample / control / waste / repeat", "no / repeat / invalid / investigation", "", "", "", "", "", "client-confidential / internal-anonymized / shareable", "yes / no / partial", "input-quality / scope-change / method-variation / site-performance / exception / mixed", "draft / reviewed / accepted-for-case", ""],
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

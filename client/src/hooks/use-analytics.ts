import { useEffect } from "react";
import { useLocation } from "wouter";

declare global {
  interface Window {
    posthog?: {
      init: (key: string, options?: object) => void;
      capture: (event: string, properties?: Record<string, unknown>) => void;
      identify: (id: string, properties?: Record<string, unknown>) => void;
      reset: () => void;
    };
  }
}

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;

let initialized = false;

function initPostHog() {
  if (initialized || !POSTHOG_KEY || typeof window === "undefined") return;
  if (window.posthog) {
    window.posthog.init(POSTHOG_KEY, {
      api_host: "https://app.posthog.com",
      capture_pageview: false, // we track manually
      autocapture: false,
      persistence: "localStorage+cookie",
    });
    initialized = true;
  }
}

export function capture(event: string, properties?: Record<string, unknown>) {
  // PostHog stub methods only exist after init() runs. When VITE_POSTHOG_KEY
  // is unset, init() is skipped and these stay undefined — so guard the call
  // itself, not just the object, to avoid crashing the whole app.
  if (typeof window !== "undefined" && typeof window.posthog?.capture === "function") {
    window.posthog.capture(event, properties);
  }
}

export function identify(userId: string, traits?: Record<string, unknown>) {
  if (typeof window !== "undefined" && typeof window.posthog?.identify === "function") {
    window.posthog.identify(userId, traits);
  }
}

/** Clear the identified user on logout so events aren't attributed across accounts. */
export function reset() {
  if (typeof window !== "undefined" && typeof window.posthog?.reset === "function") {
    window.posthog.reset();
  }
}

/** Capture a client-side error/exception to PostHog (guarded, never throws). */
export function captureError(error: unknown, context?: Record<string, unknown>) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  // Always surface in console for local/Vercel logs.
  console.error("[captureError]", message, context ?? "");
  capture("client_error", { message, stack, ...context });
}

// Hook: auto page_view on route change
export function usePageTracking() {
  const [location] = useLocation();

  useEffect(() => {
    initPostHog();
  }, []);

  useEffect(() => {
    capture("page_view", { path: location });
  }, [location]);
}

// Convenience event helpers
export const analytics = {
  leadCaptured: (source: string) =>
    capture("lead_captured", { source }),

  signupStarted: (method = "email") =>
    capture("signup_started", { method }),

  signupCompleted: (method = "email") =>
    capture("signup_completed", { method }),

  // Fired once when a user opens their first lesson — the activation milestone.
  activated: (lessonId: string) =>
    capture("activated", { lesson_id: lessonId }),

  checkoutStarted: (productType: string, priceUsd?: number) =>
    capture("checkout_started", { product_type: productType, price_usd: priceUsd }),

  subscriptionStarted: (plan = "pro_subscription") =>
    capture("subscription_started", { plan }),

  purchaseCompleted: (productType: string, amountCents?: number) =>
    capture("purchase_completed", { product_type: productType, amount_cents: amountCents }),

  onboardingStarted: () => capture("onboarding_started"),

  onboardingCompleted: (firstValue: string) =>
    capture("onboarding_completed", { first_value: firstValue }),

  upgradePromptShown: (placement: string) =>
    capture("upgrade_prompt_shown", { placement }),

  upgradePromptClicked: (placement: string) =>
    capture("upgrade_prompt_clicked", { placement }),

  proModalOpened: (trigger: string) =>
    capture("pro_modal_opened", { trigger }),

  lessonOpened: (lessonId: string, lessonTitle: string) =>
    capture("lesson_opened", { lesson_id: lessonId, lesson_title: lessonTitle }),

  downloadClicked: (productId: string, filename: string) =>
    capture("download_clicked", { product_id: productId, filename }),

  searchPerformed: (query: string, section: string, resultsCount: number) =>
    capture("search_performed", { query, section, results_count: resultsCount }),

  workflowClicked: (workflowName: string) =>
    capture("workflow_clicked", { workflow_name: workflowName }),

  blueprintCtaClicked: (placement: string, destination: string) =>
    capture("blueprint_cta_clicked", { placement, destination }),

  blueprintStarted: (source = "planner") =>
    capture("blueprint_started", { source }),

  blueprintCompiled: (projectId: string, facilityType: string, scopeCount: number) =>
    capture("blueprint_compiled", {
      project_id: projectId,
      facility_type: facilityType,
      scope_count: scopeCount,
    }),

  scenarioCompared: (baselineId: string, alternativeId: string, changedInputs: number) =>
    capture("blueprint_scenarios_compared", {
      baseline_id: baselineId,
      alternative_id: alternativeId,
      changed_inputs: changedInputs,
    }),

  scenarioComparisonExported: (signalCount: number) =>
    capture("blueprint_scenario_comparison_exported", { signal_count: signalCount }),

  turnaroundFeasibilityEvaluated: (projectId: string, horizon: string, status: string, workflowCount: number) =>
    capture("turnaround_feasibility_evaluated", { project_id: projectId, horizon, status, workflow_count: workflowCount }),

  turnaroundFeasibilityExported: (status: string, signalCount: number) =>
    capture("turnaround_feasibility_exported", { status, signal_count: signalCount }),

  sensitivityAnalyzed: (projectId: string, driverCount: number, criticalCount: number) =>
    capture("blueprint_sensitivity_analyzed", { project_id: projectId, driver_count: driverCount, decision_critical_count: criticalCount }),

  sensitivityExported: (criticalCount: number, queueCount: number) =>
    capture("blueprint_sensitivity_exported", { decision_critical_count: criticalCount, verification_queue_count: queueCount }),

  equipmentResilienceEvaluated: (projectId: string, horizon: string, status: string, nPlusOneGapUnits: number) =>
    capture("equipment_resilience_evaluated", { project_id: projectId, horizon, status, n_plus_one_gap_units: nPlusOneGapUnits }),

  equipmentResilienceExported: (status: string, nPlusOneGapUnits: number) =>
    capture("equipment_resilience_exported", { status, n_plus_one_gap_units: nPlusOneGapUnits }),

  nonRoutineLoadEvaluated: (projectId: string, horizon: string, status: string, monthlyHours: number) =>
    capture("non_routine_load_evaluated", { project_id: projectId, horizon, status, monthly_hours: monthlyHours }),

  nonRoutineLoadExported: (status: string, observedEventTypes: number) =>
    capture("non_routine_load_exported", { status, observed_event_types: observedEventTypes }),

  skillShiftCoverageEvaluated: (projectId: string, horizon: string, status: string, failingWorkflows: number) =>
    capture("skill_shift_coverage_evaluated", { project_id: projectId, horizon, status, failing_workflows: failingWorkflows }),

  skillShiftCoverageExported: (status: string, controlledEvidenceCount: number) =>
    capture("skill_shift_coverage_exported", { status, controlled_evidence_count: controlledEvidenceCount }),

  crossTrainingPriorityEvaluated: (projectId: string, actionCount: number, allocatedPeople: number, deferredPeople: number) =>
    capture("cross_training_priority_evaluated", { project_id: projectId, action_count: actionCount, allocated_people: allocatedPeople, deferred_people: deferredPeople }),

  crossTrainingPriorityExported: (allocatedPeople: number, deferredPeople: number) =>
    capture("cross_training_priority_exported", { allocated_people: allocatedPeople, deferred_people: deferredPeople }),

  expertReviewStarted: (source: string) =>
    capture("expert_review_started", { source }),

  expertReviewRequested: (hasProject: boolean) =>
    capture("expert_review_requested", { has_project: hasProject }),

  engagementPacketDownloaded: (placement: string, openItems: number) =>
    capture("engagement_packet_downloaded", { placement, open_items: openItems }),
};

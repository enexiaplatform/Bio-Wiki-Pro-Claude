import { useQuery } from "@tanstack/react-query";

export type BillingProductType =
  | "pro_subscription"
  | "pro_subscription_annual"
  | "scope_diagnostic"
  | "career_blueprint";

export interface BillingPlans {
  monthly: boolean;
  annual: boolean;
  scopeDiagnostic: boolean;
  careerBlueprint: boolean;
  commerceMode: string;
  trialDays: number;
}

async function fetchBillingPlans(): Promise<BillingPlans> {
  const response = await fetch("/api/billing/plans", { credentials: "include" });
  if (!response.ok) throw new Error("Billing availability could not be confirmed");

  const data = await response.json();
  return {
    monthly: data?.monthly === true,
    annual: data?.annual === true,
    scopeDiagnostic: data?.scopeDiagnostic === true,
    careerBlueprint: data?.careerBlueprint === true,
    commerceMode: typeof data?.commerceMode === "string" ? data.commerceMode : "unknown",
    trialDays: typeof data?.trialDays === "number" && Number.isFinite(data.trialDays) ? Math.max(0, data.trialDays) : 0,
  };
}

export function isCheckoutAvailable(productType: BillingProductType, plans: BillingPlans | null | undefined): boolean {
  if (!plans) return false;
  if (productType === "pro_subscription") return plans.monthly;
  if (productType === "pro_subscription_annual") return plans.annual;
  if (productType === "scope_diagnostic") return plans.scopeDiagnostic;
  return plans.careerBlueprint;
}

export function useBillingPlans() {
  const query = useQuery({
    queryKey: ["/api/billing/plans"],
    queryFn: fetchBillingPlans,
    retry: 1,
    staleTime: 60_000,
  });

  return {
    plans: query.data ?? null,
    isLoading: query.isPending,
    isError: query.isError,
    proCheckoutAvailable: Boolean(query.data?.monthly || query.data?.annual),
  };
}

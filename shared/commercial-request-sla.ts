export const COMMERCIAL_RESPONSE_BUSINESS_DAYS = 2;
export const COMMERCIAL_RESPONSE_DUE_SOON_MS = 24 * 60 * 60 * 1000;

export type CommercialResponseState = "overdue" | "due-soon" | "on-track" | "progressed" | "unknown";

export type CommercialRequestSlaInput = {
  status: string | null | undefined;
  owner?: string | null;
  nextAction?: string | null;
  createdAt?: string | Date | null;
};

export type CommercialRequestSlaAssessment = {
  state: CommercialResponseState;
  deadline: string | null;
  missingOwner: boolean;
  missingNextAction: boolean;
};

export function commercialResponseDeadline(createdAt: string | Date | null | undefined): Date | null {
  if (!createdAt) return null;
  const deadline = createdAt instanceof Date ? new Date(createdAt.getTime()) : new Date(createdAt);
  if (Number.isNaN(deadline.getTime())) return null;

  let businessDays = 0;
  while (businessDays < COMMERCIAL_RESPONSE_BUSINESS_DAYS) {
    deadline.setUTCDate(deadline.getUTCDate() + 1);
    const day = deadline.getUTCDay();
    if (day !== 0 && day !== 6) businessDays += 1;
  }
  return deadline;
}

export function assessCommercialRequestSla(
  request: CommercialRequestSlaInput,
  now: string | Date = new Date(),
): CommercialRequestSlaAssessment {
  const missingOwner = !request.owner?.trim();
  const missingNextAction = !request.nextAction?.trim();
  const deadline = commercialResponseDeadline(request.createdAt);

  if (request.status && request.status !== "new") {
    return { state: "progressed", deadline: deadline?.toISOString() ?? null, missingOwner, missingNextAction };
  }
  if (!deadline) return { state: "unknown", deadline: null, missingOwner, missingNextAction };

  const observedAt = now instanceof Date ? now : new Date(now);
  if (Number.isNaN(observedAt.getTime())) return { state: "unknown", deadline: deadline.toISOString(), missingOwner, missingNextAction };
  const remainingMs = deadline.getTime() - observedAt.getTime();
  const state = remainingMs < 0
    ? "overdue"
    : remainingMs <= COMMERCIAL_RESPONSE_DUE_SOON_MS
      ? "due-soon"
      : "on-track";
  return { state, deadline: deadline.toISOString(), missingOwner, missingNextAction };
}

const responseStateRank: Record<CommercialResponseState, number> = {
  overdue: 0,
  "due-soon": 1,
  "on-track": 2,
  unknown: 3,
  progressed: 4,
};

export function buildCommercialRequestSlaQueue<T extends CommercialRequestSlaInput>(
  requests: T[],
  now: string | Date = new Date(),
) {
  const items = requests.map((request) => ({ request, sla: assessCommercialRequestSla(request, now) }));
  items.sort((left, right) => {
    const stateDifference = responseStateRank[left.sla.state] - responseStateRank[right.sla.state];
    if (stateDifference !== 0) return stateDifference;
    return (left.sla.deadline ?? "9999").localeCompare(right.sla.deadline ?? "9999");
  });

  const newItems = items.filter(({ request }) => !request.status || request.status === "new");
  return {
    items,
    metrics: {
      newRequests: newItems.length,
      overdue: newItems.filter(({ sla }) => sla.state === "overdue").length,
      dueSoon: newItems.filter(({ sla }) => sla.state === "due-soon").length,
      unowned: newItems.filter(({ sla }) => sla.missingOwner).length,
      missingNextAction: newItems.filter(({ sla }) => sla.missingNextAction).length,
    },
  };
}

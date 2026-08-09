import { beforeEach, describe, expect, it, vi } from "vitest";

const database = vi.hoisted(() => ({ transaction: vi.fn() }));
vi.mock("../db.js", () => ({ db: database }));

import { fulfillStripeEventOnce } from "../stripe-fulfillment.js";

type FakeState = {
  claimed: Set<string>;
  purchases: Array<Record<string, unknown>>;
  failNextPurchase: boolean;
};

function installTransactionalDatabase(state: FakeState) {
  let queue = Promise.resolve();
  database.transaction.mockImplementation((callback: (tx: any) => Promise<unknown>) => {
    const result = queue.then(async () => {
      const draft = { claimed: new Set(state.claimed), purchases: [...state.purchases] };
      const tx = {
        insert: () => ({
          values: (value: Record<string, unknown>) => {
            if ("type" in value && "eventId" in value && !("stage" in value)) {
              return {
                onConflictDoNothing: () => ({
                  returning: async () => {
                    const eventId = String(value.eventId);
                    if (draft.claimed.has(eventId)) return [];
                    draft.claimed.add(eventId);
                    return [{ eventId }];
                  },
                }),
              };
            }
            if ("productType" in value) {
              if (state.failNextPurchase) {
                state.failNextPurchase = false;
                return Promise.reject(new Error("simulated purchase failure"));
              }
              draft.purchases.push(value);
              return Promise.resolve();
            }
            return { onConflictDoNothing: () => Promise.resolve() };
          },
        }),
      };
      const response = await callback(tx);
      state.claimed = draft.claimed;
      state.purchases = draft.purchases;
      return response;
    });
    queue = result.then(() => undefined, () => undefined);
    return result;
  });
}

const payment = {
  kind: "checkout-payment" as const,
  userId: "user-1",
  productType: "scope_diagnostic",
  sessionId: "checkout-1",
  amount: 14900,
  occurredAt: new Date("2026-08-03T00:00:00.000Z"),
};

beforeEach(() => vi.clearAllMocks());

describe("atomic Stripe fulfillment", () => {
  it("claims a concurrent duplicate once and creates one purchase", async () => {
    const state: FakeState = { claimed: new Set(), purchases: [], failNextPurchase: false };
    installTransactionalDatabase(state);

    const results = await Promise.all([
      fulfillStripeEventOnce("event-1", "checkout.session.completed", payment),
      fulfillStripeEventOnce("event-1", "checkout.session.completed", payment),
    ]);

    expect(results.filter((result) => result.duplicate)).toHaveLength(1);
    expect(results.filter((result) => !result.duplicate)).toHaveLength(1);
    expect(state.purchases).toHaveLength(1);
  });

  it("rolls back the event claim when fulfillment fails and succeeds on retry", async () => {
    const state: FakeState = { claimed: new Set(), purchases: [], failNextPurchase: true };
    installTransactionalDatabase(state);

    await expect(fulfillStripeEventOnce("event-retry", "checkout.session.completed", payment)).rejects.toThrow("simulated purchase failure");
    expect(state.claimed.size).toBe(0);
    expect(state.purchases).toHaveLength(0);

    await expect(fulfillStripeEventOnce("event-retry", "checkout.session.completed", payment)).resolves.toMatchObject({ duplicate: false });
    expect(state.claimed.has("event-retry")).toBe(true);
    expect(state.purchases).toHaveLength(1);
  });
});

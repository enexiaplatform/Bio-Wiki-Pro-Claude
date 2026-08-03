import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db } from "./db.js";
import { purchases, users } from "../shared/models/auth.js";
import { processedStripeEvents, qualityLabFunnelEvents } from "../shared/schema.js";

export type StripeFulfillment =
  | { kind: "checkout-subscription"; userId: string; customerId: string | null; subscriptionId: string | null }
  | { kind: "checkout-payment"; userId: string; productType: string; sessionId: string; amount: number | null; blueprintJourneyId?: string; occurredAt: Date }
  | { kind: "subscription-state"; userId?: string; customerId: string; subscriptionId: string; status: string; active: boolean; periodEnd?: Date }
  | { kind: "subscription-deleted"; customerId: string }
  | { kind: "invoice-failed"; customerId: string; graceUntil: Date }
  | { kind: "invoice-succeeded"; customerId: string; periodEnd?: Date }
  | { kind: "noop" };

export type StripeFulfillmentResult = {
  duplicate: boolean;
  userId?: string;
};

export async function fulfillStripeEventOnce(
  eventId: string,
  eventType: string,
  fulfillment: StripeFulfillment,
): Promise<StripeFulfillmentResult> {
  return db.transaction(async (tx) => {
    const [claim] = await tx
      .insert(processedStripeEvents)
      .values({ eventId, type: eventType })
      .onConflictDoNothing({ target: processedStripeEvents.eventId })
      .returning({ eventId: processedStripeEvents.eventId });
    if (!claim) return { duplicate: true };

    const resolveUserId = async (explicitUserId: string | undefined, customerId: string | undefined) => {
      if (explicitUserId) return explicitUserId;
      if (!customerId) return undefined;
      const [user] = await tx.select({ id: users.id }).from(users).where(eq(users.stripeCustomerId, customerId));
      return user?.id;
    };

    if (fulfillment.kind === "checkout-subscription") {
      await tx.update(users).set({
        isPro: true,
        subscriptionStatus: "active",
        stripeCustomerId: fulfillment.customerId,
        stripeSubscriptionId: fulfillment.subscriptionId,
        proGraceUntil: null,
        updatedAt: new Date(),
      }).where(eq(users.id, fulfillment.userId));
      return { duplicate: false, userId: fulfillment.userId };
    }

    if (fulfillment.kind === "checkout-payment") {
      await tx.insert(purchases).values({
        userId: fulfillment.userId,
        productType: fulfillment.productType,
        stripeSessionId: fulfillment.sessionId,
        amount: fulfillment.amount ?? undefined,
        status: "completed",
      });
      if (fulfillment.productType === "scope_diagnostic" && fulfillment.blueprintJourneyId) {
        await tx.insert(qualityLabFunnelEvents).values({
          eventId: crypto.randomUUID(),
          journeyId: fulfillment.blueprintJourneyId,
          userId: fulfillment.userId,
          stage: "diagnostic_purchased",
          source: "stripe_webhook",
          offer: fulfillment.productType,
          occurredAt: fulfillment.occurredAt,
        }).onConflictDoNothing({ target: qualityLabFunnelEvents.eventId });
      }
      return { duplicate: false, userId: fulfillment.userId };
    }

    if (fulfillment.kind === "subscription-state") {
      const userId = await resolveUserId(fulfillment.userId, fulfillment.customerId);
      if (userId) {
        await tx.update(users).set({
          isPro: fulfillment.active || fulfillment.status === "past_due",
          subscriptionStatus: fulfillment.status,
          stripeCustomerId: fulfillment.customerId,
          stripeSubscriptionId: fulfillment.subscriptionId,
          ...(fulfillment.periodEnd ? { proExpiresAt: fulfillment.periodEnd } : {}),
          ...(fulfillment.active ? { proGraceUntil: null } : {}),
          updatedAt: new Date(),
        }).where(eq(users.id, userId));
      }
      return { duplicate: false, userId };
    }

    if (fulfillment.kind === "subscription-deleted") {
      const userId = await resolveUserId(undefined, fulfillment.customerId);
      if (userId) {
        await tx.update(users).set({ isPro: false, subscriptionStatus: "canceled", proGraceUntil: null, updatedAt: new Date() }).where(eq(users.id, userId));
      }
      return { duplicate: false, userId };
    }

    if (fulfillment.kind === "invoice-failed") {
      const userId = await resolveUserId(undefined, fulfillment.customerId);
      if (userId) {
        await tx.update(users).set({ isPro: true, subscriptionStatus: "past_due", proGraceUntil: fulfillment.graceUntil, updatedAt: new Date() }).where(eq(users.id, userId));
      }
      return { duplicate: false, userId };
    }

    if (fulfillment.kind === "invoice-succeeded") {
      const userId = await resolveUserId(undefined, fulfillment.customerId);
      if (userId) {
        await tx.update(users).set({
          isPro: true,
          subscriptionStatus: "active",
          proGraceUntil: null,
          ...(fulfillment.periodEnd ? { proExpiresAt: fulfillment.periodEnd } : {}),
          updatedAt: new Date(),
        }).where(eq(users.id, userId));
      }
      return { duplicate: false, userId };
    }

    return { duplicate: false };
  });
}

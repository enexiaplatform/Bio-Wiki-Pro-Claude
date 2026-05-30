import type { User } from "../shared/models/auth.js";

/**
 * Effective Pro status, enforced lazily at read time (no cron needed):
 *  - must have isPro set, AND
 *  - not past the period end (`proExpiresAt`) — covers "cancel → off at period end", AND
 *  - if in dunning (`past_due`), not past the grace deadline (`proGraceUntil`).
 *
 * The webhook keeps these columns up to date; this function is the single
 * source of truth used by /api/auth/me and content gating.
 */
export function isProActive(user: Pick<User, "isPro" | "subscriptionStatus" | "proExpiresAt" | "proGraceUntil"> | null | undefined): boolean {
  if (!user?.isPro) return false;
  const now = Date.now();

  if (user.proExpiresAt && now > new Date(user.proExpiresAt).getTime()) {
    return false;
  }

  if (
    user.subscriptionStatus === "past_due" &&
    user.proGraceUntil &&
    now > new Date(user.proGraceUntil).getTime()
  ) {
    return false;
  }

  return true;
}

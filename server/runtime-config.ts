function normalizeOrigin(value: string | undefined): string | undefined {
  const candidate = value?.trim();
  if (!candidate) return undefined;
  const withProtocol = /^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`;
  try {
    return new URL(withProtocol).origin;
  } catch {
    return undefined;
  }
}

function isConfigured(value: string | undefined): boolean {
  const normalized = value?.trim().toLowerCase() ?? "";
  if (!normalized) return false;
  return !/(?:replace(?:_me)?|placeholder|yourdomain|your_|example\.com|(?:^|[_-])xxx(?:$|[_-])|(?:^|[_-])123(?:$|[_-]|[a-z]))/.test(normalized);
}

function hasCredentialShape(value: string | undefined, prefix: string, minimumLength: number): boolean {
  const candidate = value?.trim() ?? "";
  return isConfigured(candidate) && candidate.startsWith(prefix) && candidate.length >= minimumLength;
}

function isConfiguredEmail(value: string): boolean {
  return isConfigured(value) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export type CommerceMode = "disabled" | "test" | "live";

export function getCommerceMode(): CommerceMode {
  const candidate = process.env.COMMERCE_MODE?.trim().toLowerCase();
  return candidate === "test" || candidate === "live" ? candidate : "disabled";
}

/** Public origin used for Stripe redirects and transactional links. */
export function getPublicOrigin(): string {
  const previewOrigin = process.env.VERCEL_ENV === "preview" ? normalizeOrigin(process.env.VERCEL_URL) : undefined;
  if (getCommerceMode() === "test" && previewOrigin) return previewOrigin;
  return normalizeOrigin(process.env.PUBLIC_APP_URL)
    ?? normalizeOrigin(process.env.BASE_URL)
    ?? normalizeOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL)
    ?? normalizeOrigin(process.env.VERCEL_URL)
    ?? "http://localhost:5000";
}

export function commercialNotificationRecipients(): string[] {
  const configured = process.env.COMMERCIAL_NOTIFICATION_EMAILS
    ?? process.env.ADMIN_EMAILS
    ?? process.env.ADMIN_EMAIL
    ?? "";
  return Array.from(new Set(configured.split(",").map((email) => email.trim().toLowerCase()).filter(Boolean)));
}

export function runtimeReadiness() {
  const publicOrigin = getPublicOrigin();
  const commerceMode = getCommerceMode();
  const notificationRecipients = commercialNotificationRecipients();
  const databaseUrl = process.env.DATABASE_URL
    || process.env.POSTGRES_URL
    || process.env.POSTGRES_PRISMA_URL
    || process.env.POSTGRES_URL_NON_POOLING;
  const database = isConfigured(databaseUrl);
  const sessions = isConfigured(process.env.SESSION_SECRET) && (process.env.SESSION_SECRET?.trim().length ?? 0) >= 32;
  const stripe = hasCredentialShape(process.env.STRIPE_SECRET_KEY, "sk_", 20)
    && hasCredentialShape(process.env.STRIPE_WEBHOOK_SECRET, "whsec_", 20);
  const stripeMode = process.env.STRIPE_SECRET_KEY?.trim().startsWith("sk_live_")
    ? "live"
    : process.env.STRIPE_SECRET_KEY?.trim().startsWith("sk_test_")
      ? "test"
      : "unconfigured";
  const scopeDiagnostic = hasCredentialShape(process.env.STRIPE_SCOPE_DIAGNOSTIC_PRICE_ID, "price_", 15)
    && process.env.STRIPE_SCOPE_DIAGNOSTIC_PRICE_ID?.trim() !== "price_scope_diagnostic";
  const email = hasCredentialShape(process.env.RESEND_API_KEY, "re_", 15)
    && isConfigured(process.env.EMAIL_FROM)
    && /<[^\s@]+@[^\s@]+\.[^\s@]+>|^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(process.env.EMAIL_FROM?.trim() ?? "");
  const commercialNotifications = notificationRecipients.some(isConfiguredEmail);
  const publicOriginConfigured = publicOrigin !== "http://localhost:5000" && !/\.vercel\.app$/i.test(publicOrigin);
  const sharedCommercialBasis = database && sessions && stripe && scopeDiagnostic && email && commercialNotifications;
  const diagnosticTestReady = commerceMode === "test" && stripeMode === "test" && sharedCommercialBasis;
  const commerceReady = commerceMode === "live"
    && stripeMode === "live"
    && process.env.VERCEL_ENV !== "preview"
    && sharedCommercialBasis
    && publicOriginConfigured;
  return {
    commerceMode,
    database,
    sessions,
    stripe,
    stripeMode,
    scopeDiagnostic,
    email,
    commercialNotifications,
    analytics: hasCredentialShape(process.env.VITE_POSTHOG_KEY, "phc_", 15),
    cron: isConfigured(process.env.CRON_SECRET) && (process.env.CRON_SECRET?.trim().length ?? 0) >= 32,
    publicOriginConfigured,
    publicOrigin,
    origin: publicOrigin,
    diagnosticTestReady,
    commerceReady,
  };
}

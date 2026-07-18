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

/** Public origin used for Stripe redirects and transactional links. */
export function getPublicOrigin(): string {
  return normalizeOrigin(process.env.BASE_URL)
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
  const notificationRecipients = commercialNotificationRecipients();
  const databaseUrl = process.env.DATABASE_URL
    || process.env.POSTGRES_URL
    || process.env.POSTGRES_PRISMA_URL
    || process.env.POSTGRES_URL_NON_POOLING;
  return {
    database: isConfigured(databaseUrl),
    sessions: isConfigured(process.env.SESSION_SECRET) && (process.env.SESSION_SECRET?.trim().length ?? 0) >= 32,
    stripe: hasCredentialShape(process.env.STRIPE_SECRET_KEY, "sk_", 20)
      && hasCredentialShape(process.env.STRIPE_WEBHOOK_SECRET, "whsec_", 20),
    scopeDiagnostic: hasCredentialShape(process.env.STRIPE_SCOPE_DIAGNOSTIC_PRICE_ID, "price_", 15)
      && process.env.STRIPE_SCOPE_DIAGNOSTIC_PRICE_ID?.trim() !== "price_scope_diagnostic",
    email: hasCredentialShape(process.env.RESEND_API_KEY, "re_", 15)
      && isConfigured(process.env.EMAIL_FROM)
      && /<[^\s@]+@[^\s@]+\.[^\s@]+>|^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(process.env.EMAIL_FROM?.trim() ?? ""),
    commercialNotifications: notificationRecipients.some(isConfiguredEmail),
    analytics: hasCredentialShape(process.env.VITE_POSTHOG_KEY, "phc_", 15),
    cron: isConfigured(process.env.CRON_SECRET) && (process.env.CRON_SECRET?.trim().length ?? 0) >= 32,
    publicOriginConfigured: publicOrigin !== "http://localhost:5000" && !/\.vercel\.app$/i.test(publicOrigin),
    publicOrigin,
  };
}

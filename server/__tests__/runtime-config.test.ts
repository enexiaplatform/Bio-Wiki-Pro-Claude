import { afterEach, describe, expect, it, vi } from "vitest";
import { commercialNotificationRecipients, getPublicOrigin, runtimeReadiness } from "../runtime-config.js";

afterEach(() => vi.unstubAllEnvs());

describe("runtime configuration", () => {
  it("prefers the explicit public base URL", () => {
    vi.stubEnv("BASE_URL", "https://atlas.example.com/path");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "fallback.vercel.app");
    expect(getPublicOrigin()).toBe("https://atlas.example.com");
  });

  it("uses the Vercel production origin when a custom domain is not attached", () => {
    vi.stubEnv("BASE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "atlas-production.vercel.app");
    expect(getPublicOrigin()).toBe("https://atlas-production.vercel.app");
  });

  it("accepts the pooled Postgres variable injected by a Vercel integration", () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("POSTGRES_URL", "postgresql://atlas:secret@db.internal:5432/atlas");
    expect(runtimeReadiness()).toMatchObject({ database: true });
  });

  it("deduplicates commercial notification recipients", () => {
    vi.stubEnv("COMMERCIAL_NOTIFICATION_EMAILS", "Owner@example.com, owner@example.com, ops@example.com");
    expect(commercialNotificationRecipients()).toEqual(["owner@example.com", "ops@example.com"]);
  });

  it("reports commercial dependencies without exposing secret values", () => {
    vi.stubEnv("DATABASE_URL", "postgresql://atlas:secret@db.internal:5432/atlas");
    vi.stubEnv("SESSION_SECRET", "a-production-session-secret-longer-than-32-chars");
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_51AtlasConfiguredKey");
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_atlasConfiguredSecret");
    vi.stubEnv("STRIPE_SCOPE_DIAGNOSTIC_PRICE_ID", "price_1AtlasDiagnostic");
    const readiness = runtimeReadiness();
    expect(readiness).toMatchObject({ database: true, sessions: true, stripe: true, scopeDiagnostic: true });
    expect(JSON.stringify(readiness)).not.toContain("51AtlasConfiguredKey");
  });

  it("does not report obvious placeholder credentials as ready", () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_123");
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_123");
    vi.stubEnv("STRIPE_SCOPE_DIAGNOSTIC_PRICE_ID", "price_scope_diagnostic");
    vi.stubEnv("RESEND_API_KEY", "re_123abc");
    vi.stubEnv("EMAIL_FROM", "Life Science Atlas <no-reply@yourdomain.com>");
    vi.stubEnv("COMMERCIAL_NOTIFICATION_EMAILS", "owner@yourdomain.com");
    expect(runtimeReadiness()).toMatchObject({
      stripe: false,
      scopeDiagnostic: false,
      email: false,
      commercialNotifications: false,
    });
  });

  it("does not treat localhost or a temporary Vercel hostname as a launch origin", () => {
    vi.stubEnv("BASE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "atlas-production.vercel.app");
    expect(runtimeReadiness()).toMatchObject({
      publicOrigin: "https://atlas-production.vercel.app",
      publicOriginConfigured: false,
    });
  });
});

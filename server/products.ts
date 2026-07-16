// ============================================================================
// PRODUCT CATALOG — single source of truth for all sellable products.
//
// Maps each internal productId (used as Stripe metadata.productType and in the
// client checkout call) to: display name, checkout mode, the env var holding
// its Stripe Price ID, and the env var holding its download URL (one-time
// deliverables only). routes.ts and email.ts both derive their behavior from
// here so there is exactly ONE place to add/edit a product.
// ============================================================================

export type ProductMode = "payment" | "subscription";

export interface ProductConfig {
  /** Internal key — also the value stored in Stripe session metadata.productType */
  id: string;
  /** Human-facing name (emails, receipts, UI) */
  name: string;
  /** Stripe Checkout mode: one-time vs recurring */
  mode: ProductMode;
  /** Name of the env var that holds this product's Stripe Price ID */
  priceEnv: string;
  /** Name of the env var that holds the download URL (omit for subscriptions) */
  downloadEnv?: string;
}

export const PRODUCTS: Record<string, ProductConfig> = {
  scope_diagnostic: {
    id: "scope_diagnostic",
    name: "Atlas Paid Scope Diagnostic",
    mode: "payment",
    priceEnv: "STRIPE_SCOPE_DIAGNOSTIC_PRICE_ID",
  },
  gmp_audit_kit: {
    id: "gmp_audit_kit",
    name: "GMP Audit Readiness Kit",
    mode: "payment",
    priceEnv: "STRIPE_GMP_AUDIT_KIT_PRICE_ID",
    downloadEnv: "DOWNLOAD_GMP_AUDIT_KIT",
  },
  starter_kit: {
    id: "starter_kit",
    name: "Career Starter Kit",
    mode: "payment",
    priceEnv: "STRIPE_STARTER_KIT_PRICE_ID",
    downloadEnv: "DOWNLOAD_STARTER_KIT",
  },
  interview_prep: {
    id: "interview_prep",
    name: "Interview Prep Package",
    mode: "payment",
    priceEnv: "STRIPE_INTERVIEW_PREP_PRICE_ID",
    downloadEnv: "DOWNLOAD_INTERVIEW_PREP",
  },
  bundle: {
    id: "bundle",
    name: "Career Accelerator Bundle",
    mode: "payment",
    priceEnv: "STRIPE_BUNDLE_PRICE_ID",
    downloadEnv: "DOWNLOAD_BUNDLE",
  },
  pro_subscription: {
    id: "pro_subscription",
    name: "Life Science Atlas Pro",
    mode: "subscription",
    priceEnv: "STRIPE_PRO_PRICE_ID",
    // no downloadEnv — entitlement is granted via the subscription, not a file
  },
  pro_subscription_annual: {
    id: "pro_subscription_annual",
    name: "Life Science Atlas Pro (Annual)",
    mode: "subscription",
    priceEnv: "STRIPE_PRO_ANNUAL_PRICE_ID",
    // no downloadEnv — same Pro entitlement, billed yearly
  },
};

/** True when this product has a configured Stripe price (i.e. it's sellable). */
export function isProductAvailable(id: string): boolean {
  return getPriceId(id) !== "";
}

/** Look up a product config by id. Returns undefined for unknown ids. */
export function getProduct(id: string): ProductConfig | undefined {
  return PRODUCTS[id];
}

/**
 * Resolve the Stripe Price ID for a product. Read lazily from process.env so
 * env changes (and serverless cold starts) are always picked up. Returns "" if
 * the product is unknown or its price env var is unset.
 */
export function getPriceId(id: string): string {
  const p = PRODUCTS[id];
  if (!p) return "";
  return process.env[p.priceEnv] ?? "";
}

/**
 * Resolve the download URL for a one-time product. Returns undefined for
 * subscriptions or when the env var is unset (callers should degrade
 * gracefully rather than email a broken link).
 */
export function getDownloadUrl(id: string): string | undefined {
  const p = PRODUCTS[id];
  if (!p?.downloadEnv) return undefined;
  return process.env[p.downloadEnv] || undefined;
}

/** Display name for a product, falling back to the raw id if unknown. */
export function getProductName(id: string): string {
  return PRODUCTS[id]?.name ?? id;
}

/** Whether a product is a recurring subscription (vs one-time payment). */
export function isSubscription(id: string): boolean {
  return PRODUCTS[id]?.mode === "subscription";
}

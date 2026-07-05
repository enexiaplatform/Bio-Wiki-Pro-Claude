// Single source of truth for the public site origin (client side).
// Build-time env (VITE_*) — set VITE_SITE_URL on Vercel when the custom domain
// goes live, then redeploy. Falls back to the Vercel preview domain.
export const SITE_URL =
  (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") ??
  "https://lifescienceatlas.com";

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.svg`;

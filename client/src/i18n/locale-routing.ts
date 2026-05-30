import { isSupportedLng, DEFAULT_LNG, type Lng } from "./index";

export const LANG_COOKIE = "lang";
const ONE_YEAR = 60 * 60 * 24 * 365;

/** Read the language segment from a pathname, e.g. "/en/pricing" → "en". */
export function getLangFromPath(pathname: string): Lng | null {
  const seg = pathname.split("/")[1];
  return isSupportedLng(seg) ? (seg as Lng) : null;
}

/** Remove the leading /vi or /en prefix. "/en/pricing" → "/pricing", "/en" → "/". */
export function stripLangPrefix(pathname: string): string {
  const rest = pathname.replace(/^\/(vi|en)(?=\/|$)/, "");
  return rest === "" ? "/" : rest;
}

/** Build an absolute, language-prefixed path. (lng="en", "/pricing") → "/en/pricing". */
export function withLang(lng: Lng, pathname: string): string {
  const clean = stripLangPrefix(pathname);
  return clean === "/" ? `/${lng}` : `/${lng}${clean}`;
}

export function readLangCookie(): Lng | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|;\s*)lang=(vi|en)/);
  return m && isSupportedLng(m[1]) ? (m[1] as Lng) : null;
}

export function writeLangCookie(lng: Lng): void {
  if (typeof document === "undefined") return;
  document.cookie = `${LANG_COOKIE}=${lng}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
}

/** Cookie → navigator.language → default. Used when the URL has no lang prefix. */
export function detectInitialLang(): Lng {
  const cookie = readLangCookie();
  if (cookie) return cookie;
  if (typeof navigator !== "undefined") {
    const nav = navigator.language?.slice(0, 2);
    if (isSupportedLng(nav)) return nav as Lng;
  }
  return DEFAULT_LNG;
}

import i18n, { type Resource, type ResourceLanguage } from "i18next";
import { initReactI18next } from "react-i18next";

export const SUPPORTED_LNGS = ["en", "vi"] as const;
export type Lng = (typeof SUPPORTED_LNGS)[number];
// English is the primary language (global product); vi is the translation.
export const DEFAULT_LNG: Lng = "en";

export const NAMESPACES = [
  "common",
  "nav",
  "landing",
  "pricing",
  "academy",
  "footer",
  "upgrade",
  "onboarding",
  "auth",
  "pages",
  "gmpkit",
  "sections",
] as const;

export function isSupportedLng(value: string | undefined | null): value is Lng {
  return !!value && (SUPPORTED_LNGS as readonly string[]).includes(value);
}

// Bundle every locale JSON at build time: ./locales/{lng}/{ns}.json
// (eager glob — small files, works offline, deterministic. Swap to an
// i18next backend later if lazy network loading becomes necessary.)
const modules = import.meta.glob("./locales/*/*.json", { eager: true });
const resources: Resource = {};
for (const path in modules) {
  const match = path.match(/\.\/locales\/([^/]+)\/([^/]+)\.json$/);
  if (!match) continue;
  const [, lng, ns] = match;
  const bucket: ResourceLanguage = (resources[lng] ??= {});
  bucket[ns] = (modules[path] as { default: ResourceLanguage[string] }).default;
}

i18n.use(initReactI18next).init({
  resources,
  lng: DEFAULT_LNG,
  fallbackLng: DEFAULT_LNG,
  supportedLngs: SUPPORTED_LNGS as unknown as string[],
  ns: NAMESPACES as unknown as string[],
  defaultNS: "common",
  interpolation: { escapeValue: false },
  // Empty strings in the EN placeholder files fall back to VI instead of
  // rendering blank.
  returnEmptyString: false,
});

export default i18n;

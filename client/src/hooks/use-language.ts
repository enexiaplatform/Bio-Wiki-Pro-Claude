import { DEFAULT_LNG, type Lng } from "@/i18n";

/**
 * English-only product. Kept as a tiny hook so existing call sites that read
 * `language` (content loader lookups) don't need to change.
 */
export function useLanguage(): { language: Lng } {
  return { language: DEFAULT_LNG };
}

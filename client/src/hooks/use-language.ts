import { useTranslation } from "react-i18next";
import { isSupportedLng, DEFAULT_LNG, SUPPORTED_LNGS, type Lng } from "@/i18n";

/**
 * Convenience hook around i18next language state.
 * `changeLanguage` only updates i18n here; locale-routing (Sprint 2.2) wires
 * the URL prefix + cookie on top of it.
 */
export function useLanguage() {
  const { i18n } = useTranslation();
  const language: Lng = isSupportedLng(i18n.language) ? i18n.language : DEFAULT_LNG;

  return {
    language,
    supported: SUPPORTED_LNGS,
    changeLanguage: (lng: Lng) => i18n.changeLanguage(lng),
  };
}

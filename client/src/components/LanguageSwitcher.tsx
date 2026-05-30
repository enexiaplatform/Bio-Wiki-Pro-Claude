import { navigate } from "wouter/use-browser-location";
import clsx from "clsx";
import { useLanguage } from "@/hooks/use-language";
import { withLang } from "@/i18n/locale-routing";
import { SUPPORTED_LNGS, type Lng } from "@/i18n";

/**
 * Toggles the URL language prefix (e.g. /en/pricing ↔ /vi/pricing). Navigation
 * is absolute (bypasses the Router base) so it actually changes the prefix;
 * LocalizedRouter then syncs i18n.language + cookie from the new segment.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { language } = useLanguage();

  function switchTo(lng: Lng) {
    if (lng === language) return;
    navigate(withLang(lng, window.location.pathname));
  }

  return (
    <div
      className={clsx("inline-flex items-center rounded-lg border border-white/10 bg-white/5 p-0.5 text-xs", className)}
      role="group"
      aria-label="Language"
    >
      {SUPPORTED_LNGS.map((lng) => (
        <button
          key={lng}
          type="button"
          onClick={() => switchTo(lng)}
          aria-pressed={lng === language}
          className={clsx(
            "px-2 py-1 rounded-md font-semibold uppercase transition-colors",
            lng === language
              ? "bg-primary/20 text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
          data-testid={`lang-switch-${lng}`}
        >
          {lng}
        </button>
      ))}
    </div>
  );
}

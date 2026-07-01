import { useEffect } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Crown, Sparkles } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { analytics } from "@/hooks/use-analytics";

// Fires upgrade_prompt_shown once when a prompt mounts for a non-Pro user.
function useShown(placement: string, active: boolean) {
  useEffect(() => {
    if (active) analytics.upgradePromptShown(placement);
  }, [placement, active]);
}

/**
 * Soft nudge once the reader has consumed a few free articles.
 * Hidden for Pro users and below the threshold. Mobile-safe (stacks).
 */
export function FreeReadBanner({ count, threshold = 2 }: { count: number; threshold?: number }) {
  const { t } = useTranslation("upgrade");
  const { isPro } = useUser();
  const active = !isPro && count >= threshold;
  useShown("free_read_banner", active);
  if (!active) return null;

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 mb-6 flex flex-col sm:flex-row sm:items-center gap-3 print:hidden">
      <Sparkles className="w-5 h-5 text-primary shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{t("prompt.readCount", { count })}</p>
        <p className="text-xs text-muted-foreground">{t("prompt.bannerDesc")}</p>
      </div>
      <Link
        href="/upgrade"
        onClick={() => analytics.upgradePromptClicked("free_read_banner")}
        className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Crown className="w-4 h-4" /> {t("prompt.cta")}
      </Link>
    </div>
  );
}

/** End-of-article Pro CTA on free content. */
export function UpgradeInlineCTA({ placement = "article_end" }: { placement?: string }) {
  const { t } = useTranslation("upgrade");
  const { isPro } = useUser();
  useShown(placement, !isPro);
  if (isPro) return null;

  return (
    <div className="mt-10 rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/10 to-transparent p-6 text-center print:hidden">
      <div className="w-11 h-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center mx-auto mb-3">
        <Crown className="w-5 h-5" />
      </div>
      <h3 className="font-bold mb-1">{t("prompt.inlineTitle")}</h3>
      <p className="text-sm text-muted-foreground mb-4">{t("prompt.inlineDesc")}</p>
      <Link
        href="/upgrade"
        onClick={() => analytics.upgradePromptClicked(placement)}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Crown className="w-4 h-4" /> {t("prompt.cta")}
      </Link>
    </div>
  );
}

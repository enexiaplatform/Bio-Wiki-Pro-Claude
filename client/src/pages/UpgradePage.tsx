import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Minus, Crown, Loader2, Settings, Lock, ChevronRight } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";
import { analytics } from "@/hooks/use-analytics";
import { listContent } from "@/lib/content";
import { useLanguage } from "@/hooks/use-language";

type FeatureKey =
  | "academyFree"
  | "academyPro"
  | "sops"
  | "tools"
  | "insights"
  | "support"
  | "earlyAccess";

// [featureKey, includedInFree, includedInPro]
const MATRIX: [FeatureKey, boolean, boolean][] = [
  ["academyFree", true, true],
  ["academyPro", false, true],
  ["sops", false, true],
  ["tools", false, true],
  ["insights", false, true],
  ["support", false, true],
  ["earlyAccess", false, true],
];

export default function UpgradePage() {
  const { t } = useTranslation("upgrade");
  const { language } = useLanguage();
  const { isAuthenticated, isPro } = useUser();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [annualAvailable, setAnnualAvailable] = useState(false);
  const [trialDays, setTrialDays] = useState(0);
  const [plan, setPlan] = useState<"monthly" | "annual">("monthly");

  const proLessons = listContent({ collection: "academy", lang: language }).filter((e) => e.tier === "pro");

  useSEO({ title: t("title"), description: t("subtitle") });

  // Show the annual option only when it has a configured Stripe price.
  useEffect(() => {
    let active = true;
    fetch("/api/billing/plans", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        if (d?.annual) setAnnualAvailable(true);
        if (typeof d?.trialDays === "number") setTrialDays(d.trialDays);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  async function subscribe() {
    const productType = plan === "annual" ? "pro_subscription_annual" : "pro_subscription";
    setBusy(true);
    setError("");
    analytics.subscriptionStarted(productType);
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productType }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.message ?? t("error"));
      window.location.href = data.url;
    } catch (e: any) {
      setError(e.message ?? t("error"));
      setBusy(false);
    }
  }

  async function manage() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/customer-portal", { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.message ?? t("error"));
      window.location.href = data.url;
    } catch (e: any) {
      setError(e.message ?? t("error"));
      setBusy(false);
    }
  }

  return (
    <div className="pb-24 pt-4 md:pt-8 max-w-3xl mx-auto px-4">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-5">
          <Crown className="w-4 h-4" />
          <span className="text-sm font-bold uppercase tracking-wider">{t("badge")}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">{t("title")}</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">{t("subtitle")}</p>

        {annualAvailable && !isPro && (
          <div className="mt-5 inline-flex items-center gap-1 rounded-full border border-white/10 bg-card p-1" role="tablist">
            {(["monthly", "annual"] as const).map((p) => (
              <button
                key={p}
                role="tab"
                aria-selected={plan === p}
                onClick={() => setPlan(p)}
                className={
                  "px-4 py-1.5 rounded-full text-sm font-semibold transition-colors " +
                  (plan === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")
                }
              >
                {p === "monthly" ? "Monthly" : "Annual"}
                {p === "annual" && <span className="ml-1.5 text-[10px] font-bold text-emerald-400">2 months free</span>}
              </button>
            ))}
          </div>
        )}

        <div className="mt-5 flex items-center justify-center gap-1">
          {plan === "annual" && annualAvailable ? (
            <>
              <span className="text-4xl font-bold">{t("price")}</span>
              <span className="text-muted-foreground">/mo · billed yearly</span>
            </>
          ) : (
            <>
              <span className="text-4xl font-bold">{t("price")}</span>
              <span className="text-muted-foreground">{t("perMonth")}</span>
            </>
          )}
        </div>

        {trialDays > 0 && !isPro && (
          <p className="mt-3 text-sm font-medium text-emerald-400">
            Start with a {trialDays}-day free trial — cancel anytime before it ends and you won't be charged.
          </p>
        )}
      </div>

      {/* Comparison */}
      <Card className="overflow-hidden border-white/10 mb-8">
        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-6 px-5 py-3 border-b border-white/10 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span>{t("compare.feature")}</span>
          <span className="text-center w-14">{t("compare.free")}</span>
          <span className="text-center w-14">{t("compare.pro")}</span>
        </div>
        {MATRIX.map(([key, free, pro]) => (
          <div
            key={key}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-x-6 px-5 py-3 border-b border-white/5 last:border-0 text-sm"
          >
            <span>{t(`features.${key}`)}</span>
            <span className="flex justify-center w-14">
              {free ? <Check className="w-4 h-4 text-primary" /> : <Minus className="w-4 h-4 text-muted-foreground/40" />}
            </span>
            <span className="flex justify-center w-14">
              {pro ? <Check className="w-4 h-4 text-primary" /> : <Minus className="w-4 h-4 text-muted-foreground/40" />}
            </span>
          </div>
        ))}
      </Card>

      {/* What's inside Pro — concrete value: the actual Pro library */}
      {!isPro && proLessons.length > 0 && (
        <Card className="border-white/10 p-5 md:p-6 mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Crown className="w-4 h-4 text-primary" />
            <h2 className="font-bold">{t("inside.title")}</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {t("inside.subtitle", { count: proLessons.length })}
          </p>
          <ul className="grid gap-2 sm:grid-cols-2 mb-4">
            {proLessons.map((e) => (
              <li key={e.slug} className="flex items-start gap-2 text-sm">
                <Lock className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{e.title}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/academy?tier=pro"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            {t("inside.browse")} <ChevronRight className="w-4 h-4" />
          </Link>
        </Card>
      )}

      {/* CTA — depends on current user state */}
      <div className="text-center">
        {isPro ? (
          <>
            <Badge className="mb-4 bg-primary/15 text-primary border-primary/20">
              <Crown className="w-3 h-3 mr-1" /> {t("proActive")}
            </Badge>
            <Button
              size="lg"
              variant="outline"
              className="w-full max-w-sm font-bold"
              disabled={busy}
              onClick={manage}
              data-testid="button-manage-subscription"
            >
              {busy ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Settings className="w-5 h-5 mr-2" />}
              {busy ? t("cta.loading") : t("cta.manage")}
            </Button>
          </>
        ) : isAuthenticated ? (
          <Button
            size="lg"
            className="w-full max-w-sm font-bold text-base"
            disabled={busy}
            onClick={subscribe}
            data-testid="button-subscribe-pro"
          >
            {busy ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Crown className="w-5 h-5 mr-2" />}
            {busy ? t("cta.loading") : trialDays > 0 ? `Start ${trialDays}-day free trial` : t("cta.subscribe")}
          </Button>
        ) : (
          <Button size="lg" className="w-full max-w-sm font-bold text-base" asChild data-testid="button-login-to-upgrade">
            <Link href="/login">{t("cta.login")}</Link>
          </Button>
        )}

        {error && <p className="text-sm text-red-400 mt-3">{error}</p>}
      </div>
    </div>
  );
}

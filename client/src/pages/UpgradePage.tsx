import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Minus, Crown, Loader2, Settings } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";

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
  const { isAuthenticated, isPro } = useUser();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useSEO({ title: t("title"), description: t("subtitle") });

  async function go(endpoint: string, method: "POST" | "GET") {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: method === "POST" ? JSON.stringify({ productType: "pro_subscription" }) : undefined,
      });
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
        <div className="mt-5 flex items-center justify-center gap-1">
          <span className="text-4xl font-bold">{t("price")}</span>
          <span className="text-muted-foreground">{t("perMonth")}</span>
        </div>
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
              onClick={() => go("/api/stripe/customer-portal", "GET")}
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
            onClick={() => go("/api/stripe/create-checkout-session", "POST")}
            data-testid="button-subscribe-pro"
          >
            {busy ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Crown className="w-5 h-5 mr-2" />}
            {busy ? t("cta.loading") : t("cta.subscribe")}
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

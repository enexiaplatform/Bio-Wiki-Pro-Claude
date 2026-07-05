import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { CheckCircle2, Lock, Zap, Package } from "lucide-react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useUser } from "@/context/UserContext";
import { useSEO } from "@/hooks/use-seo";
import { analytics } from "@/hooks/use-analytics";
import { JsonLd } from "@/components/JsonLd";
import { TrustBadges } from "@/components/TrustBadges";

type ProductType = "pro_subscription" | "pro_subscription_annual" | "starter_kit" | "interview_prep" | "bundle";
const pillClass = "inline-flex items-center gap-2 rounded-full border border-teal-400/20 bg-teal-400/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-teal-300";
const planCardClass = "rounded-lg border border-white/10 bg-white/[0.045] p-6 shadow-lg shadow-black/10";
const primaryButtonClass = "w-full rounded-lg bg-teal-400 py-2.5 text-sm font-bold text-teal-950 transition-all hover:-translate-y-0.5 hover:bg-teal-300 disabled:cursor-wait disabled:opacity-60";
const ONE_TIME_PRODUCTS: { productType: Exclude<ProductType, "pro_subscription">; price: string }[] = [
  { productType: "starter_kit", price: "$15" },
  { productType: "interview_prep", price: "$20" },
  { productType: "bundle", price: "$30" },
];

async function createCheckoutSession(productType: ProductType): Promise<string> {
  const res = await fetch("/api/stripe/create-checkout-session", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productType }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "Failed to start checkout");
  }
  const { url } = await res.json();
  return url;
}

export default function PricingPage() {
  const { t } = useTranslation("pricing");
  useSEO({ title: t("seoTitle"), description: t("seoDesc") });
  const freeFeatures = t("free.features", { returnObjects: true }) as string[];
  const proFeatures = t("pro.features", { returnObjects: true }) as string[];
  const faqs = t("faq", { returnObjects: true }) as { q: string; a: string }[];
  const { isAuthenticated, isPro } = useUser();
  const [, navigate] = useLocation();
  const [loadingProduct, setLoadingProduct] = useState<ProductType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [annualAvailable, setAnnualAvailable] = useState(false);
  const [trialDays, setTrialDays] = useState(0);
  const [proPlan, setProPlan] = useState<"monthly" | "annual">("monthly");
  const proProductType: ProductType = proPlan === "annual" ? "pro_subscription_annual" : "pro_subscription";

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
    return () => { active = false; };
  }, []);

  async function handleCheckout(productType: ProductType) {
    if (!isAuthenticated) {
      navigate("/register");
      return;
    }
    setLoadingProduct(productType);
    setError(null);
    analytics.checkoutStarted(productType);
    try {
      const url = await createCheckoutSession(productType);
      window.location.href = url;
    } catch (err: any) {
      setError(err.message ?? t("genericError"));
      setLoadingProduct(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-4 md:pt-8">
      {Array.isArray(faqs) && faqs.length > 0 && (
        <JsonLd
          id="pricing-faq"
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }}
        />
      )}
      <section className="relative mb-8 overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-teal-400/10 via-white/[0.04] to-transparent p-5 text-center shadow-xl shadow-black/10 md:p-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_10%,rgba(20,184,166,0.18),transparent_30%),radial-gradient(circle_at_86%_18%,rgba(16,185,129,0.1),transparent_28%)]" />
        <span className={`${pillClass} mb-5`}>
          <Zap className="h-3.5 w-3.5" />
          Life Science Atlas Pro
        </span>
        <h1 className="mx-auto mb-4 max-w-3xl font-display text-3xl font-bold leading-tight md:text-5xl">
          {t("title")}
        </h1>
        <p className="mx-auto max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
          {t("subtitle")}
        </p>
        <div className="mx-auto mt-6 grid max-w-3xl gap-2 rounded-lg border border-white/10 bg-slate-950/45 p-3 text-left sm:grid-cols-3">
          {[
            "Workflow-backed lessons",
            "Pro templates and toolkits",
            "Free tools stay available",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-300" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {error && (
        <div className="mb-8 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-center text-sm text-red-400">
          {error}
        </div>
      )}

      {/* 3-column plan cards */}
      <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-3">

        {/* Free */}
        <div className={`${planCardClass} flex flex-col`}>
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-white/5 px-2 py-1 rounded w-fit mb-4">
            {t("free.badge")}
          </span>
          <div className="mb-6">
            <span className="text-4xl font-bold">$0</span>
            <span className="text-muted-foreground text-sm ml-1">{t("perMonth")}</span>
          </div>
          <ul className="space-y-3 mb-8 flex-1">
            {freeFeatures.map(f => (
              <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-white/30 shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
          <Link href="/register">
            <button className="w-full rounded-lg border border-white/10 py-2.5 text-sm font-semibold transition-colors hover:border-white/30 hover:bg-white/5">
              {t("free.cta")}
            </button>
          </Link>
        </div>

        {/* Pro */}
        <div className="relative flex flex-col rounded-lg border-2 border-teal-400/60 bg-white/[0.06] p-6 shadow-[0_0_40px_rgba(20,184,166,0.16)]">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <span className="rounded-full bg-teal-400 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-950">
              {t("pro.popular")}
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-teal-400 bg-teal-500/10 px-2 py-1 rounded w-fit mb-4">
            {t("pro.badge")}
          </span>
          {annualAvailable && !isPro && (
            <div className="mb-3 inline-flex w-fit items-center gap-1 rounded-lg border border-white/10 bg-background/60 p-0.5">
              {(["monthly", "annual"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setProPlan(p)}
                  className={clsx(
                    "rounded-md px-3 py-1 text-xs font-semibold transition-colors",
                    proPlan === p ? "bg-teal-400 text-teal-950" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {p === "monthly" ? "Monthly" : "Annual"}
                </button>
              ))}
            </div>
          )}
          <div className="mb-6">
            <span className="text-4xl font-bold text-teal-400">$8</span>
            <span className="text-muted-foreground text-sm ml-1">
              {proPlan === "annual" && annualAvailable ? "/mo · billed yearly" : t("perMonth")}
            </span>
            {proPlan === "annual" && annualAvailable && (
              <span className="ml-2 text-[11px] font-bold text-emerald-400">2 months free</span>
            )}
          </div>
          <ul className="space-y-3 mb-8 flex-1">
            {proFeatures.map(f => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
          {isPro ? (
            <button
              disabled
              className="w-full cursor-default rounded-lg bg-teal-500/20 py-2.5 text-sm font-semibold text-teal-300"
            >
              {t("pro.current")}
            </button>
          ) : (
            <button
              onClick={() => handleCheckout(proProductType)}
              disabled={loadingProduct === proProductType}
              className={clsx(
                primaryButtonClass,
                loadingProduct === proProductType && "opacity-60 cursor-wait"
              )}
            >
              {loadingProduct === proProductType
                ? t("pro.redirecting")
                : trialDays > 0
                ? `Start ${trialDays}-day free trial`
                : t("pro.cta")}
            </button>
          )}
          {trialDays > 0 && !isPro && (
            <p className="mt-2 text-center text-[11px] text-emerald-400 font-medium">
              {trialDays}-day free trial · cancel anytime
            </p>
          )}
        </div>

        {/* Career Products */}
        <div className={`${planCardClass} flex flex-col`}>
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded w-fit mb-4">
            {t("oneTime.badge")}
          </span>
          <p className="text-sm text-muted-foreground mb-6">
            {t("oneTime.intro")}
          </p>
          <ul className="space-y-4 flex-1 mb-8">
            {ONE_TIME_PRODUCTS.map(p => (
              <li key={p.productType} className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{t(`products.${p.productType}.label`)}</div>
                  <div className="text-xs text-muted-foreground">{p.price}</div>
                </div>
                <button
                  onClick={() => handleCheckout(p.productType)}
                  disabled={loadingProduct === p.productType}
                  className={clsx(
                    "whitespace-nowrap rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold transition-all hover:border-teal-400 hover:bg-teal-400 hover:text-teal-950",
                    loadingProduct === p.productType && "opacity-60 cursor-wait"
                  )}
                >
                  {loadingProduct === p.productType ? "…" : t("oneTime.buy")}
                </button>
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-muted-foreground text-center">
            {t("oneTime.note")}
          </p>
        </div>
      </div>

      {/* Trust strip */}
      <TrustBadges className="mb-12" />

      {/* FAQ row */}
      <div className="grid grid-cols-1 gap-4 text-center sm:grid-cols-3">
        {faqs.map((item, i) => (
          <div key={item.q} className="rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-lg shadow-black/10">
            {[<Lock className="w-5 h-5 mx-auto mb-2 text-teal-400" />, <Zap className="w-5 h-5 mx-auto mb-2 text-teal-400" />, <Package className="w-5 h-5 mx-auto mb-2 text-teal-400" />][i]}
            <p className="text-sm font-semibold mb-1">{item.q}</p>
            <p className="text-xs text-muted-foreground">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

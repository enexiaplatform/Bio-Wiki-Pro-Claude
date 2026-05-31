import { useState } from "react";
import { Link, useLocation } from "wouter";
import { CheckCircle2, Lock, Zap, Package } from "lucide-react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useUser } from "@/context/UserContext";
import { useSEO } from "@/hooks/use-seo";
import { analytics } from "@/hooks/use-analytics";

type ProductType = "pro_subscription" | "starter_kit" | "interview_prep" | "bundle";
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
    <div className="pb-24 pt-4 md:pt-8 max-w-5xl mx-auto px-4">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 font-display text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
          {t("title")}
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          {t("subtitle")}
        </p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {/* 3-column plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">

        {/* Free */}
        <div className="bg-card border border-white/10 rounded-2xl p-7 flex flex-col">
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
            <button className="w-full py-2.5 rounded-xl border border-white/10 text-sm font-semibold hover:border-white/30 transition-colors">
              {t("free.cta")}
            </button>
          </Link>
        </div>

        {/* Pro */}
        <div className="bg-card border-2 border-teal-500/60 rounded-2xl p-7 flex flex-col relative shadow-[0_0_40px_rgba(20,184,166,0.12)]">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <span className="bg-teal-500 text-teal-950 text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full">
              {t("pro.popular")}
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-teal-400 bg-teal-500/10 px-2 py-1 rounded w-fit mb-4">
            {t("pro.badge")}
          </span>
          <div className="mb-6">
            <span className="text-4xl font-bold text-teal-400">$8</span>
            <span className="text-muted-foreground text-sm ml-1">{t("perMonth")}</span>
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
              className="w-full py-2.5 rounded-xl bg-teal-500/20 text-teal-400 text-sm font-semibold cursor-default"
            >
              {t("pro.current")}
            </button>
          ) : (
            <button
              onClick={() => handleCheckout("pro_subscription")}
              disabled={loadingProduct === "pro_subscription"}
              className={clsx(
                "w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-teal-950 text-sm font-bold transition-all",
                loadingProduct === "pro_subscription" && "opacity-60 cursor-wait"
              )}
            >
              {loadingProduct === "pro_subscription" ? t("pro.redirecting") : t("pro.cta")}
            </button>
          )}
        </div>

        {/* Career Products */}
        <div className="bg-card border border-white/10 rounded-2xl p-7 flex flex-col">
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
                    "text-xs font-bold px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-teal-500 hover:text-teal-950 hover:border-teal-500 transition-all whitespace-nowrap",
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

      {/* FAQ row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        {faqs.map((item, i) => (
          <div key={item.q} className="bg-card border border-white/5 rounded-xl p-5">
            {[<Lock className="w-5 h-5 mx-auto mb-2 text-teal-400" />, <Zap className="w-5 h-5 mx-auto mb-2 text-teal-400" />, <Package className="w-5 h-5 mx-auto mb-2 text-teal-400" />][i]}
            <p className="text-sm font-semibold mb-1">{item.q}</p>
            <p className="text-xs text-muted-foreground">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

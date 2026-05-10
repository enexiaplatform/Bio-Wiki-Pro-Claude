import { useState } from "react";
import { Link, useLocation } from "wouter";
import { CheckCircle2, Lock, Zap, Package } from "lucide-react";
import clsx from "clsx";
import { useUser } from "@/context/UserContext";

type ProductType = "pro_subscription" | "starter_kit" | "interview_prep" | "bundle";

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

const FREE_FEATURES = [
  "6 free Academy entries (3 per Pillar)",
  "Basic Lab Tools calculators",
  "Career Hub — read-only",
  "QC Hub glossary",
];

const PRO_FEATURES = [
  "All 20 Academy entries across both Pillars",
  "Full workflow steps & regulatory references",
  "Premium Lab Tools",
  "Compliance SOPs (full text)",
  "Career Skill Gap Analyzer",
  "Priority content updates",
];

const CAREER_PRODUCTS: { label: string; desc: string; price: string; productType: ProductType; badge: string }[] = [
  {
    label: "Career Starter Kit",
    desc: "CV templates tailored for Pharma + top 20 biotech employers in Vietnam.",
    price: "$15",
    productType: "starter_kit",
    badge: "Resource",
  },
  {
    label: "Interview Prep Pack",
    desc: "100+ real QC/QA interview questions from hiring managers.",
    price: "$20",
    productType: "interview_prep",
    badge: "Prep Material",
  },
  {
    label: "Career Accelerator Bundle",
    desc: "Both products together. Save 14%.",
    price: "$30",
    productType: "bundle",
    badge: "Best Value",
  },
];

export default function PricingPage() {
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
    try {
      const url = await createCheckoutSession(productType);
      window.location.href = url;
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
      setLoadingProduct(null);
    }
  }

  return (
    <div className="pb-24 pt-4 md:pt-8 max-w-5xl mx-auto px-4">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 font-display text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
          Simple Pricing
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Start free. Upgrade when you need advanced content and tools.
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
            FREE
          </span>
          <div className="mb-6">
            <span className="text-4xl font-bold">$0</span>
            <span className="text-muted-foreground text-sm ml-1">/month</span>
          </div>
          <ul className="space-y-3 mb-8 flex-1">
            {FREE_FEATURES.map(f => (
              <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-white/30 shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
          <Link href="/register">
            <button className="w-full py-2.5 rounded-xl border border-white/10 text-sm font-semibold hover:border-white/30 transition-colors">
              Get Started
            </button>
          </Link>
        </div>

        {/* Pro */}
        <div className="bg-card border-2 border-teal-500/60 rounded-2xl p-7 flex flex-col relative shadow-[0_0_40px_rgba(20,184,166,0.12)]">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <span className="bg-teal-500 text-teal-950 text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full">
              Most Popular
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-teal-400 bg-teal-500/10 px-2 py-1 rounded w-fit mb-4">
            PRO
          </span>
          <div className="mb-6">
            <span className="text-4xl font-bold text-teal-400">$8</span>
            <span className="text-muted-foreground text-sm ml-1">/month</span>
          </div>
          <ul className="space-y-3 mb-8 flex-1">
            {PRO_FEATURES.map(f => (
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
              Current Plan
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
              {loadingProduct === "pro_subscription" ? "Redirecting…" : "Start Pro"}
            </button>
          )}
        </div>

        {/* Career Products */}
        <div className="bg-card border border-white/10 rounded-2xl p-7 flex flex-col">
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded w-fit mb-4">
            ONE-TIME
          </span>
          <p className="text-sm text-muted-foreground mb-6">
            Downloadable career resources. Pay once, keep forever.
          </p>
          <ul className="space-y-4 flex-1 mb-8">
            {CAREER_PRODUCTS.map(p => (
              <li key={p.productType} className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{p.label}</div>
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
                  {loadingProduct === p.productType ? "…" : "Buy Now"}
                </button>
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-muted-foreground text-center">
            All purchases are one-time payments. No subscription needed.
          </p>
        </div>
      </div>

      {/* FAQ row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        {[
          { icon: <Lock className="w-5 h-5 mx-auto mb-2 text-teal-400" />, q: "Is my payment secure?", a: "Yes — all payments processed by Stripe. We never store card details." },
          { icon: <Zap className="w-5 h-5 mx-auto mb-2 text-teal-400" />, q: "When does Pro activate?", a: "Instantly after payment. Your Academy content unlocks immediately." },
          { icon: <Package className="w-5 h-5 mx-auto mb-2 text-teal-400" />, q: "Can I cancel anytime?", a: "Yes. Cancel your Pro subscription anytime from Settings." },
        ].map(item => (
          <div key={item.q} className="bg-card border border-white/5 rounded-xl p-5">
            {item.icon}
            <p className="text-sm font-semibold mb-1">{item.q}</p>
            <p className="text-xs text-muted-foreground">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

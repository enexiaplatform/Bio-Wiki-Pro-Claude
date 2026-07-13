import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, CheckCircle2, Lock, Package, ShieldCheck, Zap } from "lucide-react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { JsonLd } from "@/components/JsonLd";
import { TrustBadges } from "@/components/TrustBadges";
import { useUser } from "@/context/UserContext";
import { analytics } from "@/hooks/use-analytics";
import { useSEO } from "@/hooks/use-seo";
import { EditorialImage } from "@/components/EditorialImage";

type ProductType = "pro_subscription" | "pro_subscription_annual" | "starter_kit" | "interview_prep" | "bundle";
const ONE_TIME_PRODUCTS: { productType: "starter_kit" | "interview_prep" | "bundle"; price: string }[] = [
  { productType: "starter_kit", price: "$15" },
  { productType: "interview_prep", price: "$20" },
  { productType: "bundle", price: "$30" },
];
const cardClass = "rounded-xl border border-white/10 bg-white/[0.045] p-6 shadow-lg shadow-black/10";

async function createCheckoutSession(productType: ProductType): Promise<string> {
  const res = await fetch("/api/stripe/create-checkout-session", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productType }) });
  if (!res.ok) { const err = await res.json(); throw new Error(err.message ?? "Failed to start checkout"); }
  const { url } = await res.json();
  return url;
}

export default function PricingPage() {
  const { t } = useTranslation("pricing");
  useSEO({ title: "Ways to work with Life Science Atlas", description: "Start a quality-laboratory blueprint engagement or choose supporting evidence access for regulated manufacturing quality work." });
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
    fetch("/api/billing/plans", { credentials: "include" }).then((r) => r.json()).then((data) => {
      if (!active) return;
      if (data?.annual) setAnnualAvailable(true);
      if (typeof data?.trialDays === "number") setTrialDays(data.trialDays);
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  async function handleCheckout(productType: ProductType) {
    if (!isAuthenticated) { navigate("/register"); return; }
    setLoadingProduct(productType); setError(null); analytics.checkoutStarted(productType);
    try { window.location.href = await createCheckoutSession(productType); }
    catch (err: any) { setError(err.message ?? t("genericError")); setLoadingProduct(null); }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-4 md:pt-8">
      {Array.isArray(faqs) && faqs.length > 0 && <JsonLd id="pricing-faq" data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }} />}

      <section className="relative mb-8 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-teal-400/10 via-white/[0.04] to-transparent p-4 shadow-xl shadow-black/10 md:p-6">
        <div className="grid gap-5 lg:grid-cols-[1.03fr_0.97fr] lg:items-stretch">
          <div className="flex flex-col justify-center p-2 text-left md:p-4">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-teal-400/20 bg-teal-400/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-teal-300"><Zap className="h-3.5 w-3.5" /> Ways to work with Atlas</span>
            <h1 className="mt-5 max-w-3xl font-display text-3xl font-bold leading-tight md:text-5xl">Start with the decision you need to make.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">Choose a project-specific Blueprint when a real laboratory decision is at stake. Choose Free or Pro for the evidence and working resources around it.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row"><Link href="/quality-lab/planner" className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-teal-200">Start a Blueprint <ArrowRight className="h-4 w-4" /></Link><a href="#evidence-plans" className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold transition hover:border-white/30">Compare evidence plans</a></div>
          </div>
          <EditorialImage src="/images/editorial/lab-team-collaboration.jpg" alt="Two laboratory professionals working together near analytical equipment" creditName="Toon Lambrechts" creditUrl="https://unsplash.com/photos/0q4ipgUIw5g" eager className="h-48 rounded-xl border border-white/10 sm:h-60 lg:h-auto lg:min-h-80" imageClassName="object-center saturate-75" />
        </div>
        <div className="mt-4 grid gap-2 rounded-lg border border-white/10 bg-slate-950/45 p-3 sm:grid-cols-3">
          {["Scope the operating question", "Expose evidence and assumptions", "Review before implementation"].map((item) => <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4 shrink-0 text-teal-300" />{item}</div>)}
        </div>
      </section>

      <section className="mb-8 overflow-hidden rounded-xl border border-teal-300/30 bg-gradient-to-br from-teal-300/[0.12] via-white/[0.05] to-sky-300/[0.06] p-6 shadow-xl shadow-teal-950/20 md:p-8">
        <div className="grid gap-7 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <span className="inline-flex rounded-full bg-teal-300 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-950">Primary offer</span>
            <h2 className="mt-4 font-display text-2xl font-bold md:text-3xl">Atlas Quality Lab Blueprint</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">A scope-based, service-assisted engagement that turns product and testing demand into a traceable laboratory capability and operating model.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/quality-lab/planner" className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-teal-200">Build an initial model <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/quality-lab/review" className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold transition hover:border-white/30 hover:bg-white/10">Request a scope review</Link>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-950/40 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-200">Expert-reviewed delivery</p>
            <ul className="mt-4 space-y-3">{["Capability and method model", "Demand and capacity scenarios", "Evidence, assumptions, and gaps", "Decision brief prepared for expert review"].map((item) => <li key={item} className="flex items-start gap-2 text-sm"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" />{item}</li>)}</ul>
            <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-relaxed text-muted-foreground">Planning and decision support only. Final design, qualification, and regulatory decisions remain with authorized experts and the site quality system.</p>
          </div>
        </div>
      </section>

      {error && <div className="mb-8 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-center text-sm text-red-400">{error}</div>}

      <div id="evidence-plans" className="mb-5 scroll-mt-24"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-300">Supporting evidence access</p><h2 className="mt-2 text-2xl font-bold">Keep the reference layer separate from the engagement</h2><p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">Free and Pro help individuals learn and reuse evidence-backed tools. They do not replace a project-specific Blueprint review.</p></div>
      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <div className={`${cardClass} flex flex-col`}>
          <span className="mb-4 w-fit rounded bg-white/5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t("free.badge")}</span>
          <div className="mb-6"><span className="text-4xl font-bold">$0</span><span className="ml-1 text-sm text-muted-foreground">{t("perMonth")}</span></div>
          <ul className="mb-8 flex-1 space-y-3">{freeFeatures.map((feature) => <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-white/30" />{feature}</li>)}</ul>
          <Link href="/register" className="inline-flex w-full items-center justify-center rounded-lg border border-white/10 py-2.5 text-sm font-semibold transition hover:border-white/30 hover:bg-white/5">{t("free.cta")}</Link>
        </div>

        <div className="relative flex flex-col rounded-xl border-2 border-teal-400/60 bg-white/[0.06] p-6 shadow-[0_0_40px_rgba(20,184,166,0.16)]">
          <span className="mb-4 w-fit rounded bg-teal-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-400">{t("pro.badge")}</span>
          {annualAvailable && !isPro && <div className="mb-3 inline-flex w-fit items-center gap-1 rounded-lg border border-white/10 bg-background/60 p-0.5">{(["monthly", "annual"] as const).map((plan) => <button key={plan} onClick={() => setProPlan(plan)} className={clsx("rounded-md px-3 py-1 text-xs font-semibold transition-colors", proPlan === plan ? "bg-teal-400 text-teal-950" : "text-muted-foreground hover:text-foreground")}>{plan === "monthly" ? "Monthly" : "Annual"}</button>)}</div>}
          <div className="mb-6"><span className="text-4xl font-bold text-teal-400">$8</span><span className="ml-1 text-sm text-muted-foreground">{proPlan === "annual" && annualAvailable ? "/mo · billed yearly" : t("perMonth")}</span>{proPlan === "annual" && annualAvailable && <span className="ml-2 text-[11px] font-bold text-emerald-400">2 months free</span>}</div>
          <ul className="mb-8 flex-1 space-y-3">{proFeatures.map((feature) => <li key={feature} className="flex items-start gap-2 text-sm"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" />{feature}</li>)}</ul>
          {isPro ? <button disabled className="w-full cursor-default rounded-lg bg-teal-500/20 py-2.5 text-sm font-semibold text-teal-300">{t("pro.current")}</button> : <button onClick={() => handleCheckout(proProductType)} disabled={loadingProduct === proProductType} className="w-full rounded-lg bg-teal-400 py-2.5 text-sm font-bold text-teal-950 transition hover:bg-teal-300 disabled:cursor-wait disabled:opacity-60">{loadingProduct === proProductType ? t("pro.redirecting") : trialDays > 0 ? `Start ${trialDays}-day free trial` : t("pro.cta")}</button>}
          {trialDays > 0 && !isPro && <p className="mt-2 text-center text-[11px] font-medium text-emerald-400">{trialDays}-day free trial · cancel anytime</p>}
        </div>
      </div>

      <details className="group mb-12 rounded-xl border border-white/10 bg-white/[0.035] p-5 open:bg-white/[0.05]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">Optional career resources</p><h2 className="mt-1 text-lg font-bold">One-time interview and career downloads</h2></div><Package className="h-5 w-5 text-muted-foreground transition group-open:text-emerald-300" /></summary>
        <p className="mt-4 text-sm text-muted-foreground">{t("oneTime.intro")}</p>
        <ul className="mt-5 grid gap-3 md:grid-cols-3">{ONE_TIME_PRODUCTS.map((product) => <li key={product.productType} className="rounded-lg border border-white/10 bg-background/40 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold">{t(`products.${product.productType}.label`)}</p><p className="mt-1 text-xs text-muted-foreground">{product.price} one time</p></div><button onClick={() => handleCheckout(product.productType)} disabled={loadingProduct === product.productType} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-bold transition hover:border-emerald-300 hover:text-emerald-200 disabled:opacity-60">{loadingProduct === product.productType ? "Processing…" : t("oneTime.buy")}</button></div></li>)}</ul>
        <p className="mt-4 text-xs text-muted-foreground">{t("oneTime.note")}</p>
      </details>

      <TrustBadges className="mb-8" />
      <div className="mb-8 flex items-start gap-3 rounded-lg border border-amber-300/20 bg-amber-300/[0.055] p-4 text-sm leading-relaxed text-muted-foreground"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" /><p><strong className="text-foreground">Choose by outcome:</strong> Blueprint for a project-specific laboratory decision; Pro for deeper evidence and reusable resources; Free for orientation and public tools.</p></div>
      <div className="grid gap-4 text-center sm:grid-cols-3">{faqs.map((item, index) => <div key={item.q} className={cardClass}>{[<Lock key="lock" className="mx-auto mb-2 h-5 w-5 text-teal-400" />, <Zap key="zap" className="mx-auto mb-2 h-5 w-5 text-teal-400" />, <Package key="package" className="mx-auto mb-2 h-5 w-5 text-teal-400" />][index]}<p className="mb-1 text-sm font-semibold">{item.q}</p><p className="text-xs text-muted-foreground">{item.a}</p></div>)}</div>
    </div>
  );
}

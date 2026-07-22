import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, FileText, Lock, ShieldCheck, Target, Zap } from "lucide-react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { JsonLd } from "@/components/JsonLd";
import { TrustBadges } from "@/components/TrustBadges";
import { useUser } from "@/context/UserContext";
import { analytics } from "@/hooks/use-analytics";
import { useSEO } from "@/hooks/use-seo";
import { EditorialImage } from "@/components/EditorialImage";

type ProductType = "pro_subscription" | "pro_subscription_annual";
const cardClass = "rounded-xl border border-white/10 bg-white/[0.045] p-6 shadow-lg shadow-black/10";

async function createCheckoutSession(productType: ProductType): Promise<string> {
  const res = await fetch("/api/stripe/create-checkout-session", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productType }) });
  if (!res.ok) { const err = await res.json(); throw new Error(err.message ?? "Failed to start checkout"); }
  const { url } = await res.json();
  return url;
}

export default function PricingPage() {
  const { t } = useTranslation("pricing");
  useSEO({ title: "Ways to work with Life Science Atlas", description: "Compare Quality Lab project work, the Atlas Pro monthly quality operating layer, and the one-time Personal Career Blueprint." });
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
    analytics.commercialPricingViewed();
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
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">Choose project work for a real laboratory decision, Pro for a recurring monthly quality workflow and reusable resources, or a one-time Career Blueprint for your next move.</p>
            <div className="mt-5 grid grid-cols-3 gap-2 lg:hidden">
              <Link href="/quality-lab/review?offer=diagnostic" className="rounded-xl border border-sky-300/25 bg-sky-300/10 p-3"><span className="block text-[10px] font-bold uppercase tracking-wide text-sky-200">Paid diagnostic</span><strong className="mt-1 block text-xl">$149</strong><span className="text-[11px] text-muted-foreground">Fixed fee</span></Link>
              <Link href="/quality-lab/review?offer=blueprint" className="rounded-xl border border-teal-300/25 bg-teal-300/10 p-3"><span className="block text-[10px] font-bold uppercase tracking-wide text-teal-200">Blueprint pilot</span><strong className="mt-1 block text-xl">From $990</strong><span className="text-[11px] text-muted-foreground">Per project</span></Link>
              <Link href="/career" className="rounded-xl border border-amber-300/25 bg-amber-300/10 p-3"><span className="block text-[10px] font-bold uppercase tracking-wide text-amber-200">Career Blueprint</span><strong className="mt-1 block text-xl">$20</strong><span className="text-[11px] text-muted-foreground">One time</span></Link>
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row"><Link href="/quality-lab/review?offer=diagnostic" className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-teal-200">Start with the $149 diagnostic <ArrowRight className="h-4 w-4" /></Link><Link href="/quality-lab/planner" className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold transition hover:border-white/30">Build an initial model</Link></div>
          </div>
          <EditorialImage src="/images/editorial/lab-team-collaboration.jpg" alt="Two laboratory professionals working together near analytical equipment" creditName="Toon Lambrechts" creditUrl="https://unsplash.com/photos/0q4ipgUIw5g" eager className="hidden rounded-xl border border-white/10 lg:block lg:h-auto lg:min-h-80" imageClassName="object-center saturate-75" />
        </div>
        <div className="mt-4 grid gap-2 rounded-lg border border-white/10 bg-slate-950/45 p-3 sm:grid-cols-3">
          {["Scope the operating question", "Expose evidence and assumptions", "Review before implementation"].map((item) => <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4 shrink-0 text-teal-300" />{item}</div>)}
        </div>
      </section>

      <section className="mb-8 grid gap-3 md:grid-cols-3" aria-label="Atlas product paths">
        <Link href="/quality-lab" className="group rounded-xl border border-teal-300/25 bg-teal-300/[0.065] p-5 transition hover:-translate-y-0.5 hover:border-teal-200/45">
          <div className="flex items-center justify-between gap-4"><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-200">For organizations</span><span className="text-sm font-bold">$149 → $990+</span></div>
          <h2 className="mt-3 text-lg font-bold">Quality Lab decisions</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Scope, model, and expert-review a real laboratory operating question.</p>
          <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-teal-300">Explore project offers <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></span>
        </Link>
        <a href="#evidence-plans" className="group rounded-xl border border-sky-300/20 bg-sky-300/[0.04] p-5 transition hover:-translate-y-0.5 hover:border-sky-200/40">
          <div className="flex items-center justify-between gap-4"><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-200">For daily practice</span><span className="text-sm font-bold">From $8/mo</span></div>
          <h2 className="mt-3 text-lg font-bold">Atlas Pro resources</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Unlock deeper lessons, working files, compliance templates, and premium tools.</p>
          <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-sky-200">Compare access <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></span>
        </a>
        <Link href="/career" className="group rounded-xl border border-amber-300/25 bg-amber-300/[0.045] p-5 transition hover:-translate-y-0.5 hover:border-amber-200/45">
          <div className="flex items-center justify-between gap-4"><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-200">For your career</span><span className="text-sm font-bold">$20 once</span></div>
          <h2 className="mt-3 text-lg font-bold">Personal Career Blueprint</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Turn your profile, evidence, constraints, and target role into a 38-page plan.</p>
          <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-amber-200">Start free first <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></span>
        </Link>
      </section>

      <section className="mb-8 overflow-hidden rounded-xl border border-teal-300/30 bg-gradient-to-br from-teal-300/[0.12] via-white/[0.05] to-sky-300/[0.06] p-6 shadow-xl shadow-teal-950/20 md:p-8">
        <div className="grid gap-7 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <span className="inline-flex rounded-full bg-teal-300 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-950">Founding design-partner pricing</span>
            <h2 className="mt-4 font-display text-2xl font-bold md:text-3xl">Buy a defined decision outcome, not software access.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">Start with a fixed-price diagnostic when the operating question still needs to be framed. Move to an expert-reviewed Blueprint when a real laboratory investment, capacity, or operating-model decision is ready to scope.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/quality-lab/review?offer=diagnostic" className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-teal-200">Request a paid diagnostic <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/quality-lab/sample" className="inline-flex items-center justify-center rounded-lg border border-teal-300/20 bg-teal-300/[0.06] px-5 py-3 text-sm font-semibold text-teal-100 transition hover:bg-teal-300/10">View illustrative Blueprint</Link>
              <Link href="/quality-lab/planner" className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold transition hover:border-white/30 hover:bg-white/10">Build an initial model</Link>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-950/40 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-200">Commercial guardrails</p>
            <ul className="mt-4 space-y-3">{["Atlas responds within 2 business days", "Blueprint target: 10 business days after complete inputs and kickoff", "Scope and named deliverables are agreed before kickoff", "Travel, third-party specialists, taxes, and detailed engineering are excluded unless quoted", "Planning and decision support only; site and regulatory approvals remain with accountable experts"].map((item) => <li key={item} className="flex items-start gap-2 text-sm"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" />{item}</li>)}</ul>
          </div>
        </div>
        <div className="mt-7 grid gap-4 border-t border-white/10 pt-7 lg:grid-cols-2">
          <article className="flex flex-col rounded-xl border border-white/10 bg-slate-950/45 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-200">Paid Scope Diagnostic</p>
            <div className="mt-3"><span className="text-3xl font-bold">$149</span><span className="ml-2 text-sm text-muted-foreground">fixed fee</span></div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">For teams that need to define the decision, available evidence, critical gaps, and a defensible Blueprint scope before committing to the full engagement.</p>
            <ul className="my-5 flex-1 space-y-2">{["One 60-minute stakeholder workshop", "Input and decision-gap triage", "Written scope and decision memo", "Fee credited to a Blueprint started within 30 days"].map((item) => <li key={item} className="flex items-start gap-2 text-sm"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />{item}</li>)}</ul>
            <Link href="/quality-lab/review?offer=diagnostic" className="inline-flex items-center justify-center gap-2 rounded-lg border border-sky-300/25 bg-sky-300/10 px-5 py-3 text-sm font-bold text-sky-100 transition hover:bg-sky-300/15">Request the diagnostic <ArrowRight className="h-4 w-4" /></Link>
          </article>
          <article className="flex flex-col rounded-xl border border-teal-300/25 bg-teal-300/[0.07] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-200">Expert-reviewed Blueprint Pilot</p>
            <div className="mt-3"><span className="text-3xl font-bold">From $990</span><span className="ml-2 text-sm text-muted-foreground">per project</span></div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Typical founding design-partner scopes are $990–$2,500. The $990 starting scope covers one site, the first microbiology wedge, a baseline plus one alternative scenario, one review workshop, and one revision.</p>
            <ul className="my-5 flex-1 space-y-2">{["Capability and method model", "Baseline and one alternative demand-capacity scenario", "Evidence, assumptions, and gap register", "Controlled workbook and decision brief", "One review workshop and one revision"].map((item) => <li key={item} className="flex items-start gap-2 text-sm"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" />{item}</li>)}</ul>
            <Link href="/quality-lab/review?offer=blueprint" className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-teal-200">Request a Blueprint scope <ArrowRight className="h-4 w-4" /></Link>
          </article>
        </div>
        <p className="mt-5 text-xs leading-5 text-muted-foreground">Design-partner pricing is limited to the first three paid engagements and will then be reviewed using delivery time, correction burden, buyer response, and project outcomes. Larger portfolios, extra scenarios, additional workshops, travel, or specialist coverage are quoted separately.</p>
      </section>

      <section className="mb-8 overflow-hidden rounded-xl border border-amber-300/25 bg-gradient-to-br from-amber-300/[0.08] via-white/[0.035] to-teal-300/[0.04] p-6 md:p-8">
        <div className="grid gap-7 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <img src="/images/career/personal-career-blueprint-preview.webp" alt="Personalized Career Blueprint product preview" width="1421" height="1107" loading="lazy" decoding="async" className="aspect-[9/7] w-full rounded-xl border border-white/10 object-cover shadow-2xl shadow-black/20" />
          <div>
            <div className="flex flex-wrap items-center gap-3"><span className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-200"><BriefcaseBusiness className="h-3.5 w-3.5" /> Personal decision product</span><span className="text-2xl font-bold text-amber-200">$20 one time</span></div>
            <h2 className="mt-4 font-display text-2xl font-bold md:text-3xl">A personalized career operating plan you can actually use.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">Complete the free Career Snapshot first. If the recommended route feels credible, unlock a named 38-page PDF built from your role, sector, experience, evidence, constraints, target horizon, and selected route.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[{ icon: Target, text: "Route and readiness logic" }, { icon: FileText, text: "CV, proof, and interview prompts" }, { icon: CheckCircle2, text: "13-week execution system" }].map((item) => <div key={item.text} className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-950/35 p-3 text-xs font-semibold"><item.icon className="h-4 w-4 shrink-0 text-amber-200" />{item.text}</div>)}
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row"><Link href="/career" className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-200">Build my free Career Snapshot <ArrowRight className="h-4 w-4" /></Link><span className="inline-flex items-center justify-center text-xs text-muted-foreground">No card required for the snapshot</span></div>
          </div>
        </div>
      </section>

      {error && <div className="mb-8 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-center text-sm text-red-400">{error}</div>}

      <div id="evidence-plans" className="mb-5 scroll-mt-24"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-300">Recurring professional workspace</p><h2 className="mt-2 text-2xl font-bold">Keep monthly quality work moving without confusing it with an engagement</h2><p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">Pro combines a repeatable monthly review, deeper evidence, tools, and working files for individual professional use. It does not replace a project-specific Blueprint review.</p></div>
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
          <div className="mb-6">{proPlan === "annual" && annualAvailable ? <><span className="text-4xl font-bold text-teal-400">$80</span><span className="ml-1 text-sm text-muted-foreground">/year</span><span className="ml-2 text-[11px] font-bold text-emerald-400">$6.67/mo equivalent · 2 months free</span></> : <><span className="text-4xl font-bold text-teal-400">$8</span><span className="ml-1 text-sm text-muted-foreground">{t("perMonth")}</span></>}</div>
          <ul className="mb-8 flex-1 space-y-3">{proFeatures.map((feature) => <li key={feature} className="flex items-start gap-2 text-sm"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" />{feature}</li>)}</ul>
          {isPro ? <button disabled className="w-full cursor-default rounded-lg bg-teal-500/20 py-2.5 text-sm font-semibold text-teal-300">{t("pro.current")}</button> : <button onClick={() => handleCheckout(proProductType)} disabled={loadingProduct === proProductType} className="w-full rounded-lg bg-teal-400 py-2.5 text-sm font-bold text-teal-950 transition hover:bg-teal-300 disabled:cursor-wait disabled:opacity-60">{loadingProduct === proProductType ? t("pro.redirecting") : trialDays > 0 ? `Start ${trialDays}-day free trial` : t("pro.cta")}</button>}
          {trialDays > 0 && !isPro && <p className="mt-2 text-center text-[11px] font-medium text-emerald-400">{trialDays}-day free trial · cancel anytime</p>}
        </div>
      </div>

      <TrustBadges className="mb-8" />
      <div className="mb-8 flex items-start gap-3 rounded-lg border border-amber-300/20 bg-amber-300/[0.055] p-4 text-sm leading-relaxed text-muted-foreground"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" /><p><strong className="text-foreground">Choose by outcome:</strong> Quality Lab for a project-specific operating decision; Career Blueprint for a personal one-time plan; Pro for recurring individual quality work backed by deeper evidence and reusable resources; Free for orientation and public tools.</p></div>
      <div className="grid gap-4 text-center sm:grid-cols-3">{faqs.map((item, index) => <div key={item.q} className={cardClass}>{[<Lock key="lock" className="mx-auto mb-2 h-5 w-5 text-teal-400" />, <Zap key="zap" className="mx-auto mb-2 h-5 w-5 text-teal-400" />, <ShieldCheck key="shield" className="mx-auto mb-2 h-5 w-5 text-teal-400" />][index]}<p className="mb-1 text-sm font-semibold">{item.q}</p><p className="text-xs text-muted-foreground">{item.a}</p></div>)}</div>
    </div>
  );
}

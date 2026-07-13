import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  CheckCircle2, ShieldCheck, FileText, ClipboardList,
  MessageSquare, Video, Phone, ChevronDown, ChevronUp,
  ArrowRight, Package, BadgeCheck, Lock,
  GraduationCap, Microscope, CalendarClock, FileWarning, MessagesSquare,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useSEO } from "@/hooks/use-seo";
import { analytics } from "@/hooks/use-analytics";
import { JsonLd } from "@/components/JsonLd";
import { LeadMagnetBanner } from "@/components/LeadMagnetBanner";
import { EditorialImage } from "@/components/EditorialImage";

// Icons paired by index with includes.items / pricing trust badges.
const INCLUDE_ICONS = [FileText, ClipboardList, ShieldCheck, MessageSquare, Video, Phone];
const TRUST_ICONS = [BadgeCheck, BadgeCheck, BadgeCheck, Lock, GraduationCap, Microscope];
const PAIN_ICONS = [CalendarClock, FileWarning, MessagesSquare];

interface Pain { title: string; desc: string }
interface Include { title: string; desc: string }
interface ValueCard { title: string; text: string }
interface Faq { q: string; a: string }

const PLACEMENT = "gmp_kit_page";

export default function GMPAuditKit() {
  const { t } = useTranslation("gmpkit");
  useSEO({ title: t("seoTitle"), description: t("seoDesc") });

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [, navigate] = useLocation();

  // Top-of-funnel signal: this page is a Pro upsell landing.
  useEffect(() => {
    analytics.upgradePromptShown(PLACEMENT);
  }, []);

  const trustBadges = t("trustBadges", { returnObjects: true }) as string[];
  const pains = t("pains.items", { returnObjects: true }) as Pain[];
  const includes = t("includes.items", { returnObjects: true }) as Include[];
  const valueCards = t("testimonials.items", { returnObjects: true }) as ValueCard[];
  const whoFor = t("whoFor.items", { returnObjects: true }) as string[];
  const faqs = t("faq.items", { returnObjects: true }) as Faq[];

  function handleUnlock() {
    analytics.upgradePromptClicked(PLACEMENT);
    navigate("/pricing");
  }

  return (
    <div className="pb-24 pt-4 md:pt-8 max-w-4xl mx-auto px-4">
      <JsonLd
        id="gmpkit-faq"
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
      {/* ── HERO ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 overflow-hidden rounded-3xl border border-teal-300/20 bg-gradient-to-br from-teal-300/10 via-white/[0.035] to-transparent p-4 md:p-6"
      >
        <div className="grid gap-5 lg:grid-cols-[1.04fr_0.96fr] lg:items-stretch">
          <div className="flex flex-col justify-center p-2 md:p-4"><span className="inline-block w-fit rounded-full bg-teal-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-teal-400">{t("hero.badge")}</span><h1 className="mt-5 font-display text-3xl font-bold leading-tight md:text-5xl">{t("hero.titleLead")} <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">{t("hero.titleHighlight")}</span></h1><p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">{t("hero.subtitle")}</p><button onClick={handleUnlock} className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl bg-teal-500 px-6 py-3 text-base font-bold text-teal-950 shadow-lg shadow-teal-500/25 transition-all hover:bg-teal-400"><Package className="h-5 w-5" /> {t("hero.buyNow")}</button></div>
          <EditorialImage src="/images/editorial/cleanroom-practice.jpg" alt="Quality professional working in a controlled cleanroom environment" creditName="Toon Lambrechts" creditUrl="https://unsplash.com/photos/RkG7wp75b48" eager className="h-52 rounded-2xl border border-white/10 sm:h-64 lg:h-auto lg:min-h-80" imageClassName="object-center saturate-75" />
        </div>
        <div className="mt-4 grid gap-2 rounded-xl border border-white/10 bg-slate-950/40 p-3 sm:grid-cols-2 lg:grid-cols-4">{trustBadges.slice(0, 4).map((b, i) => { const Icon = TRUST_ICONS[i] ?? BadgeCheck; return <span key={b} className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5 shrink-0 text-teal-400" /> {b}</span>; })}</div>
      </motion.div>

      {/* ── LEAD CAPTURE (guests only; nurtures toward Pro) ── */}
      <LeadMagnetBanner />

      {/* ── PAIN POINTS ── */}
      <div className="mb-16">
        <h2 className="text-xl font-bold text-center mb-8 text-muted-foreground">
          {t("pains.heading")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pains.map((p, index) => {
            const Icon = PAIN_ICONS[index] ?? FileWarning;
            return (
            <div key={p.title} className="bg-card border border-white/5 rounded-2xl p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-300"><Icon className="h-5 w-5" /></div>
              <h3 className="font-bold text-sm mb-2">{p.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          )})}
        </div>
      </div>

      {/* ── WHAT'S INCLUDED ── */}
      <div className="mb-16 bg-card border border-white/5 rounded-2xl p-6 md:p-10">
        <h2 className="text-2xl font-bold mb-2 text-center">{t("includes.heading")}</h2>
        <p className="text-muted-foreground text-sm text-center mb-8">{t("includes.subtitle")}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {includes.map((item, i) => {
            const Icon = INCLUDE_ICONS[i] ?? FileText;
            return (
              <div key={item.title} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">{item.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── WHY IT WORKS (honest value cards, not fabricated quotes) ── */}
      <div className="mb-16">
        <h2 className="text-xl font-bold text-center mb-8">{t("testimonials.heading")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {valueCards.map((c) => (
            <div key={c.title} className="bg-card border border-white/5 rounded-2xl p-6 flex flex-col">
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold mb-1.5">{c.title}</p>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">{c.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── PRICING CTA (Pro subscription unlocks this kit + everything) ── */}
      <div className="mb-16 bg-gradient-to-br from-teal-500/10 to-emerald-500/5 border border-teal-500/20 rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent" />
        <div className="relative z-10">
          <p className="text-sm text-teal-400 font-semibold mb-2">{t("pricing.launchNote")}</p>
          <div className="flex items-baseline justify-center gap-3 mb-2">
            <span className="text-5xl font-bold text-teal-400">$8</span>
            <span className="text-muted-foreground text-sm">/mo</span>
          </div>
          <p className="text-xs text-muted-foreground mb-8">{t("pricing.priceNote")}</p>

          <button
            onClick={handleUnlock}
            className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-teal-950 font-bold text-lg px-10 py-4 rounded-xl transition-all shadow-xl shadow-teal-500/30 mb-6"
          >
            {t("pricing.buyNow")} <ArrowRight className="w-5 h-5" />
          </button>

          <div className="mt-6 pt-6 border-t border-white/5 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <span>{t("pricing.secure")}</span>
            <span>{t("pricing.standards")}</span>
          </div>
        </div>
      </div>

      {/* ── WHO IS THIS FOR ── */}
      <div className="mb-16 bg-card border border-white/5 rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-bold mb-6">{t("whoFor.heading")}</h2>
        <div className="space-y-3">
          {whoFor.map((line) => (
            <div key={line} className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span className="text-sm">{line}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-6 border-t border-white/5">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{t("whoFor.notForLabel")}</span> {t("whoFor.notFor")}
          </p>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div className="mb-16">
        <h2 className="text-xl font-bold text-center mb-8">{t("faq.heading")}</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-card border border-white/5 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
                aria-expanded={openFaq === i}
              >
                <span className="font-semibold text-sm pr-4">{faq.q}</span>
                {openFaq === i
                  ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                }
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-white/5 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── FINAL CTA ── */}
      <div className="text-center">
        <p className="text-muted-foreground text-sm mb-4">{t("finalCta.note")}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleUnlock}
            className="inline-flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-teal-950 font-bold px-8 py-3 rounded-xl transition-all"
          >
            <Package className="w-4 h-4" />
            {t("finalCta.buy")}
          </button>
          <a
            href="mailto:thongtran.hcmus@gmail.com"
            className="inline-flex items-center justify-center gap-2 border border-white/10 hover:border-white/30 text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            {t("finalCta.ask")}
          </a>
        </div>
      </div>
    </div>
  );
}

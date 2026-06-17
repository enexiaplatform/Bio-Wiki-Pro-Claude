import { useState } from "react";
import { useLocation } from "wouter";
import {
  CheckCircle2, ShieldCheck, FileText, ClipboardList,
  MessageSquare, Video, Phone, ChevronDown, ChevronUp,
  Loader2, ArrowRight, Package, BadgeCheck, Lock,
  GraduationCap, Microscope,
} from "lucide-react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useUser } from "@/context/UserContext";
import { useSEO } from "@/hooks/use-seo";
import { analytics } from "@/hooks/use-analytics";
import { JsonLd } from "@/components/JsonLd";

type ProductType = "gmp_audit_kit";

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

// Icons paired by index with includes.items / pricing trust badges.
const INCLUDE_ICONS = [FileText, ClipboardList, ShieldCheck, MessageSquare, Video, Phone];
const TRUST_ICONS = [BadgeCheck, BadgeCheck, BadgeCheck, Lock, GraduationCap, Microscope];

interface Pain { emoji: string; title: string; desc: string }
interface Include { title: string; desc: string }
interface ValueCard { title: string; text: string }
interface Faq { q: string; a: string }

export default function GMPAuditKit() {
  const { t } = useTranslation("gmpkit");
  useSEO({ title: t("seoTitle"), description: t("seoDesc") });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { isAuthenticated } = useUser();
  const [, navigate] = useLocation();

  const trustBadges = t("trustBadges", { returnObjects: true }) as string[];
  const pains = t("pains.items", { returnObjects: true }) as Pain[];
  const includes = t("includes.items", { returnObjects: true }) as Include[];
  const valueCards = t("testimonials.items", { returnObjects: true }) as ValueCard[];
  const whoFor = t("whoFor.items", { returnObjects: true }) as string[];
  const faqs = t("faq.items", { returnObjects: true }) as Faq[];

  async function handleCheckout() {
    if (!isAuthenticated) {
      navigate("/signup");
      return;
    }
    setIsLoading(true);
    setError(null);
    analytics.checkoutStarted("gmp_audit_kit", 59);
    try {
      const url = await createCheckoutSession("gmp_audit_kit");
      window.location.href = url;
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
      setIsLoading(false);
    }
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
        className="text-center mb-16"
      >
        <span className="inline-block text-[11px] uppercase font-bold tracking-widest text-teal-400 bg-teal-400/10 px-3 py-1 rounded-full mb-5">
          {t("hero.badge")}
        </span>
        <h1 className="text-3xl md:text-5xl font-bold mb-5 font-display leading-tight">
          {t("hero.titleLead")}{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
            {t("hero.titleHighlight")}
          </span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
          {t("hero.subtitle")}
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={isLoading}
          className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-teal-950 font-bold text-lg px-8 py-4 rounded-xl transition-all shadow-lg shadow-teal-500/25 disabled:opacity-60 disabled:cursor-wait mb-4"
        >
          {isLoading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> {t("hero.redirecting")}</>
          ) : (
            <><Package className="w-5 h-5" /> {t("hero.buyNow")}</>
          )}
        </button>

        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground flex-wrap">
          {trustBadges.map((b, i) => {
            const Icon = TRUST_ICONS[i] ?? BadgeCheck;
            return (
              <span key={b} className="flex items-center gap-1">
                <Icon className="w-3.5 h-3.5 text-teal-400" /> {b}
              </span>
            );
          })}
        </div>
      </motion.div>

      {/* ── PAIN POINTS ── */}
      <div className="mb-16">
        <h2 className="text-xl font-bold text-center mb-8 text-muted-foreground">
          {t("pains.heading")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pains.map((p) => (
            <div key={p.title} className="bg-card border border-white/5 rounded-2xl p-6">
              <div className="text-3xl mb-3">{p.emoji}</div>
              <h3 className="font-bold text-sm mb-2">{p.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          ))}
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

      {/* ── PRICING CTA ── */}
      <div className="mb-16 bg-gradient-to-br from-teal-500/10 to-emerald-500/5 border border-teal-500/20 rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent" />
        <div className="relative z-10">
          <p className="text-sm text-teal-400 font-semibold mb-2">{t("pricing.launchNote")}</p>
          <div className="flex items-baseline justify-center gap-3 mb-2">
            <span className="text-lg text-muted-foreground line-through">$120</span>
            <span className="text-5xl font-bold text-teal-400">$59</span>
          </div>
          <p className="text-xs text-muted-foreground mb-8">{t("pricing.priceNote")}</p>

          <button
            onClick={handleCheckout}
            disabled={isLoading}
            className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-teal-950 font-bold text-lg px-10 py-4 rounded-xl transition-all shadow-xl shadow-teal-500/30 disabled:opacity-60 disabled:cursor-wait mb-6"
          >
            {isLoading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> {t("hero.redirecting")}</>
            ) : (
              <>{t("pricing.buyNow")} <ArrowRight className="w-5 h-5" /></>
            )}
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
            onClick={handleCheckout}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-teal-950 font-bold px-8 py-3 rounded-xl transition-all disabled:opacity-60 disabled:cursor-wait"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
            {isLoading ? t("hero.redirecting") : t("finalCta.buy")}
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

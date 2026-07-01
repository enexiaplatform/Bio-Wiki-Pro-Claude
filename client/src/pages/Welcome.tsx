import { useEffect } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { BookOpen, Gift, Crown, ArrowRight, PartyPopper } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";
import { analytics } from "@/hooks/use-analytics";
import { ContinueLearning } from "@/components/ContinueLearning";

// Recommended starting point — a structured path, not a one-off post.
const FIRST_PATH = "/paths/microbiology-qc-fundamentals";

export default function Welcome() {
  const { t } = useTranslation("onboarding");
  useSEO({ title: t("welcomeTitle") });

  useEffect(() => {
    analytics.onboardingStarted();
  }, []);

  const steps = [
    {
      icon: BookOpen,
      title: t("step1.title"),
      desc: t("step1.desc"),
      cta: t("step1.cta"),
      href: FIRST_PATH,
      primary: true,
      onClick: () => analytics.onboardingCompleted("first_path"),
    },
    { icon: Gift, title: t("step2.title"), desc: t("step2.desc"), cta: t("step2.cta"), href: "/academy" },
    { icon: Crown, title: t("step3.title"), desc: t("step3.desc"), cta: t("step3.cta"), href: "/upgrade" },
  ];

  return (
    <div className="pb-24 pt-8 md:pt-12 max-w-2xl mx-auto px-4">
      <div className="text-center mb-10">
        <div className="w-14 h-14 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mx-auto mb-4">
          <PartyPopper className="w-7 h-7" />
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">{t("welcomeTitle")}</h1>
        <p className="text-muted-foreground">{t("welcomeSubtitle")}</p>
      </div>

      <ContinueLearning />

      <div className="space-y-3">
        {steps.map((s, i) => (
          <div
            key={i}
            className={
              "flex items-center gap-4 rounded-2xl border p-4 " +
              (s.primary ? "border-primary/30 bg-primary/5" : "border-white/10 bg-card")
            }
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <s.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{s.title}</p>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </div>
            <Link
              href={s.href}
              onClick={s.onClick}
              className={
                "shrink-0 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors " +
                (s.primary
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "border border-white/10 text-foreground hover:border-white/30")
              }
            >
              {s.cta} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <Link href="/academy" className="text-sm text-muted-foreground hover:text-foreground">
          {t("skip")}
        </Link>
      </div>
    </div>
  );
}

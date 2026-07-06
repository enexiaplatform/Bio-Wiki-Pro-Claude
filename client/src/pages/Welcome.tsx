import { useEffect } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { ArrowRight, BookOpen, Crown, Gift, Sparkles } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";
import { analytics } from "@/hooks/use-analytics";
import { ContinueLearning } from "@/components/ContinueLearning";

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
    { icon: Crown, title: t("step3.title"), desc: t("step3.desc"), cta: t("step3.cta"), href: "/pricing" },
  ];

  const primaryStep = steps[0];
  const secondarySteps = steps.slice(1);

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-6 md:pt-10">
      <section className="mb-6 overflow-hidden rounded-lg border border-teal-400/20 bg-gradient-to-br from-teal-500/12 via-white/[0.045] to-emerald-500/10 p-6 shadow-xl shadow-black/15 md:p-8">
        <div className="grid gap-6 md:grid-cols-[1.15fr_0.85fr] md:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-teal-400/20 bg-teal-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-teal-200">
              <Sparkles className="h-3.5 w-3.5" />
              Account ready
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-5xl">{t("welcomeTitle")}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">{t("welcomeSubtitle")}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-background/55 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Best first move</p>
            <p className="mt-2 text-lg font-bold">{primaryStep.title}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{primaryStep.desc}</p>
          </div>
        </div>
      </section>

      <ContinueLearning />

      <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <Link
          href={primaryStep.href}
          onClick={primaryStep.onClick}
          className="group rounded-lg border border-teal-400/25 bg-teal-400/10 p-5 shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 hover:border-teal-300/50 hover:bg-teal-400/15 md:p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-teal-400/25 bg-teal-400/10 text-teal-300">
                <primaryStep.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xl font-bold">{primaryStep.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{primaryStep.desc}</p>
              </div>
            </div>
            <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-teal-300 transition-transform group-hover:translate-x-1" />
          </div>
          <span className="mt-6 inline-flex items-center justify-center rounded-lg bg-teal-400 px-4 py-2.5 text-sm font-bold text-teal-950 transition-colors group-hover:bg-teal-300">
            {primaryStep.cta}
          </span>
        </Link>

        <div className="grid gap-4">
          {secondarySteps.map((step) => (
            <Link
              key={step.title}
              href={step.href}
              className="group rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 hover:border-teal-400/35 hover:bg-white/[0.07]"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-background/45 text-teal-300">
                  <step.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{step.title}</p>
                  <p className="mt-1 text-sm leading-5 text-muted-foreground">{step.desc}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-teal-300 group-hover:text-teal-200">
                    {step.cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link href="/academy" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          {t("skip")}
        </Link>
      </div>
    </main>
  );
}

import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, CheckCircle2, Download, GraduationCap, ShieldCheck } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { analytics } from "@/hooks/use-analytics";
import { useSEO } from "@/hooks/use-seo";

const REDIRECT_SECONDS = 3;

export default function PaymentSuccessPage() {
  const { t } = useTranslation("pages");
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);

  const sessionId = new URLSearchParams(window.location.search).get("session_id");
  const productType = new URLSearchParams(window.location.search).get("product") ?? "unknown";
  const isDiagnostic = productType === "scope_diagnostic";
  const isKit = productType !== "unknown" && !productType.startsWith("pro_subscription") && !isDiagnostic;
  const destination = isDiagnostic ? "/quality-lab/review?offer=diagnostic" : isKit ? "/my-downloads" : "/academy";
  const destinationLabel = isDiagnostic ? "Complete Diagnostic intake" : isKit ? "Go to my downloads" : t("paymentSuccess.goNow");

  useSEO({
    title: "Payment successful",
    description: "Your Life Science Atlas access is ready.",
  });

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    analytics.purchaseCompleted(productType);
  }, [queryClient, productType]);

  useEffect(() => {
    if (countdown <= 0) {
      navigate(destination);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, navigate, destination]);

  const nextSteps = isDiagnostic
    ? [
        "Complete the Diagnostic intake with your decision and available evidence.",
        "Atlas confirms fit and schedules one 60-minute stakeholder workshop.",
        "Receive the written scope and decision memo within two business days after the workshop.",
      ]
    : isKit
      ? [
        "Open the download library and save your files.",
        "Keep the templates with your site procedures.",
        "Return any time from My downloads.",
        ]
      : [
        "Open Academy and continue your learning path.",
        "Use Pro lessons, toolkits, and premium tools.",
        "Track learning-path completion records from My learning.",
      ];

  return (
    <main className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-5xl items-center px-4 py-8">
      <section className="w-full overflow-hidden rounded-lg border border-teal-400/20 bg-gradient-to-br from-teal-500/12 via-white/[0.045] to-emerald-500/10 p-6 text-center shadow-xl shadow-black/15 md:p-8">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-lg border border-teal-400/25 bg-teal-400/10 text-teal-300">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">Payment confirmed</p>
        <h1 className="text-3xl font-bold tracking-tight md:text-5xl">{t("paymentSuccess.title")}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
          {isDiagnostic ? "Your $149 Paid Scope Diagnostic is reserved. Atlas will respond within two business days." : isKit ? "Your files are ready in your download library." : t("paymentSuccess.subtitle")}
        </p>

        <div className="mx-auto mt-7 grid max-w-3xl gap-3 text-left md:grid-cols-3">
          {nextSteps.map((step, index) => (
            <div key={step} className="rounded-lg border border-white/10 bg-background/45 p-4">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-teal-300">
                {index === 0 ? <ArrowRight className="h-4 w-4" /> : index === 1 ? <ShieldCheck className="h-4 w-4" /> : <GraduationCap className="h-4 w-4" />}
              </div>
              <p className="text-sm font-medium leading-6">{step}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={destination}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-400 px-6 py-3 text-sm font-bold text-teal-950 transition-colors hover:bg-teal-300 sm:w-auto"
          >
            {isKit ? <Download className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            {destinationLabel}
          </Link>
          <Link
            href="/settings"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 px-6 py-3 text-sm font-semibold transition-colors hover:border-white/30 sm:w-auto"
          >
            Account settings
          </Link>
        </div>

        <p className="mt-5 text-sm text-muted-foreground">
          {isDiagnostic ? `Opening the Diagnostic intake in ${countdown} seconds.` : t("paymentSuccess.redirecting", { count: countdown })}
        </p>

        {sessionId && (
          <p className="mx-auto mt-5 max-w-xl break-all rounded-lg border border-white/10 bg-background/35 p-3 font-mono text-[11px] text-muted-foreground/70">
            {t("paymentSuccess.session")}: {sessionId}
          </p>
        )}
      </section>
    </main>
  );
}

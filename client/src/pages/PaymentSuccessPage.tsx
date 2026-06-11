import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { CheckCircle2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { analytics } from "@/hooks/use-analytics";

const REDIRECT_SECONDS = 3;

export default function PaymentSuccessPage() {
  const { t } = useTranslation("pages");
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);

  // Read session_id + product from query string
  const sessionId = new URLSearchParams(window.location.search).get("session_id");
  const productType = new URLSearchParams(window.location.search).get("product") ?? "unknown";
  // One-time kits deliver files; subscriptions unlock Pro content.
  const isKit = productType !== "unknown" && !productType.startsWith("pro_subscription");
  const destination = isKit ? "/my-downloads" : "/academy";

  useEffect(() => {
    // Refresh auth state so isPro updates immediately
    queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    // Funnel terminal event (client proxy; webhook is the authoritative record)
    analytics.purchaseCompleted(productType);
  }, [queryClient, productType]);

  useEffect(() => {
    if (countdown <= 0) {
      navigate(destination);
      return;
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, navigate, destination]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Animated checkmark */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-teal-500/10 border-2 border-teal-500/30 flex items-center justify-center animate-in zoom-in duration-500">
            <CheckCircle2 className="w-12 h-12 text-teal-400" />
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-3">{t("paymentSuccess.title")}</h1>
        <p className="text-muted-foreground text-lg mb-2">
          {t("paymentSuccess.subtitle")}
        </p>
        <p className="text-sm text-muted-foreground mb-10">
          {t("paymentSuccess.redirecting", { count: countdown })}
        </p>

        <Link href={destination}>
          <button className="w-full sm:w-auto px-8 py-3 bg-teal-500 hover:bg-teal-400 text-teal-950 font-bold rounded-xl transition-all text-sm">
            {isKit ? "Go to my downloads" : t("paymentSuccess.goNow")}
          </button>
        </Link>

        {sessionId && (
          <p className="mt-6 text-[11px] text-muted-foreground/50 font-mono break-all">
            {t("paymentSuccess.session")}: {sessionId}
          </p>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { Gift, X, CheckCircle2, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useUser } from "@/context/UserContext";
import { analytics } from "@/hooks/use-analytics";

export function LeadMagnetBanner() {
  const { t } = useTranslation("common");
  const { isAuthenticated } = useUser();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [dismissed, setDismissed] = useState(false);

  if (isAuthenticated || dismissed) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/leads/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "lead_magnet" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message ?? "Something went wrong");
      }

      analytics.leadCaptured("lead_magnet_banner");
      setStatus("success");
    } catch (err: any) {
      setErrorMsg(err.message ?? "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="relative rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5 mb-6 overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="relative z-10">
        {status === "success" ? (
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground text-sm">{t("leadMagnet.successTitle")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t("leadMagnet.successDesc")}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                <Gift className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground leading-tight">
                  {t("leadMagnet.title")}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("leadMagnet.subtitle")}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2 shrink-0">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("leadMagnet.placeholder")}
                required
                disabled={status === "loading"}
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40 w-44 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status === "loading" || !email.trim()}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0"
              >
                {status === "loading" ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {t("leadMagnet.submitting")}</>
                ) : t("leadMagnet.submit")}
              </button>
            </form>
          </div>
        )}

        {status === "error" && (
          <p className="text-xs text-red-400 mt-2">{errorMsg}</p>
        )}
      </div>
    </div>
  );
}

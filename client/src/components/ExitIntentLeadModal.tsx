import { useEffect, useState } from "react";
import { Gift, CheckCircle2, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useUser } from "@/context/UserContext";
import { analytics, capture } from "@/hooks/use-analytics";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const SESSION_KEY = "lsa_exit_intent_shown";
const LEGACY_SESSION_KEY = "bwp_exit_intent_shown";

/**
 * One-time, guest-only exit-intent capture for the free GMP checklist. Fires when
 * the cursor leaves the top of the viewport (desktop intent to close/switch tab),
 * at most once per session, and never for signed-in users. Mobile has no
 * equivalent gesture, so it simply never triggers there (no annoyance).
 */
export function ExitIntentLeadModal() {
  const { t } = useTranslation("common");
  const { isAuthenticated } = useUser();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isAuthenticated) return;
    if (typeof window === "undefined") return;
    try {
      const alreadyShown = sessionStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(LEGACY_SESSION_KEY);
      if (alreadyShown) {
        sessionStorage.setItem(SESSION_KEY, alreadyShown);
        sessionStorage.removeItem(LEGACY_SESSION_KEY);
        return;
      }
    } catch {
      /* private mode — just proceed */
    }
    // Desktop only (mouse pointer); skip touch devices.
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let armed = false;
    const arm = setTimeout(() => { armed = true; }, 8000); // give them a moment first

    const onLeave = (e: MouseEvent) => {
      if (!armed || e.clientY > 0) return;
      try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* ignore */ }
      capture("exit_intent_shown");
      setOpen(true);
      document.removeEventListener("mouseout", onLeave);
    };
    document.addEventListener("mouseout", onLeave);
    return () => {
      clearTimeout(arm);
      document.removeEventListener("mouseout", onLeave);
    };
  }, [isAuthenticated]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/leads/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "exit_intent" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? "Something went wrong");
      }
      analytics.leadCaptured("exit_intent");
      setStatus("success");
    } catch (err: any) {
      setErrorMsg(err.message ?? "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (isAuthenticated) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="w-11 h-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center mb-2">
            <Gift className="w-5 h-5" />
          </div>
          <DialogTitle>{t("leadMagnet.title")}</DialogTitle>
          <DialogDescription>{t("leadMagnet.subtitle")}</DialogDescription>
        </DialogHeader>

        {status === "success" ? (
          <div className="flex items-start gap-3 py-2">
            <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">{t("leadMagnet.successTitle")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t("leadMagnet.successDesc")}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("leadMagnet.placeholder")}
              required
              disabled={status === "loading"}
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status === "loading" || !email.trim()}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-1.5 shrink-0"
            >
              {status === "loading" ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {t("leadMagnet.submitting")}</>
              ) : t("leadMagnet.submit")}
            </button>
          </form>
        )}
        {status === "error" && <p className="text-xs text-red-400">{errorMsg}</p>}
      </DialogContent>
    </Dialog>
  );
}

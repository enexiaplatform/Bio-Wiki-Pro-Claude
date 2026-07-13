import { useState } from "react";
import { MailWarning, Loader2, CheckCircle2 } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

/**
 * Non-blocking reminder for logged-in users who haven't confirmed their email.
 * Hidden for guests and verified users. Lets them resend the confirm link.
 */
export function VerifyEmailBanner() {
  const { user, isAuthenticated } = useUser();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  // `verifiedEmail` comes from GET /api/auth/me.
  if (!isAuthenticated || !user || (user as { verifiedEmail?: boolean }).verifiedEmail) return null;

  async function resend() {
    setBusy(true);
    try {
      await apiRequest("POST", "/api/auth/resend-verification", {});
      setSent(true);
      toast({ title: "Verification email sent", description: "Check your inbox (and spam)." });
    } catch (e: any) {
      toast({ title: "Couldn't send", description: e?.message || "Please try again later.", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside className="mb-6 flex flex-col gap-3 rounded-lg border border-amber-400/20 bg-amber-400/5 px-4 py-3 sm:flex-row sm:items-center" aria-live="polite">
      <MailWarning className="w-5 h-5 text-amber-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">Confirm your email</p>
        <p className="text-xs text-muted-foreground">
          Confirm <span className="text-foreground">{user.email}</span> so recovery and account notices reach the right inbox.
        </p>
      </div>
      {sent ? (
        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 shrink-0">
          <CheckCircle2 className="w-4 h-4" /> Sent
        </span>
      ) : (
        <button
          type="button"
          onClick={resend}
          disabled={busy}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-amber-400/30 px-3 py-2 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 disabled:opacity-60"
        >
          {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Resend
        </button>
      )}
    </aside>
  );
}

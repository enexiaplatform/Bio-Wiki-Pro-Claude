import { useEffect, useState } from "react";
import { Link } from "wouter";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/use-seo";

type State = "loading" | "ok" | "error";

export default function VerifyEmailPage() {
  useSEO({ title: "Verify email", description: "Confirm your Life Science Atlas email address." });
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token") ?? "";
    if (!token) {
      setState("error");
      return;
    }
    let active = true;
    apiRequest("POST", "/api/auth/verify-email", { token })
      .then(() => active && setState("ok"))
      .catch(() => active && setState("error"));
    return () => {
      active = false;
    };
  }, []);

  const copy = {
    loading: {
      title: "Verifying email",
      description: "Confirming your email address with Life Science Atlas.",
      icon: <Loader2 className="h-5 w-5 animate-spin" />,
    },
    ok: {
      title: "Email verified",
      description: "Thanks. Your email is confirmed and your workspace is ready.",
      icon: <CheckCircle2 className="h-5 w-5" />,
    },
    error: {
      title: "Verification failed",
      description: "This link is invalid or has expired. Sign in and request a new verification email if needed.",
      icon: <XCircle className="h-5 w-5" />,
    },
  }[state];

  return (
    <AuthShell
      eyebrow="Email verification"
      title="Secure your professional workspace"
      description="Verified email keeps your account recoverable and protects access to saved notes, downloads, and Pro content."
      footer={
        <Link href="/login" className="font-semibold text-teal-300 hover:text-teal-200">
          Back to sign in
        </Link>
      }
    >
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-teal-400/20 bg-teal-400/10 text-teal-300">
          {copy.icon}
        </div>
        <div>
          <h2 className="text-2xl font-bold">{copy.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{copy.description}</p>
        </div>
      </div>

      {state !== "loading" && (
        <Button asChild className="w-full bg-teal-400 font-bold text-teal-950 hover:bg-teal-300">
          <Link href="/academy">Go to the Academy</Link>
        </Button>
      )}
    </AuthShell>
  );
}

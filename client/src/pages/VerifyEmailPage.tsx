import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/use-seo";

type State = "loading" | "ok" | "missing" | "error";

export default function VerifyEmailPage() {
  useSEO({ title: "Verify email", description: "Confirm your Life Science Atlas email address." });
  const [token] = useState(() => new URLSearchParams(window.location.search).get("token") ?? "");
  const [state, setState] = useState<State>(token ? "loading" : "missing");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token) return;
    let active = true;
    apiRequest("POST", "/api/auth/verify-email", { token })
      .then(async () => {
        await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        if (active) setState("ok");
      })
      .catch(() => active && setState("error"));
    return () => {
      active = false;
    };
  }, [queryClient, token]);

  const copy = {
    loading: {
      title: "Verifying email",
      description: "Confirming your email address with Life Science Atlas.",
      icon: <Loader2 className="h-5 w-5 animate-spin" />,
    },
    ok: {
      title: "Email verified",
      description: "Your account contact email is confirmed.",
      icon: <CheckCircle2 className="h-5 w-5" />,
    },
    missing: {
      title: "Verification link incomplete",
      description: "This link is missing its verification token. Sign in to request a fresh email.",
      icon: <XCircle className="h-5 w-5" />,
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
      description="A confirmed contact email supports account recovery and helps keep account notices tied to the right person. Verification does not replace your organization's access or approval controls."
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
          <Link href={state === "ok" ? "/quality-lab/projects" : "/login?returnTo=/settings"}>
            {state === "ok" ? "View Blueprint projects" : "Sign in to request a new link"}
          </Link>
        </Button>
      )}
    </AuthShell>
  );
}

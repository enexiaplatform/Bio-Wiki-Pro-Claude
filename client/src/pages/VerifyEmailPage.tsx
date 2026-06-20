import { useEffect, useState } from "react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
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

  const icon =
    state === "loading" ? <Loader2 className="w-6 h-6 text-white animate-spin" /> :
    state === "ok" ? <CheckCircle2 className="w-6 h-6 text-white" /> :
    <XCircle className="w-6 h-6 text-white" />;

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-white/10 bg-card">
        <CardHeader className="space-y-1 text-center">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center mx-auto mb-4">
            {icon}
          </div>
          <CardTitle className="text-2xl font-bold">
            {state === "loading" ? "Verifying…" : state === "ok" ? "Email verified" : "Verification failed"}
          </CardTitle>
          <CardDescription>
            {state === "loading"
              ? "Confirming your email address."
              : state === "ok"
              ? "Thanks — your email is confirmed. You're all set."
              : "This link is invalid or has expired. You can request a new one from your account."}
          </CardDescription>
        </CardHeader>
        {state !== "loading" && (
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/academy">Go to the Academy</Link>
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

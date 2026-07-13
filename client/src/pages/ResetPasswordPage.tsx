import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, KeyRound } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/use-seo";

function getToken(): string {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("token") ?? "";
}

export default function ResetPasswordPage() {
  useSEO({ title: "Reset password", description: "Set a new password for your Life Science Atlas account." });
  const [token] = useState(getToken);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (password.length < 8) {
      setFormError("Use at least 8 characters for your new password.");
      return;
    }
    if (password !== confirm) {
      setFormError("The two passwords do not match. Re-enter the confirmation.");
      return;
    }
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/reset-password", { token, password });
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Password updated", description: "You are now signed in." });
      setLocation("/quality-lab/projects");
    } catch (err: any) {
      setFormError(err.message || "This link may be invalid or expired. Request a fresh reset link.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Secure reset"
      title={token ? "Create a new password" : "Request a fresh reset link"}
      description={
        token
          ? "Choose a password you have not used before. After it updates, you will return to your Blueprint projects."
          : "This reset link is missing its token. Request a new one and use the latest email from Life Science Atlas."
      }
      footer={
        <Link href="/login" className="font-semibold text-teal-300 hover:text-teal-200">
          Back to sign in
        </Link>
      }
    >
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-teal-400/20 bg-teal-400/10 text-teal-300">
          <KeyRound className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{token ? "Set a new password" : "Invalid reset link"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {token ? "Use at least 8 characters." : "The link is incomplete."}
          </p>
        </div>
      </div>

      {!token ? (
        <Button asChild className="w-full bg-teal-400 font-bold text-teal-950 hover:bg-teal-300">
          <Link href="/forgot-password">Request a new link</Link>
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                aria-describedby="password-help"
              />
              <p id="password-help" className="text-xs leading-5 text-muted-foreground">
                Use a unique password with 8 or more characters.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input
                id="confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
          </div>
          {formError && (
            <div role="alert" className="flex gap-2 rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-sm leading-5 text-red-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}
          <Button type="submit" className="w-full bg-teal-400 font-bold text-teal-950 hover:bg-teal-300" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update password"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

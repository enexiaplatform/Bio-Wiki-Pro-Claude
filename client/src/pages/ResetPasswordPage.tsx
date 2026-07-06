import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { KeyRound } from "lucide-react";
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
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({ title: "Password too short", description: "Use at least 8 characters.", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Passwords do not match", description: "Please re-enter them.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/reset-password", { token, password });
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Password updated", description: "You are now signed in." });
      setLocation("/academy");
    } catch (err: any) {
      toast({
        title: "Could not reset password",
        description: err.message || "This link may be invalid or expired.",
        variant: "destructive",
      });
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
          ? "Choose a password you have not used before. After it updates, you will go back to your Academy workspace."
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
            {token ? "Use at least 8 characters." : "The link is incomplete or expired."}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full bg-teal-400 font-bold text-teal-950 hover:bg-teal-300" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update password"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

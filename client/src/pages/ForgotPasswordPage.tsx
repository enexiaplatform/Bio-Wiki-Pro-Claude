import { useState } from "react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MailCheck, RotateCcw } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";
import { AuthShell } from "@/components/AuthShell";

export default function ForgotPasswordPage() {
  useSEO({ title: "Forgot password", description: "Reset your Life Science Atlas password." });
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/forgot-password", { email });
    } catch {
      // The endpoint is enumeration-safe; show the same state either way.
    } finally {
      setIsLoading(false);
      setSent(true);
    }
  };

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset access without losing your workspace"
      description="Use your account email and we will send a secure reset link. Your saved lessons, notes, and downloads stay attached to the same account."
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className="font-semibold text-teal-300 hover:text-teal-200">
            Sign in
          </Link>
        </>
      }
    >
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-teal-400/20 bg-teal-400/10 text-teal-300">
          {sent ? <MailCheck className="h-5 w-5" /> : <RotateCcw className="h-5 w-5" />}
        </div>
        <div>
          <h2 className="text-2xl font-bold">{sent ? "Check your inbox" : "Forgot password?"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {sent
              ? "If an account exists for that email, we sent a reset link. It expires in 1 hour."
              : "Enter your email and we will send a link to reset your password."}
          </p>
        </div>
      </div>

      {sent ? (
        <div className="space-y-4">
          <p className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-muted-foreground">
            Did not get it? Check spam, or{" "}
            <button type="button" onClick={() => setSent(false)} className="font-semibold text-teal-300 hover:text-teal-200">
              try again
            </button>
            .
          </p>
          <Button asChild className="w-full bg-teal-400 font-bold text-teal-950 hover:bg-teal-300">
            <Link href="/login">Back to sign in</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m.curie@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full bg-teal-400 font-bold text-teal-950 hover:bg-teal-300" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

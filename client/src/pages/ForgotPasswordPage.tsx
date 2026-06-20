import { useState } from "react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { FlaskConical, MailCheck } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";

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
      // Endpoint always succeeds (enumeration protection); ignore errors.
    } finally {
      setIsLoading(false);
      setSent(true);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-white/10 bg-card">
        <CardHeader className="space-y-1 text-center">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center mx-auto mb-4">
            {sent ? <MailCheck className="w-6 h-6 text-white" /> : <FlaskConical className="w-6 h-6 text-white" />}
          </div>
          <CardTitle className="text-2xl font-bold">{sent ? "Check your inbox" : "Forgot password?"}</CardTitle>
          <CardDescription>
            {sent
              ? "If an account exists for that email, we've sent a reset link. It expires in 1 hour."
              : "Enter your email and we'll send you a link to reset your password."}
          </CardDescription>
        </CardHeader>

        {sent ? (
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Didn't get it? Check spam, or{" "}
              <button onClick={() => setSent(false)} className="text-primary hover:underline">
                try again
              </button>
              .
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">Back to sign in</Link>
            </Button>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
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
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending…" : "Send reset link"}
              </Button>
              <div className="text-sm text-center text-muted-foreground">
                Remembered it?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}

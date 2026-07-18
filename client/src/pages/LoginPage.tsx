import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LogIn } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSEO } from "@/hooks/use-seo";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { AuthShell } from "@/components/AuthShell";
import { authPath, safeAuthReturnTo } from "@shared/auth-return";

export default function LoginPage() {
  const { t } = useTranslation("auth");
  useSEO({ title: t("login.seoTitle"), description: t("login.seoDesc") });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const returnTo = useMemo(() => safeAuthReturnTo(window.location.search, "/quality-lab/projects"), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/auth/login", { email, password });
      const account = await response.json() as { isAdmin?: boolean };
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setLocation(account.isAdmin && returnTo === "/quality-lab/projects" ? "/admin" : returnTo);
    } catch (err: any) {
      toast({
        title: t("login.failTitle"),
        description: err.message || t("login.failDesc"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Member access"
      title="Continue your Atlas workspace"
      description="Return to your reviewed Blueprint projects, available downloads, learning progress, and supporting evidence."
      footer={
        <>
          {t("login.noAccount")}{" "}
          <Link href={authPath("/register", returnTo)} className="font-semibold text-teal-300 hover:text-teal-200">
            {t("login.signUp")}
          </Link>
        </>
      }
    >
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-teal-400/20 bg-teal-400/10 text-teal-300">
          <LogIn className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{t("login.title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("login.subtitle")}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("login.email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder="m.curie@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="password">{t("login.password")}</Label>
              <Link href="/forgot-password" className="text-xs font-medium text-teal-300 hover:text-teal-200">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full bg-teal-400 font-bold text-teal-950 hover:bg-teal-300" disabled={isLoading}>
          {isLoading ? t("login.submitting") : t("login.submit")}
        </Button>
        <GoogleSignInButton redirectTo={returnTo} />
      </form>
    </AuthShell>
  );
}

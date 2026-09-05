import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSEO } from "@/hooks/use-seo";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { analytics } from "@/hooks/use-analytics";
import { AuthShell } from "@/components/AuthShell";
import { authPath, isAdminWorkspaceReturnTo, safeAuthReturnTo } from "@shared/auth-return";

export default function RegisterPage() {
  const { t } = useTranslation("auth");
  useSEO({ title: t("register.seoTitle"), description: t("register.seoDesc") });
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const returnTo = useMemo(() => {
    const requested = safeAuthReturnTo(window.location.search, "/welcome");
    return isAdminWorkspaceReturnTo(requested) ? "/quality-lab/projects" : requested;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    analytics.signupStarted("email");

    if (password !== confirmPassword) {
      toast({
        title: t("register.mismatchTitle"),
        description: t("register.mismatchDesc"),
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      toast({
        title: t("register.shortTitle"),
        description: t("register.shortDesc"),
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiRequest("POST", "/api/auth/register", {
        email, 
        password, 
        firstName, 
        lastName 
      });
      const account = await response.json() as { isAdmin?: boolean };
      analytics.signupCompleted("email");
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setLocation(account.isAdmin && returnTo === "/welcome" ? "/admin" : returnTo);
    } catch (err: any) {
      toast({
        title: t("register.failTitle"),
        description: err.message || t("register.failDesc"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Free account"
      title="Create your Atlas workspace"
      description="Start with a laboratory Blueprint, then connect reviewed projects, learning progress, downloads, and supporting evidence to your account."
      footer={
        <>
          {t("register.haveAccount")}{" "}
          <Link href={authPath("/login", returnTo)} className="font-semibold text-teal-300 hover:text-teal-200">
            {t("register.signIn")}
          </Link>
        </>
      }
    >
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-teal-400/20 bg-teal-400/10 text-teal-300">
          <UserPlus className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{t("register.title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("register.subtitle")}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">{t("register.firstName")}</Label>
              <Input
                id="firstName"
                name="firstName"
                autoComplete="given-name"
                placeholder="Marie"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{t("register.lastName")}</Label>
              <Input
                id="lastName"
                name="lastName"
                autoComplete="family-name"
                placeholder="Curie"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t("register.email")}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="m.curie@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("register.password")}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder={t("register.passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">{t("register.shortDesc")}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t("register.confirmPassword")}</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder={t("register.confirmPlaceholder")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full bg-teal-400 font-bold text-teal-950 hover:bg-teal-300" disabled={isLoading}>
          {isLoading ? t("register.submitting") : t("register.submit")}
        </Button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="font-semibold text-teal-300 hover:text-teal-200">Terms</Link>{" "}
          and acknowledge our{" "}
          <Link href="/privacy" className="font-semibold text-teal-300 hover:text-teal-200">Privacy Policy</Link>.
        </p>
        <GoogleSignInButton redirectTo={returnTo} />
      </form>
    </AuthShell>
  );
}

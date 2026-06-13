import { useState } from "react";
import { Link, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { FlaskConical } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSEO } from "@/hooks/use-seo";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { analytics } from "@/hooks/use-analytics";

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
      await apiRequest("POST", "/api/auth/register", {
        email, 
        password, 
        firstName, 
        lastName 
      });
      analytics.signupCompleted("email");
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setLocation("/welcome");
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
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-white/10 bg-card">
        <CardHeader className="space-y-1 text-center">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center mx-auto mb-4">
            <FlaskConical className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">{t("register.title")}</CardTitle>
          <CardDescription>
            {t("register.subtitle")}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t("register.firstName")}</Label>
                <Input 
                  id="firstName" 
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
                type="email" 
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
                type="password"
                placeholder={t("register.passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("register.confirmPassword")}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={t("register.confirmPlaceholder")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t("register.submitting") : t("register.submit")}
            </Button>
            <GoogleSignInButton redirectTo="/welcome" />
            <div className="text-sm text-center text-muted-foreground">
              {t("register.haveAccount")}{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                {t("register.signIn")}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

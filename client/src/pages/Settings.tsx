import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { Shield, ChevronRight, LogOut, LogIn, Crown, Loader2, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { t } = useTranslation("pages");
  const { user, isAuthenticated, isPro, logout } = useUser();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [portalBusy, setPortalBusy] = useState(false);

  // Open the Stripe customer portal so a Pro member can manage/cancel billing.
  async function openBillingPortal() {
    setPortalBusy(true);
    try {
      const res = await fetch("/api/stripe/customer-portal", { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.message ?? "Could not open billing portal");
      window.location.href = data.url;
    } catch (e: any) {
      toast({ title: "Billing", description: e.message ?? "Could not open billing portal", variant: "destructive" });
      setPortalBusy(false);
    }
  }

  return (
    <div className="pb-24 pt-4 md:pt-8 max-w-2xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8">{t("settings.title")}</h1>

      <div className="bg-card border border-white/10 rounded-2xl overflow-hidden mb-8">
        {isAuthenticated && user ? (
          <div className="p-6 border-b border-white/5 flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.profileImageUrl ?? undefined} alt={user.firstName ?? "User"} />
              <AvatarFallback className="text-2xl font-bold font-display bg-primary/10 text-primary">
                {user.firstName?.[0] ?? user.email?.[0]?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold" data-testid="text-settings-name">
                  {[user.firstName, user.lastName].filter(Boolean).join(" ") || "User"}
                </h2>
                {isPro && (
                  <Badge className="bg-primary/10 text-primary border-primary/20" data-testid="badge-settings-pro">
                    <Crown className="w-3 h-3 mr-1" /> Pro
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground" data-testid="text-settings-email">{user.email ?? t("settings.noEmail")}</p>
            </div>
          </div>
        ) : (
          <div className="p-6 border-b border-white/5 text-center">
            <p className="text-muted-foreground mb-4">{t("settings.signInPrompt")}</p>
            <Button asChild data-testid="button-settings-login">
              <Link href="/login">
                <LogIn className="w-4 h-4 mr-1.5" />
                {t("settings.signIn")}
              </Link>
            </Button>
          </div>
        )}

        <div className="p-6 bg-gradient-to-r from-primary/10 to-transparent flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-lg text-primary">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">{t("settings.planStatus")}</p>
              <p className="text-xs text-muted-foreground">{isPro ? t("settings.proMember") : t("settings.freeTier")}</p>
            </div>
          </div>
          {!isAuthenticated ? (
            <Button variant="outline" size="sm" asChild data-testid="button-settings-upgrade-login">
              <Link href="/login">{t("settings.signInToUpgrade")}</Link>
            </Button>
          ) : isPro ? (
            <Button
              variant="outline"
              size="sm"
              onClick={openBillingPortal}
              disabled={portalBusy}
              data-testid="button-settings-plan"
            >
              {portalBusy ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <SettingsIcon className="w-4 h-4 mr-1.5" />}
              {t("settings.managePlan")}
            </Button>
          ) : (
            <Button size="sm" onClick={() => setLocation("/upgrade")} data-testid="button-settings-plan">
              <Crown className="w-4 h-4 mr-1.5" />
              {t("settings.upgrade")}
            </Button>
          )}
        </div>
      </div>

      {isAuthenticated && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-2">{t("settings.preferences")}</h3>

          <div className="bg-card border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5">
            {isPro && (
              <button
                onClick={openBillingPortal}
                disabled={portalBusy}
                className="w-full p-4 flex items-center gap-4 hover:bg-white/5 cursor-pointer transition-colors group text-left disabled:opacity-60"
                data-testid="button-settings-billing"
              >
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors">
                  {portalBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <SettingsIcon className="w-4 h-4" />}
                </div>
                <span className="flex-1 font-medium">{t("settings.billing")}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
            <div
              onClick={logout}
              className="p-4 flex items-center gap-4 hover:bg-white/5 cursor-pointer transition-colors group"
              data-testid="button-settings-logout"
            >
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                <LogOut className="w-4 h-4" />
              </div>
              <span className="flex-1 font-medium text-red-500">{t("settings.signOut")}</span>
            </div>
          </div>
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground mt-12">
        BioWikiPro v1.0.0
      </p>
    </div>
  );
}

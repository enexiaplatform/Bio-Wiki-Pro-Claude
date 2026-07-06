import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ChevronRight,
  Crown,
  Download,
  GraduationCap,
  Loader2,
  LogIn,
  LogOut,
  Settings as SettingsIcon,
  Shield,
  UserRound,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";
import { useTranslation } from "react-i18next";

const panelClass = "rounded-lg border border-white/10 bg-white/[0.035] p-5 shadow-lg shadow-black/10 md:p-6";

export default function Settings() {
  const { t } = useTranslation("pages");
  const { user, isAuthenticated, isPro, logout } = useUser();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [portalBusy, setPortalBusy] = useState(false);

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

  const displayName = user ? [user.firstName, user.lastName].filter(Boolean).join(" ") || "User" : "Guest";

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-4 md:pt-8">
      <section className="mb-6 overflow-hidden rounded-lg border border-teal-400/20 bg-gradient-to-br from-teal-500/12 via-white/[0.045] to-emerald-500/10 p-6 shadow-xl shadow-black/15 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-400/25 bg-teal-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-200">
              <SettingsIcon className="h-3.5 w-3.5" />
              Account settings
            </span>
            <h1 className="mt-5 font-display text-3xl font-bold leading-tight md:text-5xl">{t("settings.title")}</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Manage your account, plan, and personal learning workspace.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-background/35 p-4">
            <p className="text-sm font-bold">{isPro ? t("settings.proMember") : t("settings.freeTier")}</p>
            <p className="mt-1 text-xs text-muted-foreground">{isAuthenticated ? "Signed in" : "Guest mode"}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <section className={panelClass}>
          {isAuthenticated && user ? (
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.profileImageUrl ?? undefined} alt={user.firstName ?? "User"} />
                <AvatarFallback className="bg-teal-400/10 font-display text-2xl font-bold text-teal-200">
                  {user.firstName?.[0] ?? user.email?.[0]?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-2xl font-bold" data-testid="text-settings-name">
                    {displayName}
                  </h2>
                  {isPro && (
                    <Badge className="border-teal-400/20 bg-teal-400/10 text-teal-200" data-testid="badge-settings-pro">
                      <Crown className="mr-1 h-3 w-3" />
                      Pro
                    </Badge>
                  )}
                </div>
                <p className="mt-1 truncate text-sm text-muted-foreground" data-testid="text-settings-email">
                  {user.email ?? t("settings.noEmail")}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-muted-foreground">
                <UserRound className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold">Sign in to personalize Life Science Atlas</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{t("settings.signInPrompt")}</p>
              <Button asChild className="mt-5" data-testid="button-settings-login">
                <Link href="/login">
                  <LogIn className="mr-1.5 h-4 w-4" />
                  {t("settings.signIn")}
                </Link>
              </Button>
            </div>
          )}
        </section>

        <section className={`${panelClass} bg-gradient-to-br from-teal-400/10 via-white/[0.035] to-transparent`}>
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg border border-teal-400/20 bg-teal-400/10 p-2 text-teal-200">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold">{t("settings.planStatus")}</p>
                <p className="mt-1 text-sm text-muted-foreground">{isPro ? t("settings.proMember") : t("settings.freeTier")}</p>
              </div>
            </div>
          </div>

          {!isAuthenticated ? (
            <Button variant="outline" asChild data-testid="button-settings-upgrade-login">
              <Link href="/login">{t("settings.signInToUpgrade")}</Link>
            </Button>
          ) : isPro ? (
            <Button variant="outline" onClick={openBillingPortal} disabled={portalBusy} data-testid="button-settings-plan">
              {portalBusy ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <SettingsIcon className="mr-1.5 h-4 w-4" />}
              {t("settings.managePlan")}
            </Button>
          ) : (
            <Button onClick={() => setLocation("/pricing")} data-testid="button-settings-plan">
              <Crown className="mr-1.5 h-4 w-4" />
              {t("settings.upgrade")}
            </Button>
          )}
        </section>
      </div>

      {isAuthenticated && (
        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-muted-foreground">{t("settings.preferences")}</h3>
          </div>

          <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.035] shadow-lg shadow-black/10">
            <SettingsLink href="/my-learning" icon={GraduationCap} label="My Learning" testId="link-settings-learning" />
            <SettingsLink href="/my-downloads" icon={Download} label="My Downloads" testId="link-settings-downloads" />
            {isPro && (
              <button
                onClick={openBillingPortal}
                disabled={portalBusy}
                className="flex w-full items-center gap-4 border-t border-white/10 p-4 text-left transition-colors hover:bg-white/5 disabled:opacity-60"
                data-testid="button-settings-billing"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-background/45 text-muted-foreground">
                  {portalBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <SettingsIcon className="h-4 w-4" />}
                </div>
                <span className="flex-1 font-medium">{t("settings.billing")}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
            <button
              onClick={logout}
              className="flex w-full items-center gap-4 border-t border-white/10 p-4 text-left transition-colors hover:bg-red-500/5"
              data-testid="button-settings-logout"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-300">
                <LogOut className="h-4 w-4" />
              </div>
              <span className="flex-1 font-medium text-red-300">{t("settings.signOut")}</span>
            </button>
          </div>
        </section>
      )}

      <p className="mt-12 text-center text-xs text-muted-foreground">Life Science Atlas v1.0.0</p>
    </div>
  );
}

function SettingsLink({
  href,
  icon: Icon,
  label,
  testId,
}: {
  href: string;
  icon: typeof GraduationCap;
  label: string;
  testId: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-4 p-4 transition-colors hover:bg-white/5" data-testid={testId}>
      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-background/45 text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <span className="flex-1 font-medium">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}

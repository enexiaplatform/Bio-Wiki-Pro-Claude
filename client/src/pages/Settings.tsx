import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ChevronRight,
  Crown,
  Download,
  FolderKanban,
  GraduationCap,
  Loader2,
  LogIn,
  LogOut,
  Settings as SettingsIcon,
  ShieldCheck,
  UserPlus,
  UserRound,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VerifyEmailBanner } from "@/components/VerifyEmailBanner";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/use-seo";
import { useUser } from "@/context/UserContext";

const panelClass = "rounded-lg border border-white/10 bg-white/[0.035] p-5 shadow-lg shadow-black/10 md:p-6";

export default function Settings() {
  useSEO({
    title: "Account & access",
    description: "Manage your Life Science Atlas account, Blueprint workspace links, and plan access.",
  });
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

  const displayName = user ? [user.firstName, user.lastName].filter(Boolean).join(" ") || "Atlas member" : "Guest";
  const planLabel = isPro ? "Pro plan" : "Free plan";

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-4 md:pt-8">
      <section className="mb-6 overflow-hidden rounded-lg border border-teal-400/20 bg-gradient-to-br from-teal-500/12 via-white/[0.045] to-emerald-500/10 p-6 shadow-xl shadow-black/15 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-400/25 bg-teal-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-200">
              <SettingsIcon className="h-3.5 w-3.5" />
              Account settings
            </span>
            <h1 className="mt-5 font-display text-3xl font-bold leading-tight md:text-5xl">Account & access</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Manage your identity, plan, and the account-connected records that support your Blueprint work.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-background/35 p-4" aria-label="Current account status">
            <p className="text-sm font-bold">{isAuthenticated ? planLabel : "Guest access"}</p>
            <p className="mt-1 text-xs text-muted-foreground">{isAuthenticated ? "Signed in" : "Local workspace only"}</p>
          </div>
        </div>
      </section>

      {isAuthenticated && <VerifyEmailBanner />}

      {!isAuthenticated ? (
        <section className={`${panelClass} mx-auto max-w-2xl text-center`}>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-muted-foreground">
            <UserRound className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold">Connect this workspace to an account</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
            Sign in to access reviewed Blueprint records, learning progress, downloads, and plan status. Draft Blueprint projects remain in this browser until you submit a review request.
          </p>
          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild data-testid="button-settings-login">
              <Link href="/login?returnTo=/settings">
                <LogIn className="mr-1.5 h-4 w-4" />
                Sign in
              </Link>
            </Button>
            <Button asChild variant="outline" data-testid="button-settings-register">
              <Link href="/register?returnTo=/settings">
                <UserPlus className="mr-1.5 h-4 w-4" />
                Create account
              </Link>
            </Button>
          </div>
        </section>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <section className={panelClass} aria-labelledby="profile-heading">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user?.profileImageUrl ?? undefined} alt="" />
                  <AvatarFallback className="bg-teal-400/10 font-display text-2xl font-bold text-teal-200">
                    {user?.firstName?.[0] ?? user?.email?.[0]?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Signed-in identity</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <h2 id="profile-heading" className="truncate text-2xl font-bold" data-testid="text-settings-name">
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
                    {user?.email ?? "No email available"}
                  </p>
                </div>
              </div>
            </section>

            <section className={`${panelClass} bg-gradient-to-br from-teal-400/10 via-white/[0.035] to-transparent`} aria-labelledby="plan-heading">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-lg border border-teal-400/20 bg-teal-400/10 p-2 text-teal-200">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 id="plan-heading" className="font-bold">Plan & billing</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{planLabel}</p>
                </div>
              </div>
              {isPro ? (
                <Button variant="outline" onClick={openBillingPortal} disabled={portalBusy} data-testid="button-settings-plan">
                  {portalBusy ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <SettingsIcon className="mr-1.5 h-4 w-4" />}
                  Manage plan
                </Button>
              ) : (
                <Button onClick={() => setLocation("/pricing")} data-testid="button-settings-plan">
                  <Crown className="mr-1.5 h-4 w-4" />
                  Compare plans
                </Button>
              )}
            </section>
          </div>

          <section className="mt-6" aria-labelledby="workspace-heading">
            <h2 id="workspace-heading" className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-muted-foreground">Workspace</h2>
            <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.035] shadow-lg shadow-black/10">
              <SettingsLink href="/quality-lab/projects" icon={FolderKanban} label="Blueprint projects" description="Resume local drafts and review submitted project records." testId="link-settings-projects" />
              <SettingsLink href="/my-learning" icon={GraduationCap} label="Evidence learning" description="Continue lessons and learning paths that support your work." testId="link-settings-learning" />
              <SettingsLink href="/my-downloads" icon={Download} label="Available downloads" description="Open account-entitled templates and deliverables." testId="link-settings-downloads" />
            </div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              Data boundary: draft Blueprint projects are stored in this browser. A submitted expert-review request attaches its reviewed snapshot to your account.
            </p>
          </section>

          <section className="mt-8 border-t border-white/10 pt-6" aria-labelledby="session-heading">
            <h2 id="session-heading" className="text-sm font-bold">Session</h2>
            <p className="mt-1 text-sm text-muted-foreground">Signing out does not remove drafts stored in this browser.</p>
            <Button variant="outline" onClick={logout} className="mt-4 border-red-500/20 text-red-300 hover:bg-red-500/10 hover:text-red-200" data-testid="button-settings-logout">
              <LogOut className="mr-1.5 h-4 w-4" />
              Sign out
            </Button>
          </section>
        </>
      )}
    </div>
  );
}

function SettingsLink({
  href,
  icon: Icon,
  label,
  description,
  testId,
}: {
  href: string;
  icon: typeof GraduationCap;
  label: string;
  description: string;
  testId: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 border-b border-white/10 p-4 transition-colors last:border-b-0 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-300"
      data-testid={testId}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-background/45 text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{label}</span>
        <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{description}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}

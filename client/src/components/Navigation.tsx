import { Link, useLocation } from "wouter";
import { BookOpen, Calculator, ShieldCheck, Briefcase, FlaskConical, TrendingUp, LogIn, LogOut, Crown, NotebookPen, Package, Search } from "lucide-react";

const openSearch = () => window.dispatchEvent(new Event("bwp:open-search"));
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// `key` maps to nav.json translation keys; `name` is the fallback label.
const mobileTabs = [
  { key: "qcHub", name: "QC Hub", icon: FlaskConical, path: "/qc-hub" },
  { key: "academy", name: "Academy", icon: BookOpen, path: "/academy" },
  { key: "tools", name: "Tools", icon: Calculator, path: "/tools" },
  { key: "compliance", name: "Compliance", icon: ShieldCheck, path: "/compliance" },
  { key: "vault", name: "Vault", icon: NotebookPen, path: "/vault" },
];

const desktopTabs = [
  { key: "qcHub", name: "QC Hub", icon: FlaskConical, path: "/qc-hub" },
  { key: "academy", name: "Academy", icon: BookOpen, path: "/academy" },
  { key: "tools", name: "Tools", icon: Calculator, path: "/tools" },
  { key: "compliance", name: "Compliance", icon: ShieldCheck, path: "/compliance" },
  { key: "vault", name: "Vault", icon: NotebookPen, path: "/vault" },
  { key: "career", name: "Career", icon: Briefcase, path: "/career" },
  { key: "toolkits", name: "Toolkits", icon: Package, path: "/toolkits/gmp-audit-kit" },
  { key: "insights", name: "Insights", icon: TrendingUp, path: "/insights" },
];

export function BottomNav() {
  const [location] = useLocation();
  const { t } = useTranslation("nav");

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-lg border-t border-white/10 px-4 pb-safe pt-2 z-50 md:hidden">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {mobileTabs.map((tab) => {
          const isActive = location.startsWith(tab.path) || (location === "/" && tab.path === "/qc-hub");
          return (
            <Link key={tab.name} href={tab.path} className="flex flex-col items-center gap-1 p-2 w-full" data-testid={`nav-mobile-${tab.name.toLowerCase().replace(/\s+/g, '-')}`}>
              <div className={clsx(
                "relative p-1.5 rounded-xl transition-all duration-300",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}>
                {isActive && (
                  <div className="absolute inset-0 bg-primary/15 rounded-xl transition-all duration-300" />
                )}
                <tab.icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={clsx("text-[10px] font-medium", isActive ? "text-primary" : "text-muted-foreground")}>
                {t(tab.key)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function DesktopNav() {
  const [location] = useLocation();
  const { t } = useTranslation("nav");
  const { user, isAuthenticated, isPro, logout } = useUser();

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-16 bg-background/80 backdrop-blur-md border-b border-white/5 hidden md:flex items-center px-8">
      <Link href="/" className="flex items-center gap-2 mr-12 hover:opacity-80 transition-opacity">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
          <span className="text-white font-bold text-lg">B</span>
        </div>
        <span className="font-display font-bold text-xl tracking-tight">BioWiki<span className="text-primary">Pro</span></span>
      </Link>

      <nav className="flex items-center gap-1">
        {desktopTabs.map((tab) => {
          const isActive = location.startsWith(tab.path) || (location === "/" && tab.path === "/qc-hub");
          return (
            <Link key={tab.name} href={tab.path} className={clsx(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
              isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )} data-testid={`nav-desktop-${tab.name.toLowerCase().replace(/\s+/g, '-')}`}>
              <tab.icon className="w-4 h-4" />
              {t(tab.key)}
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-3">
        <button
          onClick={openSearch}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-white/20 transition-colors"
          aria-label="Search"
        >
          <Search className="w-3.5 h-3.5" /> Search
          <kbd className="ml-1 rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-mono">⌘K</kbd>
        </button>
        {isAuthenticated ? (
          <>
            {isPro && (
              <Badge className="bg-primary/10 text-primary border-primary/20" data-testid="badge-pro-status">
                <Crown className="w-3 h-3 mr-1" /> Pro
              </Badge>
            )}
            <Link href="/my-learning" className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-white/5 transition-colors" title="My learning" data-testid="link-my-learning">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.profileImageUrl ?? undefined} alt={user?.firstName ?? "User"} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {user?.firstName?.[0] ?? user?.email?.[0]?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden lg:inline" data-testid="text-user-name">
                {user?.firstName ?? user?.email ?? "User"}
              </span>
            </Link>
            <Button variant="ghost" size="icon" onClick={logout} data-testid="button-logout">
              <LogOut className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <Button size="sm" asChild data-testid="button-login">
            <Link href="/login">
              <LogIn className="w-4 h-4 mr-1.5" />
              {t("signIn")}
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}

export function MobileHeader() {
  const { t } = useTranslation("nav");
  const { user, isAuthenticated, isPro, logout } = useUser();

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-white/5 px-4 py-3 md:hidden flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
          <span className="text-white font-bold text-lg">B</span>
        </div>
        <span className="font-display font-bold text-lg tracking-tight">BioWiki<span className="text-primary">Pro</span></span>
        {isPro && (
          <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]" data-testid="badge-pro-mobile">
            <Crown className="w-2.5 h-2.5 mr-0.5" /> Pro
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button onClick={openSearch} className="text-muted-foreground hover:text-foreground p-1.5" aria-label="Search">
          <Search className="w-5 h-5" />
        </button>
        {isAuthenticated ? (
          <>
            <Avatar className="w-7 h-7">
              <AvatarImage src={user?.profileImageUrl ?? undefined} alt={user?.firstName ?? "User"} />
              <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                {user?.firstName?.[0] ?? user?.email?.[0]?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" onClick={logout} data-testid="button-logout-mobile" className="w-8 h-8">
              <LogOut className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <Button size="sm" asChild data-testid="button-login-mobile">
            <Link href="/login">{t("signIn")}</Link>
          </Button>
        )}
      </div>
    </header>
  );
}

import { useState } from "react";
import { Link, useLocation } from "wouter";
import { BookOpen, Calculator, ShieldCheck, Briefcase, FlaskConical, TrendingUp, LogIn, LogOut, Crown, NotebookPen, Package, Microscope, Search, Menu, BookMarked, GraduationCap, Download, Tag, BookA, Info, HelpCircle, Settings as SettingsIcon } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";

const openSearch = () => window.dispatchEvent(new Event("bwp:open-search"));
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useUser } from "@/context/UserContext";
import { prefetchRoute } from "@/lib/route-prefetch";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// BioWiki Pro — "Knowledge Lattice" mark (molecule + knowledge graph).
function BioWikiMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <g fill="none" stroke="#14B8A6" strokeOpacity="0.5" strokeWidth="3.4" strokeLinecap="round">
        <line x1="50" y1="16" x2="20" y2="47" />
        <line x1="50" y1="16" x2="80" y2="47" />
        <line x1="50" y1="16" x2="50" y2="53" />
        <line x1="20" y1="47" x2="50" y2="53" />
        <line x1="80" y1="47" x2="50" y2="53" />
        <line x1="50" y1="53" x2="33" y2="85" />
        <line x1="50" y1="53" x2="67" y2="85" />
        <line x1="33" y1="85" x2="67" y2="85" />
        <line x1="20" y1="47" x2="33" y2="85" />
        <line x1="80" y1="47" x2="67" y2="85" />
      </g>
      <circle cx="20" cy="47" r="6.6" fill="#14B8A6" />
      <circle cx="80" cy="47" r="6.6" fill="#14B8A6" />
      <circle cx="33" cy="85" r="6.6" fill="#14B8A6" />
      <circle cx="67" cy="85" r="6.6" fill="#14B8A6" />
      <circle cx="50" cy="53" r="6.2" fill="#5EEAD4" />
      <circle cx="50" cy="16" r="7.8" fill="#EBBF6B" />
    </svg>
  );
}

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
  { key: "solutions", name: "Solutions", icon: Microscope, path: "/solutions" },
  { key: "insights", name: "Insights", icon: TrendingUp, path: "/insights" },
];

// Secondary destinations for the mobile "More" drawer — everything not on the
// 5-slot bottom bar, so mobile users (no desktop footer) can reach the full IA.
const moreLinks = [
  { name: "Library", icon: BookMarked, path: "/library" },
  { name: "Career", icon: Briefcase, path: "/career" },
  { name: "Solutions", icon: Microscope, path: "/solutions" },
  { name: "GMP Audit Kit", icon: Package, path: "/toolkits/gmp-audit-kit" },
  { name: "Insights", icon: TrendingUp, path: "/insights" },
  { name: "Glossary", icon: BookA, path: "/glossary" },
  { name: "Pricing", icon: Tag, path: "/pricing" },
  { name: "My Learning", icon: GraduationCap, path: "/my-learning" },
  { name: "My Downloads", icon: Download, path: "/my-downloads" },
  { name: "Settings", icon: SettingsIcon, path: "/settings" },
  { name: "About", icon: Info, path: "/about" },
  { name: "FAQ", icon: HelpCircle, path: "/faq" },
];

export function BottomNav() {
  const [location] = useLocation();
  const { t } = useTranslation("nav");
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-lg border-t border-white/10 px-2 pb-safe pt-2 z-50 md:hidden">
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

        {/* "More" → drawer with the rest of the IA (mobile has no footer). */}
        <button
          onClick={() => setMoreOpen(true)}
          className="flex flex-col items-center gap-1 p-2 w-full text-muted-foreground hover:text-foreground"
          data-testid="nav-mobile-more"
          aria-label="More"
        >
          <div className="p-1.5 rounded-xl">
            <Menu className="w-6 h-6" strokeWidth={2} />
          </div>
          <span className="text-[10px] font-medium">More</span>
        </button>
      </div>

      <Drawer open={moreOpen} onOpenChange={setMoreOpen}>
        <DrawerContent className="md:hidden">
          <DrawerHeader className="pb-2">
            <DrawerTitle>Explore BioWikiPro</DrawerTitle>
          </DrawerHeader>
          <div className="grid grid-cols-3 gap-3 px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
            {moreLinks.map((l) => {
              const isActive = location.startsWith(l.path);
              return (
                <DrawerClose asChild key={l.path}>
                  <Link
                    href={l.path}
                    className={clsx(
                      "flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 text-center transition-colors",
                      isActive
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-white/10 bg-white/5 text-foreground hover:border-primary/30"
                    )}
                    data-testid={`nav-more-${l.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <l.icon className="w-5 h-5" />
                    <span className="text-xs font-medium leading-tight">{l.name}</span>
                  </Link>
                </DrawerClose>
              );
            })}
          </div>
        </DrawerContent>
      </Drawer>
    </nav>
  );
}

export function DesktopNav() {
  const [location] = useLocation();
  const { t } = useTranslation("nav");
  const { user, isAuthenticated, isPro, logout } = useUser();

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-16 bg-background/80 backdrop-blur-md border-b border-white/5 hidden md:flex items-center px-6">
      <Link href="/" className="flex items-center gap-2 mr-6 shrink-0 hover:opacity-80 transition-opacity">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#11283a] to-[#0B1120] border border-white/10 flex items-center justify-center p-1">
          <BioWikiMark className="w-full h-full" />
        </div>
        <span className="font-display font-bold text-xl tracking-tight">BioWiki<span className="text-primary">Pro</span></span>
      </Link>

      {/* Scrollable tab strip — keeps the brand + right controls pinned and visible
          at any width while the full tab set stays reachable (no clipped Sign In). */}
      <nav className="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {desktopTabs.map((tab) => {
          const isActive = location.startsWith(tab.path) || (location === "/" && tab.path === "/qc-hub");
          return (
            <Link key={tab.name} href={tab.path} onMouseEnter={() => prefetchRoute(tab.path)} className={clsx(
              "px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap",
              isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )} data-testid={`nav-desktop-${tab.name.toLowerCase().replace(/\s+/g, '-')}`}>
              <tab.icon className="w-4 h-4" />
              {t(tab.key)}
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto shrink-0 flex items-center gap-3 pl-4">
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
            <Button variant="ghost" size="icon" onClick={logout} data-testid="button-logout" aria-label="Sign out">
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
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#11283a] to-[#0B1120] border border-white/10 flex items-center justify-center p-1 shadow-lg shadow-primary/20">
          <BioWikiMark className="w-full h-full" />
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
            <Button variant="ghost" size="icon" onClick={logout} data-testid="button-logout-mobile" className="w-8 h-8" aria-label="Sign out">
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

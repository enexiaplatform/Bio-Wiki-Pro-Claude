import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, BookOpen, Calculator, ShieldCheck, Briefcase, TrendingUp, LogIn, LogOut, Crown, NotebookPen, Package, Search, Menu, GraduationCap, Download, Tag, BookA, Info, HelpCircle, Workflow, Settings as SettingsIcon, Building2, ClipboardCheck, FileCheck2, LayoutDashboard, ChevronDown, Home, CalendarDays } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const openSearch = () => window.dispatchEvent(new Event("lsa:open-search"));
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useUser } from "@/context/UserContext";
import { prefetchRoute } from "@/lib/route-prefetch";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Life Science Atlas "Knowledge Lattice" mark (molecule + knowledge graph).
function AtlasMark({ className }: { className?: string }) {
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

// Mobile keeps the highest-frequency destinations directly reachable.
const mobileTabs = [
  { key: "home", name: "Home", icon: Home, path: "/" },
  { key: "qualityLab", name: "Quality Lab", icon: Building2, path: "/quality-lab" },
  { key: "career", name: "Career", icon: Briefcase, path: "/career" },
  { key: "academy", name: "Learn", icon: BookOpen, path: "/academy" },
];

// Product discovery is organized by the decision being purchased. Prices live on
// the product and pricing pages so this menu can stay scannable.
const productLinks = [
  { name: "Quality Lab Blueprint", audience: "For organizations", description: "Plan capability, capacity, people, equipment, cost, and risk for a real quality laboratory.", icon: Building2, path: "/quality-lab", tone: "border-teal-300/20 bg-teal-300/[0.06]" },
  { name: "Atlas Pro", audience: "For professionals", description: "Use deeper evidence, premium tools, and reusable quality working files.", icon: Crown, path: "/pro", tone: "border-sky-300/20 bg-sky-300/[0.05]" },
  { name: "Career Blueprint", audience: "For individuals", description: "Turn your role, evidence, constraints, and target into a personalized career plan.", icon: Briefcase, path: "/career", tone: "border-amber-300/20 bg-amber-300/[0.05]" },
];

const resourceLinks = [
  { name: "Workflows", description: "Step-by-step quality processes", icon: Workflow, path: "/workflows" },
  { name: "Academy", description: "Evidence-backed learning", icon: BookOpen, path: "/academy" },
  { name: "Tools", description: "Focused calculators and models", icon: Calculator, path: "/tools" },
  { name: "Toolkits", description: "Reusable working files", icon: Package, path: "/toolkits" },
  { name: "Compliance", description: "Audit and GMP readiness", icon: ShieldCheck, path: "/compliance" },
];

// Secondary destinations for the mobile "More" drawer — everything not on the
// 4-slot bottom bar, so mobile users (no desktop footer) can reach the full IA.
const moreLinks = [
  { name: "All products", icon: Package, path: "/products" },
  { name: "Request Blueprint Review", icon: ClipboardCheck, path: "/quality-lab/review" },
  { name: "How Atlas works", icon: Workflow, path: "/how-it-works" },
  { name: "Blueprint deliverables", icon: FileCheck2, path: "/quality-lab/deliverables" },
  { name: "Atlas Pro", icon: Crown, path: "/pro" },
  { name: "Pro Monthly Review", icon: CalendarDays, path: "/pro/monthly-review" },
  { name: "Workflows", icon: Workflow, path: "/workflows" },
  { name: "Tools", icon: Calculator, path: "/tools" },
  { name: "Toolkits", icon: Package, path: "/toolkits" },
  { name: "Compliance", icon: ShieldCheck, path: "/compliance" },
  { name: "Blog", icon: TrendingUp, path: "/blog" },
  { name: "Glossary", icon: BookA, path: "/glossary" },
  { name: "GMP Audit Kit", icon: Package, path: "/toolkits/gmp-audit-kit" },
  { name: "Pricing", icon: Tag, path: "/pricing" },
  { name: "My Learning", icon: GraduationCap, path: "/my-learning" },
  { name: "My Downloads", icon: Download, path: "/my-downloads" },
  { name: "Vault", icon: NotebookPen, path: "/vault" },
  { name: "Settings", icon: SettingsIcon, path: "/settings" },
  { name: "About", icon: Info, path: "/about" },
  { name: "FAQ", icon: HelpCircle, path: "/faq" },
];

// Account menu (desktop avatar dropdown) — personal surfaces moved off the
// primary tab bar so the top nav stays content-focused.
const accountLinks = [
  { name: "Pro Monthly Review", icon: CalendarDays, path: "/pro/monthly-review" },
  { name: "My Learning", icon: GraduationCap, path: "/my-learning" },
  { name: "My Downloads", icon: Download, path: "/my-downloads" },
  { name: "Vault", icon: NotebookPen, path: "/vault" },
  { name: "Settings", icon: SettingsIcon, path: "/settings" },
];

export function BottomNav() {
  const [location] = useLocation();
  const { t } = useTranslation("nav");
  const { isAdmin } = useUser();
  const [moreOpen, setMoreOpen] = useState(false);
  const visibleMoreLinks = isAdmin ? [...moreLinks, { name: "Admin dashboard", icon: LayoutDashboard, path: "/admin" }] : moreLinks;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-lg border-t border-white/10 px-2 pb-safe pt-2 z-50 md:hidden">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {mobileTabs.map((tab) => {
          const isActive = tab.path === "/" ? location === "/" : location.startsWith(tab.path);
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
            <DrawerTitle>Explore Life Science Atlas</DrawerTitle>
          </DrawerHeader>
          <div className="grid grid-cols-3 gap-3 px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
            {visibleMoreLinks.map((l) => {
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
  const { user, isAuthenticated, isPro, isAdmin, logout } = useUser();

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-16 border-b border-white/10 bg-[#07182b]/95 px-6 shadow-[0_12px_30px_rgba(2,8,23,0.2)] backdrop-blur-md hidden md:flex items-center">
      <Link href="/" className="flex items-center gap-2 mr-6 shrink-0 hover:opacity-80 transition-opacity">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#11283a] to-[#0B1120] border border-white/10 flex items-center justify-center p-1">
          <AtlasMark className="w-full h-full" />
        </div>
        <span className="font-display font-bold text-xl tracking-tight">Life Science <span className="text-primary">Atlas</span></span>
      </Link>

      {/* Scrollable tab strip — keeps the brand + right controls pinned and visible
          at any width while the full tab set stays reachable (no clipped Sign In). */}
      <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden" aria-label="Primary navigation">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={clsx(
                "flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                location.startsWith("/products") || productLinks.some((item) => location.startsWith(item.path))
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
              data-testid="nav-desktop-product"
            >
              Products
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[36rem] max-w-[calc(100vw-2rem)] p-3">
            <div className="flex items-start justify-between gap-5 px-2 pb-3">
              <div>
                <DropdownMenuLabel className="p-0 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Choose by decision</DropdownMenuLabel>
                <p className="mt-1 text-sm font-semibold text-foreground">Three products. Three clearly different outcomes.</p>
              </div>
              <Link href="/products" className="inline-flex shrink-0 items-center gap-1.5 text-xs font-bold text-teal-200 hover:text-teal-100">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {productLinks.map((item) => (
                <DropdownMenuItem key={item.path} asChild className="p-0">
                  <Link href={item.path} onMouseEnter={() => prefetchRoute(item.path)} className={clsx("flex min-h-40 cursor-pointer flex-col rounded-xl border p-4", item.tone)}>
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-slate-950/30">
                      <item.icon className="h-4 w-4 text-teal-200" />
                    </span>
                    <span className="mt-4 block text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{item.audience}</span>
                    <span className="mt-1 block text-sm font-semibold">{item.name}</span>
                    <span className="mt-2 block text-xs leading-5 text-muted-foreground">{item.description}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator className="my-3" />
            <div className="flex items-center justify-between gap-4 px-2 pb-1 text-xs text-muted-foreground">
              <span>Not sure where to start? Compare buyer, output, depth, and price.</span>
              <Link href="/pricing" className="shrink-0 font-bold text-slate-200 hover:text-white">Compare pricing</Link>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <Link href="/how-it-works" onMouseEnter={() => prefetchRoute("/how-it-works")} className={clsx(
          "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          location.startsWith("/how-it-works") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
        )}>How Atlas works</Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={clsx(
                "flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                resourceLinks.some((item) => location.startsWith(item.path))
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
              data-testid="nav-desktop-resources"
            >
              <BookOpen className="h-4 w-4" />
              Resources
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72 p-2">
            <DropdownMenuLabel className="px-2 pb-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Learn, calculate, and verify</DropdownMenuLabel>
            {resourceLinks.map((item) => (
              <DropdownMenuItem key={item.path} asChild className="p-0">
                <Link href={item.path} onMouseEnter={() => prefetchRoute(item.path)} className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-2.5">
                  <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" />
                  <span>
                    <span className="block text-sm font-semibold">{item.name}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{item.description}</span>
                  </span>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Link href="/pricing" onMouseEnter={() => prefetchRoute("/pricing")} className={clsx(
          "flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          location.startsWith("/pricing") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
        )} data-testid="nav-desktop-pricing">
          <Tag className="h-4 w-4" /> Pricing
        </Link>
      </nav>

      <div className="ml-auto flex shrink-0 items-center gap-2 pl-4">
        <button
          onClick={openSearch}
          className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-white/20 hover:text-foreground xl:inline-flex"
          aria-label="Search"
        >
          <Search className="w-3.5 h-3.5" /> Search
          <kbd className="ml-1 rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-mono">Ctrl K</kbd>
        </button>
        {isAuthenticated ? (
          <>
            {isPro && (
              <Badge className="bg-primary/10 text-primary border-primary/20" data-testid="badge-pro-status">
                <Crown className="w-3 h-3 mr-1" /> Pro
              </Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-white/5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  title="Account"
                  data-testid="button-account-menu"
                  aria-label="Account menu"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.profileImageUrl ?? undefined} alt={user?.firstName ?? "User"} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {user?.firstName?.[0] ?? user?.email?.[0]?.toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden lg:inline" data-testid="text-user-name">
                    {user?.firstName ?? user?.email ?? "User"}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="truncate">{user?.email ?? "Account"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {accountLinks.map((l) => (
                  <DropdownMenuItem key={l.path} asChild>
                    <Link href={l.path} className="cursor-pointer" data-testid={`account-${l.name.toLowerCase().replace(/\s+/g, '-')}`}>
                      <l.icon className="w-4 h-4 mr-2 text-muted-foreground" />
                      {l.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer" data-testid="account-admin-dashboard">
                      <LayoutDashboard className="w-4 h-4 mr-2 text-teal-300" />
                      Admin dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={logout} data-testid="button-logout" className="cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2 text-muted-foreground" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <Link href="/login" className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-slate-200 transition hover:bg-white/5 hover:text-white" data-testid="button-login">
            <LogIn className="h-4 w-4" /> {t("signIn")}
          </Link>
        )}
        <Link href="/quality-lab/planner" className="inline-flex min-h-10 items-center justify-center rounded-lg bg-teal-300 px-4 text-sm font-bold text-slate-950 transition hover:bg-teal-200" data-testid="nav-desktop-start-free">
          Start free
        </Link>
      </div>
    </header>
  );
}

export function MobileHeader() {
  const { t } = useTranslation("nav");
  const { user, isAuthenticated, isPro, logout } = useUser();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#07182b]/95 px-4 py-3 shadow-[0_10px_24px_rgba(2,8,23,0.18)] backdrop-blur-md md:hidden">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#11283a] to-[#0B1120] border border-white/10 flex items-center justify-center p-1 shadow-lg shadow-primary/20">
          <AtlasMark className="w-full h-full" />
        </div>
        <span className="min-w-0 truncate font-display text-sm font-bold tracking-tight sm:text-base">Life Science <span className="text-primary">Atlas</span></span>
        {isPro && (
          <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]" data-testid="badge-pro-mobile">
            <Crown className="w-2.5 h-2.5 mr-0.5" /> Pro
          </Badge>
        )}
      </div>
      <div className="ml-2 flex shrink-0 items-center gap-2">
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

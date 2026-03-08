import { Link, useLocation } from "wouter";
import { BookOpen, Calculator, ShieldCheck, Briefcase, FlaskConical, TrendingUp, LogIn, LogOut, Crown } from "lucide-react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const mobileTabs = [
  { name: "QC Hub", icon: FlaskConical, path: "/qc-hub" },
  { name: "Academy", icon: BookOpen, path: "/academy" },
  { name: "Tools", icon: Calculator, path: "/tools" },
  { name: "Compliance", icon: ShieldCheck, path: "/compliance" },
  { name: "Career", icon: Briefcase, path: "/career" },
];

const desktopTabs = [
  { name: "QC Hub", icon: FlaskConical, path: "/qc-hub" },
  { name: "Academy", icon: BookOpen, path: "/academy" },
  { name: "Tools", icon: Calculator, path: "/tools" },
  { name: "Compliance", icon: ShieldCheck, path: "/compliance" },
  { name: "Career", icon: Briefcase, path: "/career" },
  { name: "Insights", icon: TrendingUp, path: "/insights" },
];

export function BottomNav() {
  const [location] = useLocation();

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
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-primary/15 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <tab.icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={clsx("text-[10px] font-medium", isActive ? "text-primary" : "text-muted-foreground")}>
                {tab.name}
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
  const { user, isAuthenticated, isPro, logout } = useUser();

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-16 bg-background/80 backdrop-blur-md border-b border-white/5 hidden md:flex items-center px-8">
      <div className="flex items-center gap-2 mr-12">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
          <span className="text-white font-bold text-lg">B</span>
        </div>
        <span className="font-display font-bold text-xl tracking-tight">BioWiki<span className="text-primary">Pro</span></span>
      </div>

      <nav className="flex items-center gap-1">
        {desktopTabs.map((tab) => {
          const isActive = location.startsWith(tab.path) || (location === "/" && tab.path === "/qc-hub");
          return (
            <Link key={tab.name} href={tab.path} className={clsx(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
              isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )} data-testid={`nav-desktop-${tab.name.toLowerCase().replace(/\s+/g, '-')}`}>
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-3">
        {isAuthenticated ? (
          <>
            {isPro && (
              <Badge className="bg-primary/10 text-primary border-primary/20" data-testid="badge-pro-status">
                <Crown className="w-3 h-3 mr-1" /> Pro
              </Badge>
            )}
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.profileImageUrl ?? undefined} alt={user?.firstName ?? "User"} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {user?.firstName?.[0] ?? user?.email?.[0]?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden lg:inline" data-testid="text-user-name">
                {user?.firstName ?? user?.email ?? "User"}
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} data-testid="button-logout">
              <LogOut className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <Button size="sm" asChild data-testid="button-login">
            <a href="/api/login">
              <LogIn className="w-4 h-4 mr-1.5" />
              Sign In
            </a>
          </Button>
        )}
      </div>
    </header>
  );
}

export function MobileHeader() {
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
            <a href="/api/login">Sign In</a>
          </Button>
        )}
      </div>
    </header>
  );
}

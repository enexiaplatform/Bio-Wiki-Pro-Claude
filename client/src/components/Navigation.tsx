import { Link, useLocation } from "wouter";
import { BookOpen, Calculator, ShieldCheck, Briefcase, ShoppingBag, User } from "lucide-react";
import clsx from "clsx";
import { motion } from "framer-motion";

const tabs = [
  { name: "Academy", icon: BookOpen, path: "/academy" },
  { name: "Lab Tools", icon: Calculator, path: "/tools" },
  { name: "Compliance", icon: ShieldCheck, path: "/compliance" },
  { name: "Career", icon: Briefcase, path: "/career" },
  { name: "Solutions", icon: ShoppingBag, path: "/solutions" },
];

export function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-lg border-t border-white/10 px-4 pb-safe pt-2 z-50 md:hidden">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = location.startsWith(tab.path) || (location === "/" && tab.path === "/academy");
          return (
            <Link key={tab.name} href={tab.path} className="flex flex-col items-center gap-1 p-2 w-full">
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

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-16 bg-background/80 backdrop-blur-md border-b border-white/5 hidden md:flex items-center px-8">
      <div className="flex items-center gap-2 mr-12">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
          <span className="text-white font-bold text-lg">B</span>
        </div>
        <span className="font-display font-bold text-xl tracking-tight">BioWiki<span className="text-primary">Pro</span></span>
      </div>

      <nav className="flex items-center gap-1">
        {tabs.map((tab) => {
          const isActive = location.startsWith(tab.path) || (location === "/" && tab.path === "/academy");
          return (
            <Link key={tab.name} href={tab.path} className={clsx(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
              isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}>
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-4">
        <Link href="/settings" className="p-2 text-muted-foreground hover:text-foreground transition-colors">
          <User className="w-5 h-5" />
        </Link>
      </div>
    </header>
  );
}

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-white/5 px-4 py-3 md:hidden flex items-center justify-between">
      <div className="flex items-center gap-2">
         <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
          <span className="text-white font-bold text-lg">B</span>
        </div>
        <span className="font-display font-bold text-lg tracking-tight">BioWiki<span className="text-primary">Pro</span></span>
      </div>
      <Link href="/settings" className="p-2 -mr-2 text-muted-foreground active:text-foreground">
        <User className="w-5 h-5" />
      </Link>
    </header>
  );
}

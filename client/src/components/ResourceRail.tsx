import { Link, useLocation } from "wouter";
import type { IconType } from "react-icons";
import {
  PiBookOpenText,
  PiFlowArrow,
  PiGraduationCap,
  PiPulse,
  PiShieldCheck,
  PiToolbox,
  PiWrench,
} from "react-icons/pi";
import { useResourceSelection } from "@/hooks/use-resource-selection";

interface ResourceDestination {
  href: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: IconType;
}

export const RESOURCE_DESTINATIONS: ResourceDestination[] = [
  { href: "/methods", label: "Methods & standards", shortLabel: "Methods", description: "Coverage-aware evidence navigation", icon: PiBookOpenText },
  { href: "/monitor", label: "Change monitor", shortLabel: "Monitor", description: "Official-source impact watch", icon: PiPulse },
  { href: "/workflows", label: "Workflows", shortLabel: "Workflows", description: "Connected quality processes", icon: PiFlowArrow },
  { href: "/academy", label: "Academy", shortLabel: "Academy", description: "Evidence-backed learning", icon: PiGraduationCap },
  { href: "/tools", label: "Tools", shortLabel: "Tools", description: "Focused calculators and models", icon: PiWrench },
  { href: "/toolkits", label: "Toolkits", shortLabel: "Toolkits", description: "Reusable working files", icon: PiToolbox },
  { href: "/compliance", label: "Compliance", shortLabel: "Compliance", description: "Audit and GMP readiness", icon: PiShieldCheck },
];

export function isResourceLocation(location: string) {
  return location.startsWith("/library/") || RESOURCE_DESTINATIONS.some(({ href }) => location === href || location.startsWith(`${href}/`));
}

function isDestinationActive(location: string, href: string) {
  return location === href || location.startsWith(`${href}/`) || (href === "/academy" && location.startsWith("/library/"));
}

export function ResourceRail() {
  const [location] = useLocation();
  const { hrefWithSelection } = useResourceSelection();
  const compact = location === "/workflows" || location.startsWith("/workflows/");

  return (
    <>
      <aside className={`sticky top-16 hidden h-[calc(100vh-4rem)] shrink-0 border-r border-white/[0.08] bg-[#071426]/95 px-2 py-5 transition-[width] md:flex md:w-[7.25rem] md:flex-col ${compact ? "" : "xl:w-[17rem] xl:px-3"}`} aria-label="Resource areas">
        <p className="px-2 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">
          <span className={compact ? "" : "xl:hidden"}>Resources</span>
          {!compact && <span className="hidden xl:inline">Learn, calculate, and verify</span>}
        </p>
        <nav className={`mt-3 flex min-h-0 flex-1 flex-col gap-1 ${compact ? "justify-around" : "justify-around xl:flex-none xl:justify-start xl:gap-2"}`}>
          {RESOURCE_DESTINATIONS.map(({ href, label, description, icon: Icon }) => {
            const active = isDestinationActive(location, href);
            return (
              <Link
                key={href}
                href={hrefWithSelection(href, "resource-rail")}
                aria-current={active ? "page" : undefined}
                className={`group flex min-h-[4.5rem] flex-col items-center justify-center gap-2 rounded-xl px-1.5 py-2 text-center text-[11px] font-medium leading-4 outline-none transition focus-visible:ring-2 focus-visible:ring-teal-300/50 ${!compact ? "xl:min-h-[3.9rem] xl:flex-row xl:justify-start xl:gap-3 xl:px-3 xl:py-1.5 xl:text-left xl:text-xs" : ""} ${
                  active
                    ? "bg-teal-300/[0.09] text-teal-200"
                    : "text-slate-400 hover:bg-white/[0.035] hover:text-slate-100"
                }`}
              >
                <Icon className={`h-6 w-6 shrink-0 ${active ? "text-teal-300" : "text-slate-400 group-hover:text-teal-300"}`} aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block font-semibold text-slate-100">{label}</span>
                  {!compact && <span className="mt-0.5 hidden text-[11px] font-normal leading-4 text-slate-500 xl:block">{description}</span>}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <nav className="border-b border-white/[0.08] bg-[#071426]/95 px-3 py-2 md:hidden" aria-label="Resource areas">
        <div className="flex gap-1 overflow-x-auto pb-1">
          {RESOURCE_DESTINATIONS.map(({ href, shortLabel, icon: Icon }) => {
            const active = isDestinationActive(location, href);
            return (
              <Link
                key={href}
                href={hrefWithSelection(href, "resource-rail")}
                aria-current={active ? "page" : undefined}
                className={`flex min-w-[4.6rem] shrink-0 flex-col items-center gap-1.5 rounded-lg px-2 py-2 text-[10px] font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-teal-300/50 ${
                  active ? "bg-teal-300/[0.12] text-teal-200" : "text-slate-400"
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span>{shortLabel}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

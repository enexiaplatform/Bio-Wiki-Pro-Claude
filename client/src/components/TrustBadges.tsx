import { ShieldCheck, Zap, GraduationCap, Microscope } from "lucide-react";

const BADGES = [
  { icon: ShieldCheck, label: "Secure Stripe checkout" },
  { icon: Zap, label: "Instant access" },
  { icon: GraduationCap, label: "Educational use" },
  { icon: Microscope, label: "Built for QC/QA" },
] as const;

/**
 * Reassurance strip shown near purchase decision points (pricing, kit pages):
 * payment safety, instant fulfillment, honest scope, and audience fit.
 */
export function TrustBadges({ className = "" }: { className?: string }) {
  return (
    <ul
      className={`flex flex-wrap items-center justify-center gap-x-6 gap-y-3 ${className}`}
      aria-label="What you can count on"
    >
      {BADGES.map(({ icon: Icon, label }) => (
        <li key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Icon className="h-4 w-4 shrink-0 text-teal-400" aria-hidden="true" />
          {label}
        </li>
      ))}
    </ul>
  );
}

import { Info } from "lucide-react";

/**
 * Educational-use disclaimer shown at the foot of every content reader
 * (library lessons, academy lessons, blog posts). Reinforces, at the point of
 * reading, the Limitation of Liability in the Terms — important for a
 * regulated-industry (GMP/QC/QA) audience making professional decisions.
 */
export function ContentDisclaimer({ className = "" }: { className?: string }) {
  return (
    <aside
      className={`mt-10 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs leading-relaxed text-muted-foreground ${className}`}
      role="note"
      aria-label="Educational use disclaimer"
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" aria-hidden="true" />
      <p>
        <span className="font-semibold text-foreground">Educational use only.</span>{" "}
        Life Science Atlas is a learning reference — not regulatory, legal, or medical
        advice. Always verify against the current regulations, pharmacopeias
        (USP/EP/JP), and your organization&rsquo;s validated quality system
        before acting.
      </p>
    </aside>
  );
}

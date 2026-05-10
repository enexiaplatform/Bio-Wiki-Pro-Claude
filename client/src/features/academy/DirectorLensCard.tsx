import { Brain, BriefcaseBusiness, ShieldAlert } from "lucide-react";
import type { DirectorLens } from "@/types/lesson";

export function DirectorLensCard({ lens }: { lens: DirectorLens }) {
  return (
    <section className="bg-card border border-white/10 rounded-2xl p-5 md:p-6 shadow-xl shadow-black/10">
      <div className="flex items-center gap-2 mb-5">
        <Brain className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">Director Lens</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-3 mb-5">
        <LensColumn title="Junior" value={lens.juniorView} />
        <LensColumn title="Supervisor" value={lens.supervisorView} />
        <LensColumn title="Director" value={lens.directorView} highlight />
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <RiskBlock icon={<ShieldAlert className="w-4 h-4" />} title="Regulatory Risk" value={lens.regulatoryRisk} />
        <RiskBlock icon={<BriefcaseBusiness className="w-4 h-4" />} title="Business Risk" value={lens.businessRisk} />
      </div>

      <div className="mt-4 rounded-xl border border-primary/20 bg-primary/10 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Decision Principle</p>
        <p className="text-sm leading-relaxed">{lens.decisionPrinciple}</p>
      </div>
    </section>
  );
}

function LensColumn({ title, value, highlight = false }: { title: string; value: string; highlight?: boolean }) {
  return (
    <div className={highlight ? "rounded-xl border border-primary/30 bg-primary/10 p-4" : "rounded-xl border border-white/10 bg-white/5 p-4"}>
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{title}</p>
      <p className="text-sm leading-relaxed">{value}</p>
    </div>
  );
}

function RiskBlock({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-background/40 p-4">
      <div className="flex items-center gap-2 text-amber-300 mb-2">
        {icon}
        <p className="text-xs font-bold uppercase tracking-wider">{title}</p>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{value}</p>
    </div>
  );
}

import { useState } from "react";
import { AlertTriangle, CheckCircle2, GitBranch } from "lucide-react";
import { emScenarios } from "@/data/scenarios/emScenarios";

export function ScenarioDecisionTree() {
  const [selectedId, setSelectedId] = useState(emScenarios[0].id);
  const scenario = emScenarios.find((item) => item.id === selectedId) ?? emScenarios[0];

  return (
    <section className="rounded-2xl border border-white/10 bg-card p-5 md:p-6">
      <div className="flex items-center gap-2 mb-5">
        <GitBranch className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">EM Scenario Decision Tree</h2>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-5">
        <div className="space-y-2">
          {emScenarios.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              className={item.id === selectedId ? "w-full text-left rounded-xl border border-primary/40 bg-primary/10 p-3 text-sm font-medium" : "w-full text-left rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-muted-foreground hover:border-primary/30"}
            >
              {item.title}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-primary/20 bg-primary/10 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Selected Scenario</p>
            <h3 className="text-lg font-bold">{scenario.title}</h3>
          </div>
          <DecisionList title="Possible Causes" items={scenario.possibleCauses} />
          <DecisionList title="Immediate Actions" items={scenario.immediateActions} accent="emerald" />
          <DecisionList title="Investigation Path" items={scenario.investigationPath} numbered />
          <DecisionList title="CAPA Ideas" items={scenario.capaIdeas} />
          <div className="grid md:grid-cols-2 gap-3">
            <Impact title="Release Impact" value={scenario.releaseImpact} />
            <Impact title="Audit Concern" value={scenario.auditConcern} warning />
          </div>
        </div>
      </div>
    </section>
  );
}

function DecisionList({ title, items, numbered = false, accent }: { title: string; items: string[]; numbered?: boolean; accent?: "emerald" }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{title}</p>
      <div className="grid md:grid-cols-2 gap-2">
        {items.map((item, index) => (
          <div key={item} className="rounded-xl border border-white/10 bg-white/5 p-3 flex gap-2 text-sm text-muted-foreground">
            {numbered ? (
              <span className="text-primary font-bold">{index + 1}</span>
            ) : (
              <CheckCircle2 className={accent === "emerald" ? "w-4 h-4 text-emerald-300 shrink-0 mt-0.5" : "w-4 h-4 text-primary shrink-0 mt-0.5"} />
            )}
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Impact({ title, value, warning = false }: { title: string; value: string; warning?: boolean }) {
  return (
    <div className={warning ? "rounded-xl border border-amber-500/20 bg-amber-500/10 p-4" : "rounded-xl border border-white/10 bg-white/5 p-4"}>
      <div className="flex items-center gap-2 mb-2">
        {warning && <AlertTriangle className="w-4 h-4 text-amber-300" />}
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
      </div>
      <p className="text-sm leading-relaxed">{value}</p>
    </div>
  );
}

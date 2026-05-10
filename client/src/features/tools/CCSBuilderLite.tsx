import { useMemo, useState } from "react";
import { Blocks, ClipboardCheck } from "lucide-react";
import { buildCCSRecommendation, ccsOptions } from "@/data/tools/ccsBuilder";

export function CCSBuilderLite() {
  const [facilityType, setFacilityType] = useState(ccsOptions.facilityTypes[0]);
  const [processType, setProcessType] = useState(ccsOptions.processTypes[0]);
  const [riskSource, setRiskSource] = useState(ccsOptions.riskSources[0]);
  const [controlType, setControlType] = useState(ccsOptions.controlTypes[0]);

  const recommendation = useMemo(
    () => buildCCSRecommendation(facilityType, processType, riskSource, controlType),
    [facilityType, processType, riskSource, controlType],
  );

  return (
    <section className="rounded-2xl border border-white/10 bg-card p-5 md:p-6">
      <div className="flex items-center gap-2 mb-5">
        <Blocks className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">CCS Builder Lite</h2>
      </div>

      <div className="grid md:grid-cols-4 gap-3 mb-5">
        <Select label="Facility type" value={facilityType} values={ccsOptions.facilityTypes} onChange={setFacilityType} />
        <Select label="Process type" value={processType} values={ccsOptions.processTypes} onChange={setProcessType} />
        <Select label="Risk source" value={riskSource} values={ccsOptions.riskSources} onChange={setRiskSource} />
        <Select label="Control type" value={controlType} values={ccsOptions.controlTypes} onChange={setControlType} />
      </div>

      <div className="space-y-4">
        <Result title="Contamination Risk Map" items={recommendation.contaminationRiskMap} />
        <Result title="Suggested Controls" items={recommendation.suggestedControls} />
        <Result title="Evidence to Prepare" items={recommendation.evidenceToPrepare} />
        <div className="rounded-xl border border-primary/20 bg-primary/10 p-4">
          <div className="flex items-center gap-2 text-primary mb-2">
            <ClipboardCheck className="w-4 h-4" />
            <p className="text-xs font-bold uppercase tracking-wider">Audit-Ready Explanation</p>
          </div>
          <p className="text-sm leading-relaxed">{recommendation.auditReadyExplanation}</p>
        </div>
      </div>
    </section>
  );
}

function Select({ label, value, values, onChange }: { label: string; value: string; values: string[]; onChange: (value: string) => void }) {
  return (
    <label className="space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-white/10 bg-background/50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
      >
        {values.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>
    </label>
  );
}

function Result({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{title}</p>
      <div className="grid md:grid-cols-2 gap-2">
        {items.map((item) => (
          <div key={item} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-muted-foreground">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

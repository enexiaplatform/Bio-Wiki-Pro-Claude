import { AlertTriangle, ArrowDown, ArrowRight, Box, Building2, CircleGauge, Clock3, Database, GitBranch, Layers3, PackageCheck, PieChart, SlidersHorizontal, WalletCards } from "lucide-react";
import type { QualityLabBlueprint } from "@shared/quality-lab";
import { buildCapacityVisual, buildScenarioComparison, buildZoneLayout } from "@shared/quality-lab-visuals";

const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const signedNumber = (value: number) => `${value > 0 ? "+" : ""}${number.format(value)}`;
const ZONE_WIDTH = 720;
const ZONE_HEIGHT = 320;
const zoneColors = ["#99f6e4", "#bae6fd", "#c4b5fd", "#fde68a", "#a7f3d0", "#fecdd3", "#bfdbfe", "#ddd6fe", "#d1d5db"];

const capacityTone = {
  headroom: { bar: "bg-teal-300", text: "text-teal-200", label: "headroom" },
  watch: { bar: "bg-amber-300", text: "text-amber-200", label: "watch" },
  constrained: { bar: "bg-red-300", text: "text-red-200", label: "constraint" },
};

function CompilerChain({ blueprint }: { blueprint: QualityLabBlueprint }) {
  const stages = [
    {
      label: "Demand inputs",
      value: `${blueprint.input.productProfiles.length} product profile${blueprint.input.productProfiles.length === 1 ? "" : "s"}`,
      detail: `${blueprint.input.markets.length} market${blueprint.input.markets.length === 1 ? "" : "s"} in scope`,
    },
    {
      label: "Method graph",
      value: `${blueprint.methodRequirements.length} requirements`,
      detail: `${blueprint.methodBom.length} method BOM lines`,
    },
    {
      label: "Operating load",
      value: `${blueprint.workflows.length} workflows`,
      detail: `${blueprint.methodCapacitySummary.length} capacity checks`,
    },
    {
      label: "Decision outputs",
      value: `${blueprint.equipment.length} equipment classes`,
      detail: `${blueprint.spaces.length} functional zones`,
    },
  ];

  return (
    <div data-testid="blueprint-compiler-chain-visual">
      <div className="mb-3 flex items-center gap-2">
        <GitBranch className="h-4 w-4 text-sky-300 print:text-slate-700" />
        <h3 className="text-sm font-bold print:text-slate-950">Compiler chain</h3>
      </div>
      <p className="mb-4 text-xs leading-5 text-slate-500 print:text-slate-700">Each planning output remains traceable to the demand and method layers that produced it.</p>
      <div className="grid gap-2 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-stretch">
        {stages.map((stage, index) => (
          <div key={stage.label} className="contents">
            <div className="rounded-xl border border-white/10 bg-slate-950/30 p-3 print:border-slate-300 print:bg-white">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-sky-300 print:text-slate-500">0{index + 1} · {stage.label}</p>
              <p className="mt-2 text-sm font-bold text-slate-100 print:text-slate-950">{stage.value}</p>
              <p className="mt-1 text-[10px] text-slate-500">{stage.detail}</p>
            </div>
            {index < stages.length - 1 && <div className="flex items-center justify-center text-slate-600 print:text-slate-400"><ArrowDown className="h-4 w-4 md:hidden" /><ArrowRight className="hidden h-4 w-4 md:block" /></div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function ScenarioComparison({ blueprint }: { blueprint: QualityLabBlueprint }) {
  const metrics = buildScenarioComparison(blueprint.current, blueprint.future);
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/25 p-4 print:border-slate-300 print:bg-white" data-testid="blueprint-scenario-chart">
      <div className="mb-1 flex items-center gap-2"><Layers3 className="h-4 w-4 text-teal-300 print:text-slate-700" /><h3 className="text-sm font-bold print:text-slate-950">Scenario delta bridge</h3></div>
      <p className="mb-5 text-xs leading-5 text-slate-500 print:text-slate-700">Current → absolute delta → future is shown within each metric. Unlike units are never added into one waterfall.</p>
      <div className="space-y-5">
        {metrics.map((metric) => (
          <div key={metric.key}>
            <div className="mb-2 flex items-end justify-between gap-3">
              <div><p className="text-xs font-bold print:text-slate-950">{metric.label}</p><p className="text-[9px] text-slate-500">{metric.unit}</p></div>
              <span className="rounded-full border border-teal-300/15 bg-teal-300/[0.06] px-2 py-1 text-[9px] font-bold text-teal-200 print:border-slate-300 print:bg-white print:text-slate-700">Δ {signedNumber(metric.future - metric.current)} {metric.unit} · {signedNumber(metric.changePercent)}%</span>
            </div>
            <div className="space-y-1.5" role="img" aria-label={`${metric.label}: current ${number.format(metric.current)} ${metric.unit}; future ${number.format(metric.future)} ${metric.unit}`}>
              <div className="grid grid-cols-[52px_1fr_auto] items-center gap-2 text-[10px]"><span className="text-slate-500">Current</span><div className="h-2 rounded-full bg-white/8 print:bg-slate-200"><div className="h-full rounded-full bg-slate-400 print:bg-slate-500" style={{ width: `${metric.currentPlotPercent}%` }} /></div><strong className="min-w-12 text-right text-slate-300 print:text-slate-800">{number.format(metric.current)}</strong></div>
              <div className="grid grid-cols-[52px_1fr_auto] items-center gap-2 text-[10px]"><span className="text-teal-200 print:text-slate-700">Future</span><div className="h-2 rounded-full bg-white/8 print:bg-slate-200"><div className="h-full rounded-full bg-teal-300 print:bg-slate-800" style={{ width: `${metric.futurePlotPercent}%` }} /></div><strong className="min-w-12 text-right text-teal-100 print:text-slate-950">{number.format(metric.future)}</strong></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CapacityChart({ blueprint }: { blueprint: QualityLabBlueprint }) {
  const rows = buildCapacityVisual(blueprint.methodCapacitySummary);
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/25 p-4 print:border-slate-300 print:bg-white" data-testid="blueprint-capacity-chart">
      <div className="mb-1 flex items-center gap-2"><CircleGauge className="h-4 w-4 text-amber-300 print:text-slate-700" /><h3 className="text-sm font-bold print:text-slate-950">Resource pressure</h3></div>
      <p className="mb-4 text-xs leading-5 text-slate-500 print:text-slate-700">Planning utilization with an 85% watch line and visible overload up to 120%.</p>
      {rows.length > 0 ? <div className="space-y-4">
        {rows.map((row) => {
          const tone = capacityTone[row.status];
          return <div key={row.resourceId}>
            <div className="mb-1.5 flex items-start justify-between gap-3"><div><p className="text-xs font-bold print:text-slate-950">{row.resourceName}</p><p className="text-[9px] text-slate-500">{number.format(row.monthlyDemand)} {row.unit} demand · {number.format(row.availableMonthlyCapacity)} available</p></div><div className="shrink-0 text-right"><p className={`text-xs font-bold ${tone.text} print:text-slate-950`}>{number.format(row.utilizationPercent)}%</p><p className="text-[8px] font-bold uppercase tracking-wider text-slate-500">{tone.label}</p></div></div>
            <div className="relative h-3 overflow-visible rounded-full bg-white/8 print:bg-slate-200" role="img" aria-label={`${row.resourceName}: ${number.format(row.utilizationPercent)} percent utilization, ${tone.label}`}>
              <div className={`h-full rounded-full ${tone.bar} print:bg-slate-700`} style={{ width: `${row.plotPercent}%` }} />
              <span className="absolute inset-y-[-3px] w-px bg-amber-200/80 print:bg-slate-500" style={{ left: `${85 / 1.2}%` }} aria-hidden="true" />
              <span className="absolute inset-y-[-3px] w-px bg-red-200/80 print:bg-slate-950" style={{ left: `${100 / 1.2}%` }} aria-hidden="true" />
            </div>
          </div>;
        })}
        <div className="relative h-4 text-[8px] text-slate-600 print:text-slate-500"><span className="absolute left-0">0%</span><span className="absolute -translate-x-1/2" style={{ left: `${85 / 1.2}%` }}>85 watch</span><span className="absolute -translate-x-1/2" style={{ left: `${100 / 1.2}%` }}>100 capacity</span><span className="absolute right-0">120%+</span></div>
      </div> : <p className="rounded-lg border border-dashed border-white/10 p-4 text-xs text-slate-500 print:border-slate-300">Add product-method load data to unlock resource pressure charts.</p>}
    </div>
  );
}

function ZoningSchematic({ blueprint }: { blueprint: QualityLabBlueprint }) {
  const zones = buildZoneLayout(blueprint.spaces, ZONE_WIDTH, ZONE_HEIGHT);
  const totalArea = zones.reduce((sum, zone) => sum + zone.areaSqm, 0);

  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/25 p-4 print:border-slate-300 print:bg-white" data-testid="blueprint-zoning-schematic">
      <div className="mb-1 flex items-center gap-2"><Building2 className="h-4 w-4 text-violet-300 print:text-slate-700" /><h3 className="text-sm font-bold print:text-slate-950">2D functional zoning</h3></div>
      <p className="text-xs leading-5 text-slate-500 print:text-slate-700">Area-proportional schematic · {number.format(totalArea)} m² total allowance · not a floor plan.</p>
      <p className="mt-2 text-[9px] text-slate-600 sm:hidden">Swipe horizontally to inspect the full schematic.</p>
      <div className="mt-4 overflow-x-auto rounded-lg bg-slate-100 p-2 print:overflow-visible print:border print:border-slate-300">
        <svg className="h-auto w-full min-w-[680px]" width={ZONE_WIDTH} height={ZONE_HEIGHT} viewBox={`0 0 ${ZONE_WIDTH} ${ZONE_HEIGHT}`} role="img" aria-labelledby="zone-title zone-description">
          <title id="zone-title">Functional area allocation schematic</title>
          <desc id="zone-description">Two-dimensional proportional blocks for {zones.length} functional zones totaling {number.format(totalArea)} square meters. This is a planning allowance, not a floor plan.</desc>
          {zones.map((zone, index) => {
            const showName = zone.width >= 112 && zone.height >= 72;
            return <g key={zone.id}>
              <rect x={zone.x} y={zone.y} width={zone.width} height={zone.height} rx="10" fill={zoneColors[index % zoneColors.length]} stroke="#f8fafc" strokeWidth="4" />
              <text x={zone.x + 10} y={zone.y + 21} fill="#0f172a" fontSize="12" fontWeight="700">{index + 1}. {showName ? zone.name.slice(0, 24) : `${number.format(zone.areaSqm)} m²`}</text>
              {showName && <><text x={zone.x + 10} y={zone.y + 40} fill="#334155" fontSize="11">{number.format(zone.areaSqm)} m²</text><text x={zone.x + 10} y={zone.y + 57} fill="#64748b" fontSize="9">{number.format(zone.sharePercent)}% of allowance</text></>}
            </g>;
          })}
        </svg>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {zones.map((zone, index) => <div key={zone.id} className="flex items-start gap-2 text-[10px] leading-4 text-slate-400 print:text-slate-700"><span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-sm border border-slate-600" style={{ backgroundColor: zoneColors[index % zoneColors.length] }} /><span><strong className="text-slate-200 print:text-slate-950">{index + 1}. {zone.name}</strong><br />{number.format(zone.areaSqm)} m² · {number.format(zone.sharePercent)}%</span></div>)}
      </div>
      <div className="mt-4 rounded-lg border border-amber-300/15 bg-amber-300/[0.035] p-3 print:border-slate-300 print:bg-white">
        <p className="text-[9px] font-bold uppercase tracking-wider text-amber-200 print:text-slate-600">Geometry boundary</p>
        <p className="mt-1 text-[10px] leading-4 text-slate-400 print:text-slate-700">Room dimensions, adjacencies, equipment envelopes, utilities, HVAC and segregated people/material/waste routes are not yet designed. Those inputs must be confirmed before a decision-grade 3D model can be generated.</p>
      </div>
    </div>
  );
}

function MethodResourceLineage({ blueprint }: { blueprint: QualityLabBlueprint }) {
  const rows = blueprint.methodRequirements.slice(0, 6).map((requirement) => ({
    requirement,
    resources: Array.from(new Set(blueprint.methodCapacity.filter((item) => item.methodRequirementId === requirement.id).map((item) => item.resourceName))),
  }));
  return <div className="rounded-xl border border-white/10 bg-slate-950/25 p-4 print:border-slate-300 print:bg-white" data-testid="blueprint-method-lineage-visual">
    <div className="mb-1 flex items-center gap-2"><GitBranch className="h-4 w-4 text-sky-300 print:text-slate-700" /><h3 className="text-sm font-bold print:text-slate-950">Requirement → method → resource lineage</h3></div>
    <p className="mb-4 text-xs leading-5 text-slate-500 print:text-slate-700">The first six graph nodes show where a decision has an application structure and where site evidence is still required.</p>
    <div className="space-y-2">{rows.map(({ requirement, resources }) => <div key={requirement.id} className="grid gap-2 rounded-lg border border-white/8 p-3 text-[10px] md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center print:border-slate-300">
      <div><span className="font-bold uppercase tracking-wider text-slate-500">Requirement</span><p className="mt-1 font-semibold text-slate-200 print:text-slate-950">{requirement.productName}</p></div><ArrowDown className="mx-auto h-3.5 w-3.5 text-slate-600 md:rotate-[-90deg]" />
      <div><span className="font-bold uppercase tracking-wider text-slate-500">Method node</span><p className="mt-1 font-semibold text-sky-200 print:text-slate-950">{requirement.methodName}</p></div><ArrowDown className="mx-auto h-3.5 w-3.5 text-slate-600 md:rotate-[-90deg]" />
      <div><span className="font-bold uppercase tracking-wider text-slate-500">Resources</span><p className="mt-1 text-slate-300 print:text-slate-800">{resources.length ? resources.join(" · ") : "Qualification/site evidence only"}</p></div>
    </div>)}</div>
  </div>;
}

function WorkflowUncertainty({ blueprint }: { blueprint: QualityLabBlueprint }) {
  const max = Math.max(1, ...blueprint.workflows.map((item) => item.monthlyHandsOnHoursRange.high));
  return <div className="rounded-xl border border-white/10 bg-slate-950/25 p-4 print:border-slate-300 print:bg-white" data-testid="blueprint-workflow-uncertainty-visual">
    <div className="mb-1 flex items-center gap-2"><SlidersHorizontal className="h-4 w-4 text-violet-300 print:text-slate-700" /><h3 className="text-sm font-bold print:text-slate-950">Workflow uncertainty range</h3></div>
    <p className="mb-4 text-xs leading-5 text-slate-500 print:text-slate-700">Low/base/high hands-on hours use each rule's explicit uncalibrated planning spread; this is not a probability interval.</p>
    <div className="space-y-3">{blueprint.workflows.map((row) => <div key={row.id}>
      <div className="mb-1 flex items-start justify-between gap-3 text-[10px]"><span className="font-semibold text-slate-300 print:text-slate-900">{row.label}</span><span className="shrink-0 text-slate-500">{number.format(row.monthlyHandsOnHoursRange.low)} / <strong className="text-violet-200 print:text-slate-950">{number.format(row.monthlyHandsOnHours)}</strong> / {number.format(row.monthlyHandsOnHoursRange.high)} h</span></div>
      <div className="relative h-2 rounded-full bg-white/8 print:bg-slate-200" role="img" aria-label={`${row.label}: ${number.format(row.monthlyHandsOnHoursRange.low)} to ${number.format(row.monthlyHandsOnHoursRange.high)} hands-on hours, base ${number.format(row.monthlyHandsOnHours)}`}><div className="absolute h-full rounded-full bg-violet-300/45 print:bg-slate-400" style={{ left: `${row.monthlyHandsOnHoursRange.low / max * 100}%`, width: `${(row.monthlyHandsOnHoursRange.high - row.monthlyHandsOnHoursRange.low) / max * 100}%` }} /><span className="absolute top-[-2px] h-3 w-0.5 bg-violet-100 print:bg-slate-950" style={{ left: `${row.monthlyHandsOnHours / max * 100}%` }} /></div>
    </div>)}</div>
  </div>;
}

function EvidenceStatusMatrix({ blueprint }: { blueprint: QualityLabBlueprint }) {
  const labels: Record<QualityLabBlueprint["evidence"][number]["status"], string> = { "public-reference": "Public context", "user-supplied": "Project input", "internal-concept": "Atlas concept", "site-evidence-required": "Site evidence open" };
  const statuses = Object.keys(labels) as Array<keyof typeof labels>;
  return <div className="rounded-xl border border-white/10 bg-slate-950/25 p-4 print:border-slate-300 print:bg-white" data-testid="blueprint-evidence-matrix-visual">
    <div className="mb-1 flex items-center gap-2"><Database className="h-4 w-4 text-teal-300 print:text-slate-700" /><h3 className="text-sm font-bold print:text-slate-950">Evidence status matrix</h3></div>
    <p className="mb-4 text-xs leading-5 text-slate-500 print:text-slate-700">Counts describe the current record types. Public context and catalog linkage do not equal controlled applicability.</p>
    <div className="grid grid-cols-2 gap-2">{statuses.map((status) => {
      const count = blueprint.evidence.filter((item) => item.status === status).length;
      return <div key={status} className={`rounded-lg border p-3 ${status === "site-evidence-required" ? "border-amber-300/20 bg-amber-300/[0.04]" : "border-white/8 bg-white/[0.025]"} print:border-slate-300 print:bg-white`}><p className="text-xl font-bold text-slate-100 print:text-slate-950">{count}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">{labels[status]}</p></div>;
    })}</div>
  </div>;
}

function OpenInputMatrix({ blueprint }: { blueprint: QualityLabBlueprint }) {
  const categories = Array.from(new Set(blueprint.unresolvedInputs.map((item) => item.category)));
  const severityTone = { blocking: "text-red-200", important: "text-amber-200", advisory: "text-sky-200" };
  return <div className="rounded-xl border border-white/10 bg-slate-950/25 p-4 print:border-slate-300 print:bg-white" data-testid="blueprint-open-input-matrix-visual">
    <div className="mb-1 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-300 print:text-slate-700" /><h3 className="text-sm font-bold print:text-slate-950">Open-input priority matrix</h3></div>
    <p className="mb-4 text-xs leading-5 text-slate-500 print:text-slate-700">Open questions are grouped by decision domain and severity so operational risk counts cannot hide evidence blockers.</p>
    <div className="space-y-2">{categories.map((category) => <div key={category} className="grid grid-cols-[1fr_repeat(3,48px)] items-center gap-2 rounded-lg border border-white/8 px-3 py-2 print:border-slate-300"><span className="text-[10px] font-semibold capitalize text-slate-300 print:text-slate-900">{category}</span>{(["blocking", "important", "advisory"] as const).map((severity) => <div key={severity} className="text-center"><strong className={`block text-sm ${severityTone[severity]} print:text-slate-950`}>{blueprint.unresolvedInputs.filter((item) => item.category === category && item.severity === severity).length}</strong><span className="text-[7px] uppercase text-slate-600">{severity.slice(0, 3)}</span></div>)}</div>)}</div>
  </div>;
}

function WorkloadComposition({ blueprint }: { blueprint: QualityLabBlueprint }) {
  const total = Math.max(1, blueprint.workflows.reduce((sum, row) => sum + row.monthlyHandsOnHours, 0));
  const rows = [...blueprint.workflows].sort((a, b) => b.monthlyHandsOnHours - a.monthlyHandsOnHours);
  return <div className="rounded-xl border border-white/10 bg-slate-950/25 p-4 print:border-slate-300 print:bg-white" data-testid="blueprint-workload-composition-visual">
    <div className="mb-1 flex items-center gap-2"><PieChart className="h-4 w-4 text-sky-300 print:text-slate-700" /><h3 className="text-sm font-bold print:text-slate-950">Hands-on workload composition</h3></div>
    <p className="mb-4 text-xs leading-5 text-slate-500 print:text-slate-700">Share of modeled routine hands-on hours by workflow. Excluded non-routine work remains outside this composition.</p>
    <div className="space-y-3">{rows.map((row) => { const share = row.monthlyHandsOnHours / total * 100; return <div key={row.id}><div className="mb-1 flex items-center justify-between gap-3 text-[10px]"><span className="font-semibold text-slate-300 print:text-slate-900">{row.label}</span><span className="text-slate-500">{number.format(row.monthlyHandsOnHours)} h · {number.format(share)}%</span></div><div className="h-2 rounded-full bg-white/8 print:bg-slate-200" role="img" aria-label={`${row.label}: ${number.format(share)} percent of modeled routine hands-on hours`}><div className="h-full rounded-full bg-sky-300 print:bg-slate-700" style={{ width: `${share}%` }} /></div></div>; })}</div>
  </div>;
}

function TurnaroundTimeline({ blueprint }: { blueprint: QualityLabBlueprint }) {
  const maxDays = Math.max(1, ...blueprint.workflows.map((row) => row.turnaroundDays));
  return <div className="rounded-xl border border-white/10 bg-slate-950/25 p-4 print:border-slate-300 print:bg-white" data-testid="blueprint-turnaround-timeline-visual">
    <div className="mb-1 flex items-center gap-2"><Clock3 className="h-4 w-4 text-amber-300 print:text-slate-700" /><h3 className="text-sm font-bold print:text-slate-950">Laboratory workflow swimlane and nominal turnaround</h3></div>
    <p className="mb-4 text-xs leading-5 text-slate-500 print:text-slate-700">The shared stage skeleton preserves physical workflow order while the bar shows only nominal total rule duration. Stage durations, arrivals, queues, weekends, review and release deadlines are not simulated.</p>
    <div className="space-y-4">{blueprint.workflows.map((row) => <div key={row.id}><div className="mb-1 flex items-start justify-between gap-3 text-[10px]"><span className="font-semibold text-slate-300 print:text-slate-900">{row.label}</span><span className="shrink-0 text-slate-500">{number.format(row.monthlyHandsOnHours)} touch h/mo · {row.turnaroundDays} nominal d</span></div><div className="mb-1 grid grid-cols-4 gap-1 text-center text-[8px] uppercase tracking-wide text-slate-600" aria-hidden="true"><span>Receive</span><span>Prepare / execute</span><span>Run / incubate</span><span>Read / review</span></div><div className="relative h-2 rounded-full bg-white/8 print:bg-slate-200" role="img" aria-label={`${row.label}: receive, prepare or execute, run or incubate, then read or review; ${row.turnaroundDays} nominal turnaround days and ${number.format(row.monthlyHandsOnHours)} modeled monthly hands-on hours`}><div className="h-full rounded-full bg-amber-300/70 print:bg-slate-600" style={{ width: `${row.turnaroundDays / maxDays * 100}%` }} /></div></div>)}</div>
  </div>;
}

function MethodBomComposition({ blueprint }: { blueprint: QualityLabBlueprint }) {
  const categories = Array.from(new Set(blueprint.methodBom.map((row) => row.category))).map((category) => ({ category, count: blueprint.methodBom.filter((row) => row.category === category).length, open: blueprint.methodBom.filter((row) => row.category === category && row.status === "site-confirmation-required").length }));
  const max = Math.max(1, ...categories.map((row) => row.count));
  return <div className="rounded-xl border border-white/10 bg-slate-950/25 p-4 print:border-slate-300 print:bg-white" data-testid="blueprint-method-bom-composition-visual">
    <div className="mb-1 flex items-center gap-2"><PackageCheck className="h-4 w-4 text-teal-300 print:text-slate-700" /><h3 className="text-sm font-bold print:text-slate-950">Method BOM coverage</h3></div>
    <p className="mb-4 text-xs leading-5 text-slate-500 print:text-slate-700">BOM line coverage by category. Counts are not summed across incompatible physical units.</p>
    {categories.length ? <div className="space-y-3">{categories.map((row) => <div key={row.category}><div className="mb-1 flex items-center justify-between gap-3 text-[10px]"><span className="font-semibold capitalize text-slate-300 print:text-slate-900">{row.category.replaceAll("-", " ")}</span><span className="text-slate-500">{row.count} lines · {row.open} site-confirmation</span></div><div className="h-2 rounded-full bg-white/8 print:bg-slate-200"><div className="h-full rounded-full bg-teal-300 print:bg-slate-700" style={{ width: `${row.count / max * 100}%` }} /></div></div>)}</div> : <p className="rounded-lg border border-dashed border-white/10 p-4 text-xs text-slate-500 print:border-slate-300">Method BOM remains empty for this scope.</p>}
  </div>;
}

function CapexRangeBridge({ blueprint }: { blueprint: QualityLabBlueprint }) {
  const current = blueprint.current;
  const future = blueprint.future;
  const max = Math.max(1, future.capexHighUsd, current.capexHighUsd);
  const bars = [
    { label: "Current concept range", low: current.capexLowUsd, high: current.capexHighUsd, tone: "bg-slate-400" },
    { label: "Future concept range", low: future.capexLowUsd, high: future.capexHighUsd, tone: "bg-violet-300" },
    { label: "Incremental range", low: Math.max(0, future.capexLowUsd - current.capexLowUsd), high: Math.max(0, future.capexHighUsd - current.capexHighUsd), tone: "bg-amber-300" },
  ];
  return <div className="rounded-xl border border-white/10 bg-slate-950/25 p-4 print:border-slate-300 print:bg-white" data-testid="blueprint-capex-range-bridge-visual">
    <div className="mb-1 flex items-center gap-2"><WalletCards className="h-4 w-4 text-violet-300 print:text-slate-700" /><h3 className="text-sm font-bold print:text-slate-950">CAPEX range bridge</h3></div>
    <p className="mb-4 text-xs leading-5 text-slate-500 print:text-slate-700">Current, future and incremental concept ranges on one USD scale. These are vendor-neutral allowances, not quotations.</p>
    <div className="space-y-4">{bars.map((bar) => <div key={bar.label}><div className="mb-1 flex items-center justify-between gap-3 text-[10px]"><span className="font-semibold text-slate-300 print:text-slate-900">{bar.label}</span><span className="text-slate-500">${number.format(bar.low)}–${number.format(bar.high)}</span></div><div className="relative h-3 rounded-full bg-white/8 print:bg-slate-200" role="img" aria-label={`${bar.label}: ${number.format(bar.low)} to ${number.format(bar.high)} US dollars`}><div className={`absolute h-full rounded-full ${bar.tone} print:bg-slate-700`} style={{ left: `${bar.low / max * 100}%`, width: `${Math.max(1, (bar.high - bar.low) / max * 100)}%` }} /></div></div>)}</div>
  </div>;
}

export function BlueprintVisualDecisionLayer({ blueprint }: { blueprint: QualityLabBlueprint }) {
  return (
    <section id="visual-decision-layer" className="mb-5 scroll-mt-32 break-inside-avoid rounded-2xl border border-sky-300/15 bg-gradient-to-br from-sky-300/[0.055] via-white/[0.025] to-violet-300/[0.035] p-5 shadow-lg shadow-black/10 md:p-6 print:border-slate-300 print:bg-white print:shadow-none">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-300/20 bg-sky-300/10 text-sky-200 print:border-slate-300 print:bg-slate-100 print:text-slate-800"><Box className="h-5 w-5" /></div>
        <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-300 print:text-slate-500">Visual decision layer</p><h2 className="mt-1 text-xl font-bold print:text-slate-950">See the model before reading the detail</h2><p className="mt-2 max-w-4xl text-xs leading-5 text-slate-400 print:text-slate-700">A compact visual audit of how demand becomes capacity, capability and space decisions. Every mark is derived from this project Blueprint.</p></div>
      </div>
      <CompilerChain blueprint={blueprint} />
      <div className="mt-5 grid gap-4 lg:grid-cols-2"><ScenarioComparison blueprint={blueprint} /><CapacityChart blueprint={blueprint} /></div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2"><WorkflowUncertainty blueprint={blueprint} /><EvidenceStatusMatrix blueprint={blueprint} /></div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2"><WorkloadComposition blueprint={blueprint} /><TurnaroundTimeline blueprint={blueprint} /></div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2"><MethodBomComposition blueprint={blueprint} /><CapexRangeBridge blueprint={blueprint} /></div>
      <div className="mt-4"><MethodResourceLineage blueprint={blueprint} /></div>
      <div className="mt-4"><OpenInputMatrix blueprint={blueprint} /></div>
      <div className="mt-4"><ZoningSchematic blueprint={blueprint} /></div>
    </section>
  );
}

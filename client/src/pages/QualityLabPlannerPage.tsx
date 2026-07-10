import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ClipboardList,
  FlaskConical,
  Gauge,
  Layers3,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  compileQualityLabBlueprint,
  defaultQualityLabInput,
  facilityTypeValues,
  marketValues,
  qualityLabInputSchema,
  type QualityLabInput,
  type QualityLabProject,
} from "@shared/quality-lab";
import { BlueprintReport } from "@/components/quality-lab/BlueprintReport";
import { getQualityLabProject, saveQualityLabProject } from "@/lib/quality-lab-projects";
import { useSEO } from "@/hooks/use-seo";
import { analytics } from "@/hooks/use-analytics";

const steps = [
  { title: "Project basis", subtitle: "Facility, market and portfolio", icon: Building2 },
  { title: "Testing demand", subtitle: "Monthly samples and rounds", icon: ClipboardList },
  { title: "Capability scope", subtitle: "What the lab will perform", icon: Layers3 },
  { title: "Operating model", subtitle: "Capacity and planning assumptions", icon: Gauge },
];

const facilityLabels: Record<(typeof facilityTypeValues)[number], string> = {
  "nonsterile-pharma": "Non-sterile pharma",
  "sterile-pharma": "Sterile pharma",
  biologics: "Biologics",
  "food-beverage": "Food & beverage",
  cosmetics: "Cosmetics",
  "medical-device": "Medical device",
};

const marketLabels: Record<(typeof marketValues)[number], string> = {
  vietnam: "Vietnam",
  asean: "ASEAN",
  eu: "European Union",
  us: "United States",
  who: "WHO / global health",
};

const scopeOptions: { key: keyof QualityLabInput["scope"]; title: string; detail: string }[] = [
  { key: "rawMaterials", title: "Raw-material microbiology", detail: "Incoming lots, microbial limits and specified organisms." },
  { key: "finishedProducts", title: "Finished-product microbial limits", detail: "Release testing for non-sterile products." },
  { key: "water", title: "Water microbiology", detail: "PW/WFI/utility points, routine sampling and trending." },
  { key: "environmentalMonitoring", title: "Environmental monitoring", detail: "Air, surfaces, personnel and controlled-area monitoring." },
  { key: "sterility", title: "Sterility testing", detail: "Compendial sterility capability and isolator concept." },
  { key: "endotoxin", title: "Bacterial endotoxin", detail: "LAL/recombinant factor-based release or utility testing." },
  { key: "bioburden", title: "Bioburden", detail: "In-process, bulk and pre-sterilization microbial load." },
  { key: "growthPromotion", title: "Growth promotion", detail: "Media lot release and recovery evidence." },
];

function NumberField({ label, value, onChange, suffix, hint, min = 0, max }: { label: string; value: number; onChange: (value: number) => void; suffix?: string; hint?: string; min?: number; max?: number }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-slate-300">{label}</span>
      <div className="relative">
        <input type="number" min={min} max={max} step="any" value={Number.isFinite(value) ? value : ""} onChange={(event) => onChange(Number(event.target.value))} className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/55 px-3 pr-16 text-sm text-white outline-none transition focus:border-teal-300/50 focus:ring-2 focus:ring-teal-300/10" />
        {suffix && <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[11px] text-slate-500">{suffix}</span>}
      </div>
      {hint && <span className="mt-1.5 block text-[11px] leading-4 text-slate-500">{hint}</span>}
    </label>
  );
}

function TextField({ label, value, onChange, placeholder, hint }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-slate-300">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/55 px-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-teal-300/50 focus:ring-2 focus:ring-teal-300/10" />
      {hint && <span className="mt-1.5 block text-[11px] leading-4 text-slate-500">{hint}</span>}
    </label>
  );
}

function formatInt(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

export default function QualityLabPlannerPage() {
  useSEO({
    title: "Build a Quality Lab Blueprint",
    description: "Model microbiology testing demand, staffing, equipment, space and costs for a regulated manufacturing QC laboratory.",
  });
  const [, params] = useRoute("/quality-lab/projects/:id");
  const [, setLocation] = useLocation();
  const [input, setInput] = useState<QualityLabInput>(defaultQualityLabInput);
  const [step, setStep] = useState(0);
  const [project, setProject] = useState<QualityLabProject | null>(null);
  const [view, setView] = useState<"form" | "report">(params?.id ? "report" : "form");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.id) analytics.blueprintStarted("planner");
  }, [params?.id]);

  useEffect(() => {
    if (!params?.id) return;
    const saved = getQualityLabProject(params.id);
    if (saved) {
      setProject(saved);
      setInput(saved.input);
      setView("report");
    } else {
      setError("This project was not found in this browser.");
      setView("form");
    }
  }, [params?.id]);

  const preview = useMemo(() => {
    const parsed = qualityLabInputSchema.safeParse(input);
    return parsed.success ? compileQualityLabBlueprint(parsed.data) : null;
  }, [input]);

  const update = <K extends keyof QualityLabInput>(key: K, value: QualityLabInput[K]) => {
    setInput((current) => ({ ...current, [key]: value }));
    setError(null);
  };

  const updateScope = (key: keyof QualityLabInput["scope"], value: boolean) => {
    setInput((current) => ({ ...current, scope: { ...current.scope, [key]: value } }));
    setError(null);
  };

  function validateStep(currentStep: number): string | null {
    if (currentStep === 0) {
      if (input.projectName.trim().length < 2) return "Give this project a clear name.";
      if (input.country.trim().length < 2) return "Add the facility country.";
      if (input.markets.length === 0) return "Select at least one target market.";
    }
    if (currentStep === 1) {
      const demand = input.finishedBatchesPerMonth + input.rawMaterialLotsPerMonth + input.waterPoints + input.emLocations + input.sterilityBatchesPerMonth + input.endotoxinSamplesPerMonth + input.bioburdenSamplesPerMonth;
      if (demand <= 0) return "Add at least one source of monthly testing demand.";
    }
    if (currentStep === 2 && !Object.values(input.scope).some(Boolean)) return "Select at least one in-house capability.";
    return null;
  }

  function next() {
    const issue = validateStep(step);
    if (issue) return setError(issue);
    setError(null);
    setStep((current) => Math.min(steps.length - 1, current + 1));
  }

  function generate() {
    const parsed = qualityLabInputSchema.safeParse(input);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Review the project inputs.");
      return;
    }
    const saved = saveQualityLabProject(parsed.data, project?.id);
    analytics.blueprintCompiled(
      saved.id,
      saved.input.facilityType,
      Object.values(saved.input.scope).filter(Boolean).length,
    );
    setProject(saved);
    setInput(saved.input);
    setView("report");
    setError(null);
    setLocation(`/quality-lab/projects/${saved.id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (view === "report" && project) {
    return <BlueprintReport project={project} onEdit={() => { setView("form"); setStep(0); window.scrollTo({ top: 0 }); }} />;
  }

  return (
    <div className="min-h-screen bg-[#08111f] px-4 pb-24 pt-5 text-slate-100 md:pt-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/quality-lab" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"><ArrowLeft className="h-4 w-4" /> Quality Lab Blueprint</Link>
          <div className="flex items-center gap-2">
            <button onClick={() => { setInput(defaultQualityLabInput); setProject(null); setStep(0); setError(null); setLocation("/quality-lab/planner"); }} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-white/25 hover:bg-white/10"><RotateCcw className="h-3.5 w-3.5" /> Reset example</button>
            <Link href="/quality-lab/projects" className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-white/25 hover:bg-white/10"><Save className="h-3.5 w-3.5" /> Saved projects</Link>
          </div>
        </div>

        <header className="mb-6 overflow-hidden rounded-3xl border border-teal-300/20 bg-gradient-to-br from-teal-300/10 via-white/[0.035] to-sky-300/5 p-6 md:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-teal-200"><FlaskConical className="h-3.5 w-3.5" /> Microbiology compiler · v1</span>
              <h1 className="mt-5 text-3xl font-bold md:text-5xl">Build the basis of design.</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400 md:text-base">Enter the operational facts you know. Atlas will expose the assumptions it adds and separate concept estimates from decisions that require site verification.</p>
            </div>
            <div className="rounded-xl border border-amber-300/20 bg-amber-300/5 p-3 text-xs leading-5 text-amber-100 lg:max-w-sm"><ShieldCheck className="mb-2 h-4 w-4 text-amber-300" /> No product data leaves this browser in the current concept edition.</div>
          </div>
        </header>

        <div className="mb-5 grid grid-cols-2 gap-2 lg:grid-cols-4">
          {steps.map((item, index) => {
            const active = index === step;
            const complete = index < step;
            return (
              <button key={item.title} onClick={() => { if (index <= step || !validateStep(step)) { setStep(index); setError(null); } }} className={`rounded-xl border p-3 text-left transition ${active ? "border-teal-300/40 bg-teal-300/10" : complete ? "border-emerald-300/20 bg-emerald-300/5" : "border-white/10 bg-white/[0.025]"}`}>
                <div className="flex items-start gap-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${active ? "bg-teal-300 text-slate-950" : complete ? "bg-emerald-300/15 text-emerald-200" : "bg-white/5 text-slate-500"}`}>{complete ? <Check className="h-4 w-4" /> : <item.icon className="h-4 w-4" />}</div>
                  <div><p className={`text-xs font-bold ${active ? "text-teal-100" : "text-slate-300"}`}>{item.title}</p><p className="mt-1 hidden text-[10px] text-slate-500 sm:block">{item.subtitle}</p></div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid gap-5 xl:grid-cols-[1fr_330px]">
          <main className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/20 md:p-7">
            <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-300/10 text-teal-200">{(() => { const Icon = steps[step].icon; return <Icon className="h-5 w-5" />; })()}</div>
              <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">Step {step + 1} of {steps.length}</p><h2 className="mt-1 text-xl font-bold">{steps[step].title}</h2></div>
            </div>

            {step === 0 && (
              <div className="space-y-7">
                <div className="grid gap-4 md:grid-cols-2">
                  <TextField label="Project name" value={input.projectName} onChange={(value) => update("projectName", value)} placeholder="e.g. Site A microbiology expansion" />
                  <TextField label="Company / site" value={input.companyName} onChange={(value) => update("companyName", value)} placeholder="Optional" />
                  <TextField label="Facility country" value={input.country} onChange={(value) => update("country", value)} />
                </div>
                <div>
                  <p className="mb-3 text-xs font-semibold text-slate-300">Manufacturing context</p>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {facilityTypeValues.map((value) => (
                      <button key={value} onClick={() => update("facilityType", value)} className={`rounded-xl border p-3 text-left text-sm font-semibold transition ${input.facilityType === value ? "border-teal-300/40 bg-teal-300/10 text-teal-100" : "border-white/10 bg-slate-950/35 text-slate-400 hover:border-white/20"}`}><span className="flex items-center justify-between gap-2">{facilityLabels[value]}{input.facilityType === value && <CheckCircle2 className="h-4 w-4 text-teal-300" />}</span></button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-3 text-xs font-semibold text-slate-300">Target markets</p>
                  <div className="flex flex-wrap gap-2">
                    {marketValues.map((value) => {
                      const selected = input.markets.includes(value);
                      return <button key={value} onClick={() => update("markets", selected ? input.markets.filter((item) => item !== value) : [...input.markets, value])} className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${selected ? "border-teal-300/40 bg-teal-300/10 text-teal-100" : "border-white/10 bg-white/[0.025] text-slate-400"}`}>{selected && <Check className="mr-1 inline h-3.5 w-3.5" />}{marketLabels[value]}</button>;
                    })}
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <NumberField label="Finished products" value={input.finishedProducts} onChange={(value) => update("finishedProducts", value)} suffix="SKUs" hint="Portfolio breadth; used as a review signal, not direct workload." />
                  <NumberField label="Raw materials" value={input.rawMaterials} onChange={(value) => update("rawMaterials", value)} suffix="items" hint="Distinct materials potentially requiring specifications and methods." />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-7">
                <div>
                  <h3 className="text-sm font-bold">Release and incoming demand</h3><p className="mt-1 text-xs leading-5 text-slate-500">Use actual monthly lots/batches where possible — product count alone does not define workload.</p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <NumberField label="Finished-product batches" value={input.finishedBatchesPerMonth} onChange={(value) => update("finishedBatchesPerMonth", value)} suffix="/ month" />
                    <NumberField label="Raw-material lots received" value={input.rawMaterialLotsPerMonth} onChange={(value) => update("rawMaterialLotsPerMonth", value)} suffix="/ month" />
                  </div>
                </div>
                <div className="border-t border-white/10 pt-6">
                  <h3 className="text-sm font-bold">Routine monitoring demand</h3>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <NumberField label="Water sampling points" value={input.waterPoints} onChange={(value) => update("waterPoints", value)} suffix="points" />
                    <NumberField label="Water sampling rounds" value={input.waterRoundsPerWeek} onChange={(value) => update("waterRoundsPerWeek", value)} suffix="/ week" />
                    <NumberField label="EM locations per round" value={input.emLocations} onChange={(value) => update("emLocations", value)} suffix="locations" />
                    <NumberField label="EM sampling rounds" value={input.emRoundsPerWeek} onChange={(value) => update("emRoundsPerWeek", value)} suffix="/ week" />
                  </div>
                </div>
                <div className="border-t border-white/10 pt-6">
                  <h3 className="text-sm font-bold">Specialized microbiology</h3>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <NumberField label="Sterility batches" value={input.sterilityBatchesPerMonth} onChange={(value) => update("sterilityBatchesPerMonth", value)} suffix="/ month" />
                    <NumberField label="Endotoxin samples" value={input.endotoxinSamplesPerMonth} onChange={(value) => update("endotoxinSamplesPerMonth", value)} suffix="/ month" />
                    <NumberField label="Bioburden samples" value={input.bioburdenSamplesPerMonth} onChange={(value) => update("bioburdenSamplesPerMonth", value)} suffix="/ month" />
                    <NumberField label="Media lots for GPT" value={input.mediaLotsPerMonth} onChange={(value) => update("mediaLotsPerMonth", value)} suffix="/ month" />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <p className="mb-5 max-w-3xl text-sm leading-6 text-slate-400">Select capabilities performed in-house. The outsource percentage in the next step reduces modeled in-house workload across the selected scope.</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {scopeOptions.map((option) => {
                    const selected = input.scope[option.key];
                    return (
                      <button key={option.key} onClick={() => updateScope(option.key, !selected)} className={`rounded-xl border p-4 text-left transition ${selected ? "border-teal-300/35 bg-teal-300/[0.075]" : "border-white/10 bg-slate-950/35 hover:border-white/20"}`}>
                        <div className="flex items-start gap-3"><div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${selected ? "border-teal-300 bg-teal-300 text-slate-950" : "border-white/20"}`}>{selected && <Check className="h-3.5 w-3.5" />}</div><div><p className={`text-sm font-bold ${selected ? "text-teal-100" : "text-slate-300"}`}>{option.title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{option.detail}</p></div></div>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-5 rounded-xl border border-sky-300/20 bg-sky-300/5 p-4 text-xs leading-6 text-sky-100"><AlertCircle className="mr-2 inline h-4 w-4 text-sky-300" />Analytical chemistry, stability and packaging packs are deliberately outside this v1 calculation model. Their future modules can share the same core project inputs.</div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-7">
                <div className="grid gap-4 md:grid-cols-2">
                  <NumberField label="Release target" value={input.targetTurnaroundDays} onChange={(value) => update("targetTurnaroundDays", value)} suffix="days" min={1} max={60} hint="Atlas will flag conflicts with conventional incubation." />
                  <NumberField label="Growth over horizon" value={input.growthRatePercent} onChange={(value) => update("growthRatePercent", value)} suffix="%" min={-50} max={500} />
                  <NumberField label="Planning horizon" value={input.horizonYears} onChange={(value) => update("horizonYears", value)} suffix="years" min={1} max={10} />
                  <NumberField label="Working days" value={input.workingDaysPerMonth} onChange={(value) => update("workingDaysPerMonth", value)} suffix="/ month" min={10} max={31} />
                  <NumberField label="Operating shifts" value={input.shifts} onChange={(value) => update("shifts", value)} suffix="shifts" min={1} max={3} />
                  <NumberField label="Productive analyst time" value={input.productiveHoursPerShift} onChange={(value) => update("productiveHoursPerShift", value)} suffix="h / day" min={2} max={12} hint="Excludes breaks, meetings, training and non-test work." />
                </div>
                <div className="border-t border-white/10 pt-6">
                  <h3 className="text-sm font-bold">Resilience and commercial assumptions</h3>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <NumberField label="Outsourced share" value={input.outsourcePercent} onChange={(value) => update("outsourcePercent", value)} suffix="%" max={95} />
                    <NumberField label="People capacity reserve" value={input.redundancyPercent} onChange={(value) => update("redundancyPercent", value)} suffix="%" max={100} />
                    <NumberField label="Equipment downtime" value={input.equipmentDowntimePercent} onChange={(value) => update("equipmentDowntimePercent", value)} suffix="%" max={50} />
                    <NumberField label="Loaded analyst cost" value={input.analystAnnualCostUsd} onChange={(value) => update("analystAnnualCostUsd", value)} suffix="USD / year" max={500000} hint="Used only for indicative OPEX planning." />
                  </div>
                </div>
                <div className="rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-xs leading-6 text-amber-100"><ShieldCheck className="mr-2 inline h-4 w-4 text-amber-300" />By compiling, you acknowledge that all capacity and cost outputs are concept estimates requiring method, regulatory, engineering and supplier verification.</div>
              </div>
            )}

            {error && <div className="mt-6 flex items-start gap-2 rounded-xl border border-red-300/20 bg-red-300/10 p-3 text-sm text-red-100"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}

            <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5">
              <button onClick={() => { setStep((current) => Math.max(0, current - 1)); setError(null); }} disabled={step === 0} className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-slate-400 transition hover:bg-white/5 hover:text-white disabled:invisible"><ArrowLeft className="h-4 w-4" /> Back</button>
              {step < steps.length - 1 ? (
                <button onClick={next} className="inline-flex items-center gap-2 rounded-xl bg-teal-300 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-teal-200">Continue <ArrowRight className="h-4 w-4" /></button>
              ) : (
                <button onClick={generate} className="inline-flex items-center gap-2 rounded-xl bg-teal-300 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-teal-500/20 transition hover:bg-teal-200"><Sparkles className="h-4 w-4" /> Compile blueprint</button>
              )}
            </div>
          </main>

          <aside className="h-fit space-y-4 xl:sticky xl:top-24">
            <div className="rounded-2xl border border-white/10 bg-slate-950/65 p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">Live model preview</p>
              {preview ? (
                <>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {[
                      [formatInt(preview.current.monthlyTests), "test units / mo"],
                      [formatInt(preview.current.monthlyHandsOnHours), "hands-on h / mo"],
                      [String(preview.current.totalTeamFte), "team FTE"],
                      [`${preview.current.estimatedAreaSqm} m²`, "concept area"],
                    ].map(([value, label]) => <div key={label} className="rounded-xl border border-white/10 bg-white/[0.035] p-3"><p className="text-lg font-bold text-teal-200">{value}</p><p className="mt-1 text-[10px] text-slate-500">{label}</p></div>)}
                  </div>
                  <div className="mt-4 space-y-2 text-xs text-slate-400">
                    <div className="flex justify-between gap-2"><span>Selected workflows</span><strong className="text-slate-200">{preview.workflows.length}</strong></div>
                    <div className="flex justify-between gap-2"><span>Equipment classes</span><strong className="text-slate-200">{preview.equipment.length}</strong></div>
                    <div className="flex justify-between gap-2"><span>Future multiplier</span><strong className="text-slate-200">{preview.future.multiplier}×</strong></div>
                  </div>
                </>
              ) : <p className="mt-4 text-xs leading-5 text-slate-500">Complete the required fields to preview the model.</p>}
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <div className="flex items-center gap-2 text-sm font-bold"><ShieldCheck className="h-4 w-4 text-teal-300" /> Confidence discipline</div>
              <div className="mt-4 space-y-3 text-xs leading-5 text-slate-500">
                <p><strong className="text-emerald-200">High:</strong> derived directly from your inputs.</p>
                <p><strong className="text-sky-200">Medium:</strong> capacity benchmark; validate with methods.</p>
                <p><strong className="text-amber-200">Indicative:</strong> budget or design allowance; obtain specialist evidence.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

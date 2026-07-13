import { ArrowRight, BookOpenCheck, CheckCircle2, ChevronDown, CircleAlert, FlaskConical, GitCompareArrows, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "wouter";
import { analytics } from "@/hooks/use-analytics";
import { useSEO } from "@/hooks/use-seo";
import { saveQualityLabProject } from "@/lib/quality-lab-projects";
import { compileQualityLabBlueprint, defaultQualityLabInput, type QualityLabInput } from "@shared/quality-lab";

const baseProduct = defaultQualityLabInput.productProfiles[0];

const cases: Array<{
  id: string;
  label: string;
  title: string;
  question: string;
  lesson: string;
  input: QualityLabInput;
}> = [
  {
    id: "complete-in-house",
    label: "Case 01 · Reconciled portfolio",
    title: "A complete in-house portfolio replaces the aggregate sizing shortcut",
    question: "What changes when product-level execution is confirmed and reconciled?",
    lesson: "The finished-product workflow uses the verified portfolio demand and the Method Graph can allocate physical method load to site resources.",
    input: {
      ...defaultQualityLabInput,
      projectName: "Illustrative case — reconciled in-house portfolio",
      finishedBatchesPerMonth: 45,
      outsourcePercent: 40,
      portfolioIsComplete: true,
      productProfiles: [{ ...baseProduct, id: "case-solid", name: "Illustrative solid oral family", monthlyBatches: 45, execution: "in-house", methodSuitability: "verified" }],
    },
  },
  {
    id: "hybrid-execution",
    label: "Case 02 · Hybrid execution",
    title: "Outsourced products stay traceable without consuming site method capacity",
    question: "How does a hybrid portfolio change the operating model?",
    lesson: "Atlas retains the outsourced product requirements for governance while method-derived equipment load is allocated only to confirmed in-house execution.",
    input: {
      ...defaultQualityLabInput,
      projectName: "Illustrative case — hybrid in-house and outsourced portfolio",
      finishedBatchesPerMonth: 50,
      outsourcePercent: 10,
      portfolioIsComplete: true,
      productProfiles: [
        { ...baseProduct, id: "case-in-house", name: "Illustrative in-house solid family", monthlyBatches: 30, execution: "in-house", methodSuitability: "verified" },
        { ...baseProduct, id: "case-outsourced", name: "Illustrative outsourced oral liquid family", dosageForm: "oral-liquid", monthlyBatches: 20, execution: "outsource", methodSuitability: "pending" },
      ],
    },
  },
  {
    id: "unresolved-multi-market",
    label: "Case 03 · Unresolved allocation",
    title: "Regulatory traces remain visible while unsupported physical demand is held back",
    question: "What happens when one product serves multiple markets but test allocation is unknown?",
    lesson: "The Compiler creates separate market requirement traces, marks the allocation as unresolved and blocks method BOM/capacity demand instead of multiplying tests automatically.",
    input: {
      ...defaultQualityLabInput,
      projectName: "Illustrative case — unresolved multi-market allocation",
      markets: ["vietnam", "eu"],
      finishedBatchesPerMonth: 30,
      portfolioIsComplete: true,
      productProfiles: [{ ...baseProduct, id: "case-multi-market", name: "Illustrative multi-market product", markets: ["vietnam", "eu"], monthlyBatches: 30, marketExecutionStrategy: "unknown", methodSuitability: "unknown" }],
    },
  },
];

const compiledCases = cases.map((item) => ({ ...item, blueprint: compileQualityLabBlueprint(item.input) }));

export default function QualityLabCasebookPage() {
  const [, setLocation] = useLocation();
  useSEO({
    title: "Atlas Blueprint Casebook",
    description: "Illustrative, engine-calculated Quality Lab Blueprint cases showing portfolio reconciliation, hybrid execution and unresolved multi-market allocation.",
  });

  function openCase(item: (typeof compiledCases)[number]) {
    const project = saveQualityLabProject(item.input);
    analytics.blueprintCtaClicked(`casebook_${item.id}`, "editable_project");
    setLocation(`/quality-lab/projects/${project.id}`);
  }

  return (
    <div className="min-h-screen bg-[#08111f] px-4 pb-24 pt-8 text-slate-100 md:pt-14">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-3xl border border-sky-300/20 bg-gradient-to-br from-sky-300/15 via-teal-300/[0.06] to-transparent p-6 md:p-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-300/25 bg-sky-300/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-200">
            <BookOpenCheck className="h-3.5 w-3.5" /> Engine-calculated learning cases
          </span>
          <h1 className="mt-6 max-w-4xl font-display text-4xl font-bold leading-tight md:text-6xl">Atlas Blueprint Casebook</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 md:text-lg">
            Explore how one decision changes requirements, physical workload, capacity and review blockers. Every metric below is compiled live from the same concept engine used by editable Blueprint projects.
          </p>
          <div className="mt-6 flex gap-3 rounded-xl border border-amber-300/15 bg-amber-300/[0.05] p-4 text-sm leading-6 text-slate-300">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" /> These are synthetic planning scenarios, not customer cases, calibrated benchmarks, validated designs or claims of regulatory applicability.
          </div>
        </section>

        <section aria-labelledby="case-comparison-heading" className="mt-8 rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:p-7">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">Decision comparison</p>
              <h2 id="case-comparison-heading" className="mt-2 text-2xl font-bold">See what the engine permits, holds back, or keeps traceable.</h2>
            </div>
            <p className="max-w-lg text-xs leading-5 text-slate-500">Compare the calculation behavior first, then open the case that matches the assumption you need to challenge.</p>
          </div>
          <div className="mt-5 overflow-x-auto rounded-xl border border-white/8">
            <table className="min-w-[760px] w-full border-collapse text-left text-xs">
              <thead className="bg-slate-950/55 text-slate-300">
                <tr>
                  <th className="px-4 py-3 font-semibold">Engine behavior</th>
                  {compiledCases.map((item) => <th key={item.id} className="px-4 py-3 font-semibold"><a href={`#${item.id}`} className="text-teal-200 hover:text-teal-100">{item.label.replace(" · ", " — ")}</a></th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8 text-slate-400">
                {[
                  ["Sizing basis", ...compiledCases.map((item) => item.blueprint.finishedProductDemand.source.replaceAll("-", " "))],
                  ["In-house batches / month", ...compiledCases.map((item) => item.blueprint.finishedProductDemand.effectiveInHouseBatches.toLocaleString())],
                  ["Physical resource loads", ...compiledCases.map((item) => item.blueprint.methodCapacity.length.toLocaleString())],
                  ["Blocking inputs", ...compiledCases.map((item) => item.blueprint.dataQuality.blockingOpenCount.toLocaleString())],
                ].map(([label, ...values]) => (
                  <tr key={label}>
                    <th className="bg-black/10 px-4 py-3 font-semibold text-slate-300">{label}</th>
                    {values.map((value, index) => <td key={`${label}-${compiledCases[index].id}`} className="px-4 py-3 capitalize">{value}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10 space-y-6">
          {compiledCases.map((item) => {
            const blueprint = item.blueprint;
            const inHouseRequirements = blueprint.methodRequirements.filter((requirement) => requirement.execution === "in-house").length;
            return (
              <article id={item.id} key={item.id} className="scroll-mt-24 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035]">
                <div className="grid gap-7 p-6 lg:grid-cols-[1.05fr_0.95fr] lg:p-8">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300">{item.label}</p>
                    <h2 className="mt-3 text-2xl font-bold leading-tight md:text-3xl">{item.title}</h2>
                    <p className="mt-4 text-sm font-semibold text-sky-200">{item.question}</p>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">{item.lesson}</p>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <button type="button" onClick={() => openCase(item)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-300 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-teal-200">
                        Open as editable project <ArrowRight className="h-4 w-4" />
                      </button>
                      <Link href="/quality-lab/discovery-pack" className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold hover:border-white/30">Use the discovery templates</Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      [blueprint.finishedProductDemand.source.replaceAll("-", " "), "Sizing basis"],
                      [`${blueprint.finishedProductDemand.effectiveInHouseBatches}`, "In-house batches / month"],
                      [`${blueprint.methodRequirements.length}`, "Requirement traces"],
                      [`${inHouseRequirements}`, "In-house requirement traces"],
                      [`${blueprint.methodCapacity.length}`, "Allocated resource loads"],
                      [`${blueprint.dataQuality.blockingOpenCount}`, "Blocking inputs"],
                    ].map(([value, label]) => (
                      <div key={label} className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
                        <p className="text-lg font-bold capitalize text-teal-200">{value}</p>
                        <p className="mt-1 text-[11px] leading-4 text-slate-500">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="hidden gap-3 border-t border-white/10 bg-slate-950/30 p-5 md:grid md:grid-cols-3 lg:px-8">
                  <div className="flex gap-3 text-xs leading-5 text-slate-400"><GitCompareArrows className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" /><span><strong className="text-slate-200">Demand:</strong> {blueprint.finishedProductDemand.message}</span></div>
                  <div className="flex gap-3 text-xs leading-5 text-slate-400"><FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" /><span><strong className="text-slate-200">Method load:</strong> {blueprint.methodCapacity.length > 0 ? "Allocated only where physical execution is resolved and in-house." : "Held back because no eligible in-house physical execution is allocated."}</span></div>
                  <div className="flex gap-3 text-xs leading-5 text-slate-400">{blueprint.dataQuality.blockingOpenCount > 0 ? <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" />}<span><strong className="text-slate-200">Review:</strong> {blueprint.dataQuality.blockingOpenCount} blocking and {blueprint.dataQuality.importantOpenCount} important inputs remain.</span></div>
                </div>
                <details className="group border-t border-white/10 bg-slate-950/30 md:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-xs font-bold text-sky-200 marker:content-none">Why the engine responded this way <ChevronDown className="h-4 w-4 transition group-open:rotate-180" /></summary>
                  <div className="space-y-4 border-t border-white/8 p-5">
                    <div className="flex gap-3 text-xs leading-5 text-slate-400"><GitCompareArrows className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" /><span><strong className="text-slate-200">Demand:</strong> {blueprint.finishedProductDemand.message}</span></div>
                    <div className="flex gap-3 text-xs leading-5 text-slate-400"><FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" /><span><strong className="text-slate-200">Method load:</strong> {blueprint.methodCapacity.length > 0 ? "Allocated only where physical execution is resolved and in-house." : "Held back because no eligible in-house physical execution is allocated."}</span></div>
                    <div className="flex gap-3 text-xs leading-5 text-slate-400">{blueprint.dataQuality.blockingOpenCount > 0 ? <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" />}<span><strong className="text-slate-200">Review:</strong> {blueprint.dataQuality.blockingOpenCount} blocking and {blueprint.dataQuality.importantOpenCount} important inputs remain.</span></div>
                  </div>
                </details>
              </article>
            );
          })}
        </section>

        <section className="mt-10 rounded-3xl border border-teal-300/20 bg-teal-300/[0.06] p-6 md:p-8">
          <h2 className="text-2xl font-bold">Use cases to challenge assumptions, not to copy answers.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">Open a case as a local project, replace every illustrative input with site evidence, then use the assumptions and decision log before requesting expert review.</p>
          <Link href="/quality-lab/planner" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-teal-300">Build from your own inputs <ArrowRight className="h-4 w-4" /></Link>
        </section>
      </div>
    </div>
  );
}

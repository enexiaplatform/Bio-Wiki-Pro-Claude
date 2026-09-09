import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import type { QualityLabProject } from "@shared/quality-lab";
import { analyzeQualityLabChallengeWithSpecialists } from "@shared/quality-lab-challenge";
import { recordQualityLabFunnelEvent } from "@/lib/quality-lab-funnel";
import { DecisionTraceLink } from "./DecisionLineagePanel";

export function ChallengeBlueprint({ project, onEdit }: { project: QualityLabProject; onEdit?: () => void }) {
  const [result, setResult] = useState<Awaited<ReturnType<typeof analyzeQualityLabChallengeWithSpecialists>> | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);
  const generation = useRef(0);
  useEffect(() => {
    generation.current++;
    setResult(null); setBusy(false); setError(""); setShowAll(false);
    return () => { generation.current++; };
  }, [project]);
  async function run() {
    const current = ++generation.current;
    setBusy(true); setError("");
    await new Promise((resolve) => setTimeout(resolve, 20));
    try {
      const next = await analyzeQualityLabChallengeWithSpecialists(project);
      if (current === generation.current) {
        setResult(next);
        if (next.status === "ready") {
          recordQualityLabFunnelEvent({ stage: "challenge_viewed", source: "blueprint-challenge" });
          if (next.findings.length) recordQualityLabFunnelEvent({ stage: "decision_insight_reached", source: "blueprint-challenge" });
        }
      }
    } catch {
      if (current === generation.current) setError("This Blueprint could not be challenged. Review its saved basis and try again.");
    } finally {
      if (current === generation.current) setBusy(false);
    }
  }
  return <section id="blueprint-challenge" aria-labelledby="challenge-heading" className="mb-5 scroll-mt-32 rounded-2xl border border-amber-300/25 p-5 print:hidden">
    <h2 id="challenge-heading" className="text-xl font-bold">Challenge this Blueprint</h2>
    <p className="mt-2 text-sm text-slate-300">Rank the decisions and evidence that need attention, using this model's existing calculations and accepted analysis basis.</p>
    {!result && <button type="button" disabled={busy} onClick={() => void run()} className="mt-4 min-h-11 rounded-lg bg-amber-200 px-4 py-2 font-bold text-slate-950 disabled:opacity-50">{busy ? "Checking the model…" : "Show decision priorities"}</button>}
    <p role="status" className="mt-3 text-sm text-amber-100">{error || (result?.status === "blocked" ? result.message : "")}</p>
    {result?.status === "ready" && <>
      <p className="mt-3 text-xs leading-5 text-slate-400">{result.boundary}</p>
      {!result.findings.length && <p className="mt-3">No findings from the evaluated sources. This is not approval or evidence of operational readiness.</p>}
      <ol className="mt-4 space-y-3">
        {result.findings.slice(0, showAll ? undefined : 5).map((finding, index) => <li key={finding.id} className="rounded-xl border border-white/10 p-4">
          <h3 className="font-semibold">{index + 1}. {finding.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">{finding.explanation}</p>
          <p className="mt-3 text-sm leading-6"><strong>Verify next:</strong> {finding.nextAction}</p>
          <details className="mt-3 text-xs leading-5 text-slate-400">
            <summary className="min-h-8 cursor-pointer">Why this is ranked here · {finding.score} priority points</summary>
            <p>Decision impact {finding.factors.decisionImpact}; proximity {finding.factors.proximity}; evidence gap {finding.factors.evidenceGap}; linked outputs {finding.factors.dependencies}. Model confidence: {finding.confidence}.</p>
            <p className="mt-2">{finding.affectedOutputs.length} affected or rule-linked outputs. Inspect each trace to distinguish a direct dependency from shared rule context.</p>
            <p className="mt-2">Rules: {finding.ruleIds.join(", ") || "Inspect linked equipment sizing basis"}.</p>
            <div className="mt-2 flex flex-col gap-2">{finding.lineageIds.map((id) => {
              const lineage = project.blueprint.decisionLineage.find((record) => record.id === id);
              return <DecisionTraceLink key={id} projectId={project.id} lineage={lineage} label={lineage ? `${lineage.decisionType}: ${lineage.currentOutput}` : undefined} />;
            })}</div>
          </details>
          {finding.kind === "unresolved-input" && onEdit ? <button type="button" onClick={() => { recordQualityLabFunnelEvent({ stage: "challenge_action_taken", source: "blueprint-challenge" }); onEdit(); }} className="mt-3 min-h-11 text-sm text-teal-200 underline">Review project inputs</button> : <Link href={finding.kind === "unresolved-input" ? "/quality-lab/planner" : finding.kind === "equipment-threshold" ? `/quality-lab/projects/${project.id}?edit=input&field=finishedBatchesPerMonth` : `/quality-lab/${finding.kind === "sensitivity" ? "sensitivity" : finding.id.split(":")[1]}?project=${project.id}`} onClick={() => recordQualityLabFunnelEvent({ stage: "challenge_action_taken", source: "blueprint-challenge" })} className="mt-3 inline-flex min-h-11 items-center text-sm text-teal-200 underline">{finding.kind === "unresolved-input" ? "Start my project intake" : "Review the decision basis"}</Link>}
        </li>)}
      </ol>
      {result.findings.length > 5 && <button type="button" onClick={() => setShowAll(!showAll)} className="mt-3 min-h-11 text-sm text-teal-200 underline">{showAll ? "Show first five priorities" : `Show all ${result.findings.length} findings`}</button>}
      {"specialistCoverage" in result && <details className="mt-4 text-sm"><summary className="min-h-11 cursor-pointer">Analysis coverage and missing bases</summary>{result.specialistCoverage.map((item) => <p key={item.kind} className="mt-2">{item.kind}: {item.status}. {item.boundary}</p>)}</details>}
    </>}
  </section>;
}


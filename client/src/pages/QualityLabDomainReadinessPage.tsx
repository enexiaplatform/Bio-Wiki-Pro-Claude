import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, CircleDashed, Database, Download, FlaskConical, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { QualityLabEditorialHero } from "@/components/QualityLabEditorialHero";
import { assessDomainPackReadiness, domainPackReadiness, type ReadinessGateStatus } from "@/data/domainPackReadiness";
import { useSEO } from "@/hooks/use-seo";
import {
  MICROBIOLOGY_DOMAIN_PACK,
  MICROBIOLOGY_EVIDENCE_CATALOG,
  MICROBIOLOGY_SHARED_RULE_TRACE,
  workflowRuleTrace,
  type MicrobiologyWorkflowKey,
} from "@shared/quality-lab-microbiology-pack";
import { assessSourceCoverage, createSourceCoverageRegistry, type EvidenceControlState } from "@shared/quality-lab-source-coverage";

const stageLabel = { "executable-concept": "Executable concept", "evidence-development": "Evidence development", "specialist-gated": "Specialist gated", "future-gate": "Future gate only" };
const statusLabel: Record<ReadinessGateStatus, string> = { "gate-satisfied": "Gate satisfied", "in-development": "In development", "evidence-required": "Evidence required", "not-started": "Not started" };
const statusStyle: Record<ReadinessGateStatus, string> = {
  "gate-satisfied": "border-teal-300/25 bg-teal-300/10 text-teal-200",
  "in-development": "border-sky-300/20 bg-sky-300/10 text-sky-200",
  "evidence-required": "border-amber-300/20 bg-amber-300/10 text-amber-200",
  "not-started": "border-white/10 bg-white/[0.035] text-slate-400",
};

const workflowKeys: MicrobiologyWorkflowKey[] = ["rawMaterials", "finishedProducts", "water", "environmentalMonitoring", "sterility", "endotoxin", "bioburden", "growthPromotion"];
const microbiologySourceCoverage = assessSourceCoverage({
  domainPack: MICROBIOLOGY_DOMAIN_PACK,
  evidence: MICROBIOLOGY_EVIDENCE_CATALOG,
  rules: [...workflowRuleTrace(workflowKeys), ...MICROBIOLOGY_SHARED_RULE_TRACE],
});
const evidenceControlLabel: Record<EvidenceControlState, string> = {
  "controlled-context": "Versioned context",
  "version-confirmation-required": "Confirm edition",
  "project-revision": "Bind project revision",
  "concept-benchmark": "Calibration required",
  "site-evidence-required": "Site evidence required",
};

function downloadSourceCoverageRegistry() {
  const registry = createSourceCoverageRegistry(microbiologySourceCoverage);
  const blob = new Blob([JSON.stringify(registry, null, 2)], { type: "application/json" });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = `atlas-microbiology-source-coverage-${MICROBIOLOGY_DOMAIN_PACK.version.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.json`;
  anchor.click();
  URL.revokeObjectURL(href);
}

export default function QualityLabDomainReadinessPage() {
  useSEO({ title: "Domain Pack Readiness Gates | Atlas Quality Lab", description: "See the evidence, expert ownership, validation cases and qualified demand required before Atlas treats a quality domain as a verified Domain Pack." });
  return <div className="min-h-screen bg-[#08111f] px-4 pb-24 pt-8 text-slate-100 md:pt-14">
    <div className="mx-auto max-w-7xl">
      <Link href="/quality-lab/evidence" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> Atlas Evidence Graph</Link>
      <div className="mt-6">
        <QualityLabEditorialHero
          eyebrow={<span className="inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200"><ShieldCheck className="h-4 w-4" /> Evidence-gated expansion</span>}
          title="A domain becomes a Pack only after its evidence exists."
          description="Compare every planned domain against the same release gates: accountable expertise, a versioned source corpus, controlled validation cases, and paying or strongly qualified demand."
          image={{ src: "/images/editorial/test-tube-evidence-review.jpg", alt: "Gloved laboratory worker holding an organized tray of test tubes for evidence review", creditName: "Eka P. Amdela", creditUrl: "https://unsplash.com/photos/JcsYP0IJvnI", className: "object-[center_52%]" }}
          tone="amber"
          boundary={{ label: "No implied launch promise", text: "The sequence below is a strategic order and gating record. It is not a release schedule, regulatory claim, or assertion that later packs already exist.", tone: "red" }}
        />
      </div>

      <section className="mt-8 rounded-3xl border border-sky-300/20 bg-sky-300/[0.045] p-5 md:p-7" aria-labelledby="source-coverage-title">
        <div className="flex flex-col gap-5 border-b border-white/10 pb-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-sky-200"><Database className="h-5 w-5" /><p className="text-[10px] font-bold uppercase tracking-[0.18em]">Microbiology source control</p></div>
            <h2 id="source-coverage-title" className="mt-3 text-2xl font-bold">Catalog coverage is visible. Evidence closure is still open.</h2>
            <p className="mt-2 text-sm leading-7 text-slate-400">Every current rule resolves to a named catalog record, but that does not make the source corpus controlled or the Domain Pack verified. The register below exposes both measures separately.</p>
          </div>
          <button type="button" onClick={downloadSourceCoverageRegistry} className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border border-sky-300/25 bg-sky-300/10 px-4 py-3 text-xs font-bold text-sky-100 hover:bg-sky-300/15"><Download className="h-4 w-4" /> Export source registry</button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-black/15 p-4"><p className="text-2xl font-bold text-teal-200">{microbiologySourceCoverage.metrics.catalogTraceableRuleCount}/{microbiologySourceCoverage.metrics.ruleCount}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Rules linked to catalog</p></div>
          <div className="rounded-2xl border border-white/10 bg-black/15 p-4"><p className="text-2xl font-bold text-amber-200">{microbiologySourceCoverage.metrics.controlledReviewReadyRuleCount}/{microbiologySourceCoverage.metrics.ruleCount}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Rules evidence-closed</p></div>
          <div className="rounded-2xl border border-white/10 bg-black/15 p-4"><p className="text-2xl font-bold text-sky-200">{microbiologySourceCoverage.metrics.controlledEvidenceCount}/{microbiologySourceCoverage.metrics.evidenceRecordCount}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Versioned context records</p></div>
          <div className="rounded-2xl border border-white/10 bg-black/15 p-4"><p className="text-2xl font-bold text-rose-200">{microbiologySourceCoverage.metrics.openEvidenceCount}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Evidence records still open</p></div>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.045] p-4 md:p-5">
            <div className="flex items-center gap-2 text-amber-200"><AlertTriangle className="h-4 w-4" /><h3 className="text-xs font-bold uppercase tracking-wider">Release blockers</h3></div>
            <ul className="mt-3 space-y-2 text-xs leading-6 text-slate-400">{microbiologySourceCoverage.blockers.map((blocker) => <li key={blocker} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300/70" />{blocker}</li>)}</ul>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/15">
            <div className="border-b border-white/10 px-4 py-3"><h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Evidence control register</h3></div>
            <div className="divide-y divide-white/8">{microbiologySourceCoverage.evidence.map((record) => <div key={record.id} className="grid gap-2 px-4 py-3 md:grid-cols-[1fr_auto] md:items-start"><div><p className="text-xs font-semibold text-slate-200">{record.title}</p><p className="mt-1 text-[10px] leading-5 text-slate-500">{record.version} · {record.publisher}</p></div><span className={`w-fit rounded-full border px-2 py-1 text-[8px] font-bold uppercase ${record.openForControlledRelease ? "border-amber-300/20 bg-amber-300/10 text-amber-200" : "border-teal-300/20 bg-teal-300/10 text-teal-200"}`}>{evidenceControlLabel[record.controlState]}</span></div>)}</div>
          </div>
        </div>

        <details className="mt-5 rounded-2xl border border-white/10 bg-black/15">
          <summary className="cursor-pointer px-4 py-4 text-xs font-bold text-slate-200">Inspect all {microbiologySourceCoverage.metrics.ruleCount} rule-to-source records</summary>
          <div className="overflow-x-auto border-t border-white/10">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="bg-white/[0.025] text-[9px] uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Rule</th><th className="px-4 py-3">Version</th><th className="px-4 py-3">Catalog links</th><th className="px-4 py-3">Evidence closure</th></tr></thead>
              <tbody className="divide-y divide-white/8">{microbiologySourceCoverage.rules.map((rule) => <tr key={rule.ruleId}><td className="px-4 py-3"><p className="font-semibold text-slate-200">{rule.name}</p><p className="mt-1 font-mono text-[9px] text-slate-600">{rule.ruleId}</p></td><td className="px-4 py-3 text-slate-400">{rule.ruleVersion}</td><td className="px-4 py-3 text-teal-200">{rule.catalogTraceable ? `${rule.evidenceIds.length} resolved` : `${rule.missingEvidenceIds.length} missing`}</td><td className="px-4 py-3 text-amber-200">{rule.controlledReviewReady ? "Closed" : `${rule.openEvidenceIds.length} open record${rule.openEvidenceIds.length === 1 ? "" : "s"}`}</td></tr>)}</tbody>
            </table>
          </div>
        </details>
        <p className="mt-4 text-[10px] leading-5 text-slate-500">{microbiologySourceCoverage.notice}</p>
      </section>

      <section className="mt-8 grid gap-5">
        {domainPackReadiness.map((domain) => { const assessment=assessDomainPackReadiness(domain); return <article key={domain.id} className="rounded-3xl border border-white/10 bg-slate-950/35 p-5 md:p-7">
          <div className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-start md:justify-between"><div className="flex gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] font-bold text-teal-200">{domain.sequence}</div><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Expansion sequence</p><h2 className="mt-1 text-2xl font-bold">{domain.title}</h2></div></div><span className="w-fit rounded-full border border-sky-300/20 bg-sky-300/[0.07] px-3 py-1 text-[10px] font-bold uppercase text-sky-200">{stageLabel[domain.currentStage]}</span></div>
          <p className="mt-5 text-sm leading-7 text-slate-400"><strong className="text-slate-200">Current boundary:</strong> {domain.scopeBoundary}</p>
          <div className="mt-5 grid gap-3 lg:grid-cols-4">{domain.gates.map((item)=><section key={item.id} className="flex flex-col rounded-2xl border border-white/8 bg-white/[0.025] p-4"><div className="flex items-start justify-between gap-2">{item.status === "gate-satisfied" ? <CheckCircle2 className="h-5 w-5 text-teal-300" /> : <CircleDashed className="h-5 w-5 text-slate-500" />}<span className={`rounded-full border px-2 py-1 text-[8px] font-bold uppercase ${statusStyle[item.status]}`}>{statusLabel[item.status]}</span></div><h3 className="mt-4 text-sm font-bold">{item.label}</h3><p className="mt-2 flex-1 text-xs leading-6 text-slate-500">{item.currentEvidence}</p><div className="mt-4 border-t border-white/8 pt-3"><p className="text-[9px] font-bold uppercase tracking-wider text-amber-300/70">Exit evidence</p><p className="mt-1 text-[11px] leading-5 text-slate-400">{item.exitEvidence}</p>{item.supportingHref && <Link href={item.supportingHref} className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-teal-300">{item.supportingLabel ?? "Read validation framework"} <ArrowRight className="h-3 w-3" /></Link>}</div></section>)}</div>
          <div className="mt-5 flex flex-col gap-3 rounded-xl border border-white/8 bg-black/15 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold text-slate-200">Verified Pack eligibility: {assessment.eligibleForVerifiedPack ? "Eligible for controlled release review" : `${assessment.blockers.length} gate${assessment.blockers.length === 1 ? "" : "s"} remain`}</p><p className="mt-1 text-[11px] text-slate-500">{assessment.notice}</p></div>{domain.publicEvidenceHref ? <Link href={domain.publicEvidenceHref} className="inline-flex items-center gap-2 text-xs font-bold text-teal-300">Inspect current public evidence <ArrowRight className="h-4 w-4" /></Link> : <span className="text-xs font-semibold text-slate-600">No public evidence area opened</span>}</div>
        </article>; })}
      </section>

      <section className="mt-8 rounded-3xl border border-teal-300/20 bg-teal-300/[0.05] p-6 md:p-8"><div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><FlaskConical className="h-6 w-6 text-teal-300" /><h2 className="mt-4 text-2xl font-bold">The current commercial path remains microbiology-first.</h2><p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400">Use the executable concept in real discovery, capture corrections and estimate-to-actual variance, then move only reviewed learning candidates into controlled Domain Pack development.</p></div><Link href="/quality-lab/review" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-teal-300 px-5 py-3 text-sm font-bold text-slate-950">Discuss a real project <ArrowRight className="h-4 w-4" /></Link></div></section>
    </div>
  </div>;
}

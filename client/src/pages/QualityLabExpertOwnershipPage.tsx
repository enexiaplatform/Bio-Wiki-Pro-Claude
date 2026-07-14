import { AlertTriangle, ArrowLeft, CheckCircle2, Download, ShieldCheck, UserRoundCheck, UsersRound } from "lucide-react";
import { Link } from "wouter";
import { QualityLabEditorialHero } from "@/components/QualityLabEditorialHero";
import { useSEO } from "@/hooks/use-seo";
import { assessExpertOwnership, createExpertOwnershipCsv, createMicrobiologyExpertOwnerRoles } from "@shared/quality-lab-expert-ownership";
import { MICROBIOLOGY_DOMAIN_PACK, MICROBIOLOGY_SHARED_RULE_TRACE, workflowRuleTrace, type MicrobiologyWorkflowKey } from "@shared/quality-lab-microbiology-pack";

const workflowKeys: MicrobiologyWorkflowKey[] = ["rawMaterials", "finishedProducts", "water", "environmentalMonitoring", "sterility", "endotoxin", "bioburden", "growthPromotion"];
const ruleTrace = [...workflowRuleTrace(workflowKeys), ...MICROBIOLOGY_SHARED_RULE_TRACE];
const ownershipAssessment = assessExpertOwnership({ domainPack: MICROBIOLOGY_DOMAIN_PACK, ruleTrace, roles: createMicrobiologyExpertOwnerRoles(ruleTrace) });

function downloadOwnershipCharter() {
  const blob = new Blob(["\uFEFF", createExpertOwnershipCsv(ownershipAssessment)], { type: "text/csv;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = "atlas-microbiology-expert-ownership-charter.csv";
  anchor.click();
  URL.revokeObjectURL(href);
}

export default function QualityLabExpertOwnershipPage() {
  useSEO({ title: "Expert Ownership Control | Atlas Quality Lab", description: "Inspect the expert roles, competence evidence and rule-review scope required before the Microbiology Domain Pack can be treated as expert-owned." });
  return <div className="min-h-screen bg-[#08111f] px-4 pb-24 pt-8 text-slate-100 md:pt-14">
    <div className="mx-auto max-w-7xl">
      <Link href="/quality-lab/domain-readiness" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> Domain Pack readiness</Link>
      <div className="mt-6">
        <QualityLabEditorialHero
          eyebrow={<span className="inline-flex items-center gap-2 rounded-full border border-violet-300/25 bg-violet-300/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-200"><UserRoundCheck className="h-4 w-4" /> Expert ownership control</span>}
          title="A reviewer name is not evidence of qualified ownership."
          description="Control the accountable roles, competence basis, accepted scope, conflict declaration, appointment record and change-control responsibility required for the Microbiology Domain Pack."
          image={{ src: "/images/editorial/laboratory-record-review.jpg", alt: "Laboratory scientist documenting controlled review records", creditName: "Nathan Rimoux", creditUrl: "https://unsplash.com/photos/iul3dSPs1G4", className: "object-center saturate-75" }}
          tone="teal"
          boundary={{ label: "No implied appointment", text: "Atlas defines the control record but does not certify competence or appoint reviewers. Every ownership claim requires evidence and approval outside Atlas.", tone: "red" }}
        />
      </div>

      <section className="mt-8 rounded-3xl border border-violet-300/20 bg-violet-300/[0.045] p-5 md:p-7" aria-labelledby="ownership-status-title">
        <div className="flex flex-col gap-5 border-b border-white/10 pb-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl"><div className="flex items-center gap-2 text-violet-200"><UsersRound className="h-5 w-5" /><p className="text-[10px] font-bold uppercase tracking-[0.18em]">Current control status</p></div><h2 id="ownership-status-title" className="mt-3 text-2xl font-bold">Review scopes exist. Qualified owners are not yet established.</h2><p className="mt-2 text-sm leading-7 text-slate-400">The rule registry is fully allocated across four accountable review roles. No role is counted as established until its external appointment and competence controls are evidenced.</p></div>
          <button type="button" onClick={downloadOwnershipCharter} className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border border-violet-300/25 bg-violet-300/10 px-4 py-3 text-xs font-bold text-violet-100 hover:bg-violet-300/15"><Download className="h-4 w-4" /> Download ownership charter</button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric value={`${ownershipAssessment.metrics.ownershipEstablishedCount}/${ownershipAssessment.metrics.requiredRoleCount}`} label="Ownership roles established" tone="text-rose-200" />
          <Metric value={`${ownershipAssessment.metrics.rulesInReviewScopeCount}/${ownershipAssessment.metrics.ruleCount}`} label="Rules assigned to review scope" tone="text-teal-200" />
          <Metric value={ownershipAssessment.metrics.uncoveredRuleCount} label="Rules without a scope" tone="text-sky-200" />
          <Metric value={ownershipAssessment.blockers.length} label="Roles with open controls" tone="text-amber-200" />
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2" aria-label="Required expert ownership roles">
        {ownershipAssessment.roles.map((role) => <article key={role.id} className="flex flex-col rounded-3xl border border-white/10 bg-slate-950/40 p-5 md:p-6">
          <div className="flex items-start justify-between gap-4"><div><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-violet-300/75">Required accountable role</p><h2 className="mt-2 text-xl font-bold">{role.title}</h2></div>{role.ownershipEstablished ? <CheckCircle2 className="h-6 w-6 shrink-0 text-teal-300" /> : <AlertTriangle className="h-6 w-6 shrink-0 text-amber-300" />}</div>
          <p className="mt-4 text-sm leading-7 text-slate-400">{role.accountability}</p>
          <div className="mt-5"><p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Required competence</p><ul className="mt-2 space-y-1.5 text-xs leading-5 text-slate-300">{role.requiredCompetence.map((item) => <li key={item} className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-violet-300" />{item}</li>)}</ul></div>
          <div className="mt-5 rounded-2xl border border-white/8 bg-black/15 p-4"><div className="flex items-center justify-between gap-3"><p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Rule-review scope</p><span className="text-xs font-bold text-teal-200">{role.ruleIds.length} rules</span></div><p className="mt-2 break-words font-mono text-[9px] leading-5 text-slate-600">{role.ruleIds.join(" · ")}</p></div>
          <div className="mt-4 flex-1 rounded-2xl border border-amber-300/15 bg-amber-300/[0.045] p-4"><p className="text-[9px] font-bold uppercase tracking-wider text-amber-200">Missing appointment controls</p><div className="mt-3 flex flex-wrap gap-2">{role.missingControls.map((control) => <span key={control} className="rounded-full border border-amber-300/15 bg-amber-300/[0.07] px-2 py-1 text-[9px] text-amber-100/80">{control}</span>)}</div></div>
        </article>)}
      </section>

      <section className="mt-6 rounded-3xl border border-teal-300/20 bg-teal-300/[0.05] p-6 md:p-8"><div className="flex gap-4"><ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-teal-300" /><div><h2 className="text-xl font-bold">How this gate closes</h2><p className="mt-2 max-w-4xl text-sm leading-7 text-slate-400">Complete the charter using controlled records held by the appointing organization. Each role needs a named reviewer, competence basis and evidence references, conflict declaration, accepted rule scope, external appointment record, effective date, and explicit change-control responsibility. Atlas must then reconcile the completed record against the current rule version.</p><p className="mt-3 text-[10px] leading-5 text-slate-500">{ownershipAssessment.notice}</p></div></div></section>
    </div>
  </div>;
}

function Metric({ value, label, tone }: { value: string | number; label: string; tone: string }) {
  return <div className="rounded-2xl border border-white/10 bg-black/15 p-4"><p className={`text-2xl font-bold ${tone}`}>{value}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p></div>;
}

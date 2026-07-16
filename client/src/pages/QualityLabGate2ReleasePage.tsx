import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Download, LockKeyhole, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { QualityLabEditorialHero } from "@/components/QualityLabEditorialHero";
import { useUser } from "@/context/UserContext";
import { useSEO } from "@/hooks/use-seo";
import { listEngagements } from "@/lib/quality-lab-engagements";
import { loadExpertOwnershipRegister } from "@/lib/quality-lab-expert-ownership";
import { fetchAccountGovernanceRecord } from "@/lib/quality-lab-governance";
import { loadSourceClosureRegister } from "@/lib/quality-lab-source-closures";
import { fetchQualityLabReviewedProjects, getQualityLabProject } from "@/lib/quality-lab-projects";
import { assessQualityLabDeliveryReadiness } from "@shared/quality-lab-delivery";
import { applyExpertOwnershipRegister, assessExpertOwnership, createMicrobiologyExpertOwnerRoles, type ExpertOwnershipRegister } from "@shared/quality-lab-expert-ownership";
import { assessGate2Release, createGate2ReleaseDossier } from "@shared/quality-lab-gate-2-release";
import { MICROBIOLOGY_DOMAIN_PACK, MICROBIOLOGY_EVIDENCE_CATALOG, MICROBIOLOGY_SHARED_RULE_TRACE, workflowRuleTrace, type MicrobiologyWorkflowKey } from "@shared/quality-lab-microbiology-pack";
import { assessPaidPilotPortfolio, type PilotPortfolioInput } from "@shared/quality-lab-pilot-portfolio";
import { applySourceClosureRegister, assessSourceCoverage, type SourceClosureRegister } from "@shared/quality-lab-source-coverage";
import { assessValidationCaseRegistry } from "@shared/quality-lab-validation-cases";
import { qualityLabProjectFromReviewedSnapshot } from "@shared/quality-lab-persistence";

const workflowKeys: MicrobiologyWorkflowKey[] = ["rawMaterials", "finishedProducts", "water", "environmentalMonitoring", "sterility", "endotoxin", "bioburden", "growthPromotion"];
const rules = [...workflowRuleTrace(workflowKeys), ...MICROBIOLOGY_SHARED_RULE_TRACE];
const baseExpertRoles = createMicrobiologyExpertOwnerRoles(rules);

function downloadReleaseDossier(assessment: ReturnType<typeof assessGate2Release>, evidenceBasis: { sourceCoverage: ReturnType<typeof assessSourceCoverage>; expertOwnership: ReturnType<typeof assessExpertOwnership> }) {
  const blob = new Blob([JSON.stringify(createGate2ReleaseDossier(assessment, evidenceBasis), null, 2)], { type: "application/json" });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = "atlas-microbiology-gate-2-release-dossier.json";
  anchor.click();
  URL.revokeObjectURL(href);
}

export default function QualityLabGate2ReleasePage() {
  const { isAuthenticated } = useUser();
  const [serverSnapshots, setServerSnapshots] = useState<Awaited<ReturnType<typeof fetchQualityLabReviewedProjects>>>([]);
  const [loadNotice, setLoadNotice] = useState("");
  const [accountSourceRegister, setAccountSourceRegister] = useState<SourceClosureRegister | null>(null);
  const [accountOwnershipRegister, setAccountOwnershipRegister] = useState<ExpertOwnershipRegister | null>(null);
  const localSourceRegister = useMemo(loadSourceClosureRegister, []);
  const localOwnershipRegister = useMemo(loadExpertOwnershipRegister, []);
  const newestRegister = <T extends { updatedAt: string },>(local: T | null, account: T | null) => !account || (local && local.updatedAt >= account.updatedAt) ? { register: local, basis: local ? "browser" as const : "baseline" as const } : { register: account, basis: "account" as const };
  const sourceSelection = newestRegister(localSourceRegister, accountSourceRegister);
  const ownershipSelection = newestRegister(localOwnershipRegister, accountOwnershipRegister);
  const sourceClosureBasis = sourceSelection.register ? applySourceClosureRegister({ domainPack: MICROBIOLOGY_DOMAIN_PACK, register: sourceSelection.register }) : { closures: [], applied: false as const, reason: null };
  const ownershipRoleBasis = ownershipSelection.register ? applyExpertOwnershipRegister({ domainPack: MICROBIOLOGY_DOMAIN_PACK, roles: baseExpertRoles, register: ownershipSelection.register }) : { roles: baseExpertRoles, applied: false as const, reason: null };
  const sourceCoverage = useMemo(() => assessSourceCoverage({ domainPack: MICROBIOLOGY_DOMAIN_PACK, evidence: MICROBIOLOGY_EVIDENCE_CATALOG, rules, closures: sourceClosureBasis.closures }), [sourceClosureBasis.closures]);
  const expertOwnership = useMemo(() => assessExpertOwnership({ domainPack: MICROBIOLOGY_DOMAIN_PACK, ruleTrace: rules, roles: ownershipRoleBasis.roles }), [ownershipRoleBasis.roles]);

  useEffect(() => {
    if (!isAuthenticated) return;
    Promise.all([
      fetchQualityLabReviewedProjects().then(setServerSnapshots),
      fetchAccountGovernanceRecord("source-closures").then((record) => setAccountSourceRegister(record?.registerVersion === "source-closure-register/v1" ? record : null)),
      fetchAccountGovernanceRecord("expert-ownership").then((record) => setAccountOwnershipRegister(record?.registerVersion === "expert-ownership-register/v1" ? record : null)),
    ]).catch(() => setLoadNotice("Some account-connected evidence could not be loaded. Available browser-local records remain in use."));
  }, [isAuthenticated]);

  const portfolioInputs = useMemo<PilotPortfolioInput[]>(() => {
    const byProject = new Map<string, PilotPortfolioInput>();
    serverSnapshots.forEach((snapshot) => {
      if (!snapshot.engagement) return;
      const project = qualityLabProjectFromReviewedSnapshot(snapshot);
      byProject.set(snapshot.localProjectId, { packet: snapshot.engagement, deliveryReadiness: assessQualityLabDeliveryReadiness(project, snapshot.engagement) });
    });
    listEngagements().forEach((packet) => {
      const project = getQualityLabProject(packet.project.id);
      byProject.set(packet.project.id, { packet, deliveryReadiness: project ? assessQualityLabDeliveryReadiness(project, packet) : { status: "working-draft", blockers: ["Recover the corresponding Blueprint project to compute controlled delivery readiness."] } });
    });
    return Array.from(byProject.values());
  }, [serverSnapshots]);

  const validationRegistry = useMemo(() => assessValidationCaseRegistry(portfolioInputs.map((item) => item.packet)), [portfolioInputs]);
  const paidPilotPortfolio = useMemo(() => assessPaidPilotPortfolio(portfolioInputs), [portfolioInputs]);
  const assessment = useMemo(() => assessGate2Release({ sourceCoverage, expertOwnership, validationRegistry, paidPilotPortfolio }), [sourceCoverage, expertOwnership, validationRegistry, paidPilotPortfolio]);
  const progress = Math.round((assessment.evidenceCompleteCount / assessment.totalControlCount) * 100);
  useSEO({ title: "Gate 2 Release Control | Atlas Quality Lab", description: "Consolidated evidence decision for Microbiology Domain Pack source closure, expert ownership, validation cases and qualified demand.", noIndex: true });

  return <div className="min-h-screen bg-[#08111f] px-4 pb-24 pt-8 text-slate-100 md:pt-14">
    <div className="mx-auto max-w-7xl">
      <Link href="/quality-lab/domain-readiness" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> Domain Pack readiness</Link>
      <div className="mt-6">
        <QualityLabEditorialHero
          eyebrow={<span className="inline-flex items-center gap-2 rounded-full border border-rose-300/25 bg-rose-300/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-rose-200"><LockKeyhole className="h-4 w-4" /> Consolidated Gate 2 control</span>}
          title="A Domain Pack cannot release on one strong signal."
          description="Atlas combines source closure, accountable expert ownership, accepted validation cases and paid qualified demand into one version-matched release-review decision. Every control must close against the same Domain Pack version."
          image={{ src: "/images/editorial/test-tube-evidence-review.jpg", alt: "Controlled laboratory evidence arranged for consolidated release review", creditName: "Eka P. Amdela", creditUrl: "https://unsplash.com/photos/JcsYP0IJvnI", className: "object-[center_52%]" }}
          tone="amber"
          boundary={{ label: "Release review, not release", text: "Even four evidence-complete controls only permit a qualified release review. They do not verify the Pack or authorize external use without documented approval.", tone: "red" }}
        />
      </div>

      <section className="mt-8 rounded-3xl border border-rose-300/20 bg-rose-300/[0.04] p-5 md:p-7" aria-labelledby="gate-2-status-heading">
        {loadNotice && <p role="alert" className="mb-4 rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-xs text-amber-100">{loadNotice}</p>}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-200">Current release-review status</p><h2 id="gate-2-status-heading" className="mt-3 text-3xl font-bold">{assessment.evidenceCompleteCount}/{assessment.totalControlCount} evidence controls complete</h2><p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400">Active basis: {assessment.domainPackId}@{assessment.domainPackVersion}. Current status remains <strong className="text-rose-200">{assessment.status.replaceAll("-", " ")}</strong>.</p><p className="mt-2 text-[10px] uppercase tracking-wider text-slate-500">Source basis: {sourceSelection.basis} · Ownership basis: {ownershipSelection.basis} · newest exact-version record wins</p></div><button type="button" onClick={() => downloadReleaseDossier(assessment, { sourceCoverage, expertOwnership })} className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border border-rose-300/25 bg-rose-300/10 px-4 py-3 text-xs font-bold text-rose-100 hover:bg-rose-300/15"><Download className="h-4 w-4" /> Export release dossier</button></div>
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label="Gate 2 evidence control progress" aria-valuemin={0} aria-valuemax={4} aria-valuenow={assessment.evidenceCompleteCount}><div className="h-full rounded-full bg-teal-300" style={{ width: `${progress}%` }} /></div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2" aria-label="Gate 2 release controls">
        {assessment.controls.map((control) => <article key={control.id} className={`rounded-3xl border p-5 md:p-6 ${control.status === "evidence-complete" ? "border-teal-300/20 bg-teal-300/[0.04]" : "border-amber-300/15 bg-white/[0.025]"}`}>
          <div className="flex items-start justify-between gap-4"><div><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">Required evidence control</p><h2 className="mt-2 text-xl font-bold">{control.label}</h2></div>{control.status === "evidence-complete" ? <CheckCircle2 className="h-6 w-6 shrink-0 text-teal-300" /> : <AlertTriangle className="h-6 w-6 shrink-0 text-amber-300" />}</div>
          <p className="mt-4 text-sm leading-7 text-slate-400">{control.evidence}</p>
          {control.blockers.length > 0 && <div className="mt-4 rounded-xl border border-amber-300/15 bg-amber-300/[0.04] p-4"><p className="text-[9px] font-bold uppercase tracking-wider text-amber-200">Blocking evidence</p><ul className="mt-2 list-disc space-y-1.5 pl-4 text-xs leading-5 text-slate-400">{control.blockers.slice(0, 4).map((blocker) => <li key={blocker}>{blocker}</li>)}</ul>{control.blockers.length > 4 && <p className="mt-2 text-[10px] text-slate-600">+ {control.blockers.length - 4} additional blocker(s) in the exported dossier</p>}</div>}
          <Link href={control.href} className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-teal-300">Open control register <ArrowRight className="h-4 w-4" /></Link>
        </article>)}
      </section>

      <section className="mt-6 rounded-3xl border border-amber-300/15 bg-amber-300/[0.04] p-5 md:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" /><div><h2 className="font-bold">Decision boundary</h2><p className="mt-2 text-xs leading-6 text-slate-400">{assessment.notice}</p>{assessment.versionMismatches.length > 0 && <p className="mt-2 text-xs text-rose-200">{assessment.versionMismatches.length} current-version mismatch(es) must be reconciled.</p>}</div></div><div className="flex flex-col items-start gap-2"><Link href="/quality-lab/governance-history" className="inline-flex shrink-0 items-center gap-2 text-xs font-bold text-violet-200">Inspect revision history <ArrowRight className="h-4 w-4" /></Link><Link href="/quality-lab/rule-changes" className="inline-flex shrink-0 items-center gap-2 text-xs font-bold text-teal-200">Open rule-change control <ArrowRight className="h-4 w-4" /></Link></div></div></section>
    </div>
  </div>;
}

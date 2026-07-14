import { useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, CheckCircle2, Download, RotateCcw, Save, ShieldCheck, UserRoundCheck, UsersRound } from "lucide-react";
import { Link } from "wouter";
import { QualityLabEditorialHero } from "@/components/QualityLabEditorialHero";
import { useUser } from "@/context/UserContext";
import { useSEO } from "@/hooks/use-seo";
import { clearExpertOwnerRoles, loadExpertOwnerRoles, saveExpertOwnerRoles } from "@/lib/quality-lab-expert-ownership";
import { fetchAccountGovernanceRecord, fetchAccountGovernanceRevisions, saveAccountGovernanceRecord } from "@/lib/quality-lab-governance";
import { applyExpertOwnershipRegister, assessExpertOwnership, createExpertOwnershipCsv, createExpertOwnershipRegister, createMicrobiologyExpertOwnerRoles, type ExpertOwnerAppointment, type ExpertOwnerRole, type ExpertOwnershipAssessment } from "@shared/quality-lab-expert-ownership";
import { MICROBIOLOGY_DOMAIN_PACK, MICROBIOLOGY_SHARED_RULE_TRACE, workflowRuleTrace, type MicrobiologyWorkflowKey } from "@shared/quality-lab-microbiology-pack";

const workflowKeys: MicrobiologyWorkflowKey[] = ["rawMaterials", "finishedProducts", "water", "environmentalMonitoring", "sterility", "endotoxin", "bioburden", "growthPromotion"];
const ruleTrace = [...workflowRuleTrace(workflowKeys), ...MICROBIOLOGY_SHARED_RULE_TRACE];
const baseRoles = createMicrobiologyExpertOwnerRoles(ruleTrace);

function downloadOwnershipCharter(assessment: ExpertOwnershipAssessment) {
  const blob = new Blob(["\uFEFF", createExpertOwnershipCsv(assessment)], { type: "text/csv;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = "atlas-microbiology-expert-ownership-charter.csv";
  anchor.click();
  URL.revokeObjectURL(href);
}

export default function QualityLabExpertOwnershipPage() {
  const { isAuthenticated } = useUser();
  const initial = useMemo(() => loadExpertOwnerRoles(MICROBIOLOGY_DOMAIN_PACK, baseRoles), []);
  const [roles, setRoles] = useState<ExpertOwnerRole[]>(initial.roles);
  const [saveNotice, setSaveNotice] = useState(initial.reason ?? "");
  const [accountRevisionCount, setAccountRevisionCount] = useState<number | null>(null);
  const ownershipAssessment = useMemo(() => assessExpertOwnership({ domainPack: MICROBIOLOGY_DOMAIN_PACK, ruleTrace, roles }), [roles]);
  const updateAppointment = (roleId: string, patch: Partial<ExpertOwnerAppointment>) => setRoles((current) => current.map((role) => role.id === roleId ? { ...role, appointment: { ...role.appointment, ...patch } } : role));
  const saveRegister = () => {
    const register = saveExpertOwnerRoles(MICROBIOLOGY_DOMAIN_PACK, roles);
    setSaveNotice(`Saved in this browser at ${new Date(register.updatedAt).toLocaleString()}. Gate 2 will use this exact-version record.`);
  };
  const resetRegister = () => {
    clearExpertOwnerRoles();
    setRoles(createMicrobiologyExpertOwnerRoles(ruleTrace));
    setSaveNotice("Browser-local ownership evidence was cleared. No external record was changed.");
  };
  const saveToAccount = async () => {
    if (!isAuthenticated) return setSaveNotice("Sign in to save this working register to your account. Browser-local evidence remains available on this device.");
    try {
      const result = await saveAccountGovernanceRecord("expert-ownership", createExpertOwnershipRegister({ domainPack: MICROBIOLOGY_DOMAIN_PACK, roles }));
      setSaveNotice(`Saved to your account at ${new Date(result.updatedAt).toLocaleString()}. This is a working record, not an external appointment or approval.`);
      setAccountRevisionCount((await fetchAccountGovernanceRevisions("expert-ownership")).length);
    } catch { setSaveNotice("Account save could not be completed. Your browser-local working record was not changed."); }
  };
  const loadFromAccount = async () => {
    if (!isAuthenticated) return setSaveNotice("Sign in to load an account-held working register.");
    try {
      const register = await fetchAccountGovernanceRecord("expert-ownership");
      if (!register || register.registerVersion !== "expert-ownership-register/v1") return setSaveNotice("No compatible ownership working record is stored in this account yet.");
      const applied = applyExpertOwnershipRegister({ domainPack: MICROBIOLOGY_DOMAIN_PACK, roles: createMicrobiologyExpertOwnerRoles(ruleTrace), register });
      if (!applied.applied) return setSaveNotice(applied.reason ?? "The account record could not be applied to this Domain Pack version.");
      setRoles(applied.roles);
      setAccountRevisionCount((await fetchAccountGovernanceRevisions("expert-ownership")).length);
      setSaveNotice("Loaded the exact-version ownership working record from your account. It has replaced this page's browser workspace only.");
    } catch { setSaveNotice("Account record could not be loaded. Your browser workspace was not changed."); }
  };
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
          <div className="max-w-3xl"><div className="flex items-center gap-2 text-violet-200"><UsersRound className="h-5 w-5" /><p className="text-[10px] font-bold uppercase tracking-[0.18em]">Current control status</p></div><h2 id="ownership-status-title" className="mt-3 text-2xl font-bold">{ownershipAssessment.ownershipGateSatisfied ? "All accountable roles have complete working evidence." : ownershipAssessment.metrics.ownershipEstablishedCount > 0 ? "Qualified ownership evidence is in progress." : "Review scopes exist. Qualified owners are not yet established."}</h2><p className="mt-2 text-sm leading-7 text-slate-400">The rule registry is fully allocated across four accountable review roles. A role counts only when every external appointment and competence control below is evidenced against this Domain Pack version.</p></div>
          <button type="button" onClick={() => downloadOwnershipCharter(ownershipAssessment)} className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border border-violet-300/25 bg-violet-300/10 px-4 py-3 text-xs font-bold text-violet-100 hover:bg-violet-300/15"><Download className="h-4 w-4" /> Download ownership charter</button>
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
          <div className={`mt-4 flex-1 rounded-2xl border p-4 ${role.ownershipEstablished ? "border-teal-300/15 bg-teal-300/[0.045]" : "border-amber-300/15 bg-amber-300/[0.045]"}`}><p className={`text-[9px] font-bold uppercase tracking-wider ${role.ownershipEstablished ? "text-teal-200" : "text-amber-200"}`}>{role.ownershipEstablished ? "Working evidence complete" : "Missing appointment controls"}</p><div className="mt-3 flex flex-wrap gap-2">{role.ownershipEstablished ? <span className="text-xs text-teal-100/80">Ready for Gate 2 ownership assessment.</span> : role.missingControls.map((control) => <span key={control} className="rounded-full border border-amber-300/15 bg-amber-300/[0.07] px-2 py-1 text-[9px] text-amber-100/80">{control}</span>)}</div></div>
          <AppointmentEditor role={role} onChange={(patch) => updateAppointment(role.id, patch)} />
        </article>)}
      </section>

      <section className="mt-6 rounded-3xl border border-violet-300/20 bg-violet-300/[0.04] p-5 md:p-6" aria-label="Ownership register controls">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><h2 className="font-bold">Browser-local working register</h2><p className="mt-1 max-w-3xl text-xs leading-6 text-slate-400">Save only controlled references you are authorized to record. This browser copy is not an appointment, competence certification, signature, or system of record.</p>{accountRevisionCount !== null && <p className="mt-1 text-[10px] text-slate-500">Account working-record revisions: {accountRevisionCount}</p>}{saveNotice && <p role="status" className="mt-2 text-xs text-violet-200">{saveNotice}</p>}</div><div className="flex flex-wrap gap-2"><button type="button" onClick={resetRegister} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-xs font-bold text-slate-300 hover:bg-white/[0.04]"><RotateCcw className="h-4 w-4" /> Clear browser record</button><button type="button" onClick={saveRegister} className="inline-flex items-center gap-2 rounded-xl bg-violet-300 px-4 py-3 text-xs font-bold text-slate-950 hover:bg-violet-200"><Save className="h-4 w-4" /> Save browser record</button><button type="button" onClick={loadFromAccount} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-xs font-bold text-slate-300 hover:bg-white/[0.04]">Load account record</button><button type="button" onClick={saveToAccount} className="inline-flex items-center gap-2 rounded-xl border border-violet-300/30 px-4 py-3 text-xs font-bold text-violet-100 hover:bg-violet-300/10"><Save className="h-4 w-4" /> Save to account</button></div></div>
      </section>

      <section className="mt-6 rounded-3xl border border-teal-300/20 bg-teal-300/[0.05] p-6 md:p-8"><div className="flex gap-4"><ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-teal-300" /><div><h2 className="text-xl font-bold">How this gate closes</h2><p className="mt-2 max-w-4xl text-sm leading-7 text-slate-400">Complete the charter using controlled records held by the appointing organization. Each role needs a named reviewer, competence basis and evidence references, conflict declaration, accepted rule scope, external appointment record, effective date, and explicit change-control responsibility. Atlas must then reconcile the completed record against the current rule version.</p><p className="mt-3 text-[10px] leading-5 text-slate-500">{ownershipAssessment.notice}</p></div></div></section>
    </div>
  </div>;
}

function Metric({ value, label, tone }: { value: string | number; label: string; tone: string }) {
  return <div className="rounded-2xl border border-white/10 bg-black/15 p-4"><p className={`text-2xl font-bold ${tone}`}>{value}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p></div>;
}

function AppointmentEditor({ role, onChange }: { role: ExpertOwnerRole; onChange: (patch: Partial<ExpertOwnerAppointment>) => void }) {
  const appointment = role.appointment;
  return <details className="mt-4 rounded-2xl border border-violet-300/15 bg-violet-300/[0.03]">
    <summary className="cursor-pointer px-4 py-3 text-xs font-bold text-violet-100">Record controlled appointment evidence</summary>
    <div className="grid gap-4 border-t border-white/10 p-4 md:grid-cols-2">
      <ControlField label="Reviewer name" value={appointment.reviewerName ?? ""} onChange={(value) => onChange({ reviewerName: value || null })} />
      <ControlField label="Organization (optional)" value={appointment.organization ?? ""} onChange={(value) => onChange({ organization: value || null })} />
      <ControlArea label="Competence basis" value={appointment.competenceBasis ?? ""} onChange={(value) => onChange({ competenceBasis: value || null })} />
      <ControlArea label="Competence evidence references (one per line)" value={appointment.competenceEvidenceRefs.join("\n")} onChange={(value) => onChange({ competenceEvidenceRefs: value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean) })} />
      <ControlArea label="Conflict declaration" value={appointment.conflictDeclaration ?? ""} onChange={(value) => onChange({ conflictDeclaration: value || null })} />
      <ControlArea label="Change-control responsibility" value={appointment.changeControlResponsibility ?? ""} onChange={(value) => onChange({ changeControlResponsibility: value || null })} />
      <label className="grid gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">External appointment status<select aria-label={`${role.title} external appointment status`} value={appointment.appointmentStatus} onChange={(event) => onChange({ appointmentStatus: event.target.value as ExpertOwnerAppointment["appointmentStatus"] })} className="rounded-xl border border-white/10 bg-[#0b1626] px-3 py-2.5 text-xs font-normal normal-case tracking-normal text-slate-200"><option value="not-appointed">Not appointed</option><option value="appointed-outside-atlas">Appointed outside Atlas</option></select></label>
      <ControlField label="Appointment evidence reference" value={appointment.appointmentEvidenceRef ?? ""} onChange={(value) => onChange({ appointmentEvidenceRef: value || null })} />
      <DateField label="Appointment effective date" value={appointment.appointedAt} onChange={(value) => onChange({ appointedAt: value })} />
      <DateField label="Appointment expiry date (optional)" value={appointment.appointmentExpiresAt} onChange={(value) => onChange({ appointmentExpiresAt: value })} />
      <label className="flex items-start gap-3 rounded-xl border border-white/10 p-3 text-xs text-slate-300 md:col-span-2"><input type="checkbox" aria-label={`${role.title} review scope accepted`} checked={appointment.scopeAccepted} onChange={(event) => onChange({ scopeAccepted: event.target.checked })} className="mt-0.5 h-4 w-4 accent-violet-300" /><span><strong className="block text-slate-100">Review scope accepted</strong><span className="mt-1 block text-[10px] leading-5 text-slate-500">This records a claimed acceptance reference only; Atlas does not create the external appointment or approval.</span></span></label>
    </div>
  </details>;
}

function ControlField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="grid gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}<input value={value} onChange={(event) => onChange(event.target.value)} className="rounded-xl border border-white/10 bg-[#0b1626] px-3 py-2.5 text-xs font-normal normal-case tracking-normal text-slate-200" /></label>;
}

function ControlArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="grid gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}<textarea value={value} onChange={(event) => onChange(event.target.value)} rows={3} className="resize-y rounded-xl border border-white/10 bg-[#0b1626] px-3 py-2.5 text-xs font-normal normal-case leading-5 tracking-normal text-slate-200" /></label>;
}

function DateField({ label, value, onChange }: { label: string; value: string | null; onChange: (value: string | null) => void }) {
  return <label className="grid gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}<input type="date" value={value?.slice(0, 10) ?? ""} onChange={(event) => onChange(event.target.value ? `${event.target.value}T00:00:00.000Z` : null)} className="rounded-xl border border-white/10 bg-[#0b1626] px-3 py-2.5 text-xs font-normal normal-case tracking-normal text-slate-200" /></label>;
}

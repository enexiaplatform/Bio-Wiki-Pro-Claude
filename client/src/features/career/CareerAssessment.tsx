import { useMemo, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Check, LockKeyhole, Sparkles } from "lucide-react";
import {
  careerProfileSchema,
  defaultCareerProfile,
  type CareerProfile,
  type CompetencyKey,
} from "@shared/career-blueprint";

const inputClass =
  "mt-2 w-full rounded-lg border border-white/10 bg-slate-950/45 px-3.5 py-3 text-sm text-foreground outline-none transition focus:border-teal-400/60 focus:ring-2 focus:ring-teal-400/15";
const labelClass = "text-xs font-semibold uppercase tracking-[0.12em] text-slate-400";

const methodOptions = [
  "Microbial enumeration",
  "Specified microorganisms",
  "Environmental monitoring",
  "Water microbiology",
  "Sterility testing",
  "Endotoxin testing",
  "Growth-promotion testing",
  "Method suitability / validation",
  "Analytical chemistry testing",
  "Process validation",
  "Batch-record review",
  "Regulatory submissions",
];

const qualityOptions = [
  "Deviation support",
  "OOS / OOT investigation",
  "CAPA",
  "Change control",
  "Internal audit",
  "Inspection support",
  "Risk assessment",
  "Supplier quality",
  "Annual product review",
];

const evidenceOptions = [
  "SOP / work-instruction authorship",
  "Protocol / report authorship",
  "Led a bounded improvement",
  "Mentored or trained colleagues",
  "Presented to cross-functional leaders",
  "Owned a quality decision",
  "Built a metric or trend review",
  "Coordinated a project",
];

const ratingRows: Array<{ key: Exclude<CompetencyKey, "english">; label: string; low: string; high: string }> = [
  { key: "technicalExecution", label: "Technical execution", low: "Need close guidance", high: "Can explain and own decisions" },
  { key: "gmpEvidence", label: "GMP evidence", low: "Mostly training exposure", high: "Strong reviewed evidence" },
  { key: "investigationOwnership", label: "Investigation ownership", low: "Supply facts only", high: "Own end-to-end decisions" },
  { key: "documentation", label: "Documentation", low: "Follow templates", high: "Author reviewed documents" },
  { key: "leadership", label: "Leadership", low: "Individual contributor", high: "Lead people or outcomes" },
];

interface Props {
  initialProfile?: CareerProfile;
  onCancel: () => void;
  onComplete: (profile: CareerProfile) => void;
  onStepComplete?: (step: number, track: string) => void;
}

export function CareerAssessment({ initialProfile, onCancel, onComplete, onStepComplete }: Props) {
  const [profile, setProfile] = useState<CareerProfile>(initialProfile ?? defaultCareerProfile);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const steps = ["Current context", "Goal & constraints", "Experience evidence", "Readiness"];

  const canContinue = useMemo(() => {
    if (step === 0) return profile.fullName.trim().length >= 2 && profile.currentRole.trim().length >= 2 && profile.location.trim().length >= 2;
    if (step === 1) return profile.education.trim().length >= 2 && profile.targetOutcome.trim().length >= 8;
    if (step === 2) return profile.methods.length + profile.qualityActivities.length > 0;
    return true;
  }, [profile, step]);

  function update<K extends keyof CareerProfile>(key: K, value: CareerProfile[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
    setError("");
  }

  function toggle(key: "methods" | "qualityActivities" | "evidenceActivities", value: string) {
    const values = profile[key];
    update(key, (values.includes(value) ? values.filter((item) => item !== value) : [...values, value]) as CareerProfile[typeof key]);
  }

  function next() {
    if (!canContinue) {
      setError("Complete the highlighted context before continuing.");
      return;
    }
    onStepComplete?.(step + 1, profile.careerTrack);
    if (step < steps.length - 1) {
      setStep((current) => current + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const parsed = careerProfileSchema.safeParse(profile);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Review the assessment before continuing.");
      return;
    }
    onComplete(parsed.data);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-4 md:pt-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <button type="button" onClick={onCancel} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to Career
        </button>
        <span className="inline-flex items-center gap-2 text-xs text-slate-500"><LockKeyhole className="h-3.5 w-3.5" /> Browser-local by default</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_310px]">
        <main>
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-400/25 bg-teal-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-teal-200">
              <Sparkles className="h-3.5 w-3.5" /> Free personal assessment
            </span>
            <h1 className="mt-5 max-w-3xl font-display text-3xl font-bold leading-tight md:text-5xl">Tell Atlas what your job title cannot.</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">Your role, evidence, constraints, and ambition shape the recommendation. Specific answers produce a more useful Career Snapshot.</p>
          </div>

          <ol className="mb-8 grid grid-cols-4 gap-2" aria-label="Assessment progress">
            {steps.map((label, index) => (
              <li key={label} aria-current={index === step ? "step" : undefined}>
                <div className={`h-1.5 rounded-full ${index <= step ? "bg-teal-400" : "bg-white/10"}`} />
                <span className={`mt-2 hidden text-[11px] font-medium sm:block ${index === step ? "text-teal-200" : "text-slate-500"}`}>{label}</span>
              </li>
            ))}
          </ol>

          <section className="rounded-xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/15 md:p-7">
            {step === 0 && (
              <Step title="Your current professional context" body="Start with facts a hiring manager or mentor would need before giving advice.">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Your name"><input aria-label="Your name" value={profile.fullName} onChange={(event) => update("fullName", event.target.value)} className={inputClass} placeholder="e.g. Alex Morgan" /></Field>
                  <Field label="Current role"><input aria-label="Current role" value={profile.currentRole} onChange={(event) => update("currentRole", event.target.value)} className={inputClass} /></Field>
                  <Field label="Career area">
                    <select aria-label="Career area" value={profile.careerTrack} onChange={(event) => update("careerTrack", event.target.value as CareerProfile["careerTrack"])} className={inputClass}>
                      <option value="qc-microbiology">QC / Microbiology</option><option value="quality-assurance">Quality Assurance</option><option value="regulatory-affairs">Regulatory Affairs</option><option value="manufacturing-quality">Manufacturing / Quality Operations</option><option value="other">Other / Career transition</option>
                    </select>
                  </Field>
                  <Field label="Years of relevant experience"><input aria-label="Years of relevant experience" type="number" min="0" max="45" step="0.5" value={profile.yearsExperience} onChange={(event) => update("yearsExperience", Number(event.target.value))} className={inputClass} /></Field>
                  <Field label="Sector"><input aria-label="Sector" value={profile.sector} onChange={(event) => update("sector", event.target.value)} className={inputClass} /></Field>
                  <Field label="Location"><input aria-label="Location" value={profile.location} onChange={(event) => update("location", event.target.value)} className={inputClass} placeholder="City, country" /></Field>
                </div>
              </Step>
            )}

            {step === 1 && (
              <Step title="What are you optimizing for?" body="Atlas uses constraints to avoid recommending an attractive path that is unrealistic for your life.">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Education / professional foundation" wide><input aria-label="Education" value={profile.education} onChange={(event) => update("education", event.target.value)} className={inputClass} /></Field>
                  <Field label="Exact target role (optional)" wide><input aria-label="Exact target role" value={profile.targetRole} onChange={(event) => update("targetRole", event.target.value)} className={inputClass} placeholder="e.g. Senior QC Microbiologist at a multinational manufacturer" /></Field>
                  <Field label="Target outcome" wide><textarea aria-label="Target outcome" value={profile.targetOutcome} onChange={(event) => update("targetOutcome", event.target.value)} className={inputClass} rows={3} /></Field>
                  <Field label="Preferred kind of work"><select aria-label="Preferred kind of work" value={profile.workPreference} onChange={(event) => update("workPreference", event.target.value as CareerProfile["workPreference"])} className={inputClass}><option value="technical-specialist">Deep technical specialist</option><option value="quality-systems">Quality systems and investigations</option><option value="people-leadership">People leadership</option><option value="cross-functional">Cross-functional projects</option></select></Field>
                  <Field label="Transition strategy"><select aria-label="Transition strategy" value={profile.transitionMode} onChange={(event) => update("transitionMode", event.target.value as CareerProfile["transitionMode"])} className={inputClass}><option value="open-to-both">Open to internal or external</option><option value="internal">Prefer internal progression</option><option value="external">Prefer external opportunities</option></select></Field>
                  <Field label="Main constraint"><select aria-label="Main constraint" value={profile.primaryConstraint} onChange={(event) => update("primaryConstraint", event.target.value as CareerProfile["primaryConstraint"])} className={inputClass}><option value="limited-ownership">Limited ownership opportunities</option><option value="time">Limited development time</option><option value="english">Technical English</option><option value="experience">Role-relevant experience</option><option value="manager-support">Manager or sponsor support</option><option value="location">Location or mobility</option><option value="unclear-direction">Unclear direction</option></select></Field>
                  <Field label="Manager / sponsor support"><select aria-label="Manager or sponsor support" value={profile.managerSupport} onChange={(event) => update("managerSupport", event.target.value as CareerProfile["managerSupport"])} className={inputClass}><option value="yes">Yes</option><option value="uncertain">Uncertain</option><option value="no">No</option></select></Field>
                  <Field label="Planning horizon"><select aria-label="Planning horizon" value={profile.targetHorizonMonths} onChange={(event) => update("targetHorizonMonths", Number(event.target.value) as CareerProfile["targetHorizonMonths"])} className={inputClass}><option value={6}>6 months</option><option value={12}>12 months</option><option value={18}>18 months</option><option value={24}>24 months</option></select></Field>
                  <Field label="Weekly development time"><select aria-label="Weekly development time" value={profile.weeklyHours} onChange={(event) => update("weeklyHours", Number(event.target.value) as CareerProfile["weeklyHours"])} className={inputClass}><option value={2}>2 hours / week</option><option value={4}>4 hours / week</option><option value={6}>6 hours / week</option><option value={8}>8 hours / week</option><option value={10}>10 hours / week</option></select></Field>
                  <Field label="Mobility"><select aria-label="Mobility" value={profile.mobility} onChange={(event) => update("mobility", event.target.value as CareerProfile["mobility"])} className={inputClass}><option value="stay-local">Prefer to stay local</option><option value="domestic">Open to domestic relocation</option><option value="regional">Open across the region</option><option value="global">Open globally</option></select></Field>
                  <Field label="English level"><select aria-label="English level" value={profile.englishLevel} onChange={(event) => update("englishLevel", event.target.value as CareerProfile["englishLevel"])} className={inputClass}><option value="basic">Basic</option><option value="intermediate">Intermediate</option><option value="upper-intermediate">Upper intermediate</option><option value="advanced">Advanced</option></select></Field>
                </div>
              </Step>
            )}

            {step === 2 && (
              <Step title="What evidence can you already show?" body="Select work you have genuinely performed or supported. Atlas will not treat selection as independently verified proof.">
                <ChoiceGroup title="Methods, processes, or technical work" options={methodOptions} selected={profile.methods} onToggle={(value) => toggle("methods", value)} />
                <ChoiceGroup title="Quality-system exposure" options={qualityOptions} selected={profile.qualityActivities} onToggle={(value) => toggle("qualityActivities", value)} />
                <ChoiceGroup title="Evidence of ownership" options={evidenceOptions} selected={profile.evidenceActivities} onToggle={(value) => toggle("evidenceActivities", value)} />
                <Field label="One achievement you are proud of (optional)" wide><textarea aria-label="Proud achievement" value={profile.proudAchievement} onChange={(event) => update("proudAchievement", event.target.value)} className={inputClass} rows={3} placeholder="Describe what changed, your contribution, how it was reviewed, and the result. Do not include confidential data." /></Field>
              </Step>
            )}

            {step === 3 && (
              <Step title="Rate readiness, not confidence" body="Choose the level you could defend with reviewed examples today. The score is a planning aid, not a validated competency record.">
                <div className="space-y-6">
                  {ratingRows.map((row) => (
                    <div key={row.key} className="border-b border-white/10 pb-5 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between gap-4"><label htmlFor={`rating-${row.key}`} className="text-sm font-semibold">{row.label}</label><span className="rounded-full bg-teal-400/10 px-3 py-1 text-sm font-bold text-teal-200">{profile.ratings[row.key]} / 5</span></div>
                      <input id={`rating-${row.key}`} type="range" min="1" max="5" step="1" value={profile.ratings[row.key]} onChange={(event) => setProfile((current) => ({ ...current, ratings: { ...current.ratings, [row.key]: Number(event.target.value) } }))} className="mt-4 w-full accent-teal-400" />
                      <div className="mt-2 flex justify-between gap-4 text-[11px] text-slate-500"><span>{row.low}</span><span className="text-right">{row.high}</span></div>
                    </div>
                  ))}
                </div>
              </Step>
            )}

            {error && <p role="alert" className="mt-5 rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p>}
            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <button type="button" onClick={() => (step === 0 ? onCancel() : setStep((current) => current - 1))} className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 px-5 py-3 text-sm font-semibold transition hover:border-white/30"><ArrowLeft className="h-4 w-4" /> Back</button>
              <button type="button" onClick={next} disabled={!canContinue} className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-400 px-5 py-3 text-sm font-bold text-teal-950 transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:opacity-45">
                {step === steps.length - 1 ? "Create my free Career Snapshot" : "Continue"}<ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </section>
        </main>

        <aside className="lg:pt-28">
          <div className="sticky top-24 rounded-xl border border-teal-400/20 bg-teal-400/[0.045] p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-400/10 text-teal-200"><BriefcaseBusiness className="h-5 w-5" /></div>
            <h2 className="mt-4 text-lg font-bold">What you get free</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-400">
              {["Three plausible career routes", "A visual competency comparison", "Your top three evidence gaps", "One actionable 90-day starting move"].map((item) => <li key={item} className="flex gap-2"><Check className="mt-1 h-4 w-4 shrink-0 text-teal-300" />{item}</li>)}
            </ul>
            <div className="mt-5 border-t border-white/10 pt-5">
              <p className="text-xs font-bold uppercase tracking-[0.13em] text-amber-300">Optional $20 upgrade</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">A named, 38-page Career Operating Blueprint with role deconstruction, requirement diagnostics, proof-portfolio design, and a week-by-week execution system.</p>
            </div>
            <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-slate-500"><LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0" />Your profile stays in this browser unless you explicitly generate the purchased PDF.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Step({ title, body, children }: { title: string; body: string; children: ReactNode }) {
  return <><h2 className="text-2xl font-bold md:text-3xl">{title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{body}</p><div className="mt-7">{children}</div></>;
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: ReactNode }) {
  return <label className={`${labelClass} ${wide ? "md:col-span-2" : ""}`}>{label}{children}</label>;
}

function ChoiceGroup({ title, options, selected, onToggle }: { title: string; options: string[]; selected: string[]; onToggle: (value: string) => void }) {
  return <div className="mb-7 last:mb-0"><h3 className="text-sm font-bold">{title}</h3><div className="mt-3 flex flex-wrap gap-2">{options.map((option) => { const active = selected.includes(option); return <button key={option} type="button" aria-pressed={active} onClick={() => onToggle(option)} className={`inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs font-medium transition ${active ? "border-teal-400/55 bg-teal-400/10 text-teal-100" : "border-white/10 bg-slate-950/30 text-slate-400 hover:border-white/25 hover:text-white"}`}>{active && <Check className="h-3.5 w-3.5" />}{option}</button>; })}</div></div>;
}

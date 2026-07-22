import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Download,
  FileCheck2,
  Flag,
  FlaskConical,
  Loader2,
  LockKeyhole,
  MapPin,
  Pencil,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
} from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { analytics } from "@/hooks/use-analytics";
import { copyText } from "@/lib/clipboard";
import {
  buildCareerAnalysis,
  buildCareerProofExperiment,
  buildCareerSnapshotSummary,
  formatCareerProofExperiment,
  type CareerProfile,
} from "@shared/career-blueprint";

interface Props {
  profile: CareerProfile;
  entitled: boolean;
  checkingAccess: boolean;
  checkoutLoading: boolean;
  downloadLoading: boolean;
  error?: string;
  onBack: () => void;
  onEdit: () => void;
  onCheckout: () => void;
  onDownload: () => void;
  onRouteChange: (routeId: string) => void;
}

const routeTone = {
  "Best fit": "border-amber-300/70 bg-amber-300/[0.035] text-amber-200",
  Adjacent: "border-white/10 bg-white/[0.025] text-teal-200",
  Stretch: "border-white/10 bg-white/[0.025] text-violet-300",
} as const;

const milestoneIcons = [FlaskConical, ClipboardCheck, Sparkles, Flag];

export function CareerResults({ profile, entitled, checkingAccess, checkoutLoading, downloadLoading, error, onBack, onEdit, onCheckout, onDownload, onRouteChange }: Props) {
  const baseAnalysis = useMemo(() => buildCareerAnalysis(profile, profile.selectedRouteId), [profile]);
  const [selectedRouteId, setSelectedRouteId] = useState(baseAnalysis.selectedRoute.id);
  const [showDetails, setShowDetails] = useState(false);
  const [snapshotCopied, setSnapshotCopied] = useState(false);
  const [proofExperimentCopied, setProofExperimentCopied] = useState(false);
  const analysis = useMemo(() => buildCareerAnalysis(profile, selectedRouteId), [profile, selectedRouteId]);
  const proofExperiment = useMemo(() => buildCareerProofExperiment(profile, selectedRouteId), [profile, selectedRouteId]);
  const firstName = profile.fullName.trim().split(/\s+/)[0] || "Your";
  const radarData = analysis.competencies.map((item) => ({
    subject: item.label === "Investigation ownership" ? "Investigation" : item.label,
    current: item.current,
    target: item.target,
    fullMark: 100,
  }));

  function selectRoute(id: string, label: string) {
    setSelectedRouteId(id);
    setProofExperimentCopied(false);
    onRouteChange(id);
    analytics.careerRouteCompared(id, label);
  }

  async function copySnapshot() {
    await copyText(buildCareerSnapshotSummary(profile, selectedRouteId));
    setSnapshotCopied(true);
    analytics.careerSnapshotCopied(analysis.selectedRoute.id, analysis.readinessIndex);
    window.setTimeout(() => setSnapshotCopied(false), 1800);
  }

  async function copyProofExperiment() {
    await copyText(formatCareerProofExperiment(profile, selectedRouteId));
    setProofExperimentCopied(true);
    analytics.careerProofExperimentCopied(analysis.selectedRoute.id, analysis.biggestGap);
    window.setTimeout(() => setProofExperimentCopied(false), 1800);
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-28 pt-4 md:px-6 md:pt-7">
      <button type="button" onClick={onBack} className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-teal-300 transition hover:text-teal-200 xl:mb-2">
        <ArrowLeft className="h-3.5 w-3.5" /> Career command center
      </button>

      <section className="grid gap-7 xl:grid-cols-[minmax(0,1.05fr)_minmax(600px,0.95fr)] xl:items-start xl:gap-5">
        <div>
          <h1 className="max-w-4xl font-display text-3xl font-bold leading-[1.04] md:text-5xl xl:text-[42px]">
            {firstName}, your strongest next move is <span className="mt-2 block text-teal-400 xl:mt-1">{analysis.selectedRoute.title}</span>
          </h1>
          <button type="button" onClick={() => document.getElementById("career-assumptions")?.scrollIntoView({ behavior: "smooth" })} className="mt-5 inline-flex items-center gap-2 rounded-full border border-amber-300/35 bg-amber-300/10 px-3 py-1.5 text-xs font-bold text-amber-200 xl:mt-3">
            <Sparkles className="h-3.5 w-3.5" /> {analysis.decisionConfidence} · {analysis.readinessIndex}% readiness · {analysis.assumptions.length} assumptions to confirm
          </button>

          <div className="mt-6 grid gap-x-5 gap-y-4 border-t border-white/10 pt-5 text-sm text-slate-300 sm:grid-cols-2 lg:grid-cols-4 xl:mt-4 xl:grid-cols-2 xl:gap-y-3 xl:pt-4 2xl:grid-cols-4">
            <ProfileFact icon={BriefcaseBusiness} label={profile.currentRole} sublabel={`${profile.yearsExperience} years experience`} />
            <ProfileFact icon={ShieldCheck} label={profile.sector} sublabel={profile.location} />
            <ProfileFact icon={Timer} label={`${profile.weeklyHours} hrs / week`} sublabel={profile.mobility === "stay-local" ? "Prefers not to relocate" : "Open to mobility"} />
            <ProfileFact icon={Target} label="Goal" sublabel={profile.targetOutcome} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {analysis.routes.map((route) => {
            const selected = route.id === selectedRouteId;
            return (
              <button key={route.id} type="button" aria-pressed={selected} onClick={() => selectRoute(route.id, route.label)} className={`min-h-44 rounded-xl border p-4 text-left transition hover:-translate-y-0.5 hover:border-teal-300/40 xl:min-h-0 xl:p-3 ${selected ? routeTone[route.label] : "border-white/10 bg-white/[0.025] text-slate-300"}`}>
                <div className="flex items-center justify-between gap-3">
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${selected ? "border-amber-300" : "border-white/20"}`}>{selected && <span className="h-2 w-2 rounded-full bg-amber-300" />}</span>
                  <span className="text-[11px] font-semibold">{route.label}</span>
                </div>
                <h2 className="mt-4 text-base font-bold leading-tight xl:mt-3">{route.title}</h2>
                <p className="mt-2 text-xs leading-5 text-slate-400 xl:leading-4">{route.summary}</p>
                <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500"><span className="text-teal-300">{route.fitScore}% directional fit</span> · {route.readinessLabel}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-teal-300 xl:mt-3">View route details <ArrowRight className="h-3.5 w-3.5" /></span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-6 grid gap-4 xl:mt-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(600px,0.95fr)]">
        <div className="rounded-xl border border-white/10 bg-white/[0.025] p-5 md:p-6 xl:p-4">
          <h2 className="text-lg font-bold">How you compare for {analysis.selectedRoute.title}</h2>
          <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(320px,0.9fr)_minmax(280px,1.1fr)] lg:items-center xl:mt-2">
            <div className="h-[340px] w-full xl:h-[250px]" aria-label="Career competency radar chart">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="56%">
                  <PolarGrid stroke="rgba(148,163,184,0.24)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#a9b7c9", fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#0b172a", border: "1px solid rgba(255,255,255,.14)", borderRadius: "10px", color: "#f8fafc" }} />
                  <Radar name={`${firstName} today`} dataKey="current" stroke="#2dd4bf" fill="#14b8a6" fillOpacity={0.28} strokeWidth={2.5} />
                  <Radar name="Target role" dataKey="target" stroke="#e7b84b" fill="transparent" strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-5 xl:space-y-3">
              <Insight icon={CheckCircle2} tone="teal" title="Your strongest assets" body={`${analysis.strongestAssets.join(", ")} already form a credible base for this route.`} />
              <Insight icon={AlertTriangle} tone="amber" title="Your biggest gap" body={`${analysis.biggestGap} has the largest planning gap. Build one reviewed, end-to-end example before positioning for the role.`} />
              <Insight icon={Target} tone="teal" title="Why this route wins" body={analysis.selectedRoute.fitReason} />
            </div>
          </div>
          <div className="mt-4 border-t border-white/10 pt-4 xl:mt-2 xl:pt-3">
            <button type="button" onClick={() => setShowDetails((current) => !current)} className="inline-flex items-center gap-2 text-xs font-semibold text-teal-300 hover:text-teal-200">{showDetails ? "Hide competency details" : "See all competency details"}<ArrowRight className={`h-3.5 w-3.5 transition ${showDetails ? "rotate-90" : ""}`} /></button>
            {showDetails && <div className="mt-4 grid gap-2 sm:grid-cols-2">{analysis.competencies.map((item) => <div key={item.key} className="flex items-center justify-between gap-4 rounded-lg bg-slate-950/35 px-3 py-2 text-xs"><span className="text-slate-300">{item.label}</span><span className="font-semibold text-teal-200">{item.current} / {item.target}</span></div>)}</div>}
          </div>
        </div>

        <aside className="overflow-hidden rounded-xl border border-amber-300/35 bg-[#071426] p-5 shadow-2xl shadow-black/20 md:p-6 xl:p-4">
          <span className="inline-flex rounded-full border border-amber-300/25 bg-amber-300/[0.06] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200">Your personal Blueprint</span>
          <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(220px,0.95fr)_minmax(200px,1.05fr)] sm:items-center xl:mt-2">
            <div>
              <h2 className="text-2xl font-bold leading-tight xl:text-xl">{profile.fullName} — Personal Career Blueprint</h2>
              <img src="/images/career/personal-career-blueprint-preview.webp" alt="Personal Career Blueprint report cover and inside evidence-comparison page" width="1421" height="1107" loading="lazy" decoding="async" className="mt-3 aspect-[9/7] w-full rounded-lg object-cover xl:mt-2" />
            </div>
            <div>
              <p className="text-sm font-bold">38-page Blueprint + lifetime execution workspace</p>
              <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-300 xl:mt-2 xl:space-y-1">
                {["Route fit and risk comparison", `${profile.targetHorizonMonths}-month action plan`, "13 weeks of personalized actions", "Evidence and reviewer feedback log", "Personalized CV and story prompts", "Continue-adjust-pivot decision gate"].map((item) => <li key={item} className="flex gap-2"><span className="text-amber-300">•</span>{item}</li>)}
              </ul>
            </div>
          </div>

          {error && <p role="alert" className="mt-4 rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs text-red-200">{error}</p>}
          {entitled ? <div className="mt-5 space-y-2 xl:mt-3"><Link href="/career/blueprint" className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-400 px-5 py-3.5 text-sm font-bold text-teal-950 transition hover:bg-teal-300 xl:py-3"><FileCheck2 className="h-4 w-4" /> Open my 13-week workspace</Link><button type="button" onClick={onDownload} disabled={downloadLoading} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 px-5 py-3 text-sm font-bold text-slate-100 transition hover:border-white/40 disabled:cursor-wait disabled:opacity-55">{downloadLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}{downloadLoading ? "Generating your PDF…" : "Download my 38-page Blueprint"}</button></div> : <button type="button" onClick={onCheckout} disabled={checkingAccess || checkoutLoading} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-400 px-5 py-3.5 text-sm font-bold text-teal-950 transition hover:bg-teal-300 disabled:cursor-wait disabled:opacity-55 xl:mt-3 xl:py-3">{checkingAccess || checkoutLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}{checkingAccess ? "Checking access…" : checkoutLoading ? "Opening secure checkout…" : "Unlock my personalized Blueprint — $20 one-time"}</button>}
          <p className="mt-2 text-center text-[11px] text-slate-400">{entitled ? "Lifetime workspace access · regenerate the PDF whenever your profile changes." : "Secure checkout · instant PDF · lifetime execution workspace"}</p>
          <button type="button" onClick={onEdit} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:border-white/40 xl:mt-2 xl:py-2"><Pencil className="h-3.5 w-3.5" /> Edit my answers</button>
          <p className="mt-3 flex items-center justify-center gap-2 text-[10px] text-slate-500 xl:mt-2"><ShieldCheck className="h-3.5 w-3.5" /> Planning support, not a hiring or salary guarantee.</p>
        </aside>
      </section>

      <section className="mt-6" id="career-recommendations">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><h2 className="text-xl font-bold">Your {profile.targetHorizonMonths}-month path to {analysis.selectedRoute.title}</h2><p className="mt-1 text-sm text-slate-400">A focused plan to close the main gap and build evidence you can defend.</p></div>
          <Link href={analysis.recommendations[0].href} className="inline-flex items-center gap-2 text-xs font-semibold text-teal-300">See free recommendations <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
        <ol className="relative mt-7 grid gap-4 md:grid-cols-4 before:absolute before:left-8 before:right-8 before:top-4 before:hidden before:h-px before:bg-teal-400/60 md:before:block">
          {analysis.milestones.map((milestone, index) => {
            const Icon = milestoneIcons[index];
            const recommendation = analysis.recommendations[index] ?? analysis.recommendations[analysis.recommendations.length - 1];
            return <li key={milestone.title} className="relative rounded-xl border border-white/10 bg-white/[0.02] p-4 md:border-0 md:bg-transparent md:p-0">
              <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-teal-300 bg-slate-950 text-xs font-bold text-teal-200">{index + 1}</div>
              <div className="mt-3 flex items-center gap-2 text-slate-300"><Icon className="h-4 w-4" /><span className="text-[11px] uppercase tracking-wide text-slate-500">{milestone.months}</span></div>
              <h3 className="mt-2 text-sm font-bold">{milestone.title}</h3>
              <p className="mt-1 text-xs leading-5 text-slate-400">{milestone.outcome}</p>
              {index === 0 ? <Link href={recommendation.href} className="mt-4 block rounded-lg border border-amber-300/30 bg-amber-300/[0.04] p-3 text-xs leading-5 text-slate-300"><span className="font-bold text-amber-200">Free recommendation</span><br />{recommendation.title}</Link> : <div className="mt-4 flex min-h-16 items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs text-slate-500"><LockKeyhole className="h-4 w-4 shrink-0" /> Detailed monthly actions included in your Blueprint</div>}
            </li>;
          })}
        </ol>
      </section>

      <section aria-labelledby="career-proof-experiment-title" className="mt-8 overflow-hidden rounded-xl border border-amber-300/25 bg-[#071426]">
        <div className="flex flex-col gap-5 border-b border-white/10 p-5 md:flex-row md:items-start md:justify-between md:p-6">
          <div className="max-w-4xl">
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-300"><CalendarDays className="h-3.5 w-3.5" /> Your 30-day proof experiment</p>
            <h2 id="career-proof-experiment-title" className="mt-2 text-xl font-bold">Test the route through one bounded piece of evidence.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">{proofExperiment.objective}</p>
          </div>
          <button type="button" onClick={copyProofExperiment} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-amber-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-200">
            {proofExperimentCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{proofExperimentCopied ? "Copied proof experiment" : "Copy 30-day proof experiment"}
          </button>
        </div>
        <div className="grid gap-px bg-white/10 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="bg-[#0a1d32] p-5 md:p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-teal-300">Hypothesis to test</p>
            <p className="mt-3 text-sm leading-7 text-slate-300">{proofExperiment.hypothesis}</p>
            <div className="mt-5 rounded-lg border border-white/10 bg-slate-950/30 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">First action</p>
              <p className="mt-2 text-xs leading-6 text-slate-300">{proofExperiment.action}</p>
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500"><strong className="text-slate-300">Practice context:</strong> {proofExperiment.practiceContext}</p>
          </div>
          <div className="grid gap-px bg-white/10 sm:grid-cols-2">
            {[
              ["Artifact to retain", proofExperiment.artifact],
              ["Reviewer question", proofExperiment.reviewerQuestion],
              ["Success signal", proofExperiment.successSignal],
              ["Stop or change signal", proofExperiment.changeSignal],
            ].map(([label, body]) => (
              <div key={label} className="bg-[#0a1d32] p-5">
                <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500"><ClipboardCheck className="h-3.5 w-3.5 text-teal-300" />{label}</p>
                <p className="mt-2 text-xs leading-6 text-slate-300">{body}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-white/10 p-5 md:p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-teal-300">Four-week cadence</p>
          <ol className="mt-4 grid gap-3 md:grid-cols-4">
            {proofExperiment.weeklyCadence.map((item, index) => <li key={item} className="rounded-lg border border-white/10 bg-white/[0.025] p-3 text-xs leading-5 text-slate-400"><span className="mb-2 block font-bold text-teal-300">0{index + 1}</span>{item}</li>)}
          </ol>
        </div>
        <p className="border-t border-white/10 px-5 py-3 text-[10px] leading-5 text-slate-500 md:px-6">{proofExperiment.boundary}</p>
      </section>

      <section className="mt-8 rounded-xl border border-teal-300/20 bg-teal-300/[0.045] p-5 md:flex md:items-center md:justify-between md:gap-8 md:p-6">
        <div className="max-w-3xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-300">Free working artifact</p>
          <h2 className="mt-2 text-lg font-bold">Take this Snapshot into a real career conversation.</h2>
          <p className="mt-2 text-xs leading-6 text-slate-400">Copy a structured brief with your selected route, readiness, strongest evidence, priority gap, first proof-building action, confidence basis and assumptions. Review it with someone who understands the target role.</p>
        </div>
        <button type="button" onClick={copySnapshot} className="mt-5 inline-flex min-w-52 items-center justify-center gap-2 rounded-lg bg-teal-400 px-5 py-3 text-sm font-bold text-teal-950 transition hover:bg-teal-300 md:mt-0">
          {snapshotCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{snapshotCopied ? "Copied career snapshot" : "Copy career snapshot"}
        </button>
      </section>

      <section id="career-assumptions" className="mt-8 border-t border-white/10 pt-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div><h2 className="text-sm font-bold">Why Atlas has {analysis.decisionConfidence.toLowerCase()}</h2><ul className="mt-3 space-y-2 text-xs leading-5 text-slate-400">{analysis.confidenceReasons.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-300" />{item}</li>)}</ul></div>
          <div><h2 className="text-sm font-bold">Assumptions to confirm</h2><ul className="mt-3 space-y-2 text-xs leading-5 text-slate-400">{analysis.assumptions.map((item) => <li key={item} className="flex gap-2"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" />{item}</li>)}</ul></div>
        </div>
        <button type="button" onClick={onEdit} className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-xs font-semibold hover:border-white/30"><Pencil className="h-3.5 w-3.5" /> Change my answers</button>
      </section>
    </div>
  );
}

function ProfileFact({ icon: Icon, label, sublabel }: { icon: typeof MapPin; label: string; sublabel: string }) {
  return <div className="flex min-w-0 gap-3"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /><div className="min-w-0"><p className="truncate text-xs font-medium">{label}</p><p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-slate-500">{sublabel}</p></div></div>;
}

function Insight({ icon: Icon, tone, title, body }: { icon: typeof Check; tone: "teal" | "amber"; title: string; body: string }) {
  return <div className="flex gap-3"><Icon className={`mt-0.5 h-5 w-5 shrink-0 ${tone === "teal" ? "text-teal-300" : "text-amber-300"}`} /><div><h3 className={`text-sm font-bold ${tone === "teal" ? "text-teal-300" : "text-amber-300"}`}>{title}</h3><p className="mt-1 text-xs leading-5 text-slate-400">{body}</p></div></div>;
}

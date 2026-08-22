import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CircleHelp,
  FileCheck2,
  FileText,
  FlaskConical,
  FolderOpen,
  LockKeyhole,
  Route,
  Scale,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { AtlasMark } from "@/components/Navigation";
import { CareerAssessment } from "@/features/career/CareerAssessment";
import { CareerResults } from "@/features/career/CareerResults";
import { useUser } from "@/context/UserContext";
import { analytics } from "@/hooks/use-analytics";
import { useSEO } from "@/hooks/use-seo";
import { cacheCareerProfile, fetchServerCareerProfile, syncCareerProfileToServer } from "@/lib/career-profile";
import {
  buildCareerAnalysis,
  CAREER_PROFILE_STORAGE_KEY,
  careerProfileSchema,
  defaultCareerProfile,
  type CareerProfile,
} from "@shared/career-blueprint";

type Phase = "intro" | "assessment" | "results";

export default function Career() {
  useSEO({
    title: "Personal Career Navigator — Life Science Atlas",
    description: "Build a free evidence-based Career Snapshot and unlock a detailed, personalized Career Operating Blueprint.",
  });
  const { user, isAuthenticated } = useUser();
  const [location, navigate] = useLocation();
  const [phase, setPhase] = useState<Phase>("intro");
  const [profile, setProfile] = useState<CareerProfile | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [entitled, setEntitled] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CAREER_PROFILE_STORAGE_KEY);
      if (raw) {
        const parsed = careerProfileSchema.safeParse(JSON.parse(raw));
        if (parsed.success) {
          setProfile(parsed.data);
        }
      }
    } catch {
      localStorage.removeItem(CAREER_PROFILE_STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  // New-device restore: an entitled buyer without a browser-local profile
  // recovers the account copy stored after their assessment (403 for
  // non-buyers resolves to null inside the helper).
  useEffect(() => {
    if (!hydrated || !isAuthenticated || profile) return;
    let active = true;
    void fetchServerCareerProfile().then((serverProfile) => {
      if (!active || !serverProfile) return;
      setProfile(cacheCareerProfile(serverProfile));
    });
    return () => {
      active = false;
    };
  }, [hydrated, isAuthenticated, profile]);

  useEffect(() => {
    if (phase !== "results" || !profile) return;
    const analysis = buildCareerAnalysis(profile);
    analytics.careerSnapshotViewed(profile.careerTrack, analysis.selectedRoute.id);
  }, [phase, profile]);

  useEffect(() => {
    if (!isAuthenticated || phase !== "results") {
      setCheckingAccess(false);
      setEntitled(false);
      return;
    }

    let active = true;
    let attempts = 0;
    const purchaseReturn = new URLSearchParams(window.location.search).get("purchase") === "success";
    setCheckingAccess(true);

    async function check() {
      attempts += 1;
      try {
        const response = await fetch("/api/career-blueprint/access", { credentials: "include" });
        const data = response.ok ? await response.json() : { entitled: false };
        if (!active) return;
        setEntitled(Boolean(data.entitled));
        if (data.entitled || !purchaseReturn || attempts >= 6) setCheckingAccess(false);
        if (!data.entitled && purchaseReturn && attempts < 6) window.setTimeout(check, 1500);
      } catch {
        if (active) setCheckingAccess(false);
      }
    }

    void check();
    return () => {
      active = false;
    };
  }, [isAuthenticated, phase]);

  const assessmentInitial = useMemo(() => {
    const domain = typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("domain");
    if (profile) return domain && ["biopharma", "pharma-api", "drug-product"].includes(domain) ? { ...profile, domainTrackId: domain as CareerProfile["domainTrackId"] } : profile;
    const accountName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
    const nextProfile = accountName ? { ...defaultCareerProfile, fullName: accountName } : defaultCareerProfile;
    return domain && ["biopharma", "pharma-api", "drug-product"].includes(domain) ? { ...nextProfile, domainTrackId: domain as CareerProfile["domainTrackId"] } : nextProfile;
  }, [location, profile, user?.firstName, user?.lastName]);

  function startAssessment() {
    analytics.careerAssessmentStarted();
    setError("");
    setPhase("assessment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function completeAssessment(nextProfile: CareerProfile) {
    localStorage.setItem(CAREER_PROFILE_STORAGE_KEY, JSON.stringify(nextProfile));
    setProfile(nextProfile);
    if (isAuthenticated) void syncCareerProfileToServer(nextProfile);
    setPhase("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function changeSelectedRoute(routeId: string) {
    setProfile((current) => {
      if (!current) return current;
      const nextProfile = { ...current, selectedRouteId: routeId };
      localStorage.setItem(CAREER_PROFILE_STORAGE_KEY, JSON.stringify(nextProfile));
      if (isAuthenticated) void syncCareerProfileToServer(nextProfile);
      return nextProfile;
    });
  }

  async function checkout() {
    if (!profile) return;
    if (!isAuthenticated) {
      navigate("/register?returnTo=/career");
      return;
    }
    setCheckoutLoading(true);
    setError("");
    analytics.checkoutStarted("career_blueprint", 20);
    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productType: "career_blueprint" }),
      });
      const data = await response.json();
      if (!response.ok || !data.url) throw new Error(data.message ?? "Unable to start secure checkout.");
      window.location.href = data.url;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to start secure checkout.");
      setCheckoutLoading(false);
    }
  }

  async function downloadBlueprint() {
    if (!profile) return;
    setDownloadLoading(true);
    setError("");
    try {
      const response = await fetch("/api/career-blueprint/download", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message ?? "Unable to generate your Blueprint.");
      }
      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") ?? "";
      const filename = disposition.match(/filename="([^"]+)"/)?.[1] ?? "personal-career-blueprint.pdf";
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      analytics.careerBlueprintDownloaded(buildCareerAnalysis(profile, profile.selectedRouteId).selectedRoute.id);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to generate your Blueprint.");
    } finally {
      setDownloadLoading(false);
    }
  }

  if (!hydrated) return <CareerShell><div className="min-h-[70vh]" /></CareerShell>;

  if (phase === "assessment") {
    return <CareerShell><CareerAssessment initialProfile={assessmentInitial} onCancel={() => setPhase(profile ? "results" : "intro")} onComplete={completeAssessment} onStepComplete={(step, track) => analytics.careerAssessmentStepCompleted(step, track)} /></CareerShell>;
  }

  if (phase === "results" && profile) {
    return <CareerShell>
      <CareerResults
        profile={profile}
        entitled={entitled}
        checkingAccess={checkingAccess}
        checkoutLoading={checkoutLoading}
        downloadLoading={downloadLoading}
        error={error}
        onBack={() => setPhase("intro")}
        onEdit={() => setPhase("assessment")}
        onCheckout={checkout}
        onDownload={downloadBlueprint}
        onRouteChange={changeSelectedRoute}
      />
    </CareerShell>;
  }

  return <CareerShell><CareerIntro profile={profile} hasSavedProfile={Boolean(profile)} onStart={startAssessment} onResume={() => setPhase("results")} /></CareerShell>;
}

function CareerShell({ children }: { children: React.ReactNode }) {
  const navigation = [
    { label: "Snapshot", href: "/career", icon: Target, active: true },
    { label: "Studio", href: "/career#proof-studio", icon: Route },
    { label: "Evidence", href: "/career/domains", icon: BookOpenCheck },
    { label: "Blueprint", href: "/career/blueprint", icon: FileText },
    { label: "Artifacts", href: "/career/blueprint", icon: FolderOpen },
  ];

  return (
    <div className="min-h-screen bg-[#031426] text-slate-100 lg:grid lg:grid-cols-[168px_minmax(0,1fr)]">
      <aside className="relative z-40 border-b border-slate-700/70 bg-[#04182a] lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex h-16 items-center gap-4 px-4 lg:h-full lg:flex-col lg:items-stretch lg:px-3 lg:py-5">
          <Link href="/" aria-label="Life Science Atlas home" className="flex items-center gap-2.5 font-display text-sm font-bold text-white lg:px-1">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-teal-300/25 bg-[#071f35] p-1.5"><AtlasMark className="h-full w-full" /></span>
            <span className="hidden leading-tight sm:inline lg:block">Life Science<br /><span className="text-teal-300">Atlas</span></span>
          </Link>
          <p className="hidden px-2 pt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300 lg:block">Career</p>
          <nav aria-label="Career Blueprint navigation" className="ml-auto flex items-center gap-1 lg:ml-0 lg:mt-3 lg:flex-col lg:items-stretch">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.label} href={item.href} aria-label={item.label} className={`flex min-h-10 items-center gap-3 rounded-lg px-3 text-xs font-semibold transition ${item.active ? "bg-teal-300/[0.12] text-teal-200" : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-100"}`}>
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" /><span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto hidden space-y-1 lg:block">
            <Link href="/faq" className="flex min-h-10 items-center gap-3 rounded-lg px-3 text-xs text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"><CircleHelp className="h-4 w-4" />Help</Link>
            <Link href="/settings" className="flex min-h-10 items-center gap-3 rounded-lg px-3 text-xs text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"><Settings className="h-4 w-4" />Settings</Link>
          </div>
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

const proofPhases = [
  { id: "frame", eyebrow: "Phase 1", label: "Frame", weeks: "Weeks 1–2", title: "Scope the proof", body: "Define the route, success criteria, evidence boundary and reviewer.", state: "Planned", tone: "text-sky-300", icon: Target },
  { id: "build", eyebrow: "Phase 2", label: "Build", weeks: "Weeks 3–7", title: "Generate evidence", body: "Create one sanitized artifact and capture what changed in practice.", state: "In progress", tone: "text-teal-300", icon: FlaskConical },
  { id: "review", eyebrow: "Phase 3", label: "Review", weeks: "Weeks 8–10", title: "Evaluate the proof", body: "Ask a qualified reviewer to challenge the claim, gap and outcome.", state: "Under review", tone: "text-amber-300", icon: FileCheck2 },
  { id: "decide", eyebrow: "Phase 4", label: "Decide", weeks: "Weeks 11–13", title: "Choose the next move", body: "Continue, adjust or pivot from real evidence and market signals.", state: "Decision open", tone: "text-violet-300", icon: Scale },
] as const;

function CareerIntro({ profile, hasSavedProfile, onStart, onResume }: { profile: CareerProfile | null; hasSavedProfile: boolean; onStart: () => void; onResume: () => void }) {
  const planningProfile = profile ?? defaultCareerProfile;
  const baseAnalysis = useMemo(() => buildCareerAnalysis(planningProfile, planningProfile.selectedRouteId), [planningProfile]);
  const [selectedRouteId, setSelectedRouteId] = useState(baseAnalysis.selectedRoute.id);
  const [activePhase, setActivePhase] = useState<(typeof proofPhases)[number]["id"]>("frame");
  const [decision, setDecision] = useState<"Continue" | "Adjust" | "Pivot" | null>(null);
  const analysis = useMemo(() => buildCareerAnalysis(planningProfile, selectedRouteId), [planningProfile, selectedRouteId]);
  const activePhaseData = proofPhases.find((phase) => phase.id === activePhase) ?? proofPhases[0];
  const radarData = analysis.competencies.slice(0, 5).map((item) => ({
    subject: item.label === "Investigation ownership" ? "Investigation" : item.label.replace("Technical execution", "Technical"),
    current: item.current,
    target: item.target,
  }));

  function cycleRoute() {
    const index = analysis.routes.findIndex((route) => route.id === analysis.selectedRoute.id);
    const next = analysis.routes[(index + 1) % analysis.routes.length];
    setSelectedRouteId(next.id);
    setDecision(null);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] overflow-hidden bg-[#031426] bg-[url('/images/blueprint/decision-observatory-grid.jpg')] bg-[length:1600px_auto] bg-top text-slate-100 lg:min-h-screen">
      <section className="grid border-b border-slate-700/70 lg:min-h-[338px] lg:grid-cols-[0.88fr_1.12fr]">
        <div className="flex flex-col justify-center px-5 py-10 sm:px-8 lg:px-10 lg:py-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300">Personal Career Blueprint</p>
          <h1 className="mt-4 max-w-[560px] font-display text-4xl font-bold leading-[1.03] tracking-[-0.035em] text-white sm:text-5xl lg:text-[48px]">Turn your next role into a <span className="text-amber-300">proof plan.</span></h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">Build observable evidence over 13 weeks so you can test the route, learn from review, and make a clearer next decision.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={onStart} className="inline-flex min-h-[52px] items-center justify-center gap-3 rounded-lg bg-teal-300 px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-teal-200 focus-visible:ring-2 focus-visible:ring-white">Build my free Career Snapshot <ArrowRight className="h-4 w-4" /></button>
            {hasSavedProfile ? <button type="button" onClick={onResume} className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-lg border border-slate-600 px-5 py-3.5 text-sm font-semibold text-slate-200 hover:border-teal-300/50 hover:text-teal-200">Resume my snapshot</button> : <a href="/images/career/personal-career-blueprint-preview.webp" target="_blank" rel="noreferrer" className="inline-flex min-h-[52px] items-center justify-center gap-2 px-3 py-3.5 text-sm font-bold text-teal-200 hover:text-teal-100">Inspect a sample <ArrowRight className="h-4 w-4" /></a>}
          </div>
          <p className="mt-4 flex items-center gap-2 text-[11px] text-slate-500"><LockKeyhole className="h-3.5 w-3.5" />No card required · browser-local by default</p>
        </div>

        <div className="grid items-center gap-5 border-t border-slate-700/60 bg-[#06182a]/75 p-5 sm:grid-cols-[minmax(0,1fr)_210px] lg:border-l lg:border-t-0 lg:px-8">
          <img src="/images/career/personal-career-blueprint-preview.webp" alt="Personal Career Blueprint report preview" width="1421" height="1107" className="mx-auto aspect-[9/7] max-h-[315px] w-full object-contain" />
          <div className="space-y-4 text-xs leading-5 text-slate-300">
            {["Your evidence gaps and strengths", "Target-role evidence matrix", "13-week execution workspace", "Proof portfolio and interview drills"].map((item) => <p key={item} className="flex items-start gap-2.5 border-b border-slate-700/60 pb-3 last:border-b-0"><Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" />{item}</p>)}
          </div>
        </div>
      </section>

      <section id="proof-studio" className="grid lg:min-h-[510px] lg:grid-cols-[330px_minmax(0,1fr)]">
        <aside className="border-b border-slate-700/70 bg-[#04182a]/92 lg:border-b-0 lg:border-r">
          <div className="border-b border-slate-700/70 p-5">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-teal-300">{profile ? "Selected route" : "Illustrative route"}</p>
            <div className="mt-2 flex items-start justify-between gap-3">
              <div><h2 className="text-xl font-bold text-white">{analysis.selectedRoute.title}</h2><p className="mt-1 text-xs text-teal-300">{planningProfile.careerTrack.replaceAll("-", " ")}</p></div>
              <button type="button" onClick={cycleRoute} className="shrink-0 rounded-full border border-slate-600 px-3 py-1.5 text-[10px] font-semibold text-slate-400 hover:border-teal-300/50 hover:text-teal-200">Change route</button>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between"><p className="text-[9px] font-bold uppercase tracking-[0.18em] text-teal-300">Evidence profile</p><span className="text-[9px] text-slate-600">Self-rated</span></div>
            <div role="img" aria-label="Current and target evidence profile" className="mt-1 h-[270px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="67%">
                  <PolarGrid stroke="#29445b" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 9 }} />
                  <Radar name="Current evidence" dataKey="current" stroke="#2dd4bf" fill="#2dd4bf" fillOpacity={0.2} strokeWidth={2.75} />
                  <Radar name="Target evidence" dataKey="target" stroke="#fbbf24" fill="transparent" strokeWidth={2.75} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-5 text-[9px] text-slate-500"><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-teal-400" />Current evidence</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-amber-300" />Target evidence</span></div>
            <p className="mt-4 text-center text-[10px] leading-5 text-slate-600">Higher = stronger stated evidence · gaps still require qualified review.</p>
          </div>
        </aside>

        <div className="min-w-0 bg-[#031426]/90">
          <header className="flex flex-col gap-3 border-b border-slate-700/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">13-week proof studio</p><p className="mt-1 text-xs text-slate-500">Select a phase to inspect its outcome and evidence state.</p></div>
            <p className="flex items-center gap-2 text-xs text-slate-400"><CalendarDays className="h-4 w-4" />Aug 21 – Nov 19, 2026</p>
          </header>

          <div className="grid lg:grid-cols-[repeat(4,minmax(0,1fr))_160px]">
            {proofPhases.map((phase) => {
              const Icon = phase.icon;
              const active = activePhase === phase.id;
              return (
                <button key={phase.id} type="button" aria-label={`${phase.label}: ${phase.title}`} aria-pressed={active} onClick={() => setActivePhase(phase.id)} className={`group relative min-h-[310px] border-b border-slate-700/60 p-4 text-left transition lg:border-b-0 lg:border-r ${active ? "bg-teal-300/[0.055]" : "hover:bg-white/[0.025]"}`}>
                  <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-slate-500">{phase.eyebrow}</p>
                  <h3 className={`mt-2 text-lg font-bold ${active ? "text-white" : "text-slate-300"}`}>{phase.label}</h3>
                  <p className="text-[10px] font-semibold text-teal-300">{phase.weeks}</p>
                  <span className={`mt-6 grid h-12 w-12 place-items-center rounded-full border ${active ? "border-teal-300 bg-teal-300/[0.08] text-teal-200" : "border-slate-600 text-slate-500"}`}><Icon className="h-5 w-5" /></span>
                  <p className="mt-5 text-sm font-bold text-slate-100">{phase.title}</p>
                  <p className="mt-2 text-[11px] leading-5 text-slate-500">{phase.body}</p>
                  <p className={`mt-5 inline-flex rounded-md border border-current/30 px-2 py-1 text-[9px] font-semibold ${phase.tone}`}>{phase.state}</p>
                </button>
              );
            })}

            <aside className="p-4" aria-label="Career route decision gate">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">Decision gate</p>
              <p className="mt-3 text-[10px] leading-5 text-slate-500">No automatic recommendation. You decide after review.</p>
              <div className="mt-4 space-y-2">
                {(["Continue", "Adjust", "Pivot"] as const).map((choice) => (
                  <button key={choice} type="button" aria-pressed={decision === choice} onClick={() => setDecision(choice)} className={`min-h-12 w-full rounded-lg border px-3 text-left text-xs font-bold transition ${decision === choice ? "border-amber-300 bg-amber-300/[0.08] text-amber-200" : "border-slate-700 text-slate-400 hover:border-teal-300/40 hover:text-teal-200"}`}>{choice}<ArrowRight className="ml-auto inline h-3.5 w-3.5" /></button>
                ))}
              </div>
            </aside>
          </div>

          <div aria-live="polite" className="flex flex-col gap-3 border-t border-slate-700/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-400"><strong className="text-slate-200">{activePhaseData.label}:</strong> {activePhaseData.title}. {decision ? `Decision recorded as ${decision.toLowerCase()} for this illustrative state.` : "Decision remains open."}</p>
            <button type="button" onClick={onStart} className="inline-flex shrink-0 items-center gap-2 text-xs font-bold text-teal-200 hover:text-teal-100">Open my real proof plan <ArrowRight className="h-4 w-4" /></button>
          </div>
        </div>
      </section>

      <footer className="flex flex-col gap-4 border-t border-slate-700/70 bg-[#04182a] px-5 py-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" /><div><p className="font-semibold text-slate-200">Self-assessment until evidence is reviewed.</p><p className="mt-1 text-[10px] text-slate-400">Planning support, not a hiring guarantee, credential, or employer decision.</p></div></div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-[10px]"><span>Inputs stay private by default</span><span>You control what you share</span><span>Export and own your artifacts</span></div>
      </footer>
    </div>
  );
}

function LegacyCareerIntro({ hasSavedProfile, onStart, onResume }: { hasSavedProfile: boolean; onStart: () => void; onResume: () => void }) {
  return (
    <div className="pb-28">
      <section className="mx-auto max-w-7xl px-4 pb-8 pt-4 md:pb-12 md:pt-8">
        <div className="overflow-hidden rounded-2xl border border-teal-400/20 bg-[#0d1a2f] px-6 py-8 shadow-2xl shadow-black/20 md:px-10 md:py-12">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)] lg:items-center">
            <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-400/25 bg-teal-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-teal-200"><BriefcaseBusiness className="h-3.5 w-3.5" /> Personal Career Navigator</span>
            <h1 className="mt-6 max-w-3xl font-display text-4xl font-bold leading-[1.05] md:text-6xl">A career plan built around what you can prove.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">Atlas compares your current role, evidence, constraints, and target to build a route that is specific to your situation—not a generic job-title ladder.</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={onStart} className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-400 px-6 py-3.5 text-sm font-bold text-teal-950 transition hover:bg-teal-300">Build my free Career Snapshot <ArrowRight className="h-4 w-4" /></button>
              {hasSavedProfile && <button type="button" onClick={onResume} className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 px-6 py-3.5 text-sm font-semibold transition hover:border-white/30">Resume my snapshot</button>}
              <Link href="/career/domains" className="inline-flex items-center justify-center gap-2 rounded-lg border border-teal-300/25 bg-teal-300/[0.06] px-6 py-3.5 text-sm font-semibold text-teal-100 transition hover:border-teal-300/45">Explore domain evidence tracks <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400">
              <span className="flex items-center gap-2"><LockKeyhole className="h-3.5 w-3.5" /> No card required</span>
              <span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-teal-300" /> Free route comparison</span>
              <span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-teal-300" /> Browser-local by default</span>
            </div>
            </div>

            <div className="rounded-xl border border-amber-300/30 bg-[#061326] p-5 shadow-xl shadow-black/25">
            <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-200">Under review · optional after your free result</p><h2 className="mt-2 text-xl font-bold">Your named Career Blueprint</h2><p className="mt-1 text-xs text-slate-400">One-time purchase · generated from your selected route</p></div><span className="rounded-full bg-amber-300/10 px-3 py-1 text-sm font-bold text-amber-200">$20</span></div>
            <img src="/images/career/personal-career-blueprint-preview.webp" alt="Preview of a Personal Career Blueprint report and evidence comparison page" width="1421" height="1107" loading="eager" decoding="async" className="mt-4 aspect-[9/7] w-full rounded-lg object-cover" />
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-300">
              {["Profile-specific route rationale", "Target-role evidence matrix", "Lifetime 13-week workspace", "Proof portfolio and interview drills"].map((item) => <span key={item} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-teal-300" />{item}</span>)}
            </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-7xl px-4 md:mt-10">
        <div className="flex flex-col gap-4 rounded-2xl border border-amber-300/30 bg-amber-50 p-5 text-slate-950 md:flex-row md:items-center md:justify-between md:p-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700">Decision guide</p>
            <h2 className="mt-2 text-xl font-bold">Turn a route hypothesis into evidence</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Learn how the Blueprint separates self-rating, observed work and reviewer-confirmed evidence before the 13-week decision gate.</p>
          </div>
          <Link href="/blog/career-blueprint-route-to-evidence" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-amber-700 bg-white px-4 py-3 text-sm font-bold text-amber-900 transition hover:bg-amber-100">Read the Career guide <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      <section className="bg-[#f5f7f8] py-14 text-slate-950 md:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-3xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-teal-700">Your free Career Snapshot</p>
            <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-slate-950 md:text-4xl">Make the route decision before you buy the roadmap.</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">Complete five focused sections and Atlas returns a best-fit route, two credible alternatives, and the evidence gaps that matter most.</p>
          </div>
          <div className="mt-10 grid border-y border-slate-200 md:grid-cols-3 md:divide-x md:divide-slate-200">
            <Value icon={Route} step="01" title="Compare three routes" body="Best-fit, adjacent, and stretch paths—each tied to the evidence it requires." />
            <Value icon={BarChart3} step="02" title="See your priority gaps" body="A visual comparison of current evidence against the selected role threshold." />
            <Value icon={FileText} step="03" title="Choose what to do next" body="Keep the free result or unlock the detailed execution document only if it feels accurate." />
          </div>
          <button type="button" onClick={onStart} className="mt-9 inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800">Build my free snapshot <ArrowRight className="h-4 w-4" /></button>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-7xl overflow-hidden rounded-2xl border border-white/10 bg-[#071426] md:mt-16">
        <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
          <div className="border-b border-white/10 p-6 lg:border-b-0 lg:border-r lg:p-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-200">How personalization works</p>
            <h2 className="mt-3 text-2xl font-bold md:text-3xl">The same title can produce a different route.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-400">Atlas does not retrieve a fixed roadmap by job title. It recomputes the recommendation from the combination of your evidence, target, horizon, and real-world constraints.</p>
            <button type="button" onClick={onStart} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-teal-200 hover:text-teal-100">Show Atlas my real situation <ArrowRight className="h-4 w-4" /></button>
          </div>
          <div className="grid gap-px bg-white/10 sm:grid-cols-2">
            {[
              { label: "Current position", value: "Role, sector, scope, and experience" },
              { label: "Evidence you can prove", value: "Outcomes, systems, decisions, and artifacts" },
              { label: "Target route", value: "Best-fit, adjacent, or stretch destination" },
              { label: "Real constraints", value: "Time, mobility, risk, language, and study capacity" },
            ].map((item) => <div key={item.label} className="bg-[#0a1d32] p-5"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{item.label}</p><p className="mt-2 text-sm font-semibold leading-6 text-slate-200">{item.value}</p></div>)}
          </div>
        </div>
      </section>

      <section className="mt-12 bg-[#fffaf0] py-14 text-slate-950 md:mt-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 lg:grid-cols-[0.76fr_1.24fr]">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">What the $20 Blueprint adds</p>
            <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-slate-950 md:text-4xl">Not more analysis. A working document for your next move.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">The free result helps you validate the route. The paid PDF turns the route you select into concrete proof-building, positioning, interview, and execution work.</p>
            <div className="mt-6 rounded-xl border border-amber-300/50 bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-800">Personalized throughout</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Your name, current position, sector, target role, selected route, evidence gaps, constraints, and timing drive the report—not a single reusable career template.</p>
            </div>
          </div>
          <div className="grid border-t border-slate-200 sm:grid-cols-2">
            {[
              { title: "Route decision brief", body: "Why this route, why not the alternatives, and what assumptions could change the recommendation." },
              { title: "Requirement and evidence matrix", body: "Target expectations mapped against the proof you currently have, with priority gaps." },
              { title: "Proof-building portfolio", body: "Specific artifacts, outcomes, and workplace evidence to create or strengthen." },
              { title: "Lifetime 13-week execution workspace", body: "Track weekly actions, evidence, reviewer feedback, and a continue-adjust-pivot decision tied to your route." },
            ].map((item, index) => <article key={item.title} className={`border-b border-slate-200 py-6 sm:px-6 ${index % 2 === 0 ? "sm:border-r sm:pl-0" : "sm:pr-0"}`}><span className="text-xs font-bold text-amber-700">0{index + 1}</span><h3 className="mt-3 font-bold text-slate-950">{item.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p></article>)}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-7xl px-4 md:mt-16">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#071426]">
          <div className="grid lg:grid-cols-[0.7fr_1.3fr]">
            <div className="border-b border-white/10 p-6 lg:border-b-0 lg:border-r lg:p-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-200">What proof-building means</p>
              <h2 className="mt-3 text-2xl font-bold md:text-3xl">Turn a responsibility into a claim a reviewer can test.</h2>
              <p className="mt-4 text-sm leading-7 text-slate-400">The Blueprint does not invent achievements. It helps you separate participation from ownership, then define the evidence still needed.</p>
            </div>
            <div className="grid gap-px bg-white/10 sm:grid-cols-2">
              <article className="bg-[#0a1d32] p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-300">Weak, untested claim</p>
                <p className="mt-4 text-lg font-semibold leading-8 text-slate-200">“Experienced in deviation investigations.”</p>
                <p className="mt-3 text-sm leading-6 text-slate-500">The scope, decision, contribution, review status and outcome are unclear.</p>
              </article>
              <article className="bg-[#0a1d32] p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-300">Evidence-led version</p>
                <p className="mt-4 text-lg font-semibold leading-8 text-slate-200">State the bounded event, your decision, the sanitized artifact, reviewer feedback and the observable result.</p>
                <p className="mt-3 text-sm leading-6 text-slate-500">Only claim what a qualified reviewer and available evidence can support.</p>
              </article>
              <div className="bg-[#0a1d32] p-6 sm:col-span-2">
                <div className="grid gap-4 sm:grid-cols-4">
                  {[["01", "Boundary", "What exactly did you own?"], ["02", "Decision", "What judgment did you make?"], ["03", "Evidence", "What artifact or feedback supports it?"], ["04", "Outcome", "What changed, and what remains unknown?"]].map(([number, title, body]) => (
                    <div key={number}><span className="text-xs font-bold text-teal-300">{number}</span><h3 className="mt-2 text-sm font-bold text-white">{title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{body}</p></div>
                  ))}
                </div>
                <button type="button" onClick={onStart} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-teal-200 hover:text-teal-100">Map my current evidence <ArrowRight className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-12 flex max-w-7xl flex-col gap-5 px-4 md:mt-16 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-400/10 text-teal-200"><ShieldCheck className="h-5 w-5" /></div><div><h2 className="text-lg font-bold">Useful without pretending certainty</h2><p className="mt-1 max-w-3xl text-sm leading-6 text-slate-400">Scores are self-assessment planning aids. Atlas exposes assumptions, avoids hiring guarantees, and encourages review by a qualified manager or mentor.</p></div></div>
        <button type="button" onClick={onStart} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-teal-400/35 px-5 py-3 text-sm font-semibold text-teal-200 hover:bg-teal-400/10">Start assessment <ArrowRight className="h-4 w-4" /></button>
      </section>
    </div>
  );
}

function Value({ icon: Icon, step, title, body }: { icon: typeof Sparkles; step: string; title: string; body: string }) {
  return <div className="py-7 md:px-7 md:first:pl-0"><div className="flex items-center justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-800"><Icon className="h-5 w-5" /></div><span className="text-xs font-bold tracking-[0.14em] text-slate-400">{step}</span></div><h3 className="mt-5 text-lg font-bold text-slate-950">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{body}</p></div>;
}

import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Check,
  FileText,
  LockKeyhole,
  Route,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { CareerAssessment } from "@/features/career/CareerAssessment";
import { CareerResults } from "@/features/career/CareerResults";
import { useUser } from "@/context/UserContext";
import { analytics } from "@/hooks/use-analytics";
import { useSEO } from "@/hooks/use-seo";
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
  const [, navigate] = useLocation();
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
          setPhase("results");
        }
      }
    } catch {
      localStorage.removeItem(CAREER_PROFILE_STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

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
    if (profile) return profile;
    const accountName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
    return accountName ? { ...defaultCareerProfile, fullName: accountName } : defaultCareerProfile;
  }, [profile, user?.firstName, user?.lastName]);

  function startAssessment() {
    analytics.careerAssessmentStarted();
    setError("");
    setPhase("assessment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function completeAssessment(nextProfile: CareerProfile) {
    localStorage.setItem(CAREER_PROFILE_STORAGE_KEY, JSON.stringify(nextProfile));
    setProfile(nextProfile);
    setPhase("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function changeSelectedRoute(routeId: string) {
    setProfile((current) => {
      if (!current) return current;
      const nextProfile = { ...current, selectedRouteId: routeId };
      localStorage.setItem(CAREER_PROFILE_STORAGE_KEY, JSON.stringify(nextProfile));
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

  if (!hydrated) return <div className="mx-auto min-h-[70vh] max-w-6xl px-4 py-16" />;

  if (phase === "assessment") {
    return <CareerAssessment initialProfile={assessmentInitial} onCancel={() => setPhase(profile ? "results" : "intro")} onComplete={completeAssessment} onStepComplete={(step, track) => analytics.careerAssessmentStepCompleted(step, track)} />;
  }

  if (phase === "results" && profile) {
    return (
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
    );
  }

  return <CareerIntro hasSavedProfile={Boolean(profile)} onStart={startAssessment} onResume={() => setPhase("results")} />;
}

function CareerIntro({ hasSavedProfile, onStart, onResume }: { hasSavedProfile: boolean; onStart: () => void; onResume: () => void }) {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-28 pt-4 md:pt-8">
      <section className="overflow-hidden rounded-xl border border-teal-400/20 bg-white/[0.025] p-6 shadow-2xl shadow-black/15 md:p-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.04fr)_minmax(420px,0.96fr)] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-400/25 bg-teal-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-teal-200"><BriefcaseBusiness className="h-3.5 w-3.5" /> Personal Career Navigator</span>
            <h1 className="mt-6 max-w-3xl font-display text-4xl font-bold leading-[1.05] md:text-6xl">Stop following a generic career ladder.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 md:text-lg">Tell Atlas where you are, what evidence you can show, and what constraints matter. Get a free Career Snapshot built around your real situation—not only your job title.</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={onStart} className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-400 px-6 py-3.5 text-sm font-bold text-teal-950 transition hover:bg-teal-300">Build my free Career Snapshot <ArrowRight className="h-4 w-4" /></button>
              {hasSavedProfile && <button type="button" onClick={onResume} className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 px-6 py-3.5 text-sm font-semibold transition hover:border-white/30">Resume my snapshot</button>}
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-slate-500"><LockKeyhole className="h-3.5 w-3.5" /> Free assessment · no card required · browser-local by default</p>
          </div>

          <div className="rounded-xl border border-amber-300/30 bg-[#071426] p-5">
            <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-200">Optional paid deliverable</p><h2 className="mt-2 text-xl font-bold">Your named Personal Career Blueprint</h2></div><span className="rounded-full bg-amber-300/10 px-3 py-1 text-sm font-bold text-amber-200">$20</span></div>
            <img src="/images/career/personal-career-blueprint-preview.png" alt="Preview of a Personal Career Blueprint report and evidence comparison page" className="mt-4 aspect-[9/7] w-full rounded-lg object-cover" />
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-300">
              {["38 personalized pages", "Target-role requirement matrix", "13-week execution calendar", "Proof portfolio and interview drills"].map((item) => <span key={item} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-teal-300" />{item}</span>)}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-7 grid gap-4 md:grid-cols-3">
        <Value icon={Route} title="Compare credible routes" body="See a best-fit move, an adjacent option, and a stretch path with the evidence each one requires." />
        <Value icon={BarChart3} title="See the gap visually" body="Compare your current evidence with the planning threshold for the selected target role." />
        <Value icon={FileText} title="Turn insight into a plan" body="Start free, then unlock the detailed month-by-month PDF only if the snapshot feels accurate." />
      </section>

      <section className="mt-7 flex flex-col gap-5 rounded-xl border border-white/10 bg-white/[0.02] p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-400/10 text-teal-200"><ShieldCheck className="h-5 w-5" /></div><div><h2 className="text-lg font-bold">Useful without pretending certainty</h2><p className="mt-1 max-w-3xl text-sm leading-6 text-slate-400">Scores are self-assessment planning aids. Atlas exposes assumptions, avoids hiring guarantees, and encourages review by a qualified manager or mentor.</p></div></div>
        <button type="button" onClick={onStart} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-teal-400/35 px-5 py-3 text-sm font-semibold text-teal-200 hover:bg-teal-400/10">Start assessment <ArrowRight className="h-4 w-4" /></button>
      </section>
    </div>
  );
}

function Value({ icon: Icon, title, body }: { icon: typeof Sparkles; title: string; body: string }) {
  return <div className="rounded-xl border border-white/10 bg-white/[0.025] p-5"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-400/10 text-teal-200"><Icon className="h-5 w-5" /></div><h2 className="mt-4 text-lg font-bold">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{body}</p></div>;
}

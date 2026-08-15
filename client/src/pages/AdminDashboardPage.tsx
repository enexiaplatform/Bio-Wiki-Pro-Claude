import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import {
  Activity, BadgeDollarSign, BarChart3, BookOpenCheck, BriefcaseBusiness, Building2, CheckCircle2, Database,
  Download, FileArchive, FileCheck2, FolderKanban, LayoutDashboard, Loader2,
  Mail, Network, Search, ShieldCheck, ShoppingCart, Users, XCircle,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useSEO } from "@/hooks/use-seo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import type { QualityLabFunnelSnapshot, QualityLabFunnelStage } from "@shared/quality-lab-funnel";
import { DECISION_PACKAGES } from "@shared/decision-packages";
import { CAREER_DOMAIN_TRACKS } from "@shared/career-domain-tracks";
import { MANUFACTURING_QUALITY_PORTFOLIO } from "@shared/manufacturing-quality-portfolio";
import { RUNTIME_SCHEMA_REMEDIATION } from "@shared/operational-readiness";

type Overview = {
  users: { total: number; pro: number; verified: number };
  leads: number;
  commercialRequests: number;
  purchases: { total: number; completed: number; revenueCents: number };
  reviewedProjects: number;
  content: { total: number; published: number; paid: number };
  documents: { products: number; files: number };
};

type RuntimeHealth = {
  httpStatus: number;
  status: "ok" | "degraded";
  commerceMode: "disabled" | "test" | "live";
  commerceReady: boolean;
  diagnosticTestReady: boolean;
  timestamp: string;
  readiness: {
    database: boolean;
    sessions: boolean;
    stripe: boolean;
    stripeMode: "unconfigured" | "test" | "live";
    scopeDiagnostic: boolean;
    email: boolean;
    commercialNotifications: boolean;
    analytics: boolean;
    cron: boolean;
    publicOriginConfigured: boolean;
    publicOrigin: string;
    schema: boolean;
  };
};

type AdminUser = {
  id: string; email: string | null; firstName: string | null; lastName: string | null;
  isPro: boolean; verifiedEmail: boolean; subscriptionStatus: string | null;
  proExpiresAt: string | null; createdAt: string | null; updatedAt: string | null;
};

type ContentControl = {
  id: number; slug: string; lang: string; tier: "free" | "pro" | "paid";
  published: boolean; sort: number; viewCount: number; updatedAt: string | null;
};

type DocumentProduct = {
  id: string; name: string; access: "purchase-or-pro" | "pro-only"; entitledBy: string[];
  files: Array<{ filename: string; label: string; description: string; contentType: string; generated: string | null; available: boolean; previewUrl: string }>;
};

const commercialStatuses = ["new", "qualified", "diagnostic-paid", "diagnostic-scheduled", "blueprint-proposed", "won", "in-delivery", "delivered", "accepted", "lost"] as const;
type CommercialStatus = typeof commercialStatuses[number];
type CommercialRequest = {
  id: number; name: string; email: string; company: string | null; productOfInterest: string | null;
  need: string; status: CommercialStatus; owner: string | null; nextAction: string | null;
  nextActionAt: string | null; notes: string | null; createdAt: string | null; updatedAt: string | null;
};

type Pipeline = {
  leads: Array<{ id: number; email: string; source: string | null; createdAt: string | null }>;
  requests: CommercialRequest[];
  purchases: Array<{ id: number; userId: string | null; productType: string; amount: number | null; status: string | null; createdAt: string | null }>;
  projects: Array<{ id: number; userId: string; localProjectId: string; projectName: string; inputCompletenessPercent: number | null; reviewRequestedAt: string | null; updatedAt: string | null }>;
};

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const date = (value: string | null | undefined) => value ? new Date(value).toLocaleDateString("en-GB") : "—";
const funnelLabels: Record<QualityLabFunnelStage, string> = {
  cta_clicked: "Blueprint CTA clicked",
  planner_started: "Planner started",
  start_mode_selected: "Start mode selected",
  model_compiled: "Initial model compiled",
  review_viewed: "Expert review viewed",
  review_started: "Review submission started",
  review_requested: "Review requested",
  diagnostic_checkout_started: "Diagnostic checkout started",
  diagnostic_purchased: "Diagnostic purchased",
};
const decisionAnalyticsEvents = ["decision_package_viewed", "decision_package_asset_opened", "decision_package_completed", "decision_package_product_handoff", "career_domain_track_selected", "coverage_gap_opened"] as const;

export default function AdminDashboardPage() {
  useSEO({ title: "Admin Control Center", description: "Operational control center for Life Science Atlas." });
  const { isAdmin, isAuthenticated, isLoading } = useUser();
  const [, setLocation] = useLocation();
  const [userSearch, setUserSearch] = useState("");
  const [contentSearch, setContentSearch] = useState("");

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) setLocation("/login?next=/admin");
    else if (!isAdmin) setLocation("/settings");
  }, [isAdmin, isAuthenticated, isLoading, setLocation]);

  const overview = useQuery<Overview>({ queryKey: ["/api/admin/overview"], enabled: isAdmin, staleTime: 30_000 });
  const users = useQuery<{ users: AdminUser[] }>({ queryKey: ["/api/admin/users"], enabled: isAdmin, staleTime: 30_000 });
  const documents = useQuery<{ products: DocumentProduct[] }>({ queryKey: ["/api/admin/documents"], enabled: isAdmin, staleTime: 60_000 });
  const content = useQuery<{ content: ContentControl[] }>({ queryKey: ["/api/admin/content"], enabled: isAdmin, staleTime: 30_000 });
  const pipeline = useQuery<Pipeline>({ queryKey: ["/api/admin/pipeline"], enabled: isAdmin, staleTime: 30_000 });
  const funnel = useQuery<QualityLabFunnelSnapshot>({ queryKey: ["/api/admin/quality-lab-funnel?days=30"], enabled: isAdmin, staleTime: 30_000 });
  const readiness = useQuery<RuntimeHealth>({
    queryKey: ["/api/health", "admin-readiness"],
    enabled: isAdmin,
    staleTime: 30_000,
    queryFn: async () => {
      const response = await fetch("/api/health", { credentials: "include" });
      const body = await response.json() as Omit<RuntimeHealth, "httpStatus">;
      return { ...body, httpStatus: response.status };
    },
  });

  const accessMutation = useMutation({
    mutationFn: async ({ userId, isPro }: { userId: string; isPro: boolean }) => (await apiRequest("PATCH", `/api/admin/users/${userId}/access`, { isPro })).json(),
    onSuccess: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] }),
      queryClient.invalidateQueries({ queryKey: ["/api/admin/overview"] }),
    ]),
  });

  const contentMutation = useMutation({
    mutationFn: async ({ id, patch }: { id: number; patch: Partial<Pick<ContentControl, "tier" | "published" | "sort">> }) => (await apiRequest("PATCH", `/api/admin/content/${id}`, patch)).json(),
    onSuccess: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] }),
      queryClient.invalidateQueries({ queryKey: ["/api/admin/overview"] }),
    ]),
  });

  const pipelineMutation = useMutation({
    mutationFn: async ({ id, patch }: { id: number; patch: Partial<Pick<CommercialRequest, "status" | "owner" | "nextAction" | "nextActionAt" | "notes">> }) => (await apiRequest("PATCH", `/api/admin/pipeline/requests/${id}`, patch)).json(),
    onSuccess: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pipeline"] }),
      queryClient.invalidateQueries({ queryKey: ["/api/admin/overview"] }),
    ]),
  });

  const filteredUsers = useMemo(() => {
    const term = userSearch.trim().toLowerCase();
    return (users.data?.users ?? []).filter((user) => !term || `${user.email} ${user.firstName} ${user.lastName}`.toLowerCase().includes(term));
  }, [users.data, userSearch]);

  const filteredContent = useMemo(() => {
    const term = contentSearch.trim().toLowerCase();
    return (content.data?.content ?? []).filter((entry) => !term || entry.slug.toLowerCase().includes(term));
  }, [content.data, contentSearch]);
  const decisionIntelligence = useMemo(() => ({
    packages: DECISION_PACKAGES.length,
    underReview: DECISION_PACKAGES.filter((item) => item.reviewStatus === "under-review").length,
    tracks: CAREER_DOMAIN_TRACKS.length,
    linkedAreas: MANUFACTURING_QUALITY_PORTFOLIO.flatMap((lane) => lane.areas).filter((area) => area.status !== "not-covered" && area.decisionPackageIds.length > 0).length,
    totalAreas: MANUFACTURING_QUALITY_PORTFOLIO.flatMap((lane) => lane.areas).filter((area) => area.status !== "not-covered").length,
  }), []);

  if (isLoading || !isAdmin) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-teal-300" /></div>;

  const loading = overview.isLoading || users.isLoading || documents.isLoading || content.isLoading || pipeline.isLoading || funnel.isLoading || readiness.isLoading;

  return (
    <div className="min-h-screen bg-[#07111f] px-4 pb-24 pt-6 text-slate-100 md:pt-10">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-3xl border border-teal-300/20 bg-gradient-to-br from-teal-300/10 via-white/[0.035] to-transparent p-6 md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-300/10 text-teal-200"><ShieldCheck className="h-5 w-5" /></div>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-teal-300">Private operations</p>
              <h1 className="mt-2 text-3xl font-bold md:text-5xl">Admin control center</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">Control customer access, paid deliverables, content visibility and the Blueprint commercial pipeline from one operational surface.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/quality-lab/projects" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-teal-300/30">Open Blueprint workspace</Link>
              <button onClick={() => { void Promise.all([overview.refetch(), users.refetch(), documents.refetch(), content.refetch(), pipeline.refetch(), funnel.refetch(), readiness.refetch()]); }} className="inline-flex items-center gap-2 rounded-xl bg-teal-300 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-teal-200"><Activity className="h-4 w-4" /> Refresh data</button>
            </div>
          </div>
        </header>

        {loading && <div className="mt-4 flex items-center gap-2 rounded-xl border border-sky-300/15 bg-sky-300/5 p-4 text-sm text-sky-100"><Loader2 className="h-4 w-4 animate-spin" /> Loading operational data…</div>}

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.035] p-1.5">
            <AdminTab value="overview" icon={LayoutDashboard} label="Overview" />
            <AdminTab value="users" icon={Users} label="Users" />
            <AdminTab value="documents" icon={FileArchive} label="Paid documents" />
            <AdminTab value="pipeline" icon={FolderKanban} label="Pipeline" />
            <AdminTab value="funnel" icon={BarChart3} label="Blueprint funnel" />
            <AdminTab value="decision-intelligence" icon={Network} label="Decision intelligence" />
            <AdminTab value="content" icon={BookOpenCheck} label="Content" />
          </TabsList>

          <TabsContent value="overview" className="mt-5 space-y-5">
            <RuntimeReadinessPanel health={readiness.data} failed={readiness.isError} />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard icon={Users} label="Registered users" value={overview.data?.users.total ?? 0} detail={`${overview.data?.users.pro ?? 0} Pro · ${overview.data?.users.verified ?? 0} verified`} />
              <MetricCard icon={BadgeDollarSign} label="Completed revenue" value={money.format((overview.data?.purchases.revenueCents ?? 0) / 100)} detail={`${overview.data?.purchases.completed ?? 0} completed purchases`} />
              <MetricCard icon={Building2} label="Blueprint requests" value={overview.data?.commercialRequests ?? 0} detail={`${overview.data?.reviewedProjects ?? 0} reviewed projects`} />
              <MetricCard icon={FileArchive} label="Paid document files" value={overview.data?.documents.files ?? 0} detail={`${overview.data?.documents.products ?? 0} controlled products`} />
            </div>
            <section className="grid gap-4 lg:grid-cols-3">
              <StatusPanel title="Customer system" icon={Users} items={[`${overview.data?.users.total ?? 0} accounts`, `${overview.data?.leads ?? 0} captured leads`, `${overview.data?.purchases.total ?? 0} purchase records`]} />
              <StatusPanel title="Evidence commerce" icon={FileCheck2} items={[`${overview.data?.content.paid ?? 0} gated content entries`, `${overview.data?.content.published ?? 0} published entries`, `${overview.data?.documents.files ?? 0} downloadable assets`]} />
              <StatusPanel title="Blueprint operations" icon={FolderKanban} items={[`${overview.data?.commercialRequests ?? 0} commercial requests`, `${overview.data?.reviewedProjects ?? 0} account-held projects`, "Gate 2 evidence remains externally controlled"]} />
            </section>
          </TabsContent>

          <TabsContent value="users" className="mt-5">
            <Panel title="Registered users" description="Review account status and grant or revoke manual Pro access. Stripe can later overwrite a manual state when a subscription event arrives.">
              <SearchField value={userSearch} onChange={setUserSearch} placeholder="Search name or email" />
              <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[780px] text-left text-sm"><thead className="text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-3 py-3">User</th><th className="px-3 py-3">Created</th><th className="px-3 py-3">Email</th><th className="px-3 py-3">Plan</th><th className="px-3 py-3 text-right">Manual Pro</th></tr></thead><tbody className="divide-y divide-white/8">{filteredUsers.map((user) => <tr key={user.id} className="hover:bg-white/[0.025]"><td className="px-3 py-4"><p className="font-semibold text-white">{[user.firstName, user.lastName].filter(Boolean).join(" ") || "Unnamed user"}</p><p className="mt-1 text-xs text-slate-500">{user.email}</p></td><td className="px-3 py-4 text-slate-400">{date(user.createdAt)}</td><td className="px-3 py-4">{user.verifiedEmail ? <State good label="Verified" /> : <State label="Unverified" />}</td><td className="px-3 py-4"><span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300">{user.subscriptionStatus || "free"}</span></td><td className="px-3 py-4 text-right"><Switch aria-label={`Pro access for ${user.email}`} checked={user.isPro} disabled={accessMutation.isPending} onCheckedChange={(checked) => accessMutation.mutate({ userId: user.id, isPro: checked })} /></td></tr>)}</tbody></table></div>
            </Panel>
          </TabsContent>

          <TabsContent value="documents" className="mt-5 space-y-4">
            <div className="rounded-2xl border border-sky-300/15 bg-sky-300/5 p-4 text-xs leading-6 text-sky-100"><Database className="mr-2 inline h-4 w-4 text-sky-300" />The controlled file vault is repository-backed under <span className="font-mono">content/deliverables</span>. This is durable across Vercel deployments; the dashboard verifies source availability and access rules.</div>
            {(documents.data?.products ?? []).map((product) => <section key={product.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-bold text-white">{product.name}</h2><p className="mt-1 font-mono text-xs text-slate-500">{product.id}</p></div><span className="rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-xs font-bold text-teal-200">{product.access === "pro-only" ? "Pro only" : "Purchase or Pro"}</span></div><div className="mt-4 grid gap-3 md:grid-cols-2">{product.files.map((file) => <article key={file.filename} className="rounded-xl border border-white/8 bg-slate-950/35 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-slate-100">{file.label}</p><p className="mt-1 text-xs leading-5 text-slate-500">{file.description}</p></div>{file.available ? <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-300" /> : <XCircle className="h-4 w-4 shrink-0 text-red-300" />}</div><div className="mt-3 flex items-center justify-between gap-3"><span className="truncate font-mono text-[10px] text-slate-600">{file.filename}</span>{file.available && <a href={file.previewUrl} className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-teal-300 hover:text-teal-200"><Download className="h-3.5 w-3.5" /> Download</a>}</div></article>)}</div></section>)}
          </TabsContent>

          <TabsContent value="pipeline" className="mt-5 space-y-5">
            <Panel title="Blueprint and commercial requests" description="Move every request to a clear owner, next action and outcome. Request context is commercial intake, not confidential project evidence."><div className="space-y-3">{(pipeline.data?.requests ?? []).map((request) => <CommercialRequestCard key={request.id} request={request} saving={pipelineMutation.isPending} onSave={(patch) => pipelineMutation.mutate({ id: request.id, patch })} />)}</div></Panel>
            <div className="grid gap-5 lg:grid-cols-2"><Panel title="Reviewed Blueprint projects" description="Account-held projects that entered expert review."><CompactRows rows={(pipeline.data?.projects ?? []).map((project) => ({ title: project.projectName, detail: `${project.inputCompletenessPercent ?? 0}% model completeness`, meta: date(project.updatedAt) }))} /></Panel><Panel title="Purchase records" description="Recent Stripe and manual purchase records."><CompactRows rows={(pipeline.data?.purchases ?? []).map((purchase) => ({ title: purchase.productType, detail: purchase.status || "pending", meta: purchase.amount ? money.format(purchase.amount / 100) : date(purchase.createdAt) }))} /></Panel></div>
          </TabsContent>

          <TabsContent value="funnel" className="mt-5">
            <Panel title="Blueprint funnel · last 30 days" description="First-party stage receipts remain available when PostHog is absent. Counts are unique browser journeys; direct entry can make later-stage reach exceed earlier CTA reach.">
              {funnel.isError ? (
                <div className="rounded-xl border border-amber-300/20 bg-amber-300/[0.06] p-4 text-sm leading-6 text-amber-100">Funnel receipts are unavailable in this environment. {RUNTIME_SCHEMA_REMEDIATION}</div>
              ) : (
                <div className="space-y-3">
                  <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-4">
                    <div><p className="text-3xl font-bold text-white">{funnel.data?.uniqueJourneys ?? 0}</p><p className="mt-1 text-xs text-slate-500">Unique Blueprint journeys observed</p></div>
                    <p className="text-xs text-slate-600">No project inputs, contact details or evidence content are stored.</p>
                  </div>
                  {(funnel.data?.stages ?? []).map((stage) => {
                    const width = Math.min(100, stage.percentOfPlannerStarts ?? (stage.journeys > 0 ? 100 : 0));
                    return <div key={stage.stage} className="grid gap-2 border-b border-white/8 py-3 last:border-0 sm:grid-cols-[15rem_1fr_8.5rem] sm:items-center">
                      <div><p className="text-sm font-semibold text-slate-200">{funnelLabels[stage.stage]}</p><p className="mt-0.5 font-mono text-[10px] text-slate-600">{stage.stage}</p></div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-teal-300" style={{ width: `${width}%` }} /></div>
                      <div className="text-right"><span className="text-lg font-bold text-white">{stage.journeys}</span><span className="ml-2 text-xs text-slate-500">{stage.percentOfPlannerStarts === null ? "journeys" : `${stage.percentOfPlannerStarts}% of starts`}</span></div>
                    </div>;
                  })}
                </div>
              )}
            </Panel>
          </TabsContent>

          <TabsContent value="decision-intelligence" className="mt-5 space-y-5">
            <Panel title="Decision intelligence registry" description="Registry-backed coverage and instrumentation status. Engagement counts remain in the configured analytics provider; this panel never fabricates user activity.">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard icon={Network} label="Decision Packages" value={`${decisionIntelligence.packages}/12`} detail={`${decisionIntelligence.underReview} currently under review`} />
                <MetricCard icon={BriefcaseBusiness} label="Career tracks" value={decisionIntelligence.tracks} detail="Biopharma · Pharma/API · Drug Product" />
                <MetricCard icon={FileCheck2} label="Linked portfolio areas" value={`${decisionIntelligence.linkedAreas}/${decisionIntelligence.totalAreas}`} detail="Non-not-covered areas with package links" />
                <MetricCard icon={Activity} label="Instrumented events" value={decisionAnalyticsEvents.length} detail="PostHog event contract" />
              </div>
            </Panel>
            <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <Panel title="Package review queue" description="Every package remains visible, source-bound and blocked from SME promotion until qualified review is recorded.">
                <div className="space-y-2">{DECISION_PACKAGES.map((item) => <Link key={item.id} href={`/evidence/packages/${item.id}`} className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-slate-950/35 p-3 transition hover:border-teal-300/25"><div><p className="text-sm font-semibold text-white">{item.title}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-slate-600">Month {item.month} · {item.lane} · {item.stageRefs.length} stages</p></div><span className="rounded-full border border-amber-300/20 bg-amber-300/[0.06] px-2 py-1 text-[9px] font-bold uppercase text-amber-200">{item.reviewStatus}</span></Link>)}</div>
              </Panel>
              <Panel title="Analytics event contract" description="These event names are emitted by public, Blueprint, Pro and Career handoffs; no project inputs or regulated evidence are sent as event payloads.">
                <div className="flex flex-wrap gap-2">{decisionAnalyticsEvents.map((event) => <span key={event} className="rounded-lg border border-sky-300/15 bg-sky-300/[0.05] px-2.5 py-2 font-mono text-[10px] text-sky-200">{event}</span>)}</div>
                <div className="mt-5 rounded-xl border border-amber-300/15 bg-amber-300/[0.04] p-4 text-xs leading-6 text-slate-400">Review status is an editorial and SME control, not an engagement metric. Source, applicability, limitations and domain-pack boundaries remain visible in every package.</div>
              </Panel>
            </div>
          </TabsContent>

          <TabsContent value="content" className="mt-5">
            <Panel title="Content access control" description="MDX remains the editorial source of truth. This table controls publish state, tier and ordering in production.">
              <SearchField value={contentSearch} onChange={setContentSearch} placeholder="Search content slug" />
              <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[820px] text-left text-sm"><thead className="text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-3 py-3">Content</th><th className="px-3 py-3">Views</th><th className="px-3 py-3">Tier</th><th className="px-3 py-3">Sort</th><th className="px-3 py-3 text-right">Published</th></tr></thead><tbody className="divide-y divide-white/8">{filteredContent.map((entry) => <tr key={entry.id}><td className="px-3 py-4"><p className="font-mono text-xs text-slate-200">{entry.slug}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-slate-600">{entry.lang}</p></td><td className="px-3 py-4 text-slate-400">{entry.viewCount}</td><td className="px-3 py-4"><select value={entry.tier} disabled={contentMutation.isPending} onChange={(event) => contentMutation.mutate({ id: entry.id, patch: { tier: event.target.value as ContentControl["tier"] } })} className="h-9 rounded-lg border border-white/10 bg-slate-950 px-3 text-xs text-white"><option value="free">Free</option><option value="pro">Pro</option><option value="paid">Paid</option></select></td><td className="px-3 py-4"><input type="number" value={entry.sort} onChange={(event) => contentMutation.mutate({ id: entry.id, patch: { sort: Number(event.target.value) } })} className="h-9 w-20 rounded-lg border border-white/10 bg-slate-950 px-2 text-xs text-white" /></td><td className="px-3 py-4 text-right"><Switch aria-label={`Publish ${entry.slug}`} checked={entry.published} disabled={contentMutation.isPending} onCheckedChange={(checked) => contentMutation.mutate({ id: entry.id, patch: { published: checked } })} /></td></tr>)}</tbody></table></div>
            </Panel>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function AdminTab({ value, icon: Icon, label }: { value: string; icon: typeof LayoutDashboard; label: string }) { return <TabsTrigger value={value} className="gap-2 px-4 py-2.5 data-[state=active]:bg-teal-300 data-[state=active]:text-slate-950"><Icon className="h-4 w-4" />{label}</TabsTrigger>; }
function RuntimeReadinessPanel({ health, failed }: { health?: RuntimeHealth; failed: boolean }) {
  if (failed) return <section className="rounded-2xl border border-red-300/20 bg-red-300/[0.05] p-5"><p className="text-sm font-bold text-red-200">Runtime readiness could not be loaded.</p><p className="mt-2 text-xs leading-6 text-slate-400">Treat commercial operations as HOLD until the health endpoint is reachable and reviewed.</p></section>;
  if (!health) return <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-sm text-slate-500">Loading runtime readiness…</section>;

  const controls = [
    ["Persistent database", health.readiness.database, "Required"],
    ["Session security", health.readiness.sessions, "Required"],
    ["Gate 1 runtime schema", health.readiness.schema, "Required"],
    [`Stripe core · ${health.readiness.stripeMode}`, health.readiness.stripe, "Required"],
    ["USD 149 Scope Diagnostic", health.readiness.scopeDiagnostic, "Required"],
    ["Transactional email", health.readiness.email, "Required"],
    ["Monitored owner inbox", health.readiness.commercialNotifications, "Required"],
    ["Custom public origin", health.readiness.publicOriginConfigured, "Live only"],
    ["Lifecycle cron", health.readiness.cron, "Operational"],
    ["PostHog analytics", health.readiness.analytics, "Optional"],
  ] as const;
  const pilotReady = health.diagnosticTestReady;

  return <section className={`rounded-2xl border p-5 ${pilotReady ? "border-teal-300/25 bg-teal-300/[0.05]" : "border-amber-300/25 bg-amber-300/[0.05]"}`}>
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Commercial runtime</p><h2 className="mt-2 text-xl font-bold text-white">{pilotReady ? "Controlled test checkout is ready" : "HOLD — prerequisites remain"}</h2><p className="mt-2 max-w-3xl text-xs leading-6 text-slate-400">Mode: <span className="font-mono text-slate-300">{health.commerceMode}</span> · HTTP {health.httpStatus}. This panel proves configuration and minimum schema compatibility only; it does not prove webhook delivery, inbox receipt, payment acceptance or reviewer appointment.</p></div>
      <div className="flex gap-2"><ReadinessBadge ready={health.diagnosticTestReady} label="Test pilot" /><ReadinessBadge ready={health.commerceReady} label="Live commerce" /></div>
    </div>
    <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">{controls.map(([label, ready, scope]) => <div key={label} className="rounded-xl border border-white/8 bg-slate-950/35 p-3"><div className="flex items-start justify-between gap-2">{ready ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />}<span className="text-[9px] font-bold uppercase tracking-wider text-slate-600">{scope}</span></div><p className="mt-3 text-xs font-semibold text-slate-200">{label}</p><p className={`mt-1 text-[10px] font-bold uppercase ${ready ? "text-teal-300" : "text-amber-300"}`}>{ready ? "Ready" : "Open"}</p></div>)}</div>
    {!health.readiness.schema && <p className="mt-4 rounded-xl border border-amber-300/15 bg-amber-300/[0.04] p-3 text-xs leading-6 text-amber-100">{RUNTIME_SCHEMA_REMEDIATION} Never infer the required database change from this public boolean alone.</p>}
    <p className="mt-3 break-all font-mono text-[10px] text-slate-600">Origin: {health.readiness.publicOrigin} · observed {new Date(health.timestamp).toLocaleString("en-GB")}</p>
  </section>;
}
function ReadinessBadge({ ready, label }: { ready: boolean; label: string }) { return <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${ready ? "border-teal-300/25 bg-teal-300/10 text-teal-200" : "border-amber-300/25 bg-amber-300/[0.06] text-amber-200"}`}>{label}: {ready ? "Ready" : "Hold"}</span>; }
function MetricCard({ icon: Icon, label, value, detail }: { icon: typeof Users; label: string; value: string | number; detail: string }) { return <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><Icon className="h-5 w-5 text-teal-300" /><p className="mt-4 text-3xl font-bold text-white">{value}</p><p className="mt-1 text-sm font-semibold text-slate-300">{label}</p><p className="mt-2 text-xs text-slate-500">{detail}</p></article>; }
function StatusPanel({ title, icon: Icon, items }: { title: string; icon: typeof Users; items: string[] }) { return <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><div className="flex items-center gap-2"><Icon className="h-4 w-4 text-sky-300" /><h2 className="font-bold text-white">{title}</h2></div><ul className="mt-4 space-y-2">{items.map((item) => <li key={item} className="flex items-center gap-2 text-sm text-slate-400"><CheckCircle2 className="h-3.5 w-3.5 text-teal-300" />{item}</li>)}</ul></section>; }
function Panel({ title, description, children }: { title: string; description: string; children: ReactNode }) { return <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><h2 className="text-lg font-bold text-white">{title}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{description}</p><div className="mt-4">{children}</div></section>; }
function SearchField({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) { return <label className="relative block max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" /><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/60 pl-10 pr-3 text-sm text-white outline-none focus:border-teal-300/40" /></label>; }
function State({ good = false, label }: { good?: boolean; label: string }) { return <span className={`inline-flex items-center gap-1 text-xs font-semibold ${good ? "text-teal-300" : "text-amber-300"}`}>{good ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}{label}</span>; }
function CompactRows({ rows }: { rows: Array<{ title: string; detail: string; meta: string }> }) { return <div className="space-y-2">{rows.length ? rows.map((row, index) => <div key={`${row.title}-${index}`} className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-slate-950/35 p-3"><div><p className="text-sm font-semibold text-white">{row.title}</p><p className="mt-1 text-xs text-slate-500">{row.detail}</p></div><span className="text-xs text-slate-500">{row.meta}</span></div>) : <p className="py-6 text-center text-sm text-slate-600">No records yet.</p>}</div>; }

function CommercialRequestCard({ request, saving, onSave }: { request: CommercialRequest; saving: boolean; onSave: (patch: Partial<Pick<CommercialRequest, "status" | "owner" | "nextAction" | "nextActionAt" | "notes">>) => void }) {
  const [draft, setDraft] = useState({ status: request.status, owner: request.owner ?? "", nextAction: request.nextAction ?? "", nextActionAt: request.nextActionAt ? new Date(request.nextActionAt).toISOString().slice(0, 16) : "", notes: request.notes ?? "" });
  useEffect(() => { setDraft({ status: request.status, owner: request.owner ?? "", nextAction: request.nextAction ?? "", nextActionAt: request.nextActionAt ? new Date(request.nextActionAt).toISOString().slice(0, 16) : "", notes: request.notes ?? "" }); }, [request]);
  return <article className="rounded-xl border border-white/8 bg-slate-950/35 p-4">
    <div className="flex flex-wrap justify-between gap-2"><div><p className="font-semibold text-white">{request.name} · {request.company || "Company not supplied"}</p><a href={`mailto:${request.email}`} className="mt-1 inline-flex items-center gap-1 text-xs text-teal-300"><Mail className="h-3 w-3" />{request.email}</a></div><span className="text-xs text-slate-500">{date(request.createdAt)}</span></div>
    <p className="mt-3 text-xs leading-6 text-slate-400">{request.need}</p>
    <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Stage<select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as CommercialStatus })} className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-slate-950 px-2 text-xs text-white">{commercialStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Owner<input value={draft.owner} onChange={(event) => setDraft({ ...draft, owner: event.target.value })} className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-slate-950 px-3 text-xs text-white" placeholder="Name or email" /></label>
      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 lg:col-span-2">Next action<input value={draft.nextAction} onChange={(event) => setDraft({ ...draft, nextAction: event.target.value })} className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-slate-950 px-3 text-xs text-white" placeholder="Action that advances this request" /></label>
      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Due<input type="datetime-local" value={draft.nextActionAt} onChange={(event) => setDraft({ ...draft, nextActionAt: event.target.value })} className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-slate-950 px-2 text-xs text-white" /></label>
      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 lg:col-span-3">Private notes<input value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-slate-950 px-3 text-xs text-white" placeholder="Qualification, objections or delivery notes" /></label>
    </div>
    <div className="mt-3 flex justify-end"><button type="button" disabled={saving} onClick={() => onSave({ status: draft.status, owner: draft.owner || null, nextAction: draft.nextAction || null, nextActionAt: draft.nextActionAt ? new Date(draft.nextActionAt).toISOString() : null, notes: draft.notes || null })} className="rounded-lg bg-teal-300 px-4 py-2 text-xs font-bold text-slate-950 disabled:opacity-60">{saving ? "Saving…" : "Save pipeline update"}</button></div>
  </article>;
}

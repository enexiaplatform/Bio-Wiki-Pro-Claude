import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import {
  Activity, BadgeDollarSign, BookOpenCheck, Building2, CheckCircle2, Database,
  Download, FileArchive, FileCheck2, FolderKanban, LayoutDashboard, Loader2,
  Mail, Search, ShieldCheck, ShoppingCart, Users, XCircle,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useSEO } from "@/hooks/use-seo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

type Overview = {
  users: { total: number; pro: number; verified: number };
  leads: number;
  commercialRequests: number;
  purchases: { total: number; completed: number; revenueCents: number };
  reviewedProjects: number;
  content: { total: number; published: number; paid: number };
  documents: { products: number; files: number };
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

type Pipeline = {
  leads: Array<{ id: number; email: string; source: string | null; createdAt: string | null }>;
  requests: Array<{ id: number; name: string; email: string; company: string | null; productOfInterest: string | null; need: string; createdAt: string | null }>;
  purchases: Array<{ id: number; userId: string | null; productType: string; amount: number | null; status: string | null; createdAt: string | null }>;
  projects: Array<{ id: number; userId: string; localProjectId: string; projectName: string; inputCompletenessPercent: number | null; reviewRequestedAt: string | null; updatedAt: string | null }>;
};

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const date = (value: string | null | undefined) => value ? new Date(value).toLocaleDateString("en-GB") : "—";

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

  const filteredUsers = useMemo(() => {
    const term = userSearch.trim().toLowerCase();
    return (users.data?.users ?? []).filter((user) => !term || `${user.email} ${user.firstName} ${user.lastName}`.toLowerCase().includes(term));
  }, [users.data, userSearch]);

  const filteredContent = useMemo(() => {
    const term = contentSearch.trim().toLowerCase();
    return (content.data?.content ?? []).filter((entry) => !term || entry.slug.toLowerCase().includes(term));
  }, [content.data, contentSearch]);

  if (isLoading || !isAdmin) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-teal-300" /></div>;

  const loading = overview.isLoading || users.isLoading || documents.isLoading || content.isLoading || pipeline.isLoading;

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
              <button onClick={() => { void Promise.all([overview.refetch(), users.refetch(), documents.refetch(), content.refetch(), pipeline.refetch()]); }} className="inline-flex items-center gap-2 rounded-xl bg-teal-300 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-teal-200"><Activity className="h-4 w-4" /> Refresh data</button>
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
            <AdminTab value="content" icon={BookOpenCheck} label="Content" />
          </TabsList>

          <TabsContent value="overview" className="mt-5 space-y-5">
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
            <Panel title="Blueprint and commercial requests" description="Newest first. The request context remains a commercial intake, not confidential project evidence."><div className="space-y-3">{(pipeline.data?.requests ?? []).map((request) => <article key={request.id} className="rounded-xl border border-white/8 bg-slate-950/35 p-4"><div className="flex flex-wrap justify-between gap-2"><div><p className="font-semibold text-white">{request.name} · {request.company || "Company not supplied"}</p><a href={`mailto:${request.email}`} className="mt-1 inline-flex items-center gap-1 text-xs text-teal-300"><Mail className="h-3 w-3" />{request.email}</a></div><span className="text-xs text-slate-500">{date(request.createdAt)}</span></div><p className="mt-3 line-clamp-3 text-xs leading-6 text-slate-400">{request.need}</p></article>)}</div></Panel>
            <div className="grid gap-5 lg:grid-cols-2"><Panel title="Reviewed Blueprint projects" description="Account-held projects that entered expert review."><CompactRows rows={(pipeline.data?.projects ?? []).map((project) => ({ title: project.projectName, detail: `${project.inputCompletenessPercent ?? 0}% input completeness`, meta: date(project.updatedAt) }))} /></Panel><Panel title="Purchase records" description="Recent Stripe and manual purchase records."><CompactRows rows={(pipeline.data?.purchases ?? []).map((purchase) => ({ title: purchase.productType, detail: purchase.status || "pending", meta: purchase.amount ? money.format(purchase.amount / 100) : date(purchase.createdAt) }))} /></Panel></div>
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
function MetricCard({ icon: Icon, label, value, detail }: { icon: typeof Users; label: string; value: string | number; detail: string }) { return <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><Icon className="h-5 w-5 text-teal-300" /><p className="mt-4 text-3xl font-bold text-white">{value}</p><p className="mt-1 text-sm font-semibold text-slate-300">{label}</p><p className="mt-2 text-xs text-slate-500">{detail}</p></article>; }
function StatusPanel({ title, icon: Icon, items }: { title: string; icon: typeof Users; items: string[] }) { return <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><div className="flex items-center gap-2"><Icon className="h-4 w-4 text-sky-300" /><h2 className="font-bold text-white">{title}</h2></div><ul className="mt-4 space-y-2">{items.map((item) => <li key={item} className="flex items-center gap-2 text-sm text-slate-400"><CheckCircle2 className="h-3.5 w-3.5 text-teal-300" />{item}</li>)}</ul></section>; }
function Panel({ title, description, children }: { title: string; description: string; children: ReactNode }) { return <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><h2 className="text-lg font-bold text-white">{title}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{description}</p><div className="mt-4">{children}</div></section>; }
function SearchField({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) { return <label className="relative block max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" /><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/60 pl-10 pr-3 text-sm text-white outline-none focus:border-teal-300/40" /></label>; }
function State({ good = false, label }: { good?: boolean; label: string }) { return <span className={`inline-flex items-center gap-1 text-xs font-semibold ${good ? "text-teal-300" : "text-amber-300"}`}>{good ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}{label}</span>; }
function CompactRows({ rows }: { rows: Array<{ title: string; detail: string; meta: string }> }) { return <div className="space-y-2">{rows.length ? rows.map((row, index) => <div key={`${row.title}-${index}`} className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-slate-950/35 p-3"><div><p className="text-sm font-semibold text-white">{row.title}</p><p className="mt-1 text-xs text-slate-500">{row.detail}</p></div><span className="text-xs text-slate-500">{row.meta}</span></div>) : <p className="py-6 text-center text-sm text-slate-600">No records yet.</p>}</div>; }

import { Suspense } from "react";
import { Link, useRoute } from "wouter";
import { ArrowLeft, ArrowRight, Calculator, Workflow } from "lucide-react";
import { getToolBySlug, TOOLS } from "@/features/tools/registry";
import { useSEO } from "@/hooks/use-seo";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";

export default function ToolDetailPage() {
  const [, params] = useRoute("/tools/:slug");
  const slug = params?.slug ?? "";
  const tool = getToolBySlug(slug);

  useSEO({
    title: tool ? tool.title : "Tool",
    description: tool?.description,
  });

  if (!tool) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="mb-3 text-2xl font-bold">Tool not found</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          This tool does not exist. Browse all the free QC/QA tools instead.
        </p>
        <Link href="/tools" className="font-semibold text-teal-300 hover:underline">
          Back to all tools
        </Link>
      </div>
    );
  }

  const url = `${SITE_URL}/tools/${tool.slug}`;
  const more = TOOLS.filter((candidate) => candidate.slug !== tool.slug).slice(0, 3);
  const ToolComponent = tool.Component;
  const Icon = tool.icon;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-4 md:pt-8">
      <JsonLd
        id={`tool-app-${tool.slug}`}
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: tool.title,
          description: tool.description,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          url,
          isAccessibleForFree: true,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          provider: { "@type": "Organization", name: "Life Science Atlas" },
        }}
      />
      <JsonLd
        id={`tool-crumb-${tool.slug}`}
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Tools", item: `${SITE_URL}/tools` },
            { "@type": "ListItem", position: 2, name: tool.title, item: url },
          ],
        }}
      />

      <Link href="/tools" className="mb-5 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" />
        All tools
      </Link>

      <section className="mb-6 overflow-hidden rounded-lg border border-teal-400/20 bg-gradient-to-br from-teal-500/12 via-white/[0.045] to-emerald-500/10 p-6 shadow-xl shadow-black/15 md:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-400/25 bg-teal-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-200">
              <Icon className="h-3.5 w-3.5" />
              {tool.category}
            </span>
            <h1 className="mt-5 max-w-3xl font-display text-3xl font-bold leading-tight md:text-5xl">
              {tool.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {tool.description}
            </p>
            {tool.relatedWorkflow && (
              <Link
                href={`/workflows/${tool.relatedWorkflow.slug}`}
                className="mt-5 inline-flex items-center gap-2 rounded-lg border border-teal-400/25 bg-teal-400/10 px-4 py-2 text-sm font-semibold text-teal-200 transition-colors hover:border-teal-400/45"
              >
                <Workflow className="h-4 w-4" />
                See the {tool.relatedWorkflow.title} workflow
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-white/10 bg-background/35 p-4">
              <p className="text-2xl font-bold text-teal-200">Free</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">Access</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-background/35 p-4">
              <p className="text-2xl font-bold text-teal-200">Live</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">Calculator</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-background/35 p-4">
              <p className="text-2xl font-bold text-teal-200">{more.length}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">Next tools</p>
            </div>
          </div>
        </div>
      </section>

      <Suspense
        fallback={
          <section className="rounded-lg border border-white/10 bg-white/[0.035] p-6 shadow-lg shadow-black/10">
            <div className="mb-4 h-5 w-48 rounded bg-white/10" />
            <div className="h-24 rounded-lg bg-white/5" />
          </section>
        }
      >
        <ToolComponent />
      </Suspense>

      <section className="mt-10">
        <div className="mb-4 flex items-center gap-2">
          <Calculator className="h-4 w-4 text-teal-300" />
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-muted-foreground">More QC/QA tools</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {more.map((candidate) => {
            const MoreIcon = candidate.icon;
            return (
              <Link
                key={candidate.slug}
                href={`/tools/${candidate.slug}`}
                className="group flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.045] p-4 shadow-lg shadow-black/10 transition-colors hover:border-teal-400/35"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-teal-400/20 bg-teal-400/10 text-teal-200">
                  <MoreIcon className="h-4 w-4" />
                </div>
                <span className="flex-1 text-sm font-semibold leading-snug">{candidate.title}</span>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-teal-300" />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

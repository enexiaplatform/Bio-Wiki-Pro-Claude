import { Link, useRoute } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getToolBySlug, TOOLS } from "@/features/tools/registry";
import { useSEO } from "@/hooks/use-seo";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";

/**
 * /tools/:slug — a focused standalone page for a single interactive tool.
 * Carries its own SEO meta + SoftwareApplication & BreadcrumbList JSON-LD so it
 * can rank for high-intent searches (e.g. "endotoxin limit calculator").
 */
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
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-3">Tool not found</h1>
        <p className="text-muted-foreground text-sm mb-6">
          This tool doesn&rsquo;t exist. Browse all the free QC/QA tools instead.
        </p>
        <Link href="/tools" className="text-teal-400 font-semibold hover:underline">
          ← Back to all tools
        </Link>
      </div>
    );
  }

  const url = `${SITE_URL}/tools/${tool.slug}`;
  // Suggest a few sibling tools to keep people moving through the suite.
  const more = TOOLS.filter((t) => t.slug !== tool.slug).slice(0, 3);

  return (
    <div className="pb-24 pt-4 md:pt-8 max-w-6xl mx-auto px-4">
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

      <Link
        href="/tools"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-5"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> All tools
      </Link>

      <div className="mb-6">
        <span className="text-[11px] uppercase font-bold tracking-widest text-primary">{tool.category}</span>
        <h1 className="text-2xl md:text-3xl font-bold mt-1.5 mb-2 leading-tight">{tool.title}</h1>
        <p className="text-muted-foreground max-w-3xl leading-relaxed">{tool.description}</p>
      </div>

      {tool.element}

      {/* Keep moving through the suite */}
      <section className="mt-10">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">More QC/QA tools</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {more.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.slug}
                href={`/tools/${m.slug}`}
                className="group flex items-center gap-3 rounded-xl border border-white/10 bg-card p-3.5 hover:border-primary/40 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium leading-snug flex-1">{m.title}</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

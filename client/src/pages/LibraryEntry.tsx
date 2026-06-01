import { Link, useParams } from "wouter";
import { ChevronRight } from "lucide-react";
import { getContentBySlug } from "@/lib/content";
import { useLanguage } from "@/hooks/use-language";
import { useSEO } from "@/hooks/use-seo";
import { GatedContent } from "@/components/GatedContent";
import NotFound from "@/pages/not-found";

export default function LibraryEntry() {
  const { slug = "" } = useParams();
  const { language } = useLanguage();

  const entry = getContentBySlug("academy", slug, language);

  useSEO({ title: entry?.title ?? "Academy", description: entry?.seoDescription });

  if (!entry) return <NotFound />;

  return (
    <div className="pb-24 pt-4 md:pt-8 max-w-2xl mx-auto px-4">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6 flex-wrap">
        <Link href="/" className="hover:text-primary">BioWikiPro</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/academy" className="hover:text-primary">Academy</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground">{entry.category}</span>
      </nav>

      {/* Server-gated bilingual body (free → full, pro/paid → teaser + paywall) */}
      <GatedContent collection="academy" slug={slug} />
    </div>
  );
}

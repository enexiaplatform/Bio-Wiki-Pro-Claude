import { useMemo, useState } from "react";
import { Search, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import clsx from "clsx";
import { useAcademyTerms } from "@/hooks/use-data";
import { useSEO } from "@/hooks/use-seo";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";

const ALL = "All";

export default function Glossary() {
  useSEO({
    title: "Glossary — QC/QA & Life Science terms",
    description: "A searchable glossary of QC/QA, microbiology, and life-science terms — definitions, why they matter, and common mistakes.",
  });

  const { data: terms, isLoading } = useAcademyTerms();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(ALL);
  const [openId, setOpenId] = useState<string | null>(null);

  const all = terms ?? [];
  const categories = useMemo(
    () => [ALL, ...Array.from(new Set(all.map((t) => t.category))).sort()],
    [all]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all
      .filter((t) => (category === ALL ? true : t.category === category))
      .filter(
        (t) =>
          !q ||
          t.title.toLowerCase().includes(q) ||
          t.summary.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      )
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [all, search, category]);

  return (
    <div className="pb-24 pt-4 md:pt-8 max-w-3xl mx-auto px-4">
      {all.length > 0 && (
        <JsonLd
          id="glossary-termset"
          data={{
            "@context": "https://schema.org",
            "@type": "DefinedTermSet",
            name: "BioWikiPro QC/QA Glossary",
            url: `${SITE_URL}/glossary`,
            hasDefinedTerm: all.map((term) => ({
              "@type": "DefinedTerm",
              name: term.title,
              description: term.summary,
              inDefinedTermSet: `${SITE_URL}/glossary`,
            })),
          }}
        />
      )}

      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">Glossary</h1>
        <p className="text-muted-foreground">Definitions for QC/QA, microbiology, and life-science terms.</p>
      </div>

      {/* Search + filters */}
      <div className="space-y-3 mb-6 sticky top-[60px] md:top-20 z-30 bg-background/95 backdrop-blur-xl py-2 -mx-4 px-4 md:static md:bg-transparent md:p-0 md:mx-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search terms…"
            aria-label="Search glossary terms"
            className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              aria-pressed={c === category}
              className={clsx(
                "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                c === category ? "bg-primary/15 text-primary" : "bg-white/5 text-muted-foreground hover:text-foreground"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-4">{filtered.length} terms</p>

      {isLoading ? (
        <p className="text-muted-foreground py-12 text-center text-sm">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No terms match your search.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((t) => {
            const open = openId === t.id;
            return (
              <div key={t.id} className="rounded-xl border border-white/10 bg-card overflow-hidden">
                <button
                  onClick={() => setOpenId(open ? null : t.id)}
                  aria-expanded={open}
                  className="w-full text-left p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold text-sm">{t.title}</span>
                    {open ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                    <span className="rounded-md bg-primary/10 text-primary px-2 py-0.5 font-semibold">{t.category}</span>
                    <span className="text-muted-foreground">{t.difficulty}</span>
                  </div>
                  {!open && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{t.summary}</p>}
                </button>
                {open && (
                  <div className="px-4 pb-4 border-t border-white/5 pt-3 text-sm text-muted-foreground space-y-3">
                    <p>{t.summary}</p>
                    {t.whyItMatters && (
                      <div>
                        <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-1">Why it matters</p>
                        <p>{t.whyItMatters}</p>
                      </div>
                    )}
                    {t.commonMistakes?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-1">Common mistakes</p>
                        <ul className="list-disc ml-5 space-y-1">
                          {t.commonMistakes.map((m, i) => <li key={i}>{m}</li>)}
                        </ul>
                      </div>
                    )}
                    {t.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {t.tags.map((tag) => (
                          <span key={tag} className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

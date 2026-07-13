import { useMemo, useState } from "react";
import { AlertCircle, BookMarked, ChevronDown, ChevronUp, Filter, Search } from "lucide-react";
import clsx from "clsx";
import { useAcademyTerms } from "@/hooks/use-data";
import { useSEO } from "@/hooks/use-seo";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";
import { EditorialImage } from "@/components/EditorialImage";

const ALL = "All";

export default function Glossary() {
  useSEO({
    title: "Glossary: Quality laboratory decision terms",
    description: "A searchable glossary for quality-laboratory planning, evidence, methods, capacity, commercial outputs, and microbiology.",
  });

  const { data: terms, isLoading } = useAcademyTerms();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(ALL);
  const [openId, setOpenId] = useState<string | null>(null);

  const all = terms ?? [];
  const categories = useMemo(() => [ALL, ...Array.from(new Set(all.map((term) => term.category))).sort()], [all]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all
      .filter((term) => (category === ALL ? true : term.category === category))
      .filter(
        (term) =>
          !q ||
          term.title.toLowerCase().includes(q) ||
          term.summary.toLowerCase().includes(q) ||
          term.tags.some((tag) => tag.toLowerCase().includes(q)),
      )
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [all, search, category]);

  const difficultyCount = useMemo(() => new Set(all.map((term) => term.difficulty)).size, [all]);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-4 md:pt-8">
      {all.length > 0 && (
        <JsonLd
          id="glossary-termset"
          data={{
            "@context": "https://schema.org",
            "@type": "DefinedTermSet",
            name: "Life Science Atlas Quality Laboratory Glossary",
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

      <section className="mb-6 overflow-hidden rounded-lg border border-teal-400/20 bg-gradient-to-br from-teal-500/12 via-white/[0.045] to-emerald-500/10 p-4 shadow-xl shadow-black/15 md:p-6">
        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch">
          <div className="p-2 md:p-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-400/25 bg-teal-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-200">
              <BookMarked className="h-3.5 w-3.5" />
              Glossary
            </span>
            <h1 className="mt-5 max-w-3xl font-display text-3xl font-bold leading-tight md:text-5xl">
              The language behind a defensible lab decision.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Search the concepts that connect evidence, methods, testing demand, capacity, commercial outputs, and the first microbiology domain pack.
            </p>
          </div>
          <EditorialImage
            src="/images/editorial/microscope-workbench.jpg"
            alt="Laboratory microscope representing evidence-led technical definitions"
            creditName="Mezidi Zineb"
            creditUrl="https://unsplash.com/photos/dAHABqJ8Nlw"
            eager
            className="h-56 rounded-lg border border-white/10 lg:h-auto lg:min-h-72"
            imageClassName="object-[center_58%] saturate-60"
          />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-white/10 bg-background/35 p-4">
              <p className="text-2xl font-bold text-teal-200">{all.length}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">Terms</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-background/35 p-4">
              <p className="text-2xl font-bold text-teal-200">{Math.max(categories.length - 1, 0)}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">Categories</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-background/35 p-4">
              <p className="text-2xl font-bold text-teal-200">{difficultyCount}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">Levels</p>
            </div>
        </div>
      </section>

      <section className="sticky top-[60px] z-30 -mx-4 mb-6 border-y border-white/10 bg-background/95 px-4 py-3 backdrop-blur-xl md:static md:mx-0 md:rounded-lg md:border md:bg-white/[0.035] md:shadow-lg md:shadow-black/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search terms, tags, or mistakes..."
            aria-label="Search glossary terms"
            className="w-full rounded-lg border border-white/10 bg-background/65 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-teal-400/45 focus:ring-2 focus:ring-teal-400/20"
          />
        </div>

        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-muted-foreground sm:inline-flex">
            <Filter className="h-3.5 w-3.5" />
            Category
          </span>
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              aria-pressed={item === category}
              className={clsx(
                "shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors",
                item === category
                  ? "border-teal-400 bg-teal-400 text-teal-950"
                  : "border-white/10 bg-white/5 text-muted-foreground hover:border-teal-400/40 hover:text-foreground",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{filtered.length} terms shown</p>
        {(search || category !== ALL) && (
          <button
            onClick={() => {
              setSearch("");
              setCategory(ALL);
              setOpenId(null);
            }}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold transition-colors hover:border-teal-400/40"
          >
            Reset
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-white/10 bg-white/[0.035] p-12 text-center text-sm text-muted-foreground">
          Loading terms...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.035] p-12 text-center">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="font-semibold">No terms match your search.</p>
          <p className="mt-2 text-sm text-muted-foreground">Try a broader term like deviation, sterility, validation, or audit.</p>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {filtered.map((term) => {
            const open = openId === term.id;
            return (
              <article key={term.id} className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.045] shadow-lg shadow-black/10">
                <button
                  onClick={() => setOpenId(open ? null : term.id)}
                  aria-expanded={open}
                  className="w-full p-4 text-left transition-colors hover:bg-white/5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-bold">{term.title}</h2>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                        <span className="rounded-full bg-teal-400/10 px-2.5 py-1 font-semibold text-teal-200">{term.category}</span>
                        <span className="rounded-full border border-white/10 px-2.5 py-1 text-muted-foreground">{term.difficulty}</span>
                      </div>
                    </div>
                    {open ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
                  </div>
                  {!open && <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{term.summary}</p>}
                </button>

                {open && (
                  <div className="space-y-4 border-t border-white/10 px-4 pb-4 pt-4 text-sm leading-relaxed text-muted-foreground">
                    <p>{term.summary}</p>
                    {term.whyItMatters && (
                      <div className="rounded-lg border border-white/10 bg-background/35 p-3">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-foreground">Why it matters</p>
                        <p>{term.whyItMatters}</p>
                      </div>
                    )}
                    {term.commonMistakes?.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground">Common mistakes</p>
                        <ul className="ml-5 list-disc space-y-1">
                          {term.commonMistakes.map((mistake, index) => <li key={index}>{mistake}</li>)}
                        </ul>
                      </div>
                    )}
                    {term.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {term.tags.map((tag) => (
                          <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px]">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

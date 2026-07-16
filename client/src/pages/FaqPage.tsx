import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, ChevronDown, ChevronRight, HelpCircle, Search } from "lucide-react";
import clsx from "clsx";
import { useSEO } from "@/hooks/use-seo";
import { JsonLd } from "@/components/JsonLd";
import { EditorialImage } from "@/components/EditorialImage";

const FAQS: { q: string; a: string; topic: string }[] = [
  {
    topic: "Product",
    q: "Who is Life Science Atlas for?",
    a: "Atlas is built for teams planning, expanding, or changing quality laboratories in regulated manufacturing. Initial buyers include pharmaceutical manufacturers, engineering and turnkey firms, laboratory equipment distributors, contract testing laboratories, and quality leaders who need a shared operating model across QC, QA, engineering, and procurement.",
  },
  {
    topic: "Blueprint",
    q: "What is the Atlas Quality Lab Blueprint?",
    a: "It is a scope-based, service-assisted decision package that connects products, markets, testing demand, methods, resources, capacity, assumptions, evidence, and open gaps. The intended output is a traceable laboratory capability and operating model that can support expert review, budgeting, URS development, RFQs, and phased project decisions.",
  },
  {
    topic: "Blueprint",
    q: "Why does the current model start with non-sterile pharmaceutical microbiology?",
    a: "It is the first evidence-gated domain pack because it matches the strongest current expertise and can be validated deeply before Atlas expands. Microbiology is the first wedge, not the long-term boundary. Water, environmental monitoring, sterile and biologics quality, analytical chemistry with a qualified SME, stability, sample management, and other regulated manufacturing domains are planned only when evidence, expert ownership, validation cases, and demand are available.",
  },
  {
    topic: "Blueprint",
    q: "What does a Blueprint engagement include?",
    a: "Scope depends on the project. Typical outputs can include the test portfolio and capability map, method bill of materials, workload and resource demand, equipment and analyst capacity scenarios, consumables forecasts, bottleneck and redundancy review, CAPEX/OPEX assumptions, outsource-versus-insource options, vendor-neutral URS/RFQ inputs, and a decision brief with assumptions, exclusions, and unresolved inputs.",
  },
  {
    topic: "Trust",
    q: "Is an Atlas output a validated design or regulatory approval?",
    a: "No. Atlas outputs are planning and decision-support artifacts. They do not replace site risk assessment, qualified engineering, method verification or validation, QA approval, document control, or regulatory review. The app identifies where expert verification and site governance are still required.",
  },
  {
    topic: "Trust",
    q: "How does Atlas show the basis for a recommendation?",
    a: "Material outputs are designed to distinguish source evidence, source version or date when available, applicability conditions, user-supplied facts, planning assumptions, confidence, unresolved information, and the effect of changing a dependency. Concept benchmarks and expert judgment should remain visibly different from approved site facts.",
  },
  {
    topic: "Review",
    q: "What does expert review mean?",
    a: "Expert review is a documented challenge of the model's inputs, evidence, assumptions, exclusions, calculations, and intended use. A review request does not itself mean that a project, method, facility, or recommendation has been approved. Corrections, open decisions, and review boundaries remain part of the record.",
  },
  {
    topic: "Process",
    q: "Can I use Atlas before every project input is confirmed?",
    a: "Yes. The initial model is designed for early discovery, provided provisional values are clearly labeled as assumptions. You can compare scenarios and see which missing inputs have the greatest decision impact, then replace assumptions with confirmed site data, quotations, approved specifications, and reviewed evidence as the project matures.",
  },
  {
    topic: "Pricing",
    q: "How is a Blueprint priced?",
    a: "Founding design-partner Blueprint engagements start at $990 USD, with typical early scopes between $990 and $2,500. The starting scope covers one site, the first microbiology wedge, a baseline plus one alternative scenario, one review workshop, and one revision. A $149 fixed-fee Scope Diagnostic is available when the operating question still needs to be framed; that fee is credited to a Blueprint started within 30 days. Larger or specialist scopes are quoted separately.",
  },
  {
    topic: "Access",
    q: "What are Free and Pro for?",
    a: "Free and Pro are supporting evidence-access options, not the primary commercial offer. Free provides public workflows, lessons, glossary entries, articles, and selected tools. Pro can unlock deeper supporting lessons, worked examples, templates, and tools. Neither access level turns an automated model into an expert-reviewed Blueprint.",
  },
  {
    topic: "Security",
    q: "How should confidential project data be handled?",
    a: "Only information necessary for the agreed project scope should be provided, and confidential client data should not be republished as public content. The current planner is local-first; authenticated reviewed-project persistence depends on the deployed database and project workflow. Confirm the applicable data-handling arrangement before sharing sensitive site information.",
  },
  {
    topic: "Partners",
    q: "Can engineering firms, distributors, or specialist SMEs work with Atlas?",
    a: "Yes. Atlas is designed to support partner-led projects where the partner brings site access, engineering, equipment, application, or domain expertise and the engagement strengthens the same evidence, rules, templates, and reviewed project workflow. It is not a generic lead marketplace or a substitute for accountable specialist work.",
  },
];

const all = "All";

export default function FaqPage() {
  useSEO({
    title: "FAQ: Atlas Quality Lab Blueprint",
    description: "Answers about the Atlas Quality Lab Blueprint, evidence, assumptions, expert review, scope, pricing, data handling, and domain expansion.",
  });
  const [open, setOpen] = useState<number | null>(0);
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState(all);

  const topics = useMemo(() => [all, ...Array.from(new Set(FAQS.map((faq) => faq.topic))).sort()], []);
  const filtered = FAQS.filter((faq) => {
    const q = query.trim().toLowerCase();
    const matchesTopic = topic === all || faq.topic === topic;
    const matchesSearch = !q || faq.q.toLowerCase().includes(q) || faq.a.toLowerCase().includes(q) || faq.topic.toLowerCase().includes(q);
    return matchesTopic && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-4 md:pt-8">
      <JsonLd
        id="faq-page"
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((faq) => ({
            "@type": "Question",
            name: faq.q,
            acceptedAnswer: { "@type": "Answer", text: faq.a },
          })),
        }}
      />

      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-teal-300">Life Science Atlas</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">FAQ</span>
      </nav>

      <section className="mb-6 overflow-hidden rounded-lg border border-teal-400/20 bg-gradient-to-br from-teal-500/12 via-white/[0.045] to-emerald-500/10 p-4 shadow-xl shadow-black/15 md:p-6">
        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch">
          <div className="p-2 md:p-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-400/25 bg-teal-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-200">
              <HelpCircle className="h-3.5 w-3.5" />
              FAQ
            </span>
            <h1 className="mt-5 max-w-3xl font-display text-3xl font-bold leading-tight md:text-5xl">
              Decide what Atlas can—and cannot—do for your project.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Scope, evidence, assumptions, expert review, commercial outputs, and the boundaries that keep early planning defensible.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
              <span className="rounded-full border border-white/10 bg-background/35 px-3 py-1.5">{FAQS.length} answers</span>
              <span className="rounded-full border border-white/10 bg-background/35 px-3 py-1.5">{new Set(FAQS.map((faq) => faq.topic)).size} decision topics</span>
            </div>
          </div>
          <EditorialImage
            src="/images/editorial/lab-team-collaboration.jpg"
            alt="Laboratory team reviewing work together"
            creditName="Toon Lambrechts"
            creditUrl="https://unsplash.com/photos/0q4ipgUIw5g"
            eager
            className="h-56 rounded-lg border border-white/10 lg:h-auto lg:min-h-72"
            imageClassName="object-[center_42%] saturate-75"
          />
        </div>
      </section>

      <section className="mb-6 rounded-lg border border-white/10 bg-white/[0.035] p-3 shadow-lg shadow-black/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search FAQ..."
            className="w-full rounded-lg border border-white/10 bg-background/65 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-teal-400/45 focus:ring-2 focus:ring-teal-400/20"
          />
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {topics.map((item) => (
            <button
              key={item}
              onClick={() => setTopic(item)}
              className={clsx(
                "shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors",
                item === topic
                  ? "border-teal-400 bg-teal-400 text-teal-950"
                  : "border-white/10 bg-white/5 text-muted-foreground hover:border-teal-400/40 hover:text-foreground",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <p className="mb-4 text-sm text-muted-foreground">{filtered.length} answers shown</p>

      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((faq, index) => {
            const isOpen = open === FAQS.indexOf(faq);
            const sourceIndex = FAQS.indexOf(faq);
            return (
              <div key={faq.q} className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.045] shadow-lg shadow-black/10">
                <button
                  onClick={() => setOpen(isOpen ? null : sourceIndex)}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-white/5"
                  aria-expanded={isOpen}
                >
                  <span>
                    <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-teal-300">{faq.topic}</span>
                    <span className="text-sm font-bold">{faq.q}</span>
                  </span>
                  <ChevronDown className={clsx("h-4 w-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                </button>
                {isOpen && (
                  <div className="border-t border-white/10 px-4 pb-4 pt-3 text-sm leading-relaxed text-muted-foreground">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.035] p-8 text-center">
            <p className="font-semibold">No FAQ answers match that search.</p>
            <p className="mt-2 text-sm text-muted-foreground">Try a broader term like Pro, certificate, billing, or toolkit.</p>
            <button
              onClick={() => {
                setQuery("");
                setTopic(all);
                setOpen(0);
              }}
              className="mt-4 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold transition-colors hover:border-teal-400/40"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>

      <section className="mt-8 rounded-lg border border-teal-400/25 bg-teal-400/10 p-5 text-center shadow-lg shadow-black/10 md:p-6">
        <p className="font-bold">Still deciding?</p>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
          Build an initial capability model, or ask for a scope review when the decision has real project consequences.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Link href="/quality-lab/planner" className="inline-flex items-center gap-1.5 rounded-lg bg-teal-400 px-5 py-2.5 text-sm font-bold text-teal-950 transition-colors hover:bg-teal-300">
            Build an initial model
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/quality-lab/review" className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-5 py-2.5 text-sm font-semibold transition-colors hover:border-white/30">
            Request a scope review
          </Link>
        </div>
      </section>
    </div>
  );
}

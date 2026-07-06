import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ChevronDown, ChevronRight, HelpCircle, Search } from "lucide-react";
import clsx from "clsx";
import { useSEO } from "@/hooks/use-seo";
import { JsonLd } from "@/components/JsonLd";

const FAQS: { q: string; a: string; topic: string }[] = [
  {
    topic: "Product",
    q: "Who is Life Science Atlas for?",
    a: "QC and QA professionals in pharma, biotech, and life sciences: from analysts and microbiologists to quality managers. The content assumes a working GMP context and focuses on topics that come up in real labs and inspections.",
  },
  {
    topic: "Pricing",
    q: "What's the difference between Free and Pro?",
    a: "Free gives you the core lessons, learning paths, quizzes, the glossary, and the blog. Pro unlocks in-depth lessons, decision trees, templates, worked examples, every new Pro lesson, and the full library across data integrity, validation, sterility, and quality systems.",
  },
  {
    topic: "Content",
    q: "How current is the content?",
    a: "Lessons reference current standards such as EU GMP Annex 1:2022, ICH Q-series, USP/EP chapters, and FDA guidance. We revise content as guidance changes, for example the shift from 10 ppm cleaning limits to health-based exposure limits.",
  },
  {
    topic: "Pricing",
    q: "Is there a free trial?",
    a: "Yes. New Pro subscribers get a 7-day free trial. You will not be charged until the trial ends, and you can cancel anytime before then from the Stripe customer portal in Settings.",
  },
  {
    topic: "Toolkits",
    q: "What are the downloadable kits?",
    a: "Alongside the subscription we sell one-time toolkits: the GMP Audit Survival Kit, Career Starter Kit, Interview Prep Pack, and bundle. Each is a set of ready-to-use deliverables delivered as PDF and Excel files you download from your account after purchase.",
  },
  {
    topic: "Billing",
    q: "How do payments work? Is it secure?",
    a: "All payments are processed by Stripe; we never see or store your card details. Subscriptions are billed monthly and one-time kits are a single charge. You get an email receipt and, for kits, immediate access to downloads in your account.",
  },
  {
    topic: "Billing",
    q: "Can I cancel anytime?",
    a: "Yes. Pro is a subscription you manage yourself through the Stripe customer portal in Settings. Cancel anytime; your access continues until the end of the period you have paid for.",
  },
  {
    topic: "Learning",
    q: "Do I get a certificate?",
    a: "Yes. Completing any learning path unlocks a printable Certificate of Completion you can download as a PDF or image and share on LinkedIn.",
  },
  {
    topic: "Content",
    q: "Is this a substitute for official training or SOPs?",
    a: "No. Life Science Atlas is an educational reference to build understanding and prepare for audits. It does not replace your site's validated procedures, official GMP training, or regulatory advice.",
  },
  {
    topic: "Team",
    q: "Do you offer team or enterprise plans?",
    a: "Team access and volume pricing can be handled directly. Use the pricing page as the starting point, then contact support with your team size and use case.",
  },
];

const all = "All";

export default function FaqPage() {
  useSEO({
    title: "FAQ",
    description: "Frequently asked questions about Life Science Atlas: who it's for, Free vs Pro, content freshness, the free trial, cancellation, and certificates.",
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

      <section className="mb-6 overflow-hidden rounded-lg border border-teal-400/20 bg-gradient-to-br from-teal-500/12 via-white/[0.045] to-emerald-500/10 p-6 shadow-xl shadow-black/15 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-400/25 bg-teal-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-200">
              <HelpCircle className="h-3.5 w-3.5" />
              FAQ
            </span>
            <h1 className="mt-5 max-w-3xl font-display text-3xl font-bold leading-tight md:text-5xl">
              Answers before you need to ask.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Pricing, content, certificates, downloads, and how Life Science Atlas fits alongside your site procedures.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-background/35 p-4">
            <p className="text-2xl font-bold text-teal-200">{FAQS.length}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">Questions</p>
          </div>
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
          Compare the plan, then jump into the library to see how the workflow-first learning model feels.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Link href="/pricing" className="inline-flex items-center gap-1.5 rounded-lg bg-teal-400 px-5 py-2.5 text-sm font-bold text-teal-950 transition-colors hover:bg-teal-300">
            See pricing
          </Link>
          <Link href="/academy" className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-5 py-2.5 text-sm font-semibold transition-colors hover:border-white/30">
            Browse Academy
          </Link>
        </div>
      </section>
    </div>
  );
}
